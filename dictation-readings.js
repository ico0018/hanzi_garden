(function (global) {
  "use strict";
  function findReading(data, bookId, item) {
    if (data?.schemaVersion !== 1 || !data.readings || typeof data.readings !== "object" || Array.isArray(data.readings)) return "";
    const key = [bookId, item.lessonKey || "", item.word].join("|");
    const contexts = data.contextReadings;
    const value = contexts && Object.hasOwn(contexts, key) ? contexts[key] : Object.hasOwn(data.readings, item.word) ? data.readings[item.word] : "";
    if (typeof value !== "string") return "";
    const reading = value.trim().normalize("NFC");
    return /^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿê'’ -]+$/iu.test(reading) && /[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜńňǹḿê]/iu.test(reading) ? reading : "";
  }
  function applyReadings(items, bookId, data) {
    return items.map(item => ({ ...item, pinyin: findReading(data, bookId, item) }));
  }
  const api = { findReading, applyReadings };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.HANZI_DICTATION_READINGS = api;
})(typeof window === "object" ? window : this);
