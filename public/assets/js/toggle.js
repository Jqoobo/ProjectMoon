function updateStorage(url, data) {
  chrome.storage.local.set({ [url]: data });
}

function applyCSS(tabId, cssCode) {
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    css: cssCode,
  });
}

function removeCSS(tabId, cssCode) {
  chrome.scripting.removeCSS({
    target: { tabId: tabId },
    css: cssCode,
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const injectButton = document.getElementById("inject-css");
  const zoomButton = document.getElementById("zoom-button");
  const dyslexiaButton = document.getElementById("dyslexia-font");
  const animationButton = document.getElementById("animation-button");
  const cssCode = "body { background-color: #000 !important; }";
  const animationCssCode =
    "body { animation: none !important; transition: none !important; }";
  const zoomLevels = [1.0, 1.2, 1.3, 1.5];
  let currentZoomLevel = 1;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url).origin;

    injectButton.addEventListener("click", () => {
      chrome.storage.local.get([url], (result) => {
        const isInjected = result[url] && result[url].isCssInjected;
        if (!isInjected) {
          applyCSS(tab.id, cssCode);
          updateStorage(url, { ...result[url], isCssInjected: true });
        } else {
          removeCSS(tab.id, cssCode);
          updateStorage(url, { ...result[url], isCssInjected: false });
        }
      });
    });

    chrome.storage.local.get([url], (result) => {
      if (result[url] && result[url].zoomLevel) {
        currentZoomLevel = zoomLevels.indexOf(result[url].zoomLevel);
        if (currentZoomLevel === -1) currentZoomLevel = 3; // Ustaw domyślny poziom, jeśli nie znaleziono
      }
    });

    zoomButton.addEventListener("click", () => {
      currentZoomLevel = (currentZoomLevel + 1) % zoomLevels.length;
      const zoomCssCode = `body { zoom: ${zoomLevels[currentZoomLevel]}; }`;
      applyCSS(tab.id, zoomCssCode);

      // Aktualizacja chrome.storage z nowym poziomem zoomu
      chrome.storage.local.get([url], (result) => {
        const settings = result[url] || {};
        settings.zoomLevel = zoomLevels[currentZoomLevel];
        updateStorage(url, settings);
      });
    });

    dyslexiaButton.addEventListener("click", function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = new URL(tabs[0].url).origin;
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: fontToggle,
          args: [url], // Przekazuje URL jako argument
        });
      });
    });

    function fontToggle(url) {
      const stylesheetId = "opendyslexic-stylesheet";
      let link = document.getElementById(stylesheetId);

      chrome.storage.local.get([url], (result) => {
        let isFontEnabled = result[url] ? result[url].isFontEnabled : false;

        if (!isFontEnabled) {
          // Jeśli czcionka jest wyłączona, dodaj ją i zaktualizuj stan
          if (!link) {
            link = document.createElement("link");
            link.id = stylesheetId;
            link.href = chrome.runtime.getURL("assets/css/opendyslexic.css");
            link.type = "text/css";
            link.rel = "stylesheet";
            document.head.appendChild(link);
          }
          chrome.storage.local.set({ [url]: { isFontEnabled: true } });
        } else {
          // Jeśli czcionka jest włączona, usuń ją i zaktualizuj stan
          if (link) {
            link.remove();
          }
          chrome.storage.local.set({ [url]: { isFontEnabled: false } });
        }
      });
    }

    animationButton.addEventListener("click", () => {
      chrome.storage.local.get([url], (result) => {
        const animationInjection = result[url] && result[url].isAnimInjected;
        if (!animationInjection) {
          applyCSS(tab.id, animationCssCode);
          updateStorage(url, { ...result[url], isAnimInjected: true });
        } else {
          removeCSS(tab.id, animationCssCode);
          updateStorage(url, { ...result[url], isAnimInjected: false });
        }
      });
    });
  });
});
