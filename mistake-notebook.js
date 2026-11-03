(function registerMistakeNotebook(global) {
  const SOURCE = "错词.txt";
  function parse(text) {
    const seen = new Set();
    const words = [];
    let invalidCount = 0;
    String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/).forEach(line => {
      const word = line.trim();
      if (!word || word.startsWith("#")) return;
      if (!/^[\u3400-\u9fff]+$/u.test(word)) { invalidCount += 1; return; }
      if (seen.has(word)) return;
      seen.add(word);
      words.push({ id: `mistake-v1:${word}`, word });
    });
    return { words, invalidCount };
  }

  function create({ root, escapeHtml: esc, speak, pinyin, stopSpeech, now }) {
    if (!global.HANZI_MISTAKE_SCHEDULER) return null;
    const scheduler = global.HANZI_MISTAKE_SCHEDULER.create({
      storage: { getItem: key => global.localStorage.getItem(key), setItem: (key, value) => global.localStorage.setItem(key, value) }, now
    });
    let visible = false;
    let status = "idle";
    let items = [];
    let invalidCount = 0;
    let mode = "dictation";
    let generation = 0;
    let loadGeneration = 0;
    let writers = [];
    const resultText = result => result === "known" ? "会写了" : result === "unknown" ? "还要复习" : "还没听写";
    const bind = (selector, event, callback) => root.querySelector(selector)?.addEventListener(event, callback);
    const header = () => `<section class="lesson-overview"><div><h2>错词本听写</h2><p>每轮最多 30 个词，先复习到期的词，再听写新词。</p></div><div class="lesson-badge">词表共 ${items.length} 个词</div></section>`;
    const note = () => `${invalidCount ? `<p class="mistake-warning" role="status">跳过了 ${invalidCount} 行：每行只填写一个词，只写汉字。</p>` : ""}${scheduler.hasStorageWarning() ? '<p class="mistake-warning" role="status">浏览器无法读取或保存部分记录，本页仍可继续；刷新页面后进度可能丢失。</p>' : ""}`;
    const toolbar = () => '<div class="mistake-toolbar"><button class="secondary-button mistake-open-list" type="button">查看词表 / 复习</button><button class="secondary-button mistake-refresh" type="button">刷新词表</button></div>';
    function nextReviewNote() {
      const date = scheduler.nextReviewDate(items);
      return date ? `下一次复习：${esc(date)}。` : "暂无待安排的复习。";
    }
    function cancelExercise() {
      generation += 1;
      writers.forEach(writer => writer.cancelQuiz?.());
      writers = [];
      stopSpeech();
    }
    function bindToolbar() {
      bind(".mistake-open-list", "click", () => { cancelExercise(); mode = "list"; render(); root.querySelector(".mistake-continue")?.focus(); });
      bind(".mistake-refresh", "click", load);
    }
    function prepareForEntry() {
      const round = scheduler.currentRound(items);
      if (!round || round.pending.length) return;
      const progress = scheduler.progress();
      const reviewedDates = round.queue.filter(item => round.results[item.id]).map(item => progress[item.id]?.lastReviewed).filter(Boolean).sort();
      const completedDate = reviewedDates.at(-1) || round.startedAt;
      // Resume unfinished rounds across midnight. Only a completed older round
      // rolls forward on entry; finishing a word still shows today's summary.
      if (completedDate < scheduler.today()) scheduler.nextRound(items);
    }
    async function load() {
      cancelExercise();
      status = "loading";
      const request = ++loadGeneration;
      if (visible) render();
      try {
        const response = await global.fetch(encodeURI(SOURCE), { cache: "no-store" });
        if (!response.ok) throw new Error(String(response.status));
        const parsed = parse(await response.text());
        if (request !== loadGeneration) return;
        items = parsed.words;
        invalidCount = parsed.invalidCount;
        status = "ready";
        prepareForEntry();
      } catch (error) {
        if (request !== loadGeneration) return;
        status = "error";
      }
      if (visible) render();
    }
    function renderList() {
      const progress = scheduler.progress();
      root.innerHTML = `${header()}<section class="mistake-panel">${note()}
        <div class="mistake-toolbar"><button class="primary-button mistake-continue" type="button">继续错词听写</button><button class="secondary-button mistake-refresh" type="button">刷新词表</button></div>
        <ul class="mistake-list" aria-label="错词复习列表">${items.map((item, index) => `<li class="mistake-row">
          <span class="mistake-word-info"><span><span class="mistake-word">${esc(item.word)}</span><span class="word-pinyin">${esc(pinyin(item.word))}</span></span></span>
          <span class="mistake-result">${esc(resultText(progress[item.id]?.lastResult))}${progress[item.id]?.dueDate ? `<br>复习：${esc(progress[item.id].dueDate)}` : ""}</span>
          <button class="secondary-button mistake-read" data-index="${index}" type="button" aria-label="朗读${esc(item.word)}">🔊 读一读</button>
        </li>`).join("")}</ul><p id="mistake-speech-status" class="daily-review-note" role="status"></p>
        <p class="daily-review-note">词表各教材共用。不会写的词明天再练，会写的词逐步拉长复习间隔。记录只保存在当前浏览器。</p></section>`;
      bind(".mistake-continue", "click", () => { cancelExercise(); mode = "dictation"; render(); root.querySelector(".mistake-listen")?.focus(); });
      bind(".mistake-refresh", "click", load);
      root.querySelectorAll(".mistake-read").forEach(button => button.addEventListener("click", () => speak(items[Number(button.dataset.index)].word, root.querySelector("#mistake-speech-status"))));
    }
    function renderFinished(round) {
      const unknown = round.queue.filter(item => round.results[item.id] === "unknown").length;
      const eligible = scheduler.eligible(items).length;
      const removed = round.ids.length - round.queue.length;
      root.innerHTML = `${header()}<section class="dictation-card daily-dictation-card">${note()}<h2>这轮 ${round.queue.length} 个词写完啦</h2><p>会写 ${round.queue.length - unknown} 个，还要复习 ${unknown} 个。</p>
        ${removed ? `<p class="daily-review-note">${removed} 个词已从词表移除，本轮跳过。</p>` : ""}
        <p class="daily-review-note">不会写的词安排在下一天；今天写过的词不会反复凑数。</p>
        ${eligible ? `<button class="primary-button mistake-next-round" type="button">继续下一轮（${Math.min(30, eligible)} 个词）</button>` : `<p class="daily-review-note">今天没有其他可听写的词了。${nextReviewNote()}</p>`}${toolbar()}</section>`;
      bind(".mistake-next-round", "click", () => { cancelExercise(); scheduler.nextRound(items); render(); root.querySelector(".mistake-listen")?.focus(); });
      bindToolbar();
      root.querySelector("button")?.focus();
    }
    function renderWaiting() {
      root.innerHTML = `${header()}<section class="dictation-card daily-dictation-card">${note()}<h2>暂时没有到期的词</h2><p>新词已经听写过啦，复习到期后会自动加入下一轮。</p><p>${nextReviewNote()}</p>${toolbar()}</section>`;
      bindToolbar();
    }
    function renderExercise(round) {
      cancelExercise();
      const token = generation;
      const item = round.pending[0];
      const characters = Array.from(item.word);
      const completedCount = round.queue.length - round.pending.length;
      root.innerHTML = `${header()}<section class="dictation-card daily-dictation-card">${note()}
        <p class="dictation-step">错词听写 · 第 ${completedCount + 1} / ${round.queue.length} 个</p><p>先听读音，再在田字格里写下来。</p>
        <div class="mistake-toolbar"><button class="listen-button mistake-listen" type="button">🔊 听一遍</button><button class="secondary-button mistake-reveal" type="button" aria-expanded="false">查看答案</button></div>
        <div class="dictation-answer" hidden><p class="dictation-pinyin">${esc(pinyin(item.word))}</p><p class="dictation-answer-word">${esc(item.word)}</p></div>
        <p id="mistake-writing-status" class="daily-review-note" role="status">写完每个字后，再自己判断会不会写。</p>
        <div class="tianzi-grid-list">${characters.map((char, index) => `<div class="tianzi-grid daily-writing-grid"><div id="mistake-writing-${index}" class="dictation-target" aria-label="第 ${index + 1} 个字书写区"></div></div>`).join("")}</div>
        <div class="mistake-assessment" hidden><p>这次听写，你会写吗？标记后进入下一个词。</p><div class="mistake-toolbar"><button class="primary-button mistake-known" type="button">我会写</button><button class="secondary-button mistake-unknown" type="button">我不会写</button></div></div>
        <div class="mistake-toolbar"><button class="secondary-button mistake-rewrite" type="button">重新写这个词</button></div>${toolbar()}</section>`;
      const writingStatus = root.querySelector("#mistake-writing-status");
      const completed = new Set();
      let assessed = false;
      const isCurrent = () => visible && mode === "dictation" && generation === token;
      const assess = known => {
        if (!isCurrent() || assessed || completed.size !== characters.length) return;
        assessed = true;
        scheduler.mark(item.id, known);
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
      bind(".mistake-rewrite", "click", () => { render(); root.querySelector(".mistake-listen")?.focus(); });
      bindToolbar();
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
          quizResult?.catch?.(() => { if (isCurrent()) writingStatus.textContent = "书写数据未能加载，请点击“重新写这个词”重试。"; });
        } catch (error) { writingStatus.textContent = "书写工具暂时不可用，请点击“重新写这个词”重试。"; }
      });
    }
    function render() {
      if (!visible) return;
      if (status === "loading") root.innerHTML = `${header()}<section class="mistake-panel" role="status">正在打开错词本…</section>`;
      else if (status === "error") {
        root.innerHTML = `${header()}<section class="mistake-panel"><h3>错词表没有加载成功</h3><p>请检查网络，或确认网站中有“错词.txt”。</p><button class="secondary-button mistake-reload" type="button">重新加载</button></section>`;
        bind(".mistake-reload", "click", load);
      } else if (!items.length) {
        root.innerHTML = `${header()}<section class="mistake-panel">${note()}<h3>错词本还是空的</h3><p>把要复习的词添加到错词.txt，一行一个词，保存并更新网站后刷新词表。</p><button class="secondary-button mistake-refresh" type="button">刷新词表</button></section>`;
        bind(".mistake-refresh", "click", load);
      } else if (mode === "list") renderList();
      else {
        const round = scheduler.currentRound(items) || scheduler.nextRound(items);
        if (!round) renderWaiting();
        else if (!round.pending.length) renderFinished(round);
        else renderExercise(round);
      }
    }
    return {
      enter() { if (visible) return; visible = true; if (status === "idle") load(); else { if (status === "ready") prepareForEntry(); render(); } },
      leave() { if (!visible) return; visible = false; cancelExercise(); }
    };
  }
  global.HANZI_MISTAKE_NOTEBOOK = { parse, create };
})(window);
