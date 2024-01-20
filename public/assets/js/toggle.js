const CONTRAST = "contrast";
const ANIMATION = "animation";
const FONT = "font";
const STATES_COUNT = 3;

const cssStylesData = {
  [CONTRAST]: {
    code: "body { background-color: #000 !important; }",
    isInjected: false,
  },
  [CONTRAST + "2"]: {
    code: "body { background-color: #fff !important; }",
    isInjected: false,
  },
  [ANIMATION]: {
    code: "body { animation: none !important; transition: none !important; }",
    isInjected: false,
  },
  [FONT]: {
    code: "* { font-family: OpenDyslexic !important; }",
    isInjected: false,
  },
};

const zoomLevels = [1.0, 1.2, 1.3, 1.5];

async function getStorageData(url) {
  const result = await chrome.storage.local.get([url]);
  return result[url] || {};
}

async function updateStorageData(url, data) {
  await chrome.storage.local.set({ [url]: data });
}

async function applyCSS(tabId, cssCode) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    css: cssCode,
  });
}

async function removeCSS(tabId, cssCode) {
  await chrome.scripting.removeCSS({
    target: { tabId },
    css: cssCode,
  });
}

async function updateCSSState(tabId, data, styleKey, cssCode, isInjected) {
  if (isInjected) {
    await applyCSS(tabId, cssCode);
  } else {
    await removeCSS(tabId, cssCode);
  }
  data[styleKey].code = cssCode;
  data[styleKey].isInjected = isInjected;
}

async function toggleCSSInjection(
  tabId,
  url,
  styleKey,
  button = null,
  text1 = "",
  text2 = "",
  text3 = ""
) {
  const data = await getStorageData(url);
  if (!data[styleKey]) {
    data[styleKey] = {
      ...cssStylesData[styleKey],
      clickCount: 0,
      isInjected: false,
    };
  }

  if (button && text1 && text2 && text3) {
    data[styleKey].clickCount = (data[styleKey].clickCount + 1) % STATES_COUNT;

    switch (data[styleKey].clickCount) {
      case 0:
        await updateCSSState(
          tabId,
          data,
          styleKey,
          cssStylesData[styleKey].code,
          false
        );
        button.textContent = text1;
        break;
      case 1:
        await updateCSSState(tabId, data, styleKey, data[styleKey].code, true);
        button.textContent = text2;
        break;
      case 2:
        const newCode = cssStylesData[styleKey + "2"]
          ? cssStylesData[styleKey + "2"].code
          : data[styleKey].code;
        await updateCSSState(tabId, data, styleKey, newCode, true);
        button.textContent = text3;
        break;
    }
  } else {
    const isInjected = !data[styleKey].isInjected;
    await updateCSSState(
      tabId,
      data,
      styleKey,
      data[styleKey].code,
      isInjected
    );
    button.textContent = isInjected ? text1 : text2;
  }

  if (button && !data.buttonText) {
    data.buttonText = {};
  }
  if (button) {
    data.buttonText[styleKey] = button.textContent;
  }
  await updateStorageData(url, data);
}

async function applyZoom(tabId, zoomLevel) {
  await chrome.tabs.setZoom(tabId, zoomLevel);
}

async function toggleZoom(tabId, url) {
  const data = await getStorageData(url);
  if (!data.currentZoomLevel) {
    data.currentZoomLevel = 1.0;
  }

  const nextZoomIndex =
    (zoomLevels.indexOf(data.currentZoomLevel) + 1) % zoomLevels.length;
  data.currentZoomLevel = zoomLevels[nextZoomIndex];

  await applyZoom(tabId, data.currentZoomLevel);
  await updateStorageData(url, data);

  const zoomButton = document.getElementById("zoom-button");
  const buttonText =
    zoomLevels[nextZoomIndex] === 1.0
      ? "Zoom 1x"
      : `Zoom ${zoomLevels[nextZoomIndex]}x`;
  zoomButton.textContent = buttonText;
}

