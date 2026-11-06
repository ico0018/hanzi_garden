(function (root) {
  "use strict";

  function parseWritingTable(data, expectedBookId, expectedCount) {
    if (!data || data.bookId !== expectedBookId || !Array.isArray(data.lessons)) {
      throw new Error("写字表册次不匹配");
    }
    const seenLessons = new Set();
    const seenCharacters = new Set();
    const lessons = data.lessons.map((entry, index) => {
      if (!entry.lessonKey || seenLessons.has(entry.lessonKey) || !entry.title || !Array.isArray(entry.characters) || !entry.characters.length) {
        throw new Error("写字表课次不完整");
      }
      seenLessons.add(entry.lessonKey);
      const chars = entry.characters.map((item) => {
        if (!/^[\u3400-\u9fff]$/.test(item.char || "") || !item.pinyin || seenCharacters.has(item.char)) {
          throw new Error("写字表生字或读音不完整");
        }
        seenCharacters.add(item.char);
        if (item.readingPhrase && (!/^[\u3400-\u9fff]{2,8}$/.test(item.readingPhrase) || !item.readingPhrase.includes(item.char))) {
          throw new Error("写字表读音提示不完整");
        }
        let words = [];
        let sentence = null;
        if (data.learningSupportVersion === 1 || item.words !== undefined || item.sentence !== undefined) {
          if ((item.examplesLabel !== undefined && item.examplesLabel !== "用法示例") ||
              !Array.isArray(item.words) || item.words.length !== 2 || new Set(item.words.map(word => word?.word)).size !== 2 ||
              !item.words.every(word => typeof word?.word === "string" &&
                (word.kind === "usage" ? Array.from(word.word.trim()).length >= 2 && Array.from(word.word).length <= 20 && !/[\u0000-\u001f<>]/.test(word.word) : /^[\u3400-\u9fff]{2,8}$/.test(word.word)) && word.word.includes(item.char) &&
                typeof word.pinyin === "string" && typeof word.meaning === "string" &&
                (word.kind === undefined || word.kind === "usage") && (word.kind !== "usage" || item.examplesLabel === "用法示例")) ||
              !item.sentence || !item.words.some(word => word.word === item.sentence.groupWord) ||
              typeof item.sentence.text !== "string" || !item.sentence.text.includes(item.sentence.groupWord)) {
            throw new Error("组词造句内容不完整");
          }
          words = item.words.map(word => ({ word: word.word, pinyin: word.pinyin, meaning: word.meaning, ...(word.kind ? { kind: word.kind } : {}) }));
          sentence = { groupWord: item.sentence.groupWord, text: item.sentence.text };
        }
        return { char: item.char, pinyin: item.pinyin, readingPhrase: item.readingPhrase || "", words, sentence, ...(item.examplesLabel ? { examplesLabel: item.examplesLabel } : {}) };
      });
      return {
        id: index + 1,
        lessonKey: entry.lessonKey,
        title: entry.title,
        subtitle: [data.edition, "写字表"].filter(Boolean).join(" · "),
        writingTable: true,
        chars
      };
    });
    const count = lessons.reduce((total, lesson) => total + lesson.chars.length, 0);
    if (!lessons.length || count !== data.total || count !== expectedCount) {
      throw new Error("写字表字数核对未通过");
    }
    return lessons;
  }

  const api = { parseWritingTable };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.HANZI_WRITING_TABLES = api;
})(typeof window === "object" ? window : this);
