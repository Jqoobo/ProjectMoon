//Zmienne globalne
const CONTRAST = "contrast";
const ANIMATION = "animation";
const FONT = "variousFonts";
const CURSOR = "cursor";
const FONT_SIZE = "fontSize";
const LINK = "link";
const LETTER_SPACING = "letterSpacing";
const LINE_HEIGHT = "lineHeight";
const ALIGN = "align";
const SATURATION = "saturation";
const NO_SATURATION = "noSaturation";
const BRIGHTNESS = "brightness";
const NO_IMG = "noImg";
const IMG_ZOOM = "imgZoom";
const STATES_COUNT = 3;

const cssStylesData = {
  [CONTRAST]: {
    code: `
    * {background-color: #000 !important; color: #ff0 !important; border-radius: 0 !important;}
    *:hover, *:focus, *:active {background-color: #000 !important; color: #ff0 !important;}
    `,
    isInjected: false,
  },
  [CONTRAST + "2"]: {
    code: `
    * {background-color: #000 !important; color: #00fbff !important; border-radius: 0 !important;}
    *:hover, *:focus, *:active {background-color: #000 !important; color: #00fbff !important;}
    `,
    isInjected: false,
  },
  [ANIMATION]: {
    code: "* { animation: none !important; transition: none !important; }",
    isInjected: false,
  },
  [FONT]: {
    code: "* { font-family: OpenDyslexic !important; }",
    isInjected: false,
  },
  [FONT + "2"]: {
    code: "* { font-family: OpenSans !important; }",
    isInjected: false,
  },
  [CURSOR]: {
    code: "* { cursor: url(chrome-extension://nipkeppodhkpeeedgakdmflaandghken/assets/images/cursor_yellow.svg), auto !important; }",
    isInjected: false,
  },
  [CURSOR + "2"]: {
    code: "* { cursor: url(chrome-extension://nipkeppodhkpeeedgakdmflaandghken/assets/images/cursor_blue.svg), auto !important; }",
    isInjected: false,
  },
  [FONT_SIZE]: {
    code: "* { font-size: 1rem !important; }",
    isInjected: false,
  },
  [FONT_SIZE + "2"]: {
    code: "* { font-size: 1.25rem !important; }",
    isInjected: false,
  },
  [LINK]: {
    code: "a { background-color: #000 !important; color: #ff0 !important; text-decoration: underline !important;}",
    isInjected: false,
  },
  [LINK + "2"]: {
    code: "a { background-color: #000 !important; color: #00fbff !important; text-decoration: underline !important;}",
    isInjected: false,
  },
  [LETTER_SPACING]: {
    code: "* { letter-spacing: 0.12em !important; }",
    isInjected: false,
  },
  [LINE_HEIGHT]: {
    code: "* { line-height: 1.5 !important; }",
    isInjected: false,
  },
  [LINE_HEIGHT + "2"]: {
    code: "* { line-height: 2.0 !important; }",
    isInjected: false,
  },
  [ALIGN]: {
    code: "* { text-align: justify !important; }",
    isInjected: false,
  },
  [ALIGN + "2"]: {
    code: "* { text-align: left !important; }",
    isInjected: false,
  },
  [SATURATION]: {
    code: "html { filter: saturate(0.5) !important; }",
    isInjected: false,
  },
  [SATURATION + "2"]: {
    code: "html { filter: saturate(3) !important; }",
    isInjected: false,
  },
  [NO_SATURATION]: {
    code: "html { filter: saturate(0) !important; }",
    isInjected: false,
  },
  [BRIGHTNESS]: {
    code: "html { filter: brightness(50%) !important; }",
    isInjected: false,
  },
  [BRIGHTNESS + "2"]: {
    code: "html { filter: brightness(125%) !important; }",
    isInjected: false,
  },
  [NO_IMG]: {
    code: "img { display: none !important; } * { background-image: none !important; }",
    isInjected: false,
  },
  [IMG_ZOOM]: {
    code: "img { transform: scale(1.5) !important; }",
    isInjected: false,
  },
};

