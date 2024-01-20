//Zmienne globalne
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

//Tablica z poziomami zoomu
const zoomLevels = [1.0, 1.2, 1.3, 1.5];

// Funkcja, która pobiera dane z chrome.storage.local
async function getStorageData(url) {
  try {
    const result = await chrome.storage.local.get([url]);
    return result[url] || {};
  } catch (error) {
    console.error(
      `❌Wystąpił błąd, podczas próby pobierania danych z chrome.storage dla: ${url}`,
      error
    );
    return {};
  }
}

// Funkcja, która aktualizuje dane w chrome.storage.local
async function updateStorageData(url, data) {
  try {
    await chrome.storage.local.set({ [url]: data });
  } catch (error) {
    console.error(
      `❌Wystąpił błąd, podczas próby aktualizacji danych w chrome.storage dla: ${url}`,
      error
    );
  }
}

// Funkcja, która wstrzykuje CSS do strony
async function applyCSS(tabId, cssCode) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: cssCode,
    });
  } catch (error) {
    console.error(
      `❌Wystąpił błąd, podczas próby wstrzykiwania kodu CSS do strony, której ID zakładki to: ${tabId}`,
      error
    );
  }
}

// Funkcja, która usuwa wstrzyknięte CSS ze strony
async function removeCSS(tabId, cssCode) {
  try {
    await chrome.scripting.removeCSS({
      target: { tabId },
      css: cssCode,
    });
  } catch (error) {
    console.error(
      `❌Wystąpił błąd, podczas próby usuwania kodu CSS ze strony, której ID zakładki to: ${tabId}`,
      error
    );
  }
}

// Funkcja, która aktualizuje stan CSS
async function updateCSSState(tabId, data, styleKey, cssCode, isInjected) {
  if (typeof data[styleKey] !== "object") {
    console.error(
      `❓Oczekiwano obiektu dla klucza stylu: ${styleKey}, ✅otrzymano: ${typeof data[
        styleKey
      ]}`
    );
    return;
  }

  if (isInjected) {
    await applyCSS(tabId, cssCode);
  } else {
    await removeCSS(tabId, cssCode);
  }
  data[styleKey].code = cssCode;
  data[styleKey].isInjected = isInjected;
}

//Funkcja, która włącza/wyłącza wstrzyknięcie CSS (do wyboru: przycisk podstawowy, przycisk z 3 stanami)
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
        data[styleKey].isInjected = false;
        await updateCSSState(tabId, data, styleKey, data[styleKey].code, false);
        button.textContent = text1;
        break;
      case 1:
        const code1 = cssStylesData[styleKey]
          ? cssStylesData[styleKey].code
          : "";
        data[styleKey].isInjected = true;
        await updateCSSState(tabId, data, styleKey, code1, true);
        button.textContent = text2;
        break;
      case 2:
        data[styleKey].isInjected = false;
        await updateCSSState(tabId, data, styleKey, data[styleKey].code, false);
        const code2 = cssStylesData[styleKey + "2"]
          ? cssStylesData[styleKey + "2"].code
          : "";
        data[styleKey].isInjected = true;
        await updateCSSState(tabId, data, styleKey, code2, true);
        button.textContent = text3;
        break;
    }
  } else {
    data[styleKey].isInjected = !data[styleKey].isInjected;
    await updateCSSState(
      tabId,
      data,
      styleKey,
      data[styleKey].code,
      data[styleKey].isInjected
    );

    if (button) {
      button.textContent = data[styleKey].isInjected ? text1 : text2;
    }
  }

  if (button && !data.buttonText) {
    data.buttonText = {};
  }
  if (button) {
    data.buttonText[styleKey] = button.textContent;
  }
  await updateStorageData(url, data);
}

//Funkcja, która włącza/wyłącza zoom
async function applyZoom(tabId, zoomLevel) {
  await chrome.tabs.setZoom(tabId, zoomLevel);
}

//Funkcja, która aktualizuje stan zoomu
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

//Funkcja pobierająca DOM strony
document.addEventListener("DOMContentLoaded", function () {
  //Zmienne dla głosności Web Speech API
  let debounceTimer;
  let isMuted = false;
  let previousVolume = 100;
  //Funkcje aktualizujące oraz synchronizujące głośność Web Speech API
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

  //Zmienne przyjmujące wartości przycisków
  const buttons = {
    inject: document.getElementById("inject-css"),
    zoom: document.getElementById("zoom-button"),
    animation: document.getElementById("animation-button"),
    dyslexia: document.getElementById("dyslexia-font"),
  };

  //Funkcja, która pobiera dane obecnie aktywnie otwartej zakładki w oknie przeglądarki
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url).origin;
    const data = await getStorageData(url);

    //Warunki sprawdzające, czy przyciski mają tekst
    if (data.buttonText && data.buttonText.contrast) {
      buttons.inject.textContent = data.buttonText.contrast;
    }
    if (data.buttonText && data.buttonText.animation) {
      buttons.animation.textContent = data.buttonText.animation;
    }
    if (data.buttonText && data.buttonText.font) {
      buttons.dyslexia.textContent = data.buttonText.font;
    }

    //Warunek sprawdzający, czy przycisk zoomu ma tekst
    if (data.currentZoomLevel) {
      const buttonText =
        data.currentZoomLevel === 1.0
          ? "Zoom 1x"
          : `Zoom ${data.currentZoomLevel}x`;
      buttons.zoom.textContent = buttonText;
    }

    //Funkcje wywoływane po kliknięciu przycisków
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
