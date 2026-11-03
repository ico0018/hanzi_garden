(function registerMistakeScheduler(global) {
  const STATE_KEY = "hanzi-mistake-notebook-state-v2";
  const LEGACY_KEY = "hanzi-mistake-notebook-progress-v1";
  const INTERVALS = [2, 4, 7, 15, 30, 60];
  const ROUND_SIZE = 30;

  function localDateKey(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function isDateKey(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime()) && localDateKey(date) === value;
  }

  function addDays(dateKey, days) {
    const date = new Date(`${dateKey}T12:00:00`);
    date.setDate(date.getDate() + days);
    return localDateKey(date);
  }

  const isObject = value => value && typeof value === "object" && !Array.isArray(value);
  const isResult = value => value === "known" || value === "unknown";

  function create({ storage, now = () => new Date() }) {
    let warning = false;
    let state = { version: 2, progress: {}, round: null };
    const today = () => localDateKey(now());
    const read = key => {
      try { return JSON.parse(storage.getItem(key) || "null"); }
      catch (error) { warning = true; return null; }
    };
    const save = () => {
      try { storage.setItem(STATE_KEY, JSON.stringify(state)); }
      catch (error) { warning = true; }
    };
    const saved = read(STATE_KEY);
    if (isObject(saved) && saved.version === 2) {
      if (isObject(saved.progress)) Object.entries(saved.progress).forEach(([id, value]) => {
        if (!id.startsWith("mistake-v1:") || !isObject(value) || !isResult(value.lastResult) || !isDateKey(value.lastReviewed) || !isDateKey(value.dueDate)) return;
        state.progress[id] = { lastResult: value.lastResult, lastReviewed: value.lastReviewed, dueDate: value.dueDate,
          successCount: Number.isInteger(value.successCount) ? Math.max(0, Math.min(value.successCount, INTERVALS.length)) : 0 };
      });
      if (isObject(saved.round) && Array.isArray(saved.round.ids) && isDateKey(saved.round.startedAt)) {
        const ids = [...new Set(saved.round.ids.filter(id => typeof id === "string" && id.startsWith("mistake-v1:")))].slice(0, ROUND_SIZE);
        const results = {};
        ids.forEach(id => { if (isResult(saved.round.results?.[id])) results[id] = saved.round.results[id]; });
        if (ids.length) state.round = { startedAt: saved.round.startedAt, ids, results };
      }
    } else {
      const legacy = read(LEGACY_KEY);
      if (isObject(legacy)) {
        Object.entries(legacy).forEach(([id, value]) => {
          if (!id.startsWith("mistake-v1:") || !isObject(value) || !isResult(value.result)) return;
          const timestamp = new Date(typeof value.updatedAt === "string" ? value.updatedAt : NaN);
          const reviewed = Number.isFinite(timestamp.getTime()) ? localDateKey(timestamp) : today();
          const known = value.result === "known";
          state.progress[id] = { successCount: known ? 1 : 0, lastResult: value.result, lastReviewed: reviewed, dueDate: addDays(reviewed, known ? 2 : 1) };
        });
        // One atomic document keeps each result and its future schedule together.
        // Leave v1 untouched so failed storage writes never destroy old records.
        save();
      }
    }

    function eligible(items) {
      const date = today();
      const sourceOrder = new Map(items.map((item, index) => [item.id, index]));
      const due = items.filter(item => {
        const progress = state.progress[item.id];
        return progress && progress.lastReviewed < date && progress.dueDate <= date;
      }).sort((a, b) => state.progress[a.id].dueDate.localeCompare(state.progress[b.id].dueDate) || sourceOrder.get(a.id) - sourceOrder.get(b.id));
      const fresh = items.filter(item => !state.progress[item.id]);
      return [...due, ...fresh];
    }

    function currentRound(items) {
      if (!state.round) return null;
      const byId = new Map(items.map(item => [item.id, item]));
      // Keep the stored full round unchanged; words removed from the file are
      // omitted from this view, never marked correct or silently reintroduced.
      const queue = state.round.ids.map(id => byId.get(id)).filter(Boolean);
      return { ...state.round, ids: state.round.ids.slice(), results: { ...state.round.results }, queue,
        pending: queue.filter(item => !state.round.results[item.id]) };
    }

    function nextRound(items) {
      const current = currentRound(items);
      if (current?.pending.length) return current;
      const queue = eligible(items).slice(0, ROUND_SIZE);
      if (!queue.length) return null;
      state.round = { startedAt: today(), ids: queue.map(item => item.id), results: {} };
      save();
      return currentRound(items);
    }

    function mark(id, known) {
      if (!state.round?.ids.includes(id) || state.round.results[id]) return false;
      const date = today();
      const previous = state.progress[id];
      const successCount = known ? Math.min((previous?.successCount || 0) + 1, INTERVALS.length) : 0;
      const lastResult = known ? "known" : "unknown";
      state.progress[id] = { successCount, lastResult, lastReviewed: date, dueDate: addDays(date, known ? INTERVALS[successCount - 1] : 1) };
      state.round.results[id] = lastResult;
      save();
      return true;
    }

    function nextReviewDate(items) {
      const date = today();
      const dates = items.map(item => state.progress[item.id]?.dueDate).filter(value => value && value > date).sort();
      return dates[0] || null;
    }

    return { currentRound, nextRound, eligible, mark, nextReviewDate, today,
      progress: () => JSON.parse(JSON.stringify(state.progress)),
      snapshot: () => JSON.parse(JSON.stringify(state)),
      hasStorageWarning: () => warning };
  }

  global.HANZI_MISTAKE_SCHEDULER = { create, localDateKey, addDays, STATE_KEY, LEGACY_KEY, INTERVALS, ROUND_SIZE };
})(window);
