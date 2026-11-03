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
        return { char: item.char, pinyin: item.pinyin, readingPhrase: item.readingPhrase || "", words: [], sentence: null };
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
