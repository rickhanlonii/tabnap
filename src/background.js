if (typeof importScripts !== "undefined") {
  importScripts("/build/defaults.js");
}

let lastWokenTabId = null;
let offscreenCreated = false;
let currentSettings = { ...DEFAULT_SETTINGS };

chrome.storage.onChanged.addListener((changes) => {
  if (changes.settings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...changes.settings.newValue };
  }
});

chrome.storage.local.get(["settings"]).then((result) => {
  if (result && result.settings) {
    currentSettings = { ...DEFAULT_SETTINGS, ...result.settings };
  }
});

function playWakeupSound() {
  if (offscreenCreated) {
    chrome.runtime.sendMessage({ type: "play-sound", url: "/lib/wakeup.wav" });
    return;
  }
  chrome.offscreen
    .createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Playing wake-up sound for snoozed tabs",
    })
    .then(() => {
      offscreenCreated = true;
      chrome.runtime.sendMessage({ type: "play-sound", url: "/lib/wakeup.wav" });
    })
    .catch((err) => {
      if (err.message && err.message.includes("already exists")) {
        offscreenCreated = true;
        chrome.runtime.sendMessage({ type: "play-sound", url: "/lib/wakeup.wav" });
      } else {
        console.error(err);
      }
    });
}

function sortedTabs(tabs) {
  return [...tabs].sort((a, b) => a.when - b.when);
}
function checkTabs() {
  chrome.storage.local
    .get(["tabs"])
    .then((result) => {
      if (!result.tabs || result.tabs.length === 0) {
        return;
      }
      const { tabs } = result;

      const sorted = sortedTabs(tabs);
      const currentTabs = [];
      const remainingTabs = [];
      const currentTime = Date.now();
      for (let i = 0; i < sorted.length; i++) {
        let tab = sorted[i];
        if (currentTime + 60000 >= tab.when) {
          currentTabs.push(tab);
        } else {
          remainingTabs.push(tab);
        }
      }

      if (currentTabs.length > 0) {
        currentTabs.forEach((tab, index) => {
          chrome.tabs
            .create({
              url: tab.url,
            })
            .then((createdTab) => {
              if (index === 0 && createdTab) {
                lastWokenTabId = createdTab.id;
              }
            })
            .catch(console.error);

          if (tab.recurring) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            remainingTabs.push({ ...tab, when: tomorrow.getTime() });
          }
        });

        remainingTabs.sort((a, b) => a.when - b.when);

        const tabTitles = currentTabs.map((tab) => tab.title || tab.url).slice(0, 5);
        const titleList = tabTitles.map((t) => "- " + t).join("\n");
        const suffix = currentTabs.length > 5 ? "\n+ " + (currentTabs.length - 5) + " more" : "";

        if (currentSettings.showNotifications) {
          chrome.notifications.create("tabnap-wakeup", {
            type: "basic",
            title: "TabNap",
            message: `Woke up ${currentTabs.length} ${
              currentTabs.length > 1 ? "tabs" : "tab"
            }\n${titleList}${suffix}`,
            iconUrl: "/icon.png",
          }).catch(console.error);
        }

        if (currentSettings.playWakeupSound) {
          playWakeupSound();
        }
      }

      chrome.storage.local.set({ tabs: remainingTabs });

      if (remainingTabs.length > 0) {
        chrome.alarms.create("tabnap", { when: remainingTabs[0].when });
      }
    })
    .catch(console.error);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.get("tabnap").then((a) => {
    if (!a)
      chrome.alarms.create("tabnap", {
        periodInMinutes: 1.0,
        when: Date.now() + 1000,
      });
  });

  checkTabs();
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  checkTabs();
});

chrome.idle.onStateChanged.addListener(function (e) {
  if (e === "active") {
    chrome.storage.local.get(["tabs"]).then((result) => {
      if (!result.tabs || result.tabs.length === 0) {
        return;
      }
      const sorted = sortedTabs(result.tabs);
      // Wait 60s for WiFi to reconnect before waking tabs
      const delayedWhen = Math.max(sorted[0].when, Date.now() + 60000);
      chrome.alarms.create("tabnap", { when: delayedWhen });
    });
  } else {
    chrome.alarms.clear("tabnap");
  }
});

chrome.notifications.onClicked.addListener(function (notificationId) {
  if (notificationId === "tabnap-wakeup" && lastWokenTabId !== null) {
    chrome.tabs
      .update(lastWokenTabId, { active: true })
      .then((tab) => {
        if (tab && tab.windowId) {
          chrome.windows.update(tab.windowId, { focused: true });
        }
      })
      .catch(console.error);
  }
});

if (typeof jest !== "undefined") {
  module.exports = {
    checkTabs,
    sortedTabs,
    playWakeupSound,
    setSettings: (s) => { currentSettings = s; },
    resetOffscreenCreated: () => { offscreenCreated = false; },
    setLastWokenTabId: (id) => { lastWokenTabId = id; },
  };
}
