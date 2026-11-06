(function (global) {
  "use strict";
  const SIZES = [10, 20, 30];
  const INTERVALS = [2, 4, 7, 15, 30, 60];
  const isDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + "T12:00:00Z")) && new Date(value + "T12:00:00Z").toISOString().slice(0, 10) === value;
  function addDays(date, days) {
    const value = new Date(date + "T12:00:00Z");
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  }
  function wrongState(progress = {}) {
    if (progress.wrongReview && typeof progress.wrongReview.active === "boolean") {
      const state = progress.wrongReview;
      return { ...state, correctDays: isDate(state.lastCorrectDate) && Number.isInteger(state.correctDays) ? Math.max(0, Math.min(2, state.correctDays)) : 0 };
    }
    if (progress.lastResult === "unknown") return { active: true, correctDays: 0, lastCorrectDate: null, lastWrongDate: isDate(progress.lastReviewed) ? progress.lastReviewed : null };
    // A legacy success count does not prove a previous error. Preserve its normal schedule.
    return { active: false, correctDays: 0, lastCorrectDate: null, lastWrongDate: null };
  }
  function applyResult(previous = {}, known, date) {
    if (!isDate(date)) throw new Error("听写日期无效");
    if (isDate(previous.lastReviewed) && previous.lastReviewed >= date) return previous;
    const wrong = wrongState(previous);
    let nextWrong = wrong;
    const previousSuccesses = Number.isInteger(previous.successCount) ? Math.max(0, previous.successCount) : 0;
    let successCount = known ? Math.min(previousSuccesses + 1, INTERVALS.length) : 0;
    let interval = known ? INTERVALS[successCount - 1] : 1;
    if (!known) nextWrong = { ...wrong, active: true, correctDays: 0, lastCorrectDate: null, lastWrongDate: date };
    else if (wrong.active) {
      const consecutive = wrong.lastCorrectDate === addDays(date, -1);
      const correctDays = consecutive ? Math.min(wrong.correctDays + 1, 2) : 1;
      nextWrong = { ...wrong, active: correctDays < 2, correctDays, lastCorrectDate: date };
      successCount = correctDays;
      interval = nextWrong.active ? 1 : INTERVALS[successCount - 1];
    }
    return { ...previous, successCount, dueDate: addDays(date, interval), lastResult: known ? "known" : "unknown", lastReviewed: date, wrongReview: nextWrong };
  }
  function planQueue({ items, progress, saved, date, requestedSize }) {
    if (!isDate(date)) throw new Error("听写日期无效");
    const existing = saved?.date === date && Array.isArray(saved.ids) ? saved : null;
    const results = existing?.results && typeof existing.results === "object" && !Array.isArray(existing.results) ? existing.results : {};
    const locked = !!existing && (!!existing.started || Object.keys(results).length > 0);
    const byId = new Map(items.map(item => [item.id, item]));
    const lockedSize = Number.isInteger(existing?.size) && existing.size > 0 && existing.size <= 30 ? existing.size : existing?.ids.filter(id => byId.has(id)).length;
    const size = locked ? lockedSize : SIZES.includes(requestedSize) ? requestedSize : SIZES.includes(existing?.size) ? existing.size : 10;
    if (locked) return { ...existing, size, started: true, results, reviewIds: existing.reviewIds || existing.ids.filter(id => !!progress[id]) };
    const due = items.filter(item => {
      const entry = progress[item.id];
      if (!entry || entry.lastReviewed >= date) return false;
      return wrongState(entry).active || (entry.dueDate && entry.dueDate <= date);
    }).sort((a, b) => {
      const wrongDifference = Number(wrongState(progress[b.id]).active) - Number(wrongState(progress[a.id]).active);
      return wrongDifference || (progress[a.id].dueDate || "").localeCompare(progress[b.id].dueDate || "") || a.order - b.order;
    });
    const fresh = items.filter(item => !progress[item.id]);
    const eligible = new Set([...due, ...fresh].map(item => item.id));
    const ids = (existing?.ids || []).filter(id => byId.has(id) && eligible.has(id));
    for (const item of [...due, ...fresh]) if (!ids.includes(item.id)) ids.push(item.id);
    return { ...(existing || {}), date, size, started: false, ids: ids.slice(0, size), results, reviewIds: due.map(item => item.id).filter(id => ids.slice(0, size).includes(id)) };
  }
  const api = { SIZES, INTERVALS, wrongState, applyResult, planQueue };
  if (typeof module === "object" && module.exports) module.exports = api;
  else global.HANZI_DICTATION = api;
})(typeof window === "object" ? window : this);
