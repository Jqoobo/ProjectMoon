if ("speechSynthesis" in window) {
  let lastSpokenText = "";

  function speakText(text) {
    if (text !== lastSpokenText) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pl-PL";

      utterance.onerror = function (event) {
        if (event.error !== "interrupted") {
          console.error(
            "Wystąpił błąd podczas syntezowania mowy:",
            event.error
          );
        }
      };

      window.speechSynthesis.speak(utterance);
      lastSpokenText = text;
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
} else {
  console.error("Przeglądarka nie obsługuje Web Speech API");
}
