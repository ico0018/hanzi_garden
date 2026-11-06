const appTabs = document.getElementById("app-tabs");
const learningView = document.getElementById("learning-view");
const dictationView = document.getElementById("dictation-view");
const lessonNav = document.getElementById("lesson-nav");
const lessonOverview = document.getElementById("lesson-overview");
const charList = document.getElementById("char-list");
const charDetail = document.getElementById("char-detail");
const detailLayout = document.querySelector(".detail-layout");
const dictationOverview = document.getElementById("dictation-overview");
const dictationDetail = document.getElementById("dictation-detail");
const switchBookButton = document.getElementById("switch-book-button");

switchBookButton?.addEventListener("click", () => {
  invalidateStudyView();
  window.location.href = "welcome.html";
});

let lessons = [];
let currentLessonIndex = 0;
let currentCharIndex = 0;
let writerInstance = null;
let activeView = "learning";
let speechVoices = [];
let activeAudio = null;

const BOOK_CATALOG = window.HANZI_BOOK_CATALOG || {};
const selectedBookId = new URLSearchParams(window.location.search).get("book") || "2026-3-upper";
const selectedBook = BOOK_CATALOG[selectedBookId];
const DAILY_DICTATION_BANK_FILES = {
  "3-upper": "每日词语听写题库.txt"
};
const HUMAN_AUDIO_BASE_URL = "https://raw.githubusercontent.com/hugolpz/audio-cmn/master/64k/hsk";
const AUDIO_CACHE_LIMIT = 40;
const audioCache = new Map();
let dailyDictationItems = [];
let dailyDictationBankStatus = "not-configured";
let dailyDictationTable = null;
let dictationPhase = "preview";
let viewEpoch = 0;
let studySession = null;

function invalidateStudyView() {
  viewEpoch++;
  studySession?.close();
  document.querySelectorAll?.(".self-assessment-modal").forEach(modal => modal.remove());
  return viewEpoch;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function loadSpeechVoices() {
  speechVoices = "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [];
}

function normalizeSpeechText(text) {
  return String(text || "").replace(/\s/g, "");
}

function cacheHumanAudio(text) {
  const phrase = normalizeSpeechText(text);
  if (!phrase) return null;
  if (audioCache.has(phrase)) {
    const cached = audioCache.get(phrase);
    audioCache.delete(phrase);
    audioCache.set(phrase, cached);
    return cached;
  }

  const audio = new Audio(`${HUMAN_AUDIO_BASE_URL}/cmn-${encodeURIComponent(phrase)}.mp3`);
  const entry = { audio, state: "loading" };
  audio.preload = "auto";
  audio.addEventListener("canplay", () => { entry.state = "ready"; });
  audio.addEventListener("canplaythrough", () => { entry.state = "ready"; });
  audio.addEventListener("error", () => { entry.state = "error"; });
  audio.load();
  audioCache.set(phrase, entry);

  while (audioCache.size > AUDIO_CACHE_LIMIT) {
    const oldestKey = audioCache.keys().next().value;
    const oldest = audioCache.get(oldestKey);
    oldest?.audio?.pause?.();
    audioCache.delete(oldestKey);
  }
  return entry;
}

function speakSystemChinese(text, statusElement) {
  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    if (statusElement) statusElement.textContent = "当前浏览器不支持系统语音朗读。";
    return false;
  }

  const phrase = normalizeSpeechText(text);
  if (!phrase) return false;
  loadSpeechVoices();
  const voice = speechVoices.find((item) =>
    /^(zh-CN|zh_CN|zh)/i.test(item.lang || "") || /Chinese|中文|普通话|Mandarin/i.test(item.name || "")
  );

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const speech = new SpeechSynthesisUtterance(phrase);
    speech.lang = voice?.lang || "zh-CN";
    if (voice) speech.voice = voice;
    speech.rate = 0.82;
    speech.volume = 1;
    speech.onstart = () => {
      if (statusElement) statusElement.textContent = "正在使用系统语音朗读…";
    };
    speech.onerror = () => {
      if (statusElement) statusElement.textContent = "系统语音朗读失败，请确认设备已启用中文语音。";
    };
    window.speechSynthesis.speak(speech);
    return true;
  } catch (error) {
    if (statusElement) statusElement.textContent = "系统语音朗读失败。";
    return false;
  }
}

function playHumanChinese(text, statusElement) {
  const phrase = normalizeSpeechText(text);
  if (!phrase) return;

  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }

  const entry = cacheHumanAudio(phrase);
  const canUseHuman = entry && entry.state === "ready" && entry.audio.readyState >= 3;
  if (!canUseHuman) {
    speakSystemChinese(phrase, statusElement);
    return;
  }

  try {
    window.speechSynthesis?.cancel();
    const audio = entry.audio;
    activeAudio = audio;
    audio.currentTime = 0;
    if (statusElement) statusElement.textContent = "正在播放真人录音…";
    const result = audio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        entry.state = "error";
        if (statusElement) statusElement.textContent = "真人录音无法播放，请再点一次使用系统语音。";
      });
    }
  } catch (error) {
    entry.state = "error";
    speakSystemChinese(phrase, statusElement);
  }
}

