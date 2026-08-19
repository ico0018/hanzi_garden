// iOS Safari requires speechSynthesis to be activated from a direct user gesture.
// Prime it before app.js starts asynchronous human-audio loading, so the existing
// human-audio -> system-TTS fallback can still speak after an error or timeout.
(function () {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;

  let unlocked = false;

  function unlockSpeechSynthesis() {
    if (unlocked) {
      window.speechSynthesis.resume();
      return;
    }

    try {
      window.speechSynthesis.resume();

      // A silent utterance inside the user's gesture unlocks Web Speech on iOS.
      // Keep it silent so it never competes with the preferred human recording.
      const primer = new SpeechSynthesisUtterance(" ");
      primer.lang = "zh-CN";
      primer.volume = 0;
      primer.rate = 1;
      primer.onend = () => {
        unlocked = true;
      };
      primer.onerror = () => {
        // Even if the silent primer reports an error, future gestures will retry.
        unlocked = false;
      };
      window.speechSynthesis.speak(primer);

      // Mark this gesture as attempted immediately. A later pointer/click can still
      // call resume(), which is important after iOS suspends speech in the background.
      unlocked = true;
    } catch (error) {
      unlocked = false;
    }
  }

  // pointerdown/touchstart happen earlier than click and are trusted user gestures.
  document.addEventListener("pointerdown", unlockSpeechSynthesis, { capture: true, passive: true });
  document.addEventListener("touchstart", unlockSpeechSynthesis, { capture: true, passive: true });
  document.addEventListener("click", unlockSpeechSynthesis, true);

  // iOS may suspend speechSynthesis after switching apps/tabs.
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      try {
        window.speechSynthesis.resume();
      } catch (error) {
        // Ignore: the next trusted gesture will retry the unlock.
      }
    }
  });
})();
