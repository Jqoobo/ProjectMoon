function insertCSSIfNeeded(tabId, settings) {
  Object.keys(settings).forEach((key) => {
    if (settings[key].isInjected) {
      chrome.scripting
        .insertCSS({
          target: { tabId: tabId },
          css: settings[key].code,
        })
        .catch((error) => {
          console.error(
            `❌Wystąpił bład podczas dodawania CSS dla klucza ${key}:`,
            error
          );
        });
    }
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    try {
      const url = new URL(tab.url).origin;
      chrome.storage.local.get([url], (result) => {
        if (result[url]) {
          insertCSSIfNeeded(tabId, result[url]);
          console.log(`✅Zastosowano ustawienia dla: ${url}`);
        } else {
          console.error(`❌Nie znaleziono ustawień dla: ${url}`);
        }
      });
    } catch (error) {
      console.error(`❌Nieprawidłowy URL: ${tab.url}`, error);
    }
  }
});