function preloadVisibleAudio() {
  const lesson = lessons[currentLessonIndex];
  if (!lesson) return;
  lesson.chars.forEach((character) => {
    cacheHumanAudio(character.char);
    character.words.forEach((word) => cacheHumanAudio(word.word));
  });
}

function parseLessonsText(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  const parsedLessons = [];
  let currentLesson = null;

  for (const rawLine of lines) {
    if (rawLine.startsWith("[") && rawLine.endsWith("]")) {
      currentLesson = { id: parsedLessons.length + 1, title: rawLine.slice(1, -1).trim(), subtitle: "", chars: [] };
      parsedLessons.push(currentLesson);
      continue;
    }
    if (!currentLesson) continue;

    const cells = rawLine.split("|").map((cell) => cell.trim());
    if (cells.length < 3) continue;
    const [char, pinyin, ...rest] = cells;
    // `||` introduces optional sentence metadata while leaving the established
    // word-list format unchanged for every existing textbook file.
    const [wordSource, linkedGroupWord = "", sentenceText = ""] = rest.join("|")
      .split("||")
      .map((part) => part.trim());
    const words = wordSource
      .split(";")
      .map((group) => group.trim())
      .filter(Boolean)
      .map((group) => {
        const parts = group.split("|").map((item) => item.trim());
        if (parts.length < 3) return null;
        return { word: parts[0], pinyin: parts[1], meaning: parts[2] };
      })
      .filter(Boolean);
    if (!char || !words.length) continue;
    const sentence = sentenceText
      ? {
          groupWord: linkedGroupWord || words[0]?.word || "",
          text: sentenceText
        }
      : null;
    currentLesson.chars.push({ char, pinyin, words, sentence });
  }

  return parsedLessons.filter((lesson) => lesson.chars.length > 0);
}

