(function registerDailyWordBank(global) {
  const bankFiles = {
    "3-upper": "每日词语听写题库.txt",
    "2-lower": "curriculum/renjiao/words-2-lower.txt",
    "4-upper": "curriculum/renjiao/words-4-upper.txt",
    "4-lower": "curriculum/renjiao/words-4-lower.txt",
    "5-upper": "curriculum/renjiao/words-5-upper.txt",
    "5-lower": "curriculum/renjiao/words-5-lower.txt",
    "6-upper": "curriculum/renjiao/words-6-upper.txt",
    "6-lower": "curriculum/renjiao/words-6-lower.txt"
  };
  const textbookBankNotes = {
    "2-lower": "课本词语表转录；待核对教材版本。",
    "4-upper": "课本词语表转录；待核对教材版本。",
    "4-lower": "词语表未齐：7、9、10、11、13 课等词语待补；当前收录已核对来源的部分。",
    "5-upper": "课本词语表转录；待核对教材版本。",
    "5-lower": "课本词语表转录；待核对教材版本。",
    "6-upper": "课本词语表转录；待核对教材版本。",
    "6-lower": "课本词语表转录；待核对教材版本。"
  };
  const unconfiguredBankNotes = {
    "1-upper": "当前教材资料未提供独立词语表，可先进行生字学习。",
    "1-lower": "当前教材资料未提供独立词语表，可先进行生字学习。",
    "3-lower": "本册课本词语表尚待核对，暂不提供听写题目，可先进行生字学习。"
  };
  function parseDailyWordBank(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  }

  function createDailyDictationItems(bookId, words) {
    if (!Object.prototype.hasOwnProperty.call(bankFiles, bookId)) return [];
    return words.map((word, order) => ({
      id: encodeURIComponent((bookId === "3-upper"
        ? [bookId, "daily-word-bank-v4", word]
        : [bookId, "textbook-word-table-v1", order, word]).join("|")),
      order,
      lessonTitle: "每日词语听写题库",
      word,
      pinyin: ""
    }));
  }

  global.HANZI_DAILY_WORD_BANK = { bankFiles, textbookBankNotes, unconfiguredBankNotes, parseDailyWordBank, createDailyDictationItems };
})(window);
