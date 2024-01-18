function insertCSSIfNeeded(tabId, url, settings) {
  Object.keys(settings).forEach((key) => {
    if (settings[key].isInjected) {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        css: settings[key].code,
      });
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url).origin;
    chrome.storage.local.get([url], (result) => {
      if (result[url]) {
        insertCSSIfNeeded(tabId, url, result[url]);
      }
    });
  }
});