async function loadLessonsFromTxt(bookId) {
  const book = BOOK_CATALOG[bookId];
  if (!book?.available || !book.dataFile) throw new Error(`Unknown or unavailable book: ${bookId}`);
  const response = await fetch(encodeURI(book.dataFile), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${book.dataFile}: ${response.status}`);
  if (book.dataFormat === "writing-json-v1") {
    if (!window.HANZI_WRITING_TABLES) throw new Error("写字表读取工具未加载");
    return window.HANZI_WRITING_TABLES.parseWritingTable(await response.json(), bookId, book.characterCount);
  }
  const parsed = parseLessonsText(await response.text());
  if (!parsed.length) throw new Error(`No valid lessons parsed from ${book.dataFile}`);
  return parsed;
}

async function loadDailyDictationWordBank(bookId) {
  dailyDictationItems = [];
  dailyDictationTable = null;
  dailyDictationBankStatus = "not-configured";
  const book = BOOK_CATALOG[bookId];
  if (book?.wordTableFile) {
    const response = await fetch(encodeURI(book.wordTableFile), { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to load ${book.wordTableFile}: ${response.status}`);
    dailyDictationTable = window.HANZI_DAILY_WORD_BANK.parseTextbookWordTable(await response.json(), bookId);
    dailyDictationItems = dailyDictationTable.items;
    dailyDictationBankStatus = "ready";
    return;
  }
  if (book?.wordTableStatus === "not-in-textbook") {
    dailyDictationBankStatus = "not-in-textbook";
    return;
  }
  const bankFile = DAILY_DICTATION_BANK_FILES[bookId];
  if (!bankFile) {
    return;
  }

  const response = await fetch(encodeURI(bankFile), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${bankFile}: ${response.status}`);
  const words = window.HANZI_DAILY_WORD_BANK?.parseDailyWordBank(await response.text()) || [];
  if (!words.length) throw new Error(`No daily dictation words found in ${bankFile}`);
  dailyDictationItems = window.HANZI_DAILY_WORD_BANK?.createDailyDictationItems(bookId, words) || [];
  if (!dailyDictationItems.length) throw new Error(`Could not create daily dictation items from ${bankFile}`);
  dailyDictationBankStatus = "ready";
}

function stableItemId(lesson, character) {
  const firstWord = lesson.writingTable ? character.char : character.words[0]?.word || character.char;
  const lessonIdentity = lesson.writingTable ? lesson.lessonKey : lesson.title;
  return encodeURIComponent([selectedBookId, lessonIdentity, character.char, firstWord].join("|"));
}

function formatDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function todayKey() {
  return formatDate(new Date());
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

function practiceProgressKey() {
  return `hanzi-practice-v3-${selectedBookId}`;
}

function getPracticeProgress() {
  try {
    return JSON.parse((window.XbbStorage || localStorage).getItem(practiceProgressKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function savePracticeProgress(lessonIndex, charIndex, status) {
  const lesson = lessons[lessonIndex];
  const character = lesson?.chars[charIndex];
  if (!lesson || !character) return;
  const progress = getPracticeProgress();
  progress[stableItemId(lesson, character)] = { status, updatedAt: todayKey() };
  (window.XbbStorage || localStorage).setItem(practiceProgressKey(), JSON.stringify(progress));
}

function getPracticeStatus(lessonIndex, charIndex) {
  const lesson = lessons[lessonIndex];
  const character = lesson?.chars[charIndex];
  if (!lesson || !character) return null;
  const entry = getPracticeProgress()[stableItemId(lesson, character)];
  if (entry === true) return "learned";
  return entry?.status || null;
}

function migratePracticeProgress() {
  if ((window.XbbStorage || localStorage).getItem(practiceProgressKey())) return;
  const migrated = {};
  lessons.forEach((lesson, lessonIndex) => {
    let raw = (window.XbbStorage || localStorage).getItem(`hanzi-practice-v2-${selectedBookId}-${lessonIndex}`);
    if (raw === null && selectedBookId === "3-upper") raw = (window.XbbStorage || localStorage).getItem(`hanzi-practice-${lessonIndex}`);
    if (!raw) return;
    try {
      const legacy = JSON.parse(raw);
      lesson.chars.forEach((character, charIndex) => {
        if (legacy[charIndex] !== undefined) migrated[stableItemId(lesson, character)] = legacy[charIndex];
      });
    } catch (error) {
      console.warn("Skipping invalid legacy practice progress", error);
    }
  });
  (window.XbbStorage || localStorage).setItem(practiceProgressKey(), JSON.stringify(migrated));
}

function dailyDictationProgressKey() {
  return `hanzi-daily-dictation-progress-v4-${selectedBookId}`;
}

function dailyDictationQueueKey() {
  return `hanzi-daily-dictation-queue-v4-${selectedBookId}`;
}

function getDictationItems() {
  return dailyDictationItems;
}

function getDailyDictationProgress() {
  try {
    return JSON.parse((window.XbbStorage || localStorage).getItem(dailyDictationProgressKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function saveDailyDictationProgress(progress) {
  (window.XbbStorage || localStorage).setItem(dailyDictationProgressKey(), JSON.stringify(progress));
}

function getDailyQueue(requestedSize) {
  const date = todayKey();
  const items = getDictationItems();
  const progress = getDailyDictationProgress();
  let savedQueue = null;
  try {
    savedQueue = JSON.parse((window.XbbStorage || localStorage).getItem(dailyDictationQueueKey()) || "null");
  } catch (error) {
    savedQueue = null;
  }

  const state = window.HANZI_DICTATION.planQueue({ items, progress, saved: savedQueue, date, requestedSize });
  if (JSON.stringify(state) !== JSON.stringify(savedQueue)) {
    (window.XbbStorage || localStorage).setItem(dailyDictationQueueKey(), JSON.stringify(state));
  }
  const itemById = new Map(items.map(item => [item.id, item]));
  return state.ids.map(id => itemById.get(id)).filter(Boolean);
}

function getTodayQueueState() {
  try {
    return JSON.parse((window.XbbStorage || localStorage).getItem(dailyDictationQueueKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function saveManualDictationResult(item, known) {
  const date = todayKey();
  const state = getTodayQueueState();
  if (state.date !== date || !state.started || !state.ids?.includes(item.id) || state.results?.[item.id]) return;
  const progress = getDailyDictationProgress();
  const previous = progress[item.id] || { successCount: 0 };
  progress[item.id] = window.HANZI_DICTATION.applyResult(previous, known, date);
  saveDailyDictationProgress(progress);
  if (state.date === date) {
    state.results = { ...(state.results || {}), [item.id]: progress[item.id].lastResult };
    (window.XbbStorage || localStorage).setItem(dailyDictationQueueKey(), JSON.stringify(state));
  }
}

function openSelfAssessmentModal({ title, message, knownLabel, unknownLabel, onKnown, onUnknown }) {
  const modal = document.createElement("div");
  modal.className = "self-assessment-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "self-assessment-title");
  modal.innerHTML = `
    <div class="self-assessment-panel">
      <h2 id="self-assessment-title">${escapeHtml(title)}</h2>
      <p>${escapeHtml(message)}</p>
      <div class="self-assessment-actions">
        <button class="mark-known" type="button">${escapeHtml(knownLabel)}</button>
        <button class="mark-unknown" type="button">${escapeHtml(unknownLabel)}</button>
      </div>
    </div>`;
  const close = () => modal.remove();
  modal.querySelector(".mark-known").addEventListener("click", () => { close(); onKnown(); });
  modal.querySelector(".mark-unknown").addEventListener("click", () => { close(); onUnknown(); });
  document.body.appendChild(modal);
  modal.querySelector("button")?.focus();
}

function renderAppTabs() {
  appTabs.innerHTML = `
    <button class="app-tab ${activeView === "learning" ? "active" : ""}" type="button" data-view="learning">生字学习</button>
    <button class="app-tab ${activeView === "dictation" ? "active" : ""}" type="button" data-view="dictation">每日听写</button>
  `;
  appTabs.querySelectorAll(".app-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      dictationPhase = "preview";
      render();
    });
  });
}

function openWordStudy(item, opener) {
  studySession?.close();
  const dialog = document.createElement("dialog");
  dialog.className = "word-study-dialog";
  dialog.setAttribute("aria-labelledby", "word-study-title");
  const characters = Array.from(item.word).filter(char => /[\u3400-\u9fff]/.test(char));
  const support = lessons.flatMap(lesson => lesson.chars).flatMap(char => char.words).find(word => word.word === item.word);
  dialog.innerHTML = `
    <div class="study-heading"><div><p>${escapeHtml(item.lessonTitle)}</p><h2 id="word-study-title">${escapeHtml(item.word)}</h2></div><button class="close-study secondary-button" type="button">关闭学习</button></div>
    ${item.pinyin || support?.pinyin ? `<p class="word-pinyin">${escapeHtml(item.pinyin || support.pinyin)}</p>` : ""}
    ${support?.meaning ? `<p>${escapeHtml(support.meaning)}</p>` : ""}
    <button class="study-listen listen-button" type="button">🔊 朗读整个词</button>
    <p class="daily-review-note">先观察每个字的笔顺，再点“练一练”书写。这里的练习不计听写成绩。</p>
    <div class="study-characters">${characters.map((char, index) => `
      <section class="study-character"><h3>${escapeHtml(char)}</h3><div class="tianzi-grid study-grid"><div class="study-target" id="study-character-${index}" aria-label="${escapeAttr(char)}笔顺与书写区"></div></div>
      <div class="study-actions"><button type="button" class="secondary-button" data-study-demo="${index}">看笔顺</button><button type="button" class="primary-button" data-study-practice="${index}">练一练</button></div><p class="daily-review-note" data-study-status="${index}" aria-live="polite">看笔顺，再自己写一写。</p></section>`).join("")}</div>`;
  const session = {
    live: true,
    close() {
      if (!session.live) return;
      session.live = false;
      dialog.close(); dialog.remove();
      if (studySession === session) studySession = null;
      if (opener?.isConnected) opener.focus();
    }
  };
  studySession = session;
  dialog.querySelector(".close-study").addEventListener("click", session.close);
  dialog.addEventListener("close", session.close);
  dialog.querySelector(".study-listen").addEventListener("click", () => playHumanChinese(item.word));
  document.body.appendChild(dialog);
  dialog.showModal();
  characters.forEach((char, index) => {
    const target = dialog.querySelector(`#study-character-${index}`);
    const status = dialog.querySelector(`[data-study-status="${index}"]`);
    let generation = 0;
    const createWriter = practice => {
      const token = ++generation;
      const live = () => session.live && token === generation;
      target.replaceChildren();
      if (!window.HanziWriter || !window.XuebabangbangStrokeData) {
        status.textContent = "书写工具未加载，请刷新后重试。"; return;
      }
      status.textContent = practice ? "按笔顺写完这个字。" : "观察笔顺，也可以点“练一练”。";
      const writer = HanziWriter.create(target, char, {
        width: target.clientWidth || 160, height: target.clientWidth || 160, padding: 12,
        charDataLoader: window.XuebabangbangStrokeData.charDataLoader,
        showCharacter: !practice, showOutline: !practice,
        onLoadCharDataError: () => { if (live()) status.textContent = "笔画未加载，请再点一次重试。"; }
      });
      if (practice) writer.quiz({ leniency: 1.15, showHintAfterMisses: 2, onComplete: () => { if (live()) status.textContent = "这个字写完了！继续学习下一个字吧。"; } });
      else writer.animateCharacter();
    };
    target.addEventListener("touchmove", event => event.preventDefault(), { passive: false });
    dialog.querySelector(`[data-study-demo="${index}"]`).addEventListener("click", () => createWriter(false));
    dialog.querySelector(`[data-study-practice="${index}"]`).addEventListener("click", () => createWriter(true));
    createWriter(false);
  });
}

