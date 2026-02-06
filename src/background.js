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
        if (currentTime >= tab.when) {
          currentTabs.push(tab);
        } else {
          remainingTabs.push(tab);
        }
      }

      if (currentTabs.length > 0) {
        currentTabs.forEach((tab) => {
          chrome.tabs
            .create({
              url: tab.url,
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

        chrome.notifications.create("", {
          type: "basic",
          title: "TabNap",
          message: `Woke up ${currentTabs.length} ${
            currentTabs.length > 1 ? "tabs" : "tab"
          }`,
          iconUrl: "/logo.png",
        });
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
      chrome.alarms.get("tabnap").then((a) => {
        if (!a) {
          chrome.alarms.create("tabnap", { when: sorted[0].when });
        }
        checkTabs();
      });
    });
  } else {
    chrome.alarms.clear("tabnap");
  }
});

if (typeof jest !== "undefined") {
  module.exports = {
    checkTabs,
    sortedTabs,
  };
}
