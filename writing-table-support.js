// Fixed textbook vocabulary adapter.
// IMPORTANT: the learning scope comes ONLY from the textbook `writing` table.
// `recognition` is never used to build the site's character list.
(function () {
  const originalFetch = window.fetch.bind(window);
  const DATASET_COMMIT = "68faa378f2211fb1b9152f9df45eb8fa2c4fb2b4";
  const DATASET_BASE = `https://cdn.jsdelivr.net/gh/vipzhicheng/shukong-app@${DATASET_COMMIT}/public/books/renjiao`;
  const BOOK_SOURCE = {
    "1-upper": "111.json",
    "1-lower": "121.json",
    "2-upper": "211.json",
    "2-lower": "221.json",
    "3-upper": "311.json",
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

  function fixedWordsForCharacter(character, wordEntry, lessonTitle) {
    const textbookWords = Array.isArray(wordEntry?.characters) ? wordEntry.characters : [];
    const containing = textbookWords.filter((word) =>
      Array.isArray(word) && word.some((item) => item.character === character.character)
    );
    const multiCharacter = containing.filter((word) => wordText(word).length > 1);
    const chosen = (multiCharacter.length ? multiCharacter : containing).slice(0, 3);

    if (!chosen.length) {
      return [{
        word: character.character,
        pinyin: character.pinyin || "",
        meaning: `《${lessonTitle}》写字表生字`
      }];
    }

    return chosen.map((word) => ({
      word: wordText(word),
      pinyin: wordPinyin(word),
      meaning: `《${lessonTitle}》课内固定词语`
    }));
  }

  function buildAppText(dataset) {
    const volume = dataset?.grades?.[0]?.volumes?.[0];
    if (!volume || !Array.isArray(volume.writing)) {
      throw new Error("Textbook dataset has no writing table");
    }

    const wordEntries = Array.isArray(volume.words) ? volume.words : [];
    const output = [];

    // Deliberately iterate ONLY volume.writing. Do not touch volume.recognition.
    volume.writing.forEach((writingEntry) => {
      const lessonTitle = textbookTitle(volume, writingEntry);
      output.push(`[${lessonTitle}]`);

      const wordEntry = wordEntries.find((entry) =>
        (entry.lesson && entry.lesson === writingEntry.lesson) ||
        (entry.short && entry.short === writingEntry.short)
      );

      (writingEntry.characters || []).forEach((character) => {
        const fixedWords = fixedWordsForCharacter(character, wordEntry, lessonTitle);
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
    if (!isBookDataRequest(input)) return originalFetch(input, init);

    try {
      const fixedText = await getFixedBookText();
      return new Response(fixedText, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    } catch (error) {
      console.error("Writing-table curriculum failed to load", error);
      // Never fall back to old local files here: some legacy files contain recognition-table
      // characters. Failing visibly is safer than silently showing the wrong curriculum.
      return new Response("", {
        status: 503,
        statusText: "Writing-table curriculum unavailable",
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  };
})();