function renderDictationPreview(queue, state) {
  const progress = getDailyDictationProgress();
  const reviewIds = new Set(state.reviewIds || []);
  const completed = queue.filter(item => state.results?.[item.id]).length;
  const list = (items, heading) => `<section class="preview-list"><h3>${heading} <small>${items.length}词</small></h3>${items.length ? `<ul>${items.map(item => {
    const wrong = window.HANZI_DICTATION.wrongState(progress[item.id]).active;
    const result = state.results?.[item.id];
    return `<li><button type="button" class="preview-word" data-study-word="${escapeAttr(item.id)}">${wrong ? '<span class="wrong-marker"><svg aria-hidden="true" width="20" height="19" viewBox="0 0 20 19"><path fill="#b42318" d="M10 1 20 18H0Z"/><text x="10" y="15" text-anchor="middle" fill="white" font-size="13" font-weight="bold">!</text></svg><span class="visually-hidden">错词强化复习：</span></span>' : ""}<span>${escapeHtml(item.word)}</span><small>${escapeHtml(item.lessonTitle)}${result ? (result === "known" ? " · 已会写" : " · 需复习") : ""}</small></button></li>`;
  }).join("")}</ul>` : '<p class="daily-review-note">今天没有这类词。</p>'}</section>`;
  dictationDetail.innerHTML = `<section class="dictation-card dictation-preview">
    <h2>先学一学，再听写</h2><label class="dictation-size-label">今日数量 <select id="dictation-size" ${state.started ? "disabled" : ""}>
      ${[10, 20, 30].includes(state.size) ? "" : `<option selected value="${state.size}">${state.size}词（今日原有）</option>`}${[10, 20, 30].map(size => `<option value="${size}" ${size === state.size ? "selected" : ""}>${size}词</option>`).join("")}</select></label>
    <p class="daily-review-note">${state.started ? `今日已开始${queue.length}词，明日可更改数量。已答结果会保留。` : "开始前可以调整数量，开始后今天的词表固定。"} 今天实际安排${queue.length}词，先复习再学新词；其余到期词会在以后安排。</p>
    <p class="daily-review-note">点击词语可以听读音、看笔顺、练字。红色三角感叹号表示错词强化复习，连续两个日历日正确后解除。</p>
    <div class="preview-columns">${list(queue.filter(item => reviewIds.has(item.id)), "复习词")}${list(queue.filter(item => !reviewIds.has(item.id)), "待学词")}</div>
    <button class="primary-button begin-dictation" type="button" ${!queue.length || completed >= queue.length ? "disabled" : ""}>${completed >= queue.length && queue.length ? "今日听写已完成，可继续学习词语" : state.started ? "准备好了，继续听写" : "准备好了，开始听写"}</button></section>`;
  dictationDetail.querySelector("#dictation-size").addEventListener("change", event => { getDailyQueue(Number(event.target.value)); renderDailyDictation(); });
  dictationDetail.querySelectorAll("[data-study-word]").forEach(button => button.addEventListener("click", () => {
    const item = queue.find(item => item.id === button.dataset.studyWord);
    if (item) openWordStudy(item, button);
  }));
  dictationDetail.querySelector(".begin-dictation").addEventListener("click", () => {
    const current = getTodayQueueState();
    if (current.date !== todayKey() || !queue.length) { renderDailyDictation(); return; }
    current.started = true;
    (window.XbbStorage || localStorage).setItem(dailyDictationQueueKey(), JSON.stringify(current));
    dictationPhase = "test"; renderDailyDictation();
  });
}

function renderDailyDictation() {
  const token = invalidateStudyView();
  if (dailyDictationBankStatus !== "ready") {
    const unavailable = dailyDictationBankStatus === "not-in-textbook";
    const failed = dailyDictationBankStatus === "error";
    const title = failed ? "教材词语表加载失败" : unavailable ? "本册教材没有独立词语表" : "本册教材词语表正在整理";
    const note = failed ? "请刷新页面后重试；生字学习仍可使用。" : unavailable ? "暂不提供教材词语听写，可以继续生字学习。" : "整理完成后，就可以按教材词语表进行每日听写。";
    dictationOverview.innerHTML = `
      <div><h2>每日听写</h2><p>按教材词语表听写，写完后自己判断掌握情况。</p></div>
      <div class="lesson-badge">${failed ? "加载失败" : unavailable ? "无独立词语表" : "整理中"}</div>`;
    dictationDetail.innerHTML = `<section class="dictation-card daily-dictation-card"><h2>${title}</h2><p class="daily-review-note">${note}</p></section>`;
    return;
  }
  const queue = getDailyQueue();
  const state = getTodayQueueState();
  const results = state.results || {};
  const pending = queue.filter((item) => !results[item.id]);
  const completedCount = queue.length - pending.length;

  dictationOverview.innerHTML = `
    <div><h2>每日听写</h2><p>先预习，再听写。今天可选10、20或30词；写完后自己判断会不会写。</p>${dailyDictationTable ? `<p class="daily-review-note">${escapeHtml(dailyDictationTable.edition)} · 教材词语表 ${dailyDictationTable.total} 词</p>` : ""}</div>
    <div class="lesson-badge">${completedCount} / ${queue.length} 已标记</div>`;

  if (dictationPhase !== "test" || !state.started) {
    renderDictationPreview(queue, state);
    return;
  }
  const returnToPreview = document.createElement("button");
  returnToPreview.className = "secondary-button";
  returnToPreview.type = "button";
  returnToPreview.textContent = "返回词表学习";
  returnToPreview.addEventListener("click", () => { dictationPhase = "preview"; renderDailyDictation(); });
  dictationOverview.appendChild(returnToPreview);

  if (!queue.length) {
    dictationDetail.innerHTML = `<section class="dictation-card daily-dictation-card"><h2>今天还没有可听写的生词</h2><p class="daily-review-note">已学词汇会在复习日期自动回到这里。</p></section>`;
    return;
  }
  if (!pending.length) {
    dictationDetail.innerHTML = `<section class="dictation-card daily-dictation-card"><div class="daily-finished"><h2>今日 ${queue.length} 词已完成</h2><p>明天会根据你的手动标记安排下一次复习。</p></div></section>`;
    return;
  }

  const item = pending[0];
  const dateAtRender = todayKey();
  const isCurrent = () => token === viewEpoch && activeView === "dictation" && dictationPhase === "test" && todayKey() === dateAtRender &&
    !getTodayQueueState().results?.[item.id];
  cacheHumanAudio(item.word);
  const wordCharacters = Array.from(item.word).filter((character) => /[\u3400-\u9fff]/.test(character));
  dictationDetail.innerHTML = `
    <section class="dictation-card daily-dictation-card">
      <p class="dictation-step">第 ${completedCount + 1} / ${queue.length} 个</p>
      <span class="daily-count">${escapeHtml(item.lessonTitle)}</span>
      <p class="daily-prompt is-hidden">请先听读音，再写下来</p>
      <button class="listen-button daily-listen" type="button">🔊 听写</button>
      <button class="secondary-button reveal-dictation" type="button" aria-expanded="false">需要提示或答案</button>
      <div class="dictation-answer" hidden>
        ${item.pinyin ? `<p class="dictation-pinyin">${escapeHtml(item.pinyin)}</p>` : ""}
        <p class="dictation-answer-word">答案：${escapeHtml(item.word)}</p>
      </div>
      <p id="daily-writing-status" class="daily-review-note">请按笔顺在田字格中写完这个词的每个汉字，完成后才可手动标记。</p>
      <div class="tianzi-grid-list">
        ${wordCharacters.map((character, index) => `<div class="tianzi-grid daily-writing-grid"><div id="daily-writing-${index}" class="dictation-target" aria-label="第 ${index + 1} 个字书写区"></div></div>`).join("")}
      </div>
      <p class="writing-complete-note">已完成全词书写，请在弹窗中选择掌握情况。</p>
    </section>`;

  const writingStatus = dictationDetail.querySelector("#daily-writing-status");
  const completedCharacters = new Set();
  let assessmentOpened = false;
  const openAssessmentAfterWriting = () => {
    if (!isCurrent() || assessmentOpened || completedCharacters.size !== wordCharacters.length) return;
    assessmentOpened = true;
    writingStatus.textContent = "全词已写完。请你自己选择会不会写；系统不会自动替你标记。";
    dictationDetail.querySelector(".writing-complete-note")?.classList.add("is-visible");
    openSelfAssessmentModal({
      title: "写完啦，自己来判断",
      message: "这次听写，你会写吗？",
      knownLabel: "我会写",
      unknownLabel: "我不会写",
      onKnown: () => { if (isCurrent()) { saveManualDictationResult(item, true); renderDailyDictation(); } },
      onUnknown: () => { if (isCurrent()) { saveManualDictationResult(item, false); renderDailyDictation(); } }
    });
  };

  dictationDetail.querySelector(".daily-listen").addEventListener("click", () => playHumanChinese(item.word, writingStatus));
  const revealButton = dictationDetail.querySelector(".reveal-dictation");
  revealButton.addEventListener("click", () => {
    const answer = dictationDetail.querySelector(".dictation-answer");
    const isHidden = answer.hidden;
    answer.hidden = !isHidden;
    revealButton.setAttribute("aria-expanded", String(isHidden));
    revealButton.textContent = isHidden ? "隐藏提示和答案" : "需要提示或答案";
  });

  if (!window.HanziWriter || !window.XuebabangbangStrokeData || !wordCharacters.length) {
    writingStatus.textContent = "书写工具加载失败，请刷新页面后重试。";
    return;
  }

  wordCharacters.forEach((character, index) => {
    const target = document.getElementById(`daily-writing-${index}`);
    target.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    const size = target.clientWidth;
    const writer = HanziWriter.create(target, character, {
      charDataLoader: window.XuebabangbangStrokeData.charDataLoader,
      onLoadCharDataError: () => { writingStatus.textContent = "笔画暂时无法加载，请刷新后重试。"; },
      width: size,
      height: size,
      padding: 12,
      showCharacter: false,
      showOutline: false,
      drawingColor: "#1d1d1d",
      drawingWidth: 5,
      highlightColor: "#f4b942",
      highlightOnComplete: true
    });
    writer.quiz({
      leniency: 1.15,
      showHintAfterMisses: 2,
      onMistake: () => {
        writingStatus.textContent = "这笔不太对，再试一次；完成全词后再由你手动标记。";
      },
      onComplete: () => {
        if (!isCurrent()) return;
        completedCharacters.add(index);
        target.parentElement.classList.add("is-complete");
        if (completedCharacters.size === wordCharacters.length) {
          writingStatus.textContent = "全词写完啦！";
          openAssessmentAfterWriting();
        }
      }
    });
  });
}

function renderLessons() {
  lessonNav.innerHTML = lessons.map((lesson, index) => `
    <button class="lesson-button ${index === currentLessonIndex ? "active" : ""}" data-index="${index}" type="button">
      ${escapeHtml(lesson.title)}
    </button>`).join("");

  lessonNav.querySelectorAll(".lesson-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentLessonIndex = Number(button.dataset.index);
      currentCharIndex = 0;
      render();
    });
  });
}

function renderOverview() {
  const lesson = lessons[currentLessonIndex];
  lessonOverview.innerHTML = `
    <div><h2>${escapeHtml(lesson.title)}</h2><p>${escapeHtml(lesson.subtitle)}</p></div>
    <div class="lesson-overview-actions">
      <div class="lesson-badge">${lesson.chars.length} 个生字</div>
      <button class="primary-button start-dictation" type="button">每日听写</button>
    </div>`;
  lessonOverview.querySelector(".start-dictation").addEventListener("click", () => {
    activeView = "dictation";
    render();
  });
}

function renderCharList() {
  const lesson = lessons[currentLessonIndex];
  charList.hidden = false;
  charList.innerHTML = lesson.chars.map((item, index) => `
    <button class="char-button ${index === currentCharIndex ? "active" : ""}" data-index="${index}" type="button">
      <span class="char-mini">${escapeHtml(item.char)}</span>
      <span class="char-read">${escapeHtml(item.pinyin)}</span>
      ${getPracticeStatus(currentLessonIndex, index) === "learned" ? '<span class="learned-check" aria-label="已学会" title="已学会">✓</span>' : ""}
      ${getPracticeStatus(currentLessonIndex, index) === "review" ? '<span class="review-warning" aria-label="还要复习" title="还要复习">!</span>' : ""}
    </button>`).join("");

  charList.querySelectorAll(".char-button").forEach((button) => {
    button.addEventListener("click", () => {
      currentCharIndex = Number(button.dataset.index);
      renderDetail();
      renderCharList();
    });
  });
}

function getMeaningPinyin(text) {
  if (!window.pinyinPro?.pinyin) return "";
  return window.pinyinPro.pinyin(text, { toneType: "symbol" });
}

function renderDetail() {
  invalidateStudyView();
  const lesson = lessons[currentLessonIndex];
  const character = lesson.chars[currentCharIndex];
  cacheHumanAudio(character.readingPhrase || character.char);
  character.words.forEach((word) => cacheHumanAudio(word.word));
  if (character.sentence?.groupWord) cacheHumanAudio(character.sentence.groupWord);

  charDetail.innerHTML = `
    <div class="character-panel">
      <div class="character-box">
        <div class="character-header">
          <div class="big-char">${escapeHtml(character.char)}</div>
          <span class="pinyin-tag">${escapeHtml(character.pinyin)}</span>
          <button class="speak-character-button" type="button" data-character="${escapeAttr(character.readingPhrase || character.char)}" aria-label="朗读${escapeAttr(character.readingPhrase || character.char)}" title="朗读">🔊</button>
        </div>
        <div class="stroke-demo" aria-label="笔画演示"><div class="writer-target" id="writer-target"></div></div>
        <div class="character-actions">
          <button class="animate-button" type="button">演示笔画</button>
          <button class="practice-button" type="button">我来试试</button>
        </div>
      </div>
      <div class="info-panel">
        <div>
          <h3 class="words-title">${escapeHtml(character.examplesLabel || (character.words.length ? "组词" : "写字表练习"))}</h3>
          <div class="word-list">
            ${lesson.writingTable && !character.words.length ? '<p class="writing-table-note">先听读音、观察笔顺，再在田字格里写一写。</p>' : ""}
            ${character.readingPhrase ? `<p class="writing-table-note">读音提示：${escapeHtml(character.readingPhrase)}。点击喇叭听读。</p>` : ""}
            ${character.words.map((word) => `
              <div class="word-card">
                <div class="word-heading">
                  <h4>${escapeHtml(word.word)}</h4>
                  <button class="speak-word-button" type="button" data-word="${escapeAttr(word.word)}" aria-label="朗读${escapeAttr(word.word)}" title="朗读">🔊</button>
                </div>
                ${word.pinyin ? `<span class="word-pinyin">${escapeHtml(word.pinyin)}</span>` : ""}
                ${word.meaning ? `<span class="meaning-pinyin">${escapeHtml(getMeaningPinyin(word.meaning))}</span><p>${escapeHtml(word.meaning)}</p>` : ""}
              </div>`).join("")}
          </div>
        </div>
        ${character.sentence?.text ? `
          <section class="sentence-card" aria-label="造句">
            <div class="sentence-heading">
              <h3 class="sentence-title">造句</h3>
              <span class="sentence-group-word">关联组词：${escapeHtml(character.sentence.groupWord)}</span>
            </div>
            <p class="sentence-text">${escapeHtml(character.sentence.text)}</p>
          </section>` : ""}
      </div>
    </div>`;

  charDetail.querySelector(".animate-button").addEventListener("click", animateStrokes);
  charDetail.querySelector(".practice-button").addEventListener("click", () => renderCharacterPractice(character));
  charDetail.querySelector(".speak-character-button").addEventListener("click", (event) => {
    playHumanChinese(event.currentTarget.dataset.character);
  });
  charDetail.querySelectorAll(".speak-word-button").forEach((button) => {
    button.addEventListener("click", () => playHumanChinese(button.dataset.word));
  });

  if (window.HanziWriter && window.XuebabangbangStrokeData) {
    const target = document.getElementById("writer-target");
    if (target) {
      writerInstance = HanziWriter.create(target, character.char, {
        charDataLoader: window.XuebabangbangStrokeData.charDataLoader,
        onLoadCharDataError: () => { target.textContent = "笔画暂时无法加载，请重新选择此字。"; },
        width: 160,
        height: 160,
        padding: 0,
        strokeAnimationSpeed: 1.1,
        delayBetweenLoops: 900,
        highlightOnComplete: true,
        showOutline: false,
        showCharacter: true,
        characterColor: "#1d1d1d",
        outlineColor: "#1d1d1d",
        mainColor: "#1d1d1d",
        highlightColor: "#f4b942"
      });
    }
  }
  animateStrokes();
}

function renderCharacterPractice(character) {
  const token = invalidateStudyView();
  const practiceLessonIndex = currentLessonIndex;
  const practiceCharIndex = currentCharIndex;
  charDetail.innerHTML = `
    <section class="dictation-card practice-card">
      <p class="dictation-step">我来试试</p>
      <p class="dictation-hint">请按正确笔顺，在田字格中写一遍“${escapeHtml(character.char)}”。</p>
      <div class="tianzi-grid practice-grid"><div id="practice-target" class="dictation-target" aria-label="${escapeAttr(character.char)}田字格书写区"></div></div>
      <p id="practice-status" class="dictation-status" aria-live="polite">准备好后开始书写。</p>
      <div class="dictation-actions"><button class="secondary-button retry-practice" type="button">重新书写</button><button class="primary-button return-learning" type="button">返回学习</button></div>
    </section>`;

  const practiceStatus = document.getElementById("practice-status");
  const completePractice = () => {
    if (token !== viewEpoch || activeView !== "learning") return;
    openSelfAssessmentModal({
      title: "写完啦，自己来判断",
      message: `“${character.char}”这次学会了吗？`,
      knownLabel: "已学会",
      unknownLabel: "还要复习",
      onKnown: () => {
        if (token !== viewEpoch || activeView !== "learning") return;
        savePracticeProgress(practiceLessonIndex, practiceCharIndex, "learned");
        renderCharList();
        practiceStatus.textContent = "已标记为学会，生字列表有绿色对勾。";
      },
      onUnknown: () => {
        if (token !== viewEpoch || activeView !== "learning") return;
        savePracticeProgress(practiceLessonIndex, practiceCharIndex, "review");
        renderCharList();
        practiceStatus.textContent = "已标记为还要复习，生字列表有红色提示。";
      }
    });
  };

  const target = document.getElementById("practice-target");
  target.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
  charDetail.querySelector(".retry-practice").addEventListener("click", () => renderCharacterPractice(character));
  charDetail.querySelector(".return-learning").addEventListener("click", () => {
    renderCharList();
    renderDetail();
  });

  if (!window.HanziWriter || !window.XuebabangbangStrokeData) {
    practiceStatus.textContent = "书写工具未加载，请刷新页面后重试。";
    return;
  }

  const size = target.clientWidth;
  const practiceWriter = HanziWriter.create(target, character.char, {
    charDataLoader: window.XuebabangbangStrokeData.charDataLoader,
    onLoadCharDataError: () => { practiceStatus.textContent = "笔画暂时无法加载，请点“重新书写”重试。"; },
    width: size,
    height: size,
    padding: 12,
    showCharacter: false,
    showOutline: false,
    drawingColor: "#1d1d1d",
    drawingWidth: 5,
    highlightColor: "#f4b942",
    highlightOnComplete: true
  });
  practiceWriter.quiz({
    leniency: 1.15,
    showHintAfterMisses: 2,
    onMistake: () => {
      practiceStatus.textContent = "这笔不太对，再试一次。";
    },
    onComplete: completePractice
  });
}

function animateStrokes() {
  if (writerInstance && typeof writerInstance.animateCharacter === "function") {
    writerInstance.animateCharacter();
  }
}

function render() {
  invalidateStudyView();
  renderAppTabs();
  if (activeView === "dictation") {
    learningView.hidden = true;
    dictationView.hidden = false;
    renderDailyDictation();
    return;
  }

  learningView.hidden = false;
  dictationView.hidden = true;
  detailLayout.classList.remove("single-panel");
  renderLessons();
  renderOverview();
  renderCharList();
  renderDetail();
  preloadVisibleAudio();
}

function renderLoadError() {
  learningView.hidden = false;
  dictationView.hidden = true;
  appTabs.innerHTML = "";
  lessonNav.innerHTML = "";
  lessonOverview.innerHTML = `<section class="dictation-card"><h2>教材数据加载失败</h2><p>请返回重新选择教材后再试。</p><a class="primary-button" href="welcome.html">返回选择教材</a></section>`;
  charList.innerHTML = "";
  charDetail.innerHTML = "";
}

async function init() {
  if (window.XbbCloudReady) await window.XbbCloudReady;
  loadSpeechVoices();
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = loadSpeechVoices;
  if (!selectedBook?.available) {
    renderLoadError();
    return;
  }

  try {
    lessons = await loadLessonsFromTxt(selectedBookId);
    migratePracticeProgress();
    try {
      await loadDailyDictationWordBank(selectedBookId);
    } catch (error) {
      console.error(error);
      dailyDictationItems = [];
      dailyDictationTable = null;
      dailyDictationBankStatus = "error";
    }
    document.querySelector(".topbar h1").textContent = `汉字乐园 · ${selectedBook.label}${selectedBook.legacy ? "（原有教材）" : "（2026写字表）"}`;
    render();
  } catch (error) {
    console.error(error);
    renderLoadError();
  }
}

init();
