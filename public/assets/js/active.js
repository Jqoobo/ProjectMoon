// Syntezator mowy Web Speech API
if ("speechSynthesis" in window) {
  let lastSpokenText = "";
  let utterance = new SpeechSynthesisUtterance();
  utterance.lang = "pl-PL";

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

  function isSingleWord(text) {
    return text.trim().match(/^\S+$/) !== null;
  }

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

  chrome.storage.sync.get(["volume"], function (data) {
    utterance.volume = data.volume ? data.volume / 100 : 1;
  });

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

//Ładownanie czcionki OpenDyslexic w postaci assetu
function loadStylesheet(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.crossOrigin = "anonymous";
    link.id = "projectmoon_opendyslexic_font";
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(`❌Asset nie został załadowany: ${url}`);
    document.head.appendChild(link);
  });
}

loadStylesheet(chrome.runtime.getURL("assets/css/opendyslexic.css"))
  .then(() => {
    console.log("✅Asset został załadowany (OpenDyslexic)");
  })
  .catch((error) => {
    console.error(error);
  });
