let cssStylesData = {
  contrast: {
    code: "body { background-color: #000 !important; }",
    isInjected: false,
  },
  animation: {
    code: "body { animation: none !important; transition: none !important; }",
    isInjected: false,
  },
  font: {
    code: "* { font-family: OpenDyslexic !important;",
    isInjected: false,
  },
};

const zoomLevels = [1.0, 1.2, 1.3, 1.5];

function getStorageData(url, callback) {
  chrome.storage.local.get([url], (result) => {
    callback(result[url] || {});
  });
}

function updateStorageData(url, data) {
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

function toggleCSSInjection(tabId, url, styleKey) {
  getStorageData(url, (data) => {
    if (!data[styleKey]) {
      data[styleKey] = { ...cssStylesData[styleKey] };
    }

    if (!data[styleKey].isInjected) {
      applyCSS(tabId, data[styleKey].code);
      data[styleKey].isInjected = true;
    } else {
      removeCSS(tabId, data[styleKey].code);
      data[styleKey].isInjected = false;
    }
    updateStorageData(url, data);
  });
}

function applyZoom(tabId, zoomLevel) {
  chrome.tabs.setZoom(tabId, zoomLevel);
}

function toggleZoom(tabId, url) {
  getStorageData(url, (data) => {
    if (!data.currentZoomLevel) {
      data.currentZoomLevel = 1.0;
    }

    let nextZoomIndex =
      (zoomLevels.indexOf(data.currentZoomLevel) + 1) % zoomLevels.length;
    data.currentZoomLevel = zoomLevels[nextZoomIndex];

    applyZoom(tabId, data.currentZoomLevel);
    updateStorageData(url, data);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const buttons = {
    inject: document.getElementById("inject-css"),
    zoom: document.getElementById("zoom-button"),
    animation: document.getElementById("animation-button"),
    dyslexia: document.getElementById("dyslexia-font"),
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url).origin;

    buttons.inject.addEventListener("click", () => {
      toggleCSSInjection(tab.id, url, "contrast", cssStylesData);
    });

    buttons.zoom.addEventListener("click", () => {
      toggleZoom(tab.id, url);
    });

    buttons.animation.addEventListener("click", () => {
      toggleCSSInjection(tab.id, url, "animation", cssStylesData);
    });

    buttons.dyslexia.addEventListener("click", () => {
      toggleCSSInjection(tab.id, url, "font", cssStylesData);
    });
  });
});