const originalButtonTexts = {
  contrast: "Kontrast",
  zoom: "Zoom 1x",
  variousFonts: "Przyjazne czcionki",
  animation: "Wyłączenie animacji",
  cursor: "Kursor",
  fontSize: "Wielkość tekstu",
  link: "Podświetlenie linków",
  letterSpacing: "Odstęp znaków",
  lineHeight: "Wysokość linii",
  align: "Wyrównaj tekst",
  saturation: "Zmiana saturacji",
  noSaturation: "Desaturacja",
  brightness: "Zmiana jasności",
  noImg: "Ukryj obrazy",
  imgZoom: "Powiększ obrazy",
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
async function cssInjection(
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
    const buttonTextSpan = button.querySelector(".button_text");

    switch (data[styleKey].clickCount) {
      case 0:
        if (data[styleKey].isInjected) {
          await updateCSSState(
            tabId,
            data,
            styleKey,
            data[styleKey].code,
            false
          );
        }
        if (buttonTextSpan) buttonTextSpan.textContent = text1;
        data[styleKey].isInjected = false;
        break;
      case 1:
        const code1 = cssStylesData[styleKey]
          ? cssStylesData[styleKey].code
          : "";
        if (data[styleKey].isInjected) {
          await updateCSSState(
            tabId,
            data,
            styleKey,
            data[styleKey].code,
            false
          );
        }
        await updateCSSState(tabId, data, styleKey, code1, true);
        if (buttonTextSpan) buttonTextSpan.textContent = text2;
        data[styleKey].isInjected = true;
        break;
      case 2:
        if (data[styleKey].isInjected) {
          await updateCSSState(
            tabId,
            data,
            styleKey,
            data[styleKey].code,
            false
          );
        }
        const code2 = cssStylesData[styleKey + "2"]
          ? cssStylesData[styleKey + "2"].code
          : "";
        await updateCSSState(tabId, data, styleKey, code2, true);
        if (buttonTextSpan) buttonTextSpan.textContent = text3;
        data[styleKey].isInjected = true;
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
      const buttonTextSpan = button.querySelector(".button_text");
      buttonTextSpan.textContent = data[styleKey].isInjected ? text1 : text2;
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
async function updateZoom(tabId, url) {
  const data = await getStorageData(url);
  if (!data.currentZoomLevel) {
    data.currentZoomLevel = 1.0;
  }

  const nextZoomIndex =
    (zoomLevels.indexOf(data.currentZoomLevel) + 1) % zoomLevels.length;
  data.currentZoomLevel = zoomLevels[nextZoomIndex];

  await applyZoom(tabId, data.currentZoomLevel);
  await updateStorageData(url, data);

  const zoomButton = document.getElementById("zoomButton");
  const zoomButtonTextSpan = zoomButton.querySelector(".button_text");
  const buttonText =
    zoomLevels[nextZoomIndex] === 1.0
      ? "Zoom 1x"
      : `Zoom ${zoomLevels[nextZoomIndex]}x`;
  zoomButtonTextSpan.textContent = buttonText;
}

//Funkcja, która resetuje wszystkie style
async function resetAllStyles(tabId, url) {
  const data = await getStorageData(url);

  for (const styleKey in cssStylesData) {
    if (cssStylesData.hasOwnProperty(styleKey)) {
      data[styleKey] = {
        ...cssStylesData[styleKey],
        clickCount: 0,
        isInjected: false,
      };
      await removeCSS(tabId, cssStylesData[styleKey].code);
    }
  }

  updateButtonLabels(data);
  const defaultZoom = 1.0;
  await applyZoom(tabId, defaultZoom);
  data.currentZoomLevel = defaultZoom;
  await updateStorageData(url, data);
}

//Funkcja, która aktualizuje etykiety przycisków po resecie styli
function updateButtonLabels(data) {
  for (const styleKey in originalButtonTexts) {
    if (originalButtonTexts.hasOwnProperty(styleKey)) {
      const button = document.getElementById(styleKey + "Button");
      if (button) {
        const buttonTextSpan = button.querySelector(".button_text");
        buttonTextSpan.textContent = originalButtonTexts[styleKey];
      }
      if (data.buttonText) {
        data.buttonText[styleKey] = originalButtonTexts[styleKey];
      }
    }
  }
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
    contrast: document.getElementById("contrastButton"),
    zoom: document.getElementById("zoomButton"),
    animation: document.getElementById("animationButton"),
    variousfonts: document.getElementById("variousFontsButton"),
    cursor: document.getElementById("cursorButton"),
    fontsize: document.getElementById("fontSizeButton"),
    link: document.getElementById("linkButton"),
    letterspacing: document.getElementById("letterSpacingButton"),
    lineheight: document.getElementById("lineHeightButton"),
    align: document.getElementById("alignButton"),
    saturation: document.getElementById("saturationButton"),
    nosaturation: document.getElementById("noSaturationButton"),
    brightness: document.getElementById("brightnessButton"),
    noimg: document.getElementById("noImgButton"),
    imgzoom: document.getElementById("imgZoomButton"),
    reset: document.getElementById("resetButton"),
  };

  //Funkcja, która pobiera dane obecnie aktywnie otwartej zakładki w oknie przeglądarki
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs[0];
    const url = new URL(tab.url).origin;
    const data = await getStorageData(url);

    //Warunki sprawdzające, czy przyciski mają tekst
    if (data.buttonText && data.buttonText.contrast) {
      const contrastTextSpan = buttons.contrast.querySelector(".button_text");
      contrastTextSpan.textContent = data.buttonText.contrast;
    }
    if (data.buttonText && data.buttonText.animation) {
      const animationButtonTextSpan =
        buttons.animation.querySelector(".button_text");
      animationButtonTextSpan.textContent = data.buttonText.animation;
    }
    if (data.buttonText && data.buttonText.variousFonts) {
      const fontsTextSpan = buttons.variousfonts.querySelector(".button_text");
      fontsTextSpan.textContent = data.buttonText.variousFonts;
    }
    if (data.buttonText && data.buttonText.cursor) {
      const cursorTextSpan = buttons.cursor.querySelector(".button_text");
      cursorTextSpan.textContent = data.buttonText.cursor;
    }
    if (data.buttonText && data.buttonText.fontSize) {
      const fonSizeTextSpan = buttons.fontsize.querySelector(".button_text");
      fonSizeTextSpan.textContent = data.buttonText.fontSize;
    }
    if (data.buttonText && data.buttonText.link) {
      const linkTextSpan = buttons.link.querySelector(".button_text");
      linkTextSpan.textContent = data.buttonText.link;
    }
    if (data.buttonText && data.buttonText.letterSpacing) {
      const letterSpacingTextSpan =
        buttons.letterspacing.querySelector(".button_text");
      letterSpacingTextSpan.textContent = data.buttonText.letterSpacing;
    }
    if (data.buttonText && data.buttonText.lineHeight) {
      const lineHeightTextSpan =
        buttons.lineheight.querySelector(".button_text");
      lineHeightTextSpan.textContent = data.buttonText.lineHeight;
    }
    if (data.buttonText && data.buttonText.align) {
      const alignTextSpan = buttons.align.querySelector(".button_text");
      alignTextSpan.textContent = data.buttonText.align;
    }
    if (data.buttonText && data.buttonText.saturation) {
      const saturationTextSpan =
        buttons.saturation.querySelector(".button_text");
      saturationTextSpan.textContent = data.buttonText.saturation;
    }
    if (data.buttonText && data.buttonText.noSaturation) {
      const noSaturationTextSpan =
        buttons.nosaturation.querySelector(".button_text");
      noSaturationTextSpan.textContent = data.buttonText.noSaturation;
    }
    if (data.buttonText && data.buttonText.brightness) {
      const brightnessTextSpan =
        buttons.brightness.querySelector(".button_text");
      brightnessTextSpan.textContent = data.buttonText.brightness;
    }
    if (data.buttonText && data.buttonText.noImg) {
      const noImgTextSpan = buttons.noimg.querySelector(".button_text");
      noImgTextSpan.textContent = data.buttonText.noImg;
    }
    if (data.buttonText && data.buttonText.imgZoom) {
      const imgZoomTextSpan = buttons.imgzoom.querySelector(".button_text");
      imgZoomTextSpan.textContent = data.buttonText.imgZoom;
    }

    //Warunek sprawdzający, czy przycisk zoomu ma tekst
    if (data.currentZoomLevel) {
      const buttonText =
        data.currentZoomLevel === 1.0
          ? "Zoom 1x"
          : `Zoom ${data.currentZoomLevel}x`;
      const zoomTextSpan = buttons.zoom.querySelector(".button_text");
      zoomTextSpan.textContent = buttonText;
    }

    //Funkcje wywoływane po kliknięciu przycisków
    buttons.contrast.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        CONTRAST,
        buttons.contrast,
        "Nie ustawiono",
        "Kontrast 1",
        "Kontrast 2"
      );
    });

    buttons.zoom.addEventListener("click", async () => {
      await updateZoom(tab.id, url);
    });

    buttons.animation.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        ANIMATION,
        buttons.animation,
        "Zatrzymanie animacji",
        "Włączenie animacji"
      );
    });

    buttons.variousfonts.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        FONT,
        buttons.variousfonts,
        "Nie ustawiono",
        "Czcionka OpenDyslexic",
        "Czcionka OpenSans"
      );
    });

    buttons.cursor.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        CURSOR,
        buttons.cursor,
        "Nie ustawiono",
        "Kursor żółty",
        "Kursor niebieski"
      );
    });
    buttons.fontsize.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        FONT_SIZE,
        buttons.fontsize,
        "Nie ustawiono",
        "Rozmiar czcionki 1x",
        "Rozmiar czcionki 1.25x"
      );
    });
    buttons.link.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        LINK,
        buttons.link,
        "Nie ustawiono",
        "Podświetlenie żółte",
        "Podświetlenie niebieskie"
      );
    });
    buttons.letterspacing.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        LETTER_SPACING,
        buttons.letterspacing,
        "Odstęp między literami",
        "Nie ustawiono"
      );
    });
    buttons.lineheight.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        LINE_HEIGHT,
        buttons.lineheight,
        "Nie ustawiono",
        "Wysokość linii 1.5",
        "Wysokość linii 2.0"
      );
    });
    buttons.align.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        ALIGN,
        buttons.align,
        "Nie ustawiono",
        "Tekst wyjustowany",
        "Tekst do lewej"
      );
    });
    buttons.saturation.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        SATURATION,
        buttons.saturation,
        "Nie ustawiono",
        "Saturacja 50%",
        "Saturacja 150%"
      );
    });
    buttons.nosaturation.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        NO_SATURATION,
        buttons.nosaturation,
        "Monochromatyczność",
        "Nie ustawiono"
      );
    });
    buttons.brightness.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        BRIGHTNESS,
        buttons.brightness,
        "Nie ustawiono",
        "Jasność 50%",
        "Jasność 150%"
      );
    });
    buttons.noimg.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        NO_IMG,
        buttons.noimg,
        "Ukryj obrazy",
        "Nie ustawiono"
      );
    });
    buttons.imgzoom.addEventListener("click", async () => {
      await cssInjection(
        tab.id,
        url,
        IMG_ZOOM,
        buttons.imgzoom,
        "Powiększ obrazy",
        "Nie ustawiono"
      );
    });
    buttons.reset.addEventListener("click", async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        const url = new URL(tab.url).origin;
        await resetAllStyles(tab.id, url);
      });
    });
  });
});
