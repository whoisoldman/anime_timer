/**
 * Project: Animated Timer (Diploma) / Анимированный Таймер (Диплом)
 * Files: index.html, style.css, script.js
 * Author / Автор: Mr.OLDMAN
 * GitHub: https://github.com/whoisoldman/whoisoldman.github.io
 * Year / Год: 2025
 * License / Лицензия: MIT (see LICENSE / см. LICENSE)
 */

(() => {
  // ==== Preloader control ====
  const preloader = document.getElementById("preloader");
  const MIN_PRELOAD_TIME = 3100; // 3.1s minimum
  let preloadStart = Date.now();

  if (preloader) document.documentElement.classList.add("preload-lock");

  /**
   * EN: Hides the preloader after ensuring a minimal visible time.
   *     Removes scroll lock, triggers card fade-in, and then detaches the node.
   * RU: Скрывает прелоадер после минимального времени показа.
   *     Снимает блокировку прокрутки, включает плавное появление карточки и удаляет узел.
   *
   @returns {void}
   */
  function hidePreloader() {
    if (!preloader || preloader.classList.contains("is-hidden")) return;

    const elapsed = Date.now() - preloadStart;
    const remaining = Math.max(0, MIN_PRELOAD_TIME - elapsed);

    setTimeout(() => {
      preloader.classList.add("is-hidden");
      document.documentElement.classList.remove("preload-lock");

      // after the preloader starts disappearing, turn on the card fade-in
      document.body.classList.add("preload-done");

      setTimeout(() => preloader.remove?.(), 600); // убрать из DOM после fade-out
    }, remaining);
  }

  // after the preloader starts disappearing, turn on the card fade-in
  (function () {
    const wrap = document.querySelector("#preloader .prelogo-wrap");
    const img = wrap?.querySelector(".prelogo-img");
    if (!wrap || !img) return;

    /**
     * EN: Marks preloader logo wrapper as ready to trigger breathing/fade animations.
     * RU: Помечает обёртку логотипа как готовую, чтобы запустить «дыхание»/fade-анимации.
     * @returns {void}
     */
    function markReady() {
      wrap.classList.add("is-ready");
    }

    if (img.complete) {
      requestAnimationFrame(markReady);
    } else {
      img.addEventListener("load", markReady, { once: true });
    }
  })();

  // ===== i18n dictionary =====
  const dict = {
    ru: {
      title: "Таймер",
      labelDuration: "Длительность (минуты)",
      btnStart: "Старт",
      btnPause: "Пауза",
      btnResume: "Продолжить",
      btnRestart: "Перезапуск",
      msgEnterValid: "Введите число от 1 до 99",
      msgReadyStart: "Готов к Старту!",
      msgStarted: "Таймер запущен!",
      msgPaused: "Таймер на паузе...",
      msgResumed: "Продолжение отсчёта...",
      msgRestartedFor: "Перезапуск на длительность {m} мин.",
      msgMinuteLeft_one: "Осталась 1 минута!",
      msgMinuteLeft_many: "Осталось {m} мин.",
      msgLast15s: "Внимание! Идут последние 15 секунд...",
      msgTimesUp: "Время истекло!",
      msgTimesUpReady: "Время вышло! Готов к Старту или Перезапуску!",
    },
    en: {
      title: "Timer",
      labelDuration: "Duration (minutes)",
      btnStart: "Start",
      btnPause: "Pause",
      btnResume: "Resume",
      btnRestart: "Restart",
      msgEnterValid: "Enter a number from 1 to 99",
      msgReadyStart: "Ready to Start!",
      msgStarted: "Timer started!",
      msgPaused: "Timer paused...",
      msgResumed: "Timer resumed...",
      msgRestartedFor: "Restarted for {m} min.",
      msgMinuteLeft_one: "1 minute left!",
      msgMinuteLeft_many: "{m} min. left",
      msgLast15s: "Attention! Last 15 seconds...",
      msgTimesUp: "Time’s up!",
      msgTimesUpReady: "Time’s up! Ready to Start or Restart!",
    },
  };

  // ===== DOM =====
  /**
   * EN: Shorthand for document.querySelector.
   * RU: Короткая запись для document.querySelector.
   * @param {string} sel
   * @returns {Element|null}
   */
  const $ = (sel) => document.querySelector(sel);
  const minutesInput = $("#minutes");
  const startPauseBtn = $("#startPause");
  const restartBtn = $("#restart");
  const progressCircle = $("#progressCircle");
  const timeText = $("#timeText");
  const messagesEl = $("#messages");
  const flashOverlay = $("#flashOverlay");
  const langToggle = $("#langToggle");

  // ===== Language state & helpers =====
  let lang =
    localStorage.getItem("timerLang") ||
    document.documentElement.getAttribute("lang") ||
    "ru";

  /**
   * EN: Translate by key for current language and replace template variables {k}.
   * RU: Возвращает перевод по ключу для текущего языка и подставляет переменные {k}.
   * @param {string} key
   * @param {Record<string,string|number>} [vars]
   * @returns {string}
   */
  function t(key, vars = {}) {
    let s = (dict[lang] && dict[lang][key]) || key;
    for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
    return s;
  }

  /**
   * EN: Applies localized labels to all [data-i18n] elements and the Start/Pause button state.
   * RU: Применяет локализованные подписи ко всем [data-i18n] и корректирует надпись кнопки Старт/Пауза.
   * @returns {void}
   */
  function setTexts() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (el === startPauseBtn) {
        if (endLock) {
          el.textContent = t("btnStart");
        } else if (!isRunning && startedAt !== 0) {
          el.textContent = t("btnResume");
        } else {
          el.textContent = isRunning ? t("btnPause") : t("btnStart");
        }
      } else {
        el.textContent = t(key);
      }
    });
    if (langToggle) langToggle.textContent = lang === "ru" ? "EN" : "RU";
  }

  /**
   * EN: Applies current language into DOM <html lang>, document title, messages and persists it.
   * RU: Применяет текущий язык в <html lang>, заголовок документа, сообщения и сохраняет выбор.
   * @returns {void}
   */
  function applyLang() {
    document.documentElement.setAttribute("lang", lang);
    document.title = dict[lang].title;
    setTexts();
    refreshStickyMessage();
    localStorage.setItem("timerLang", lang);
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      lang = lang === "ru" ? "en" : "ru";
      applyLang();
    });
  }

  // ===== Timer state =====
  const R = 45;
  const CIRC = 2 * Math.PI * R;
  progressCircle.style.strokeDasharray = String(CIRC);
  progressCircle.style.strokeDashoffset = String(CIRC);

  let totalSeconds = 0;
  let lastDurationMin = 0;
  let isRunning = false;
  let startedAt = 0;
  let pausedAccumMs = 0;
  let pauseStartedAt = 0;
  let tickTimer = null;

  // State flags
  let endLock = false; // blocking Start after completion
  let hasStartedOnce = false; // was there at least one launch (to activate Restart)

  /**
   * EN: Update Start/Pause button's disabled state based on endLock.
   * RU: Обновляет состояние блокировки кнопки Старт/Пауза в зависимости от endLock.
   * @returns {void}
   */
  function updateStartLock() {
    startPauseBtn.disabled = endLock;
    startPauseBtn.setAttribute("aria-disabled", String(endLock));
  }

  /**
   * EN: Enable/disable Restart button: available only after the first launch.
   * RU: Включает/выключает кнопку Перезапуска: доступна только после первого запуска.
   * @returns {void}
   */
  function updateRestartState() {
    restartBtn.disabled = !hasStartedOnce; // before the first start - off
    restartBtn.setAttribute("aria-disabled", String(!hasStartedOnce));
  }

  // Messages
  let hideMsgTimer = null;
  let stickyKey = null; // 'ready' | 'paused' | 'last15' | 'timesup' | 'invalid' | null
  let lastAnnouncedMin = null;
  let last15Shown = false;

  const RED_THRESHOLD_SEC = 15;
  /**
   * EN: Returns the orange zone threshold in seconds (last quarter of total duration).
   * RU: Возвращает порог оранжевой зоны в секундах (последняя четверть длительности).
   * @returns {number}
   */
  const orangeZone = () => Math.floor(totalSeconds * 0.25);

  // ===== Utils =====
  /**
   * EN: Clamp number into [min, max].
   * RU: Ограничивает число в диапазон [min, max].
   * @param {number} n
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  /**
   * EN: Format seconds into "MM:SS".
   * RU: Форматирует секунды в строку "MM:SS".
   * @param {number} s
   * @returns {string}
   */
  const fmt = (s) => {
    s = Math.max(0, s | 0);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  };

  /**
   * EN: Clears current sticky message if key matches or if no key provided (clear any).
   * RU: Очищает закреплённое сообщение по ключу или любое, если ключ не указан.
   * @param {string|null} [key]
   * @returns {void}
   */
  function clearMessageIf(key) {
    if (stickyKey && (!key || stickyKey === key)) {
      messagesEl.innerHTML = "";
      stickyKey = null;
    }
  }

  /**
   * EN: Shows message of a kind with optional timeout or sticky mode.
   * RU: Показывает сообщение заданного типа с опциональным таймаутом или как «закреплённое».
   * @param {"good"|"info"|"warn"|"err"} kind
   * @param {string} text
   * @param {{timeoutMs?:number, sticky?:boolean, key?:string|null}} [opts]
   * @returns {void}
   */
  function showMessage(kind, text, opts = {}) {
    const { timeoutMs = 5000, sticky = false, key = null } = opts;
    if (hideMsgTimer) {
      clearTimeout(hideMsgTimer);
      hideMsgTimer = null;
    }
    const div = document.createElement("div");
    div.className = `msg msg-${kind}`;
    div.textContent = text;
    messagesEl.innerHTML = "";
    messagesEl.appendChild(div);
    if (sticky) {
      stickyKey = key || "__sticky__";
    } else if (timeoutMs > 0) {
      hideMsgTimer = setTimeout(() => {
        if (!stickyKey) messagesEl.innerHTML = "";
      }, timeoutMs);
    }
  }

  /**
   * EN: Re-show current sticky message (after language change) and adjust ring/overlay styles for paused state.
   * RU: Переотображает текущее закреплённое сообщение (после смены языка) и корректирует стили кольца/оверлея для паузы.
   * @returns {void}
   */
  function refreshStickyMessage() {
    if (!stickyKey) return;
    if (stickyKey === "ready") {
      showMessage("info", t("msgReadyStart"), { sticky: true, key: "ready" });
    } else if (stickyKey === "paused") {
      showMessage("info", t("msgPaused"), { sticky: true, key: "paused" });
      progressCircle.style.stroke = "#f59e0b";
      progressCircle.classList.add("blink-opacity");
      flashOverlay.classList.remove("blink-overlay");
      flashOverlay.style.background = "transparent";
    } else if (stickyKey === "last15") {
      showMessage("warn", t("msgLast15s"), { sticky: true, key: "last15" });
    } else if (stickyKey === "timesup") {
      showMessage("err", t("msgTimesUpReady"), {
        sticky: true,
        key: "timesup",
      });
    } else if (stickyKey === "invalid") {
      showMessage("err", t("msgEnterValid"), { sticky: true, key: "invalid" });
    }
  }

  /**
   * EN: Computes remaining seconds based on start time, pauses and current wall clock.
   * RU: Вычисляет оставшиеся секунды по времени старта, паузам и текущему времени.
   * @returns {number}
   */
  function computeRemainingSec() {
    const now = Date.now();
    const elapsedMs =
      (!isRunning ? pauseStartedAt || now : now) - startedAt - pausedAccumMs;
    return Math.max(0, totalSeconds - Math.floor(elapsedMs / 1000));
  }

  /**
   * EN: Adjusts ring/overlay styles depending on remaining time (green/orange/red zones).
   * RU: Настраивает стили кольца/оверлея в зависимости от остатка времени (зелёная/оранжевая/красная зоны).
   * @param {number} remaining
   * @returns {void}
   */
  function setStrokeByRemaining(remaining) {
    const inRed = remaining <= RED_THRESHOLD_SEC;
    const inOrange = remaining <= orangeZone() && !inRed;
    if (inRed) {
      progressCircle.style.stroke = "#d92d20";
      progressCircle.classList.add("blink-opacity");
      flashOverlay.classList.add("blink-overlay");
      flashOverlay.style.background =
        "radial-gradient(rgba(217,45,32,0.25), transparent 70%)";
    } else if (inOrange) {
      progressCircle.style.stroke = "#f59e0b";
      progressCircle.classList.remove("blink-opacity");
      flashOverlay.classList.remove("blink-overlay");
      flashOverlay.style.background = "transparent";
    } else {
      progressCircle.style.stroke = "#18a957";
      progressCircle.classList.remove("blink-opacity");
      flashOverlay.classList.remove("blink-overlay");
      flashOverlay.style.background = "transparent";
    }
  }

  /**
   * EN: Render visual progress and the time label; handles paused styling when applicable.
   * RU: Рендерит визуальный прогресс и подпись времени; при необходимости показывает стиль паузы.
   * @param {number} remaining
   * @returns {void}
   */
  function render(remaining) {
    const offset = CIRC * (remaining / totalSeconds);
    progressCircle.style.strokeDashoffset = isFinite(offset)
      ? String(offset)
      : String(CIRC);
    timeText.textContent = fmt(remaining);

    if (!isRunning && startedAt !== 0 && !endLock) {
      progressCircle.style.stroke = "#f59e0b";
      progressCircle.classList.add("blink-opacity");
      flashOverlay.classList.remove("blink-overlay");
      flashOverlay.style.background = "transparent";
      return;
    }
    setStrokeByRemaining(remaining);
  }

  /**
   * EN: Starts the timer for a given number of minutes. Resets state, schedules ticks and shows a start message.
   * RU: Запускает таймер на указанное число минут. Сбрасывает состояние, запускает тики и показывает сообщение о старте.
   * @param {number} min - EN: minutes (1–99); RU: минуты (1–99)
   * @returns {void}
   * @throws {Error} EN: if minutes are invalid (handled by caller); RU: при некорректном вводе (обрабатывается вызывающим кодом)
   */
  function startFromMinutes(min) {
    if (!hasStartedOnce) {
      hasStartedOnce = true;
      updateRestartState();
    }

    endLock = false;
    updateStartLock();

    lastDurationMin = min;
    totalSeconds = min * 60;
    startedAt = Date.now();
    pausedAccumMs = 0;
    pauseStartedAt = 0;
    isRunning = true;
    lastAnnouncedMin = null;
    last15Shown = false;

    clearMessageIf();
    setTexts();
    tick();
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = setInterval(tick, 250);
    showMessage("good", t("msgStarted"), { timeoutMs: 5000 });
  }

  /**
   * EN: Main loop: computes remaining time, fires minute/15s alerts, renders and handles completion.
   * RU: Главный цикл: считает остаток, показывает минутные/15-сек предупреждения, рендерит и завершает при нуле.
   * @returns {void}
   */
  function tick() {
    const remaining = computeRemainingSec();

    if (
      remaining > 0 &&
      remaining % 60 === 0 &&
      remaining !== lastAnnouncedMin * 60
    ) {
      const m = remaining / 60;
      lastAnnouncedMin = m;
      if (m === 1)
        showMessage("warn", t("msgMinuteLeft_one"), { timeoutMs: 5000 });
      else
        showMessage("warn", t("msgMinuteLeft_many", { m }), {
          timeoutMs: 5000,
        });
    }

    if (!last15Shown && remaining === 15) {
      last15Shown = true;
      showMessage("warn", t("msgLast15s"), { sticky: true, key: "last15" });
    }

    render(remaining);

    if (remaining <= 0) {
      clearInterval(tickTimer);
      tickTimer = null;
      isRunning = false;
      setTexts();

      showMessage("err", t("msgTimesUpReady"), {
        sticky: true,
        key: "timesup",
      });

      progressCircle.style.stroke = "#d92d20";
      progressCircle.classList.remove("blink-opacity");
      flashOverlay.classList.remove("blink-overlay");

      endLock = true;
      updateStartLock();
      setTexts();
    }
  }

  // === Controls ===
  startPauseBtn.addEventListener("click", () => {
    if (endLock) return;

    if (!isRunning && startedAt === 0) {
      const val = Number(minutesInput.value);
      if (!Number.isFinite(val) || val < 1 || val > 99) {
        showMessage("err", t("msgEnterValid"), {
          sticky: true,
          key: "invalid",
        });
        minutesInput.focus();
        return;
      }
      startFromMinutes(val | 0);
      return;
    }

    if (isRunning) {
      isRunning = false;
      pauseStartedAt = Date.now();
      setTexts();
      showMessage("info", t("msgPaused"), { sticky: true, key: "paused" });
      progressCircle.style.stroke = "#f59e0b";
      progressCircle.classList.add("blink-opacity");
      flashOverlay.classList.remove("blink-overlay");
      flashOverlay.style.background = "transparent";
    } else {
      if (pauseStartedAt) {
        pausedAccumMs += Date.now() - pauseStartedAt;
        pauseStartedAt = 0;
      }
      isRunning = true;
      clearMessageIf("paused");
      clearMessageIf("invalid");
      setTexts();
      showMessage("info", t("msgResumed"), { timeoutMs: 5000 });
    }
  });

  restartBtn.addEventListener("click", () => {
    if (!hasStartedOnce) return;

    const val = Number(minutesInput.value);
    const useMin =
      Number.isFinite(val) && val >= 1 && val <= 99
        ? val | 0
        : lastDurationMin > 0
        ? lastDurationMin
        : 1;

    endLock = false;
    updateStartLock();

    minutesInput.value = useMin;
    startFromMinutes(useMin);
    showMessage("good", t("msgRestartedFor", { m: useMin }), {
      timeoutMs: 5000,
    });
  });

  // Input UX
  minutesInput.addEventListener(
    "wheel",
    (e) => {
      if (document.activeElement === minutesInput) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { passive: false }
  );

  minutesInput.addEventListener("keydown", (e) => {
    const ctrl = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End",
    ];
    if (ctrl.includes(e.key)) return;
    if (e.key === "Enter") {
      startPauseBtn.click();
      return;
    }
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  });

  minutesInput.addEventListener("input", () => {
    const cleaned = (minutesInput.value || "").replace(/\D+/g, "").slice(0, 2);
    minutesInput.value = cleaned;
    if (cleaned !== "") {
      const n = clamp(parseInt(cleaned, 10) || 0, 1, 99);
      if (String(n) !== cleaned) minutesInput.value = String(n);

      if (endLock && n !== lastDurationMin) {
        endLock = false;
        isRunning = false;
        startedAt = 0;
        pausedAccumMs = 0;
        pauseStartedAt = 0;
        lastAnnouncedMin = null;
        last15Shown = false;

        progressCircle.style.strokeDashoffset = String(CIRC);
        progressCircle.style.stroke = "#18a957";
        progressCircle.classList.remove("blink-opacity");
        flashOverlay.classList.remove("blink-overlay");
        flashOverlay.style.background = "transparent";

        updateStartLock();
        setTexts();
      }
    }
  });

  // Init
  timeText.textContent = fmt(0);
  applyLang();
  hasStartedOnce = false;
  updateRestartState();
  showMessage("info", t("msgReadyStart"), { sticky: true, key: "ready" });
  updateStartLock();
  minutesInput.focus();
  window.addEventListener("load", hidePreloader);
  hidePreloader();
})();
