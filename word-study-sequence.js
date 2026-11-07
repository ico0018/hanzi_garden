(function (global) {
  "use strict";
  function createSequence({ createWriter, onError = () => {}, onStepComplete = () => {}, onFinished = () => {} }) {
    let generation = 0;
    let active = null;
    let disposed = false;
    const isCurrent = token => !disposed && token === generation;
    function cancel() {
      generation++;
      const previous = active;
      active = null;
      if (previous) {
        previous.cancelQuiz?.();
        try { Promise.resolve(previous.hideCharacter?.({ duration: 0 })).catch(() => {}); } catch (_) { /* A failed loader has nothing left to stop. */ }
      }
      return generation;
    }
    function track(writer, token) {
      if (isCurrent(token)) active = writer;
    }
    async function play(indices) {
      const token = cancel();
      for (const index of indices) {
        if (!isCurrent(token)) return;
        try {
          const writer = createWriter(index, token);
          if (!writer || !isCurrent(token)) return;
          active = writer;
          // Writer 2.0.2 returns the real animation result; load failure may resolve undefined.
          const result = await writer.animateCharacter();
          if (!isCurrent(token) || result?.canceled !== false) return;
          if (active === writer) active = null;
          onStepComplete(index);
        } catch (error) {
          if (isCurrent(token)) onError(index, error);
          return;
        }
      }
      if (isCurrent(token)) onFinished();
    }
    return { play, cancel, track, isCurrent, dispose() { cancel(); disposed = true; } };
  }
  const api = { createSequence };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.HANZI_WORD_STUDY_SEQUENCE = api;
})(typeof window === "object" ? window : this);
