// Reliable Chinese audio controller, especially for iPhone/iPad Safari.
//
// Strategy:
// 1. Preload human recordings in the background whenever a visible word/character appears.
// 2. When the user taps a speaker button, use the human recording only if it is already playable.
// 3. If it is not ready (missing file, slow network, first load), call speechSynthesis immediately
//    inside that same trusted tap. We never wait for an async error/timeout before starting TTS.
(function () {
  const HUMAN_AUDIO_BASE_URL = "https://raw.githubusercontent.com/hugolpz/audio-cmn/master/64k/hsk";
  const audioCache = new Map();
  let controllerAudio = null;

  function normalize(text) {
    return String(text || "").replace(/\s/g, "");
  }

  function audioUrl(phrase) {
    return `${HUMAN_AUDIO_BASE_URL}/cmn-${encodeURIComponent(phrase)}.mp3`;
  }

  function preloadHuman(phrase) {
    phrase = normalize(phrase);
    if (!phrase) return null;

    const existing = audioCache.get(phrase);
    if (existing) return existing;

    const audio = new Audio(audioUrl(phrase));
    const entry = { audio, state: "loading" };
    audioCache.set(phrase, entry);

    audio.preload = "auto";
    audio.addEventListener("canplay", () => {
      entry.state = "ready";
    });
    audio.addEventListener("canplaythrough", () => {
      entry.state = "ready";
    });
    audio.addEventListener("error", () => {
      entry.state = "error";
    });
    audio.load();
    return entry;
  }

  function loadVoices() {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function speakSystemChinese(text, statusElement) {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      if (statusElement) statusElement.textContent = "当前浏览器不支持系统语音朗读。";
      return false;
    }

    const phrase = normalize(text);
    if (!phrase) return false;

    const voices = loadVoices();
    const voice = voices.find((item) =>
      /^(zh-CN|zh_CN|zh)/i.test(item.lang || "") ||
      /Chinese|中文|普通话|Mandarin/i.test(item.name || "")
    );

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = voice?.lang || "zh-CN";
      if (voice) utterance.voice = voice;
      utterance.rate = 0.82;
      utterance.volume = 1;

      utterance.onstart = () => {
        if (statusElement) statusElement.textContent = "正在使用系统语音朗读…";
      };
      utterance.onerror = () => {
        if (statusElement) statusElement.textContent = "系统语音朗读失败，请检查设备是否启用了中文语音。";
      };

      // Important: this call happens synchronously from the user's tap.
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      if (statusElement) statusElement.textContent = "系统语音朗读失败。";
      return false;
    }
  }

  function reliablePlayChinese(text, statusElement) {
    const phrase = normalize(text);
    if (!phrase) return;

    if (controllerAudio) {
      controllerAudio.pause();
      controllerAudio.currentTime = 0;
      controllerAudio = null;
    }

    const entry = preloadHuman(phrase);
    const canUseHuman = entry && entry.state === "ready" && entry.audio.readyState >= 3;

    if (!canUseHuman) {
      // The recording is missing or is not already ready. TTS starts NOW, while this
      // function is still running in the trusted click/touch event on iOS Safari.
      speakSystemChinese(phrase, statusElement);
      return;
    }

    try {
      window.speechSynthesis?.cancel();
      const audio = entry.audio;
      controllerAudio = audio;
      audio.currentTime = 0;
      if (statusElement) statusElement.textContent = "正在播放真人录音…";

      const result = audio.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          // A play rejection can still happen on unusual browsers. This is best effort;
          // subsequent user taps will fall back synchronously if the recording is unusable.
          entry.state = "error";
          if (statusElement) statusElement.textContent = "真人录音无法播放，请再点一次使用系统语音。";
        });
      }
    } catch (error) {
      entry.state = "error";
      speakSystemChinese(phrase, statusElement);
    }
  }

  function scanAndPreload(root) {
    if (!root?.querySelectorAll) return;

    root.querySelectorAll("[data-character]").forEach((node) => preloadHuman(node.dataset.character));
    root.querySelectorAll("[data-word]").forEach((node) => preloadHuman(node.dataset.word));

    // Daily dictation keeps the answer in the DOM even while it is visually hidden.
    root.querySelectorAll(".dictation-answer-word").forEach((node) => {
      preloadHuman(node.textContent.replace(/^答案[:：]\s*/, ""));
    });
  }

  function installOverride() {
    // app.js declares playHumanChinese globally. Replacing the global binding means all
    // existing character, word and dictation click handlers use this implementation.
    if (typeof window.playHumanChinese === "function") {
      window.playHumanChinese = reliablePlayChinese;
    }

    scanAndPreload(document);
  }

  // app.js is the next classic script in index.html. Run after it has created its globals.
  window.setTimeout(installOverride, 0);
  document.addEventListener("DOMContentLoaded", installOverride, { once: true });

  if ("speechSynthesis" in window) {
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) scanAndPreload(node);
      });
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    scanAndPreload(document);
  }, { once: true });
})();
