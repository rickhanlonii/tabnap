function sortedTabs(tabs) {
  return tabs.sort((a, b) => a.when - b.when);
}
function checkTabs() {
  chrome.storage.local.get(["tabs"]).then((result) => {
    if (!result.tabs || result.tabs.length === 0) {
      return;
    }
    const { tabs } = result;

    const sorted = sortedTabs(tabs);
    const currentTabs = [];
    const remainingTabs = [];
    const currentTime = Date.now();
    console.log("## checking time ", new Date(currentTime).toLocaleString());
    for (var i = 0; i < sorted.length; i++) {
      var tab = sorted[i];
      if (currentTime >= tab.when) {
        console.log(
          "## waking up tab: ",
          tab.url,
          new Date(tab.when).toLocaleString()
        );
        currentTabs.push(tab);
      } else {
        console.log(
          "## tab not ready yet: ",
          tab.url,
          new Date(tab.when).toLocaleString()
        );
        remainingTabs.push(tab);
      }
    }
    console.log(
      "#tabs found, remaining",
      currentTabs,
      remainingTabs,
      new Date().toLocaleString()
    );

    if (currentTabs.length > 0) {
      currentTabs.forEach((tab) => {
        chrome.tabs.create({
          url: tab.url,
        });
      });

      console.log("## creating notifitication", currentTabs.length);
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
      console.log(
        "## creating alarm",
        new Date(remainingTabs[0].when).toLocaleString()
      );
      chrome.alarms.create("tabnap", { when: remainingTabs[0].when });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("#### installed", new Date().toLocaleString());
  chrome.alarms.get("tabnap", (a) => {
    console.log("### exiting alarm", a);
    if (!a)
      chrome.alarms.create("tabnap", {
        periodInMinutes: 1.0,
        when: Date.now() + 1000,
      });
  });

  checkTabs();
});
console.log("#### background script", new Date().toLocaleString());

chrome.alarms.onAlarm.addListener(function (alarm) {
  console.log("#### listener fired", new Date().toLocaleString());
  checkTabs();
});

chrome.idle.onStateChanged.addListener(function (e) {
  console.log("### state changed", e, new Date().toLocaleString());
  if (e === "active") {
    chrome.storage.local.get(["tabs"]).then((result) => {
      if (!result.tabs || result.tabs.length === 0) {
        return;
      }
      const sorted = sortedTabs(result.tabs);
      console.log("## checking alarms");
      chrome.alarms.get("tabnap", (a) => {
        if (!a) {
          console.log(
            "## recreating alarm",
            new Date(sorted[0].when).toLocaleString()
          );
          chrome.alarms.create("tabnap", { when: sorted[0].when });
        }
        checkTabs();
      });
    });
  } else {
    chrome.alarms.clear("tabnap");
  }
});
