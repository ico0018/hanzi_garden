// Fixed textbook vocabulary adapter.
// IMPORTANT: character scope comes ONLY from the textbook 写字表.
//
// 三年级上册 is intentionally NOT intercepted here. The checked-in 生字数据.txt
// has been verified against the user's textbook 写字表 (250 characters) and already
// contains three curated words per character. It is the source of truth for 3-upper.
(function () {
  const originalFetch = window.fetch.bind(window);
  const DATASET_COMMIT = "68faa378f2211fb1b9152f9df45eb8fa2c4fb2b4";
  const DATASET_BASE = `https://cdn.jsdelivr.net/gh/vipzhicheng/shukong-app@${DATASET_COMMIT}/public/books/renjiao`;
  const BOOK_SOURCE = {
    "1-upper": "111.json",
    "1-lower": "121.json",
    "2-upper": "211.json",
    "2-lower": "221.json",
    "3-lower": "321.json",
    "4-upper": "411.json",
    "4-lower": "421.json",
    "5-upper": "511.json",
    "5-lower": "521.json",
    "6-upper": "611.json",
    "6-lower": "621.json"
  };

  const selectedBookId = new URLSearchParams(window.location.search).get("book") || "3-upper";
  let fixedDatasetPromise = null;

  function isBookDataRequest(input) {
    const url = typeof input === "string" ? input : input?.url || "";
    const decoded = decodeURI(url);
    return /生字数据/i.test(decoded) || /\.txt(?:$|\?)/i.test(decoded);
  }

  function wordText(wordCharacters) {
    return (wordCharacters || []).map((item) => item.character || "").join("");
  }

  function wordPinyin(wordCharacters) {
    return (wordCharacters || []).map((item) => item.pinyin || "").filter(Boolean).join(" ");
  }

  function textbookTitle(volume, writingEntry) {
    const title = volume.lessons?.[writingEntry.lesson] || writingEntry.lesson || `第${writingEntry.short || ""}课`;
    const short = writingEntry.short || String(writingEntry.lesson || "").replace(/\D/g, "");
    return short ? `${short} ${title}` : title;
  }

  function sameLesson(entry, writingEntry) {
    return Boolean(
      (entry?.lesson && entry.lesson === writingEntry.lesson) ||
      (entry?.short && writingEntry.short && entry.short === writingEntry.short)
    );
  }

  function flattenWords(wordEntries) {
    const result = [];
    wordEntries.forEach((entry) => {
      (entry.characters || []).forEach((characters) => {
        if (!Array.isArray(characters)) return;
        const text = wordText(characters);
        if (!text) return;
        result.push({ text, pinyin: wordPinyin(characters), lesson: entry.lesson || "", short: entry.short || "" });
      });
    });
    return result;
  }

  function chooseWords(character, writingEntry, lessonTitle, wordEntries, allWords) {
    const lessonWords = flattenWords(wordEntries.filter((entry) => sameLesson(entry, writingEntry)))
      .filter((word) => word.text.includes(character.character) && word.text.length > 1);
    const volumeWords = allWords
      .filter((word) => word.text.includes(character.character) && word.text.length > 1);

    const chosen = [];
    const seen = new Set();
    const pushUnique = (word, sourceLabel) => {
      if (!word || seen.has(word.text) || chosen.length >= 3) return;
      seen.add(word.text);
      chosen.push({ word: word.text, pinyin: word.pinyin, meaning: sourceLabel });
    };

    // app.js uses words[0] for daily dictation, so same-lesson vocabulary comes first.
    lessonWords.forEach((word) => pushUnique(word, `《${lessonTitle}》课内词语`));
    volumeWords.forEach((word) => pushUnique(word, "本册教材固定词语"));

    if (!chosen.length) {
      chosen.push({ word: character.character, pinyin: character.pinyin || "", meaning: `《${lessonTitle}》写字表生字` });
    }
    return chosen;
  }

  function buildAppText(dataset) {
    const volume = dataset?.grades?.[0]?.volumes?.[0];
    if (!volume || !Array.isArray(volume.writing)) throw new Error("Textbook dataset has no writing table");

    const wordEntries = Array.isArray(volume.words) ? volume.words : [];
    const allWords = flattenWords(wordEntries);
    const output = [];

    // Only 写字表 determines which characters appear. recognition is never read here.
    volume.writing.forEach((writingEntry) => {
      const lessonTitle = textbookTitle(volume, writingEntry);
      output.push(`[${lessonTitle}]`);
      (writingEntry.characters || []).forEach((character) => {
        const fixedWords = chooseWords(character, writingEntry, lessonTitle, wordEntries, allWords);
        const groups = fixedWords.map((item) => `${item.word}|${item.pinyin}|${item.meaning}`);
        output.push(`${character.character}|${character.pinyin || ""}|${groups.join(";")}`);
      });
    });
    return output.join("\n");
  }

  async function getFixedBookText() {
    const sourceFile = BOOK_SOURCE[selectedBookId];
    if (!sourceFile) throw new Error(`No fixed textbook source for ${selectedBookId}`);
    if (!fixedDatasetPromise) {
      fixedDatasetPromise = originalFetch(`${DATASET_BASE}/${sourceFile}`, { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error(`Fixed textbook dataset failed: ${response.status}`);
          return response.json();
        })
        .then(buildAppText);
    }
    return fixedDatasetPromise;
  }

  window.fetch = async function (input, init) {
    // Verified local curriculum: do not override 三年级上册.
    if (selectedBookId === "3-upper") return originalFetch(input, init);
    if (!isBookDataRequest(input)) return originalFetch(input, init);

    try {
      const fixedText = await getFixedBookText();
      return new Response(fixedText, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    } catch (error) {
      console.error("Writing-table curriculum failed to load", error);
      return new Response("", {
        status: 503,
        statusText: "Writing-table curriculum unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  };
})();
