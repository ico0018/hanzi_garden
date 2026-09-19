(function registerDailyWordBank(global) {
  function parseDailyWordBank(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  }

  function createDailyDictationItems(bookId, words) {
    if (bookId !== "3-upper") return [];
    return words.map((word, order) => ({
      id: encodeURIComponent([bookId, "daily-word-bank-v4", word].join("|")),
      order,
      lessonTitle: "每日词语听写题库",
      word,
      pinyin: ""
    }));
  }

  global.HANZI_DAILY_WORD_BANK = { parseDailyWordBank, createDailyDictationItems };
})(window);
