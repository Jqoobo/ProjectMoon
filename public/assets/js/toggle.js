document.addEventListener("DOMContentLoaded", function () {
  const injectButton = document.getElementById("inject-css");
  const cssCode = "body { background-color: red !important; }";

  const updateStateAndButton = (url, injected) => {
    chrome.storage.local.set({ [url]: injected });
    injectButton.textContent = injected ? "Usuń CSS" : "Wstrzyknij CSS";
  };

  const toggleCSS = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      const url = new URL(tab.url).origin; // Użyj tylko części origin URL

      chrome.storage.local.get([url], (result) => {
        if (!result[url]) {
          chrome.scripting.insertCSS({
            target: { tabId: tab.id },
            css: cssCode,
          });
          updateStateAndButton(url, true);
        } else {
          chrome.scripting.removeCSS({
            target: { tabId: tab.id },
            css: cssCode,
          });
          updateStateAndButton(url, false);
        }
      });
    });
  };

  injectButton.addEventListener("click", toggleCSS);

  const zoomButton = document.getElementById("zoom-button");
  let currentZoomLevel = 0;
  const zoomLevels = [1.2, 1.3, 1.5];

  const applyZoom = (zoomLevel) => {
    const cssCode = `body { zoom: ${zoomLevel} !important; }`;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.insertCSS({
        target: { tabId: tabs[0].id },
        css: cssCode,
      });
    });
  };

  const toggleZoom = () => {
    currentZoomLevel = (currentZoomLevel + 1) % zoomLevels.length;
    applyZoom(zoomLevels[currentZoomLevel]);
  };

  zoomButton.addEventListener("click", toggleZoom);
});
