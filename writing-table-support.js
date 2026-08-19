// Adapter for textbook writing-table datasets that store only the required characters.
// It keeps curriculum files simple and lets pinyin-pro generate pronunciation at runtime.
(function () {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input, init) {
    const response = await originalFetch(input, init);
    if (!response.ok) return response;

    const url = typeof input === "string" ? input : input?.url || "";
    if (!/生字数据_.*\.txt/i.test(decodeURI(url))) return response;

    const text = await response.text();
    if (!text.includes("# FORMAT: writing-table")) {
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }

    const chars = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    const output = [];
    const groupSize = 25;
    for (let index = 0; index < chars.length; index += groupSize) {
      output.push(`[写字表 ${Math.floor(index / groupSize) + 1}]`);
      chars.slice(index, index + groupSize).forEach((char) => {
        const pinyin = window.pinyinPro?.pinyin
          ? window.pinyinPro.pinyin(char, { toneType: "symbol" })
          : "";
        output.push(`${char}|${pinyin}|${char}|${pinyin}|课本写字表要求会写的生字`);
      });
    }

    return new Response(output.join("\n"), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  };
})();
