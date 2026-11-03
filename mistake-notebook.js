(function registerMistakeNotebook(global) {
  const SOURCE = "错词.txt";
  const PROGRESS_KEY = "hanzi-mistake-notebook-progress-v1";
  const hanziOnly = /^[\u3400-\u9fff]+$/u;

  function parse(text) {
    const seen = new Set();
    const words = [];
    let invalidCount = 0;
    String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).forEach(line => {
      const word = line.trim();
      if (!word || word.startsWith("#")) return;
      if (!hanziOnly.test(word)) { invalidCount += 1; return; }
      if (seen.has(word)) return;
      seen.add(word);
      words.push({ id: `mistake-v1:${word}`, word });
    });
    return { words, invalidCount };
  }

  function readProgress(storage) {
    try {
      const value = JSON.parse(storage.getItem(PROGRESS_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (error) { return {}; }
  }

  function create({ root, escapeHtml: esc, speak, pinyin, stopSpeech }) {
    let visible = false;
    let status = "idle";
    let items = [];
    let selected = new Set();
    let invalidCount = 0;
    let session = null;
    let generation = 0;
    let loadGeneration = 0;
    let writers = [];
    let storageWarning = false;
    const getProgress = () => {
      try { return readProgress(global.localStorage); } catch (error) { return {}; }
    };
    const resultText = result => result === "known" ? "会写了" : result === "unknown" ? "还要复习" : "未听写";

    function cancelExercise() {
      generation += 1;
      writers.forEach(writer => writer.cancelQuiz?.());
      writers = [];
      stopSpeech();
    }

    function saveResult(item, known) {
      const progress = getProgress();
      progress[item.id] = { result: known ? "known" : "unknown", updatedAt: new Date().toISOString() };
      try { global.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }
      catch (error) { storageWarning = true; }
    }

    function bind(selector, event, callback) {
      root.querySelector(selector)?.addEventListener(event, callback);
    }

    function header() {
      return `<section class="lesson-overview"><div><h2>错词本</h2><p>先读一读，再选几个词来听写。</p></div><div class="lesson-badge">${items.length} 个词</div></section>`;
    }

    function note() {
      return `${invalidCount ? `<p class="mistake-warning" role="status">跳过了 ${invalidCount} 行：每行只填写一个词，只写汉字。</p>` : ""}${storageWarning ? '<p class="mistake-warning" role="status">浏览器无法保存记录，本轮仍可继续；离开页面后记录可能丢失。</p>' : ""}`;
    }

    async function load() {
      cancelExercise();
      session = null;
      status = "loading";
      const request = ++loadGeneration;
      if (visible) render();
      try {
        const response = await global.fetch(encodeURI(SOURCE), { cache: "no-store" });
        if (!response.ok) throw new Error(String(response.status));
        const parsed = parse(await response.text());
        if (request !== loadGeneration) return;
        const firstLoad = items.length === 0;
        const oldSelected = selected;
        items = parsed.words;
        invalidCount = parsed.invalidCount;
        selected = new Set(items.filter(item => firstLoad || oldSelected.has(item.id)).map(item => item.id));
        status = "ready";
      } catch (error) {
        if (request !== loadGeneration) return;
        status = "error";
      }
      if (visible) render();
    }

    function start(queue) {
      if (!queue.length) return;
      cancelExercise();
      session = { queue: queue.slice(), index: 0, results: {} };
      render();
      root.querySelector(".mistake-listen")?.focus();
    }

    function renderList() {
      const progress = getProgress();
      root.innerHTML = `${header()}<section class="mistake-panel">${note()}
        <div class="mistake-toolbar"><button class="secondary-button mistake-select-all" type="button">全选</button><button class="secondary-button mistake-clear" type="button">清空选择</button><button class="secondary-button mistake-refresh" type="button">刷新词表</button></div>
        ${items.length ? `<p id="mistake-selection-count" class="daily-review-note" aria-live="polite"></p>
        <ul class="mistake-list" aria-label="错词复习列表">${items.map((item, index) => `<li class="mistake-row">
          <label class="mistake-selection"><input type="checkbox" value="${esc(item.id)}" ${selected.has(item.id) ? "checked" : ""}><span><span class="mistake-word">${esc(item.word)}</span><span class="word-pinyin">${esc(pinyin(item.word))}</span></span></label>
          <span class="mistake-result">${esc(resultText(progress[item.id]?.result))}</span>
          <button class="secondary-button mistake-read" data-index="${index}" type="button" aria-label="朗读${esc(item.word)}">🔊 读一读</button>
        </li>`).join("")}</ul>
        <div class="mistake-toolbar"><button class="primary-button mistake-start" type="button">听写选中的词</button></div><p id="mistake-speech-status" class="daily-review-note" role="status"></p>` : '<h3>错词本还是空的</h3><p>把要复习的词添加到错词.txt，一行一个词，保存并更新网站后，点击“刷新词表”。</p>'}
        <p class="daily-review-note">听写结果只记在当前浏览器里。错词表由家长维护，各教材共用；标记“会写了”不会删除词语。</p></section>`;
      const updateSelection = () => {
        const count = root.querySelector("#mistake-selection-count");
        if (count) count.textContent = `已选 ${selected.size} / ${items.length} 个词`;
        const startButton = root.querySelector(".mistake-start");
        if (startButton) startButton.disabled = selected.size === 0;
      };
      root.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener("change", () => {
        if (input.checked) selected.add(input.value); else selected.delete(input.value);
        updateSelection();
      }));
      const setSelection = all => {
        selected = new Set(all ? items.map(item => item.id) : []);
        root.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = all; });
        updateSelection();
      };
      bind(".mistake-select-all", "click", () => setSelection(true));
      bind(".mistake-clear", "click", () => setSelection(false));
      bind(".mistake-refresh", "click", load);
      bind(".mistake-start", "click", () => start(items.filter(item => selected.has(item.id))));
      root.querySelectorAll(".mistake-read").forEach(button => button.addEventListener("click", () => speak(items[Number(button.dataset.index)].word, root.querySelector("#mistake-speech-status"))));
      updateSelection();
    }

    function renderFinished() {
      const unknown = session.queue.filter(item => session.results[item.id] === "unknown");
      root.innerHTML = `${header()}<section class="dictation-card daily-dictation-card">${note()}<h2>这轮 ${session.queue.length} 个词写完啦</h2><p>会写 ${session.queue.length - unknown.length} 个，还要复习 ${unknown.length} 个。</p><div class="mistake-toolbar">${unknown.length ? '<button class="primary-button mistake-retry-unknown" type="button">再练不会写的词</button>' : ""}<button class="secondary-button mistake-back" type="button">返回错词列表</button></div></section>`;
      bind(".mistake-retry-unknown", "click", () => start(unknown));
      bind(".mistake-back", "click", backToList);
      root.querySelector("button")?.focus();
    }

    function backToList() {
      cancelExercise();
      session = null;
      render();
      root.querySelector(".mistake-start")?.focus();
    }

    function renderExercise() {
      cancelExercise();
      const token = generation;
      const currentSession = session;
      const item = session.queue[session.index];
      if (!item) { renderFinished(); return; }
      const characters = Array.from(item.word);
      root.innerHTML = `${header()}<section class="dictation-card daily-dictation-card">${note()}
        <p class="dictation-step">错词听写 · 第 ${session.index + 1} / ${session.queue.length} 个</p>
        <p>先听读音，再在田字格里写下来。</p>
        <div class="mistake-toolbar"><button class="listen-button mistake-listen" type="button">🔊 听一遍</button><button class="secondary-button mistake-reveal" type="button" aria-expanded="false">查看答案</button></div>
        <div class="dictation-answer" hidden><p class="dictation-pinyin">${esc(pinyin(item.word))}</p><p class="dictation-answer-word">${esc(item.word)}</p></div>
        <p id="mistake-writing-status" class="daily-review-note" role="status">写完每个字后，再自己判断会不会写。</p>
        <div class="tianzi-grid-list">${characters.map((char, index) => `<div class="tianzi-grid daily-writing-grid"><div id="mistake-writing-${index}" class="dictation-target" aria-label="第 ${index + 1} 个字书写区"></div></div>`).join("")}</div>
        <div class="mistake-assessment" hidden><p>这次听写，你会写吗？</p><div class="mistake-toolbar"><button class="primary-button mistake-known" type="button">我会写</button><button class="secondary-button mistake-unknown" type="button">我不会写</button></div></div>
        <div class="mistake-toolbar"><button class="secondary-button mistake-rewrite" type="button">重新写这个词</button><button class="secondary-button mistake-back" type="button">返回错词列表</button></div></section>`;
      const writingStatus = root.querySelector("#mistake-writing-status");
      const completed = new Set();
      let assessed = false;
      const isCurrent = () => visible && generation === token && session === currentSession;
      const assess = known => {
        if (!isCurrent() || assessed || completed.size !== characters.length) return;
        assessed = true;
        session.results[item.id] = known ? "known" : "unknown";
        saveResult(item, known);
        session.index += 1;
        render();
        root.querySelector(".mistake-listen")?.focus();
      };
      bind(".mistake-listen", "click", () => speak(item.word, writingStatus));
      bind(".mistake-reveal", "click", () => {
        const answer = root.querySelector(".dictation-answer");
        answer.hidden = !answer.hidden;
        const button = root.querySelector(".mistake-reveal");
        button.setAttribute("aria-expanded", String(!answer.hidden));
        button.textContent = answer.hidden ? "查看答案" : "隐藏答案";
      });
      bind(".mistake-known", "click", () => assess(true));
      bind(".mistake-unknown", "click", () => assess(false));
      bind(".mistake-back", "click", backToList);
      bind(".mistake-rewrite", "click", () => { render(); root.querySelector(".mistake-listen")?.focus(); });
      if (!global.HanziWriter) { writingStatus.textContent = "书写工具加载失败，请刷新页面后重试。"; return; }
      characters.forEach((char, index) => {
        const target = root.querySelector(`#mistake-writing-${index}`);
        target.addEventListener("touchmove", event => event.preventDefault(), { passive: false });
        try {
          const writer = global.HanziWriter.create(target, char, {
            width: target.clientWidth, height: target.clientWidth, padding: 12,
            showCharacter: false, showOutline: false, drawingColor: "#1d1d1d", drawingWidth: 5,
            highlightColor: "#f4b942", highlightOnComplete: true,
            onLoadCharDataError: () => { if (isCurrent()) writingStatus.textContent = "有汉字的笔顺数据未能加载，请点击“重新写这个词”重试。"; }
          });
          writers.push(writer);
          const quizResult = writer.quiz({
            leniency: 1.15, showHintAfterMisses: 2,
            onMistake: () => { if (isCurrent()) writingStatus.textContent = "这笔再试一次，写完后自己判断。"; },
            onComplete: () => {
              if (!isCurrent()) return;
              completed.add(index);
              target.parentElement.classList.add("is-complete");
              if (completed.size === characters.length) {
                writingStatus.textContent = "全词写完啦！自己判断会不会写，标记后进入下一个词。";
                root.querySelector(".mistake-assessment").hidden = false;
                root.querySelector(".mistake-known")?.focus();
              }
            }
          });
          quizResult?.catch?.(() => {
            if (isCurrent()) writingStatus.textContent = "书写数据未能加载，请点击“重新写这个词”重试。";
          });
        } catch (error) {
          writingStatus.textContent = "书写工具暂时不可用，请点击“重新写这个词”重试。";
        }
      });
    }

    function render() {
      if (!visible) return;
      if (status === "loading") {
        root.innerHTML = `${header()}<section class="mistake-panel" role="status">正在打开错词本…</section>`;
      } else if (status === "error") {
        root.innerHTML = `${header()}<section class="mistake-panel"><h3>错词表没有加载成功</h3><p>请检查网络，或确认网站中有“错词.txt”。</p><button class="secondary-button mistake-reload" type="button">重新加载</button></section>`;
        bind(".mistake-reload", "click", load);
      } else if (session) renderExercise();
      else renderList();
    }

    return {
      enter() {
        if (visible) return;
        visible = true;
        if (status === "idle") load(); else render();
      },
      leave() {
        if (!visible) return;
        visible = false;
        cancelExercise();
      }
    };
  }

  global.HANZI_MISTAKE_NOTEBOOK = { parse, readProgress, create, PROGRESS_KEY };
})(window);