document.addEventListener("DOMContentLoaded", function () {
  const buttons = {
    inject: document.getElementById("inject-css"),
    zoom: document.getElementById("zoom-button"),
    animation: document.getElementById("animation-button"),
    dyslexia: document.getElementById("dyslexia-font"),
  };

  let debounceTimer;
  let isMuted = false;
  let previousVolume = 100;

  chrome.storage.sync.get(["volume", "isMuted"], function (data) {
    isMuted = data.isMuted || false;
    previousVolume = data.volume !== undefined ? data.volume : 100;

    document.getElementById("volumeSlider").value = previousVolume;

    document.getElementById("muteButton").textContent = isMuted
      ? "Odcisz"
      : "Wycisz";
  });

  document
    .getElementById("volumeSlider")
    .addEventListener("input", function () {
      let volume = this.value;
      if (!isMuted) {
        previousVolume = volume;
      }
      let muteButton = document.getElementById("muteButton");
      muteButton.textContent = volume == 0 ? "Odcisz" : "Wycisz";
      isMuted = volume == 0;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        chrome.storage.sync.set(
          { volume: volume, isMuted: isMuted, previousVolume: previousVolume },
          function () {
            if (chrome.runtime.lastError) {
              console.log("Error: ", chrome.runtime.lastError);
            } else {
              console.log("Volume is set to " + volume);
              updateVolume(volume);
            }
          }
        );
      }, 175);
    });

  document.getElementById("muteButton").addEventListener("click", function () {
    let volumeSlider = document.getElementById("volumeSlider");
    let muteButton = this;

    if (isMuted) {
      let newVolume = previousVolume;
      volumeSlider.value = newVolume > 0 ? newVolume : 75;
      muteButton.textContent = "Wycisz";
      isMuted = false;
      updateVolume(volumeSlider.value);
    } else {
      previousVolume = volumeSlider.value;
      volumeSlider.value = 0;
      muteButton.textContent = "Odcisz";
      isMuted = true;
      updateVolume(0);
    }

    chrome.storage.sync.set(
      {
        volume: volumeSlider.value,
        isMuted: isMuted,
        previousVolume: previousVolume,
      },
      function () {
        console.log("Volume is set to " + volumeSlider.value);
      }
    );
  });

  function updateVolume(volume) {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs.sendMessage(tab.id, { volume: volume });
      });
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url).origin;
    const data = await getStorageData(url);
    if (data.buttonText && data.buttonText.contrast) {
      buttons.inject.textContent = data.buttonText.contrast;
    }
    if (data.buttonText && data.buttonText.animation) {
      buttons.animation.textContent = data.buttonText.animation;
    }
    if (data.buttonText && data.buttonText.font) {
      buttons.dyslexia.textContent = data.buttonText.font;
    }
    if (data.currentZoomLevel) {
      const buttonText =
        data.currentZoomLevel === 1.0
          ? "Zoom 1x"
          : `Zoom ${data.currentZoomLevel}x`;
      buttons.zoom.textContent = buttonText;
    }

    buttons.inject.addEventListener("click", async () => {
      await toggleCSSInjection(
        tab.id,
        url,
        CONTRAST,
        buttons.inject,
        "Brak",
        "Kontrast 1",
        "Kontrast 2"
      );
    });

    buttons.zoom.addEventListener("click", async () => {
      await toggleZoom(tab.id, url);
    });

    buttons.animation.addEventListener("click", async () => {
      await toggleCSSInjection(
        tab.id,
        url,
        ANIMATION,
        buttons.animation,
        "Animacja",
        "Brak"
      );
    });

    buttons.dyslexia.addEventListener("click", async () => {
      await toggleCSSInjection(
        tab.id,
        url,
        FONT,
        buttons.dyslexia,
        "Czcionka",
        "Brak"
      );
    });
  });
});
