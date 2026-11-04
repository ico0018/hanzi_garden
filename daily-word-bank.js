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

  function parseTextbookWordTable(data, expectedBookId) {
    if (!/^2026-[1-6]-(upper|lower)$/.test(expectedBookId || "") ||
        data?.schemaVersion !== 1 || data.bookId !== expectedBookId) {
      throw new Error("词语表册次或格式不匹配");
    }
    const source = data.source;
    if (typeof data.edition !== "string" || !data.edition.trim() ||
        source?.publisher !== "人民教育出版社" || source.table !== "词语表" ||
        !/^https:\/\/[^\s]+$/.test(source.url || "") ||
        !Array.isArray(source.printedPages) || !source.printedPages.length ||
        !source.printedPages.every(page => Number.isInteger(page) && page > 0) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(source.reviewedAt || "")) {
      throw new Error("词语表版本或来源不完整");
    }
    if (!Array.isArray(data.lessons) || !data.lessons.length) throw new Error("词语表课次不完整");
    const seenLessons = new Set();
    const items = [];
    for (const lesson of data.lessons) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lesson.lessonKey || "") || seenLessons.has(lesson.lessonKey) ||
          typeof lesson.title !== "string" || !lesson.title.trim() || !Array.isArray(lesson.words) || !lesson.words.length) {
        throw new Error("词语表课次不完整");
      }
      seenLessons.add(lesson.lessonKey);
      const seenWords = new Set();
      for (const entry of lesson.words) {
        if (!/^[\u3400-\u9fff]+$/.test(entry?.word || "") || seenWords.has(entry.word) ||
            (entry.pinyin !== undefined && typeof entry.pinyin !== "string")) {
          throw new Error("词语表词条不完整或同课重复");
        }
        seenWords.add(entry.word);
        items.push({
          id: encodeURIComponent([expectedBookId, "textbook-word-table-v1", lesson.lessonKey, entry.word].join("|")),
          order: items.length,
          lessonKey: lesson.lessonKey,
          lessonTitle: lesson.title,
          word: entry.word,
          pinyin: entry.pinyin || ""
        });
      }
    }
    if (!Number.isInteger(data.total) || items.length !== data.total) throw new Error("词语表词数核对未通过");
    return { items, edition: data.edition, total: items.length, source };
  }

  global.HANZI_DAILY_WORD_BANK = { parseDailyWordBank, createDailyDictationItems, parseTextbookWordTable };
})(window);
