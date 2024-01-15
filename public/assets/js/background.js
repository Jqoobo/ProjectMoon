function insertCSSIfNeeded(tabId, url, settings) {
  if (settings.isCssInjected) {
    const cssCode = "body { background-color: #000 !important; }";
    chrome.scripting.insertCSS({ target: { tabId: tabId }, css: cssCode });
  }
  if (settings.zoomLevel) {
    const zoomCss = `body { zoom: ${settings.zoomLevel}; }`;
    chrome.scripting.insertCSS({ target: { tabId: tabId }, css: zoomCss });
  }
  if (settings.isAnimInjected) {
    const animationCssCode =
      "body { animation: none !important; transition: none !important; }";
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      css: animationCssCode,
    });
  }
  if (settings.isAnimInjected) {
    const animationCssCode =
      "body { animation: none !important; transition: none !important; }";
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      css: animationCssCode,
    });
  }
  if (settings.isDyslexiaFontInjected) {
    const dyslexiaFontCssCode =
      "body { font-family: OpenDyslexic !important; }";
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      css: dyslexiaFontCssCode,
    });
  }
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url).origin;
    chrome.storage.local.get([url], (result) => {
      if (result[url] && result[url].isFontEnabled) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: applyOpenDyslexicFont,
        });
      }
    });
  }
});

function applyOpenDyslexicFont() {
  const stylesheetId = "opendyslexic-stylesheet";
  if (!document.getElementById(stylesheetId)) {
    const link = document.createElement("link");
    link.id = stylesheetId;
    link.href = chrome.runtime.getURL("assets/css/opendyslexic.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
}
