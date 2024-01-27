// Syntezator mowy Web Speech API
if ("speechSynthesis" in window) {
  let lastSpokenText = "";
  let utterance = new SpeechSynthesisUtterance();
  //Ustawienia języka
  utterance.lang = "pl-PL";

  //Funkcja, która odtwarza podświetlony tekst
  function speakText(text) {
    if (text !== lastSpokenText) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      utterance.text = text;

      utterance.onerror = function (event) {
        console.error(
          "🧐Podczas syntezowania mowy, wystąpił błąd:",
          event.error
        );
      };

      window.speechSynthesis.speak(utterance);
      lastSpokenText = text;
      console.log("📢:", text);
    }
  }

  //Funkcja, która sprawdza, czy zaznaczony tekst jest pojedynczym słowem
  function isSingleWord(text) {
    return text.trim().match(/^\S+$/) !== null;
  }

  //Funckja wywoływana po zaznaczeniu tekstu
  document.addEventListener("mouseup", function () {
    let selectedText = window.getSelection().toString();

    if (selectedText.trim()) {
      let textToSpeak = isSingleWord(selectedText)
        ? selectedText.trim()
        : selectedText.trim();
      speakText(textToSpeak);
    } else {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    }
  });

  //Funkcja, która synchoronizuje ustawienia głośności z popupem
  chrome.storage.sync.get(["volume"], function (data) {
    utterance.volume = data.volume ? data.volume / 100 : 1;
  });

  //Funkcja, która przesyła ustawienia głośności z popup.js do active.js
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (sender.id === chrome.runtime.id && request.volume !== undefined) {
      utterance.volume = request.volume / 100;
    }
  });
} else {
  console.error("Twoja przeglądarka nie obsługuje Web Speech API 😞");
}

//Ładowanie czcionek w postaci assetów
function loadStylesheet(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.crossOrigin = "anonymous";
    link.id = "projectmoon_fonts";
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(`❌Assety nie zostały załadowane: ${url}`);
    document.head.appendChild(link);
  });
}

//Ładowanie czcionek oraz wyświetlenie komunikatu w konsoli
loadStylesheet(chrome.runtime.getURL("assets/css/fonts.css"))
  .then(() => {
    console.log("✅Assety zostały załadowane (OpenDyslexic oraz OpenSans)");
  })
  .catch((error) => {
    console.error(error);
  });

//Funkcja, która dodaje tabindex do elementów interaktywnych
window.onload = function () {
  var selectors =
    'a[href], button, input, textarea, select, [role="button"], [onclick], [onkeydown], [onkeyup], [onkeypress]';
  console.log("🔎Szukanie elementów interaktywnych...");
  var interactiveElements = document.querySelectorAll(selectors);

  interactiveElements.forEach(function (element) {
    if (!element.hasAttribute("tabindex")) {
      element.setAttribute("tabindex", "0");
      console.log(
        `✅Element interaktywny został zaindeksowany dla: ${element.tagName} ${
          element.className ? "." + element.className : ""
        } ${element.id ? "#" + element.id : ""}`
      );
    }
  });

  //Śledzenie zmiany wartości inputa typu range
  for (let e of document.querySelectorAll(
    'input[type="range"].slider-progress'
  )) {
    e.style.setProperty("--value", e.value);
    e.style.setProperty("--min", e.min == "" ? "0" : e.min);
    e.style.setProperty("--max", e.max == "" ? "100" : e.max);
    e.addEventListener("input", () => e.style.setProperty("--value", e.value));
  }
};
