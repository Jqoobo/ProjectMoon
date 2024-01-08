chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const url = new URL(tab.url).origin;
      chrome.storage.local.get([url], (result) => {
        if (result[url]) {
          const cssCode = 'body { background-color: red !important; }';
          chrome.scripting.insertCSS({
            target: { tabId: tabId },
            css: cssCode
          });
        }
      });
    }
  });