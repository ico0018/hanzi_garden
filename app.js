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
const selectedBookId = new URLSearchParams(window.location.search).get("book") || "3-upper";
const selectedBook = BOOK_CATALOG[selectedBookId];
const DAILY_DICTATION_SIZE = 15;
const EBBINGHAUS_INTERVALS = [2, 4, 7, 15, 30, 60];
const HUMAN_AUDIO_BASE_URL = "https://raw.githubusercontent.com/hugolpz/audio-cmn/master/64k/hsk";
const AUDIO_CACHE_LIMIT = 40;
const audioCache = new Map();

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
    const words = rest.join("|")
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
    currentLesson.chars.push({ char, pinyin, words });
  }

  return parsedLessons.filter((lesson) => lesson.chars.length > 0);
}

async function loadLessonsFromTxt(bookId) {
  const book = BOOK_CATALOG[bookId];
  if (!book?.available || !book.dataFile) throw new Error(`Unknown or unavailable book: ${bookId}`);
  const response = await fetch(encodeURI(book.dataFile), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${book.dataFile}: ${response.status}`);
  const parsed = parseLessonsText(await response.text());
  if (!parsed.length) throw new Error(`No valid lessons parsed from ${book.dataFile}`);
  return parsed;
}

function stableItemId(lesson, character) {
  const firstWord = character.words[0]?.word || character.char;
  return encodeURIComponent([selectedBookId, lesson.title, character.char, firstWord].join("|"));
}

function legacyIndexId(lessonIndex, charIndex) {
  return `${selectedBookId}:${lessonIndex}:${charIndex}`;
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
    return JSON.parse(localStorage.getItem(practiceProgressKey()) || "{}");
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
  localStorage.setItem(practiceProgressKey(), JSON.stringify(progress));
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
  if (localStorage.getItem(practiceProgressKey())) return;
  const migrated = {};
  lessons.forEach((lesson, lessonIndex) => {
    let raw = localStorage.getItem(`hanzi-practice-v2-${selectedBookId}-${lessonIndex}`);
    if (raw === null && selectedBookId === "3-upper") raw = localStorage.getItem(`hanzi-practice-${lessonIndex}`);
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
  localStorage.setItem(practiceProgressKey(), JSON.stringify(migrated));
}

function dailyDictationProgressKey() {
  return `hanzi-daily-dictation-progress-v3-${selectedBookId}`;
}

function dailyDictationQueueKey() {
  return `hanzi-daily-dictation-queue-v3-${selectedBookId}`;
}

function getDictationItems() {
  return lessons.flatMap((lesson, lessonIndex) =>
    lesson.chars.map((character, charIndex) => ({
      id: stableItemId(lesson, character),
      legacyId: legacyIndexId(lessonIndex, charIndex),
      order: lessonIndex * 1000 + charIndex,
      lessonTitle: lesson.title,
      character: character.char,
      word: character.words[0]?.word || character.char,
      pinyin: character.words[0]?.pinyin || character.pinyin
    }))
  );
}

function migrateDailyDictationProgress() {
  if (localStorage.getItem(dailyDictationProgressKey())) return;
  const items = getDictationItems();
  const byLegacy = new Map(items.map((item) => [item.legacyId, item.id]));
  let raw = localStorage.getItem(`hanzi-daily-dictation-progress-v2-${selectedBookId}`);
  if (raw === null && selectedBookId === "3-upper") raw = localStorage.getItem("hanzi-daily-dictation-progress-v1");
  const migrated = {};
  if (raw) {
    try {
      const legacy = JSON.parse(raw);
      Object.entries(legacy).forEach(([id, value]) => {
        const normalizedLegacyId = id.startsWith(`${selectedBookId}:`) ? id : `${selectedBookId}:${id}`;
        const stableId = byLegacy.get(normalizedLegacyId);
        if (stableId) migrated[stableId] = value;
      });
    } catch (error) {
      console.warn("Skipping invalid legacy dictation progress", error);
    }
  }
  localStorage.setItem(dailyDictationProgressKey(), JSON.stringify(migrated));
}

function getDailyDictationProgress() {
  try {
    return JSON.parse(localStorage.getItem(dailyDictationProgressKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function saveDailyDictationProgress(progress) {
  localStorage.setItem(dailyDictationProgressKey(), JSON.stringify(progress));
}

function getDailyQueue() {
  const date = todayKey();
  const items = getDictationItems();
  const itemById = new Map(items.map((item) => [item.id, item]));
  const progress = getDailyDictationProgress();
  let savedQueue = null;
  try {
    savedQueue = JSON.parse(localStorage.getItem(dailyDictationQueueKey()) || "null");
  } catch (error) {
    savedQueue = null;
  }

  if (savedQueue?.date === date && Array.isArray(savedQueue.ids)) {
    return savedQueue.ids.map((id) => itemById.get(id)).filter(Boolean).slice(0, DAILY_DICTATION_SIZE);
  }

  const dueItems = items
    .filter((item) => progress[item.id]?.dueDate && progress[item.id].dueDate <= date)
    .sort((a, b) => {
      const dueCompare = progress[a.id].dueDate.localeCompare(progress[b.id].dueDate);
      return dueCompare || a.order - b.order;
    });
  const dueIds = new Set(dueItems.map((item) => item.id));
  const newItems = items.filter((item) => !progress[item.id] && !dueIds.has(item.id));
  const queue = [...dueItems, ...newItems].slice(0, DAILY_DICTATION_SIZE);
  localStorage.setItem(dailyDictationQueueKey(), JSON.stringify({ date, ids: queue.map((item) => item.id), results: {} }));
  return queue;
}

function getTodayQueueState() {
  try {
    return JSON.parse(localStorage.getItem(dailyDictationQueueKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function saveManualDictationResult(item, known) {
  const date = todayKey();
  const progress = getDailyDictationProgress();
  const previous = progress[item.id] || { successCount: 0 };
  const successCount = known ? Math.min((previous.successCount || 0) + 1, EBBINGHAUS_INTERVALS.length) : 0;
  const interval = known ? EBBINGHAUS_INTERVALS[successCount - 1] : 1;
  progress[item.id] = {
    successCount,
    dueDate: addDays(date, interval),
    lastResult: known ? "known" : "unknown",
    lastReviewed: date
  };
  saveDailyDictationProgress(progress);

  const state = getTodayQueueState();
  if (state.date === date) {
    state.results = { ...(state.results || {}), [item.id]: known ? "known" : "unknown" };
    localStorage.setItem(dailyDictationQueueKey(), JSON.stringify(state));
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
      render();
    });
  });
}

function renderDailyDictation() {
  const queue = getDailyQueue();
  const state = getTodayQueueState();
  const results = state.results || {};
  const pending = queue.filter((item) => !results[item.id]);
  const completedCount = queue.length - pending.length;

  dictationOverview.innerHTML = `
    <div><h2>每日听写</h2><p>每天最多 15 个生词；系统只安排复习，你自己决定会不会写。</p></div>
    <div class="lesson-badge">${completedCount} / ${queue.length} 已标记</div>`;

  if (!queue.length) {
    dictationDetail.innerHTML = `<section class="dictation-card daily-dictation-card"><h2>今天还没有可听写的生词</h2><p class="daily-review-note">已学词汇会在复习日期自动回到这里。</p></section>`;
    return;
  }
  if (!pending.length) {
    dictationDetail.innerHTML = `<section class="dictation-card daily-dictation-card"><div class="daily-finished"><h2>今日 15 词已完成</h2><p>明天会根据你的手动标记安排下一次复习。</p></div></section>`;
    return;
  }

  const item = pending[0];
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
        <p class="dictation-pinyin">${escapeHtml(item.pinyin)}</p>
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
    if (assessmentOpened || completedCharacters.size !== wordCharacters.length) return;
    assessmentOpened = true;
    writingStatus.textContent = "全词已写完。请你自己选择会不会写；系统不会自动替你标记。";
    dictationDetail.querySelector(".writing-complete-note")?.classList.add("is-visible");
    openSelfAssessmentModal({
      title: "写完啦，自己来判断",
      message: "这次听写，你会写吗？",
      knownLabel: "我会写",
      unknownLabel: "我不会写",
      onKnown: () => { saveManualDictationResult(item, true); renderDailyDictation(); },
      onUnknown: () => { saveManualDictationResult(item, false); renderDailyDictation(); }
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

  if (!window.HanziWriter || !wordCharacters.length) {
    writingStatus.textContent = "书写工具加载失败，请刷新页面后重试。";
    return;
  }

  wordCharacters.forEach((character, index) => {
    const target = document.getElementById(`daily-writing-${index}`);
    target.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    const size = target.clientWidth;
    const writer = HanziWriter.create(target, character, {
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
  const lesson = lessons[currentLessonIndex];
  const character = lesson.chars[currentCharIndex];
  cacheHumanAudio(character.char);
  character.words.forEach((word) => cacheHumanAudio(word.word));

  charDetail.innerHTML = `
    <div class="character-panel">
      <div class="character-box">
        <div class="character-header">
          <div class="big-char">${escapeHtml(character.char)}</div>
          <span class="pinyin-tag">${escapeHtml(character.pinyin)}</span>
          <button class="speak-character-button" type="button" data-character="${escapeAttr(character.char)}" aria-label="朗读${escapeAttr(character.char)}" title="朗读">🔊</button>
        </div>
        <div class="stroke-demo" aria-label="笔画演示"><div class="writer-target" id="writer-target"></div></div>
        <div class="character-actions">
          <button class="animate-button" type="button">演示笔画</button>
          <button class="practice-button" type="button">我来试试</button>
        </div>
      </div>
      <div class="info-panel">
        <div>
          <h3 class="words-title">组词</h3>
          <div class="word-list">
            ${character.words.map((word) => `
              <div class="word-card">
                <div class="word-heading">
                  <h4>${escapeHtml(word.word)}</h4>
                  <button class="speak-word-button" type="button" data-word="${escapeAttr(word.word)}" aria-label="朗读${escapeAttr(word.word)}" title="朗读">🔊</button>
                </div>
                <span class="word-pinyin">${escapeHtml(word.pinyin)}</span>
                <span class="meaning-pinyin">${escapeHtml(getMeaningPinyin(word.meaning))}</span>
                <p>${escapeHtml(word.meaning)}</p>
              </div>`).join("")}
          </div>
        </div>
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

  if (window.HanziWriter) {
    const target = document.getElementById("writer-target");
    if (target) {
      writerInstance = HanziWriter.create(target, character.char, {
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

  const completePractice = () => {
    openSelfAssessmentModal({
      title: "写完啦，自己来判断",
      message: `“${character.char}”这次学会了吗？`,
      knownLabel: "已学会",
      unknownLabel: "还要复习",
      onKnown: () => {
        savePracticeProgress(practiceLessonIndex, practiceCharIndex, "learned");
        renderCharList();
        document.getElementById("practice-status").textContent = "已标记为学会，生字列表有绿色对勾。";
      },
      onUnknown: () => {
        savePracticeProgress(practiceLessonIndex, practiceCharIndex, "review");
        renderCharList();
        document.getElementById("practice-status").textContent = "已标记为还要复习，生字列表有红色提示。";
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

  if (!window.HanziWriter) {
    document.getElementById("practice-status").textContent = "书写工具未加载，请刷新页面后重试。";
    return;
  }

  const size = target.clientWidth;
  const practiceWriter = HanziWriter.create(target, character.char, {
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
      document.getElementById("practice-status").textContent = "这笔不太对，再试一次。";
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
  loadSpeechVoices();
  if ("speechSynthesis" in window) window.speechSynthesis.onvoiceschanged = loadSpeechVoices;
  if (!selectedBook?.available) {
    renderLoadError();
    return;
  }

  try {
    lessons = await loadLessonsFromTxt(selectedBookId);
    migratePracticeProgress();
    migrateDailyDictationProgress();
    document.querySelector(".topbar h1").textContent = `汉字乐园 · ${selectedBook.label}`;
    render();
  } catch (error) {
    console.error(error);
    renderLoadError();
  }
}

init();
