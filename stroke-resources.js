(function (global) {
  "use strict";

  function validateStrokeData(data, character) {
    if (!data || !Array.isArray(data.strokes) || !data.strokes.length ||
        !data.strokes.every(stroke => typeof stroke === "string" && stroke.trim()) ||
        !Array.isArray(data.medians) || data.medians.length !== data.strokes.length ||
        !data.medians.every(line => Array.isArray(line) && line.length >= 2 && line.every(point =>
          Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)))) {
      throw new Error("笔画数据格式不正确: " + character);
    }
    return data;
  }

  function createStrokeDataLoader(fetchData, baseURI) {
    const requests = new Map();
    return function charDataLoader(character, onComplete, onError) {
      if (!requests.has(character)) {
        const request = Promise.resolve().then(async () => {
          if (!/^[\u3400-\u9fff]$/.test(character)) throw new Error("无效汉字");
          const url = new URL("vendor/hanzi-data/" + encodeURIComponent(character) + ".json", baseURI);
          const response = await fetchData(url.href, { cache: "no-cache" });
          if (!response.ok) throw new Error("笔画数据 HTTP " + response.status + ": " + character);
          return validateStrokeData(await response.json(), character);
        });
        requests.set(character, request);
        // Keep successful requests shared; a later attempt can retry any failure.
        request.catch(() => { if (requests.get(character) === request) requests.delete(character); });
      }
      requests.get(character).then(onComplete, error => {
        if (typeof onError === "function") onError(error);
        else console.error("无法加载本地笔画数据", character, error);
      });
      // Writer 2.0.2 expects callbacks or raw data here, never a returned Promise.
    };
  }

  if (typeof module === "object" && module.exports) module.exports = { createStrokeDataLoader, validateStrokeData };
  else global.XuebabangbangStrokeData = { charDataLoader: createStrokeDataLoader(global.fetch.bind(global), document.baseURI) };
})(typeof window === "object" ? window : this);
