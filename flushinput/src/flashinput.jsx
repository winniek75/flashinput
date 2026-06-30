import { useState, useEffect, useCallback, useRef } from "react";
import { VOCAB_DB as BASE_VOCAB } from "./vocabData.js";
import { EXTRA_VOCAB } from "./vocabDataExtra.js";

// Merge all extra units into base vocab
const VOCAB_DB = Object.fromEntries(
  Object.entries(BASE_VOCAB).map(([gradeKey, gradeData]) => {
    const extras = Object.keys(EXTRA_VOCAB)
      .filter(k => k === gradeKey || k.startsWith(gradeKey + "_"))
      .reduce((acc, k) => ({ ...acc, ...EXTRA_VOCAB[k] }), {});
    return [gradeKey, {
      ...gradeData,
      units: { ...gradeData.units, ...extras },
    }];
  })
);

// ─────────────────────────────────────────────────────────────
// SOUND EFFECTS — Web Audio API
// ─────────────────────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playCorrectSound() {
  try {
    const ctx = getAudioCtx();
    const freqs = [523.25, 659.25, 783.99]; // C-E-G chime
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.08 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.3);
    });
  } catch (e) { /* audio not available */ }
}

function playWrongSound() {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) { /* audio not available */ }
}

// ─────────────────────────────────────────────────────────────
// LOCALSTORAGE PERSISTENCE
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "flashinput_progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedUnits: {}, wrongAnswers: {}, stats: { totalSessions: 0, totalWords: 0 } };
    return JSON.parse(raw);
  } catch { return { completedUnits: {}, wrongAnswers: {}, stats: { totalSessions: 0, totalWords: 0 } }; }
}

function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* storage full */ }
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// PHASE CONFIG
// ─────────────────────────────────────────────────────────────
const PHASES = [
  { id: "photo",    duration: 2800, label: "IMAGE" },
  { id: "word",     duration: 3200, label: "WORD" },
  { id: "meaning",  duration: 2800, label: "MEANING" },
  { id: "sentence", duration: 3500, label: "CONTEXT" },
  { id: "recall",   duration: 4500, label: "RECALL" },
];

// ─────────────────────────────────────────────────────────────
// GRADE METADATA
// ─────────────────────────────────────────────────────────────
const GRADES = [
  { key: "grade5", ...VOCAB_DB.grade5 },
  { key: "grade4", ...VOCAB_DB.grade4 },
  { key: "grade3", ...VOCAB_DB.grade3 },
  { key: "pre2",   ...VOCAB_DB.pre2   },
  { key: "grade2", ...VOCAB_DB.grade2 },
];

// ─────────────────────────────────────────────────────────────
// HELPERS — Web Speech API（正しく実装）
// ─────────────────────────────────────────────────────────────

// アプリ起動時に1回だけ最良の英語音声を選んでキャッシュする
// voices はブラウザが非同期で読み込むため、モジュールレベルで管理する
let cachedVoice = null;  // 選択済みの音声
let voiceReady  = false; // 音声が選択できたかどうか

// 優先順位でベストな英語音声を選択する
// Chrome: "Google US English" が圧倒的に自然
// Mac Safari: "Samantha"（アメリカ英語）
// Windows: "Microsoft Zira" / "Microsoft David"
const VOICE_PRIORITY = [
  "Google US English",        // Chrome — 最高品質
  "Google UK English Female", // Chrome — 次点
  "Samantha",                 // Mac Safari — 自然
  "Karen",                    // Mac — オーストラリア英語
  "Alex",                     // Mac — 男性
  "Microsoft Zira Desktop",   // Windows
  "Microsoft David Desktop",  // Windows
  "Microsoft Mark Desktop",   // Windows
];

function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // 1. 名前で完全一致（優先リスト順）
  for (const name of VOICE_PRIORITY) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  // 2. en-US のオンライン音声（Google等のクラウド音声）
  const onlineUS = voices.find((v) => v.lang === "en-US" && !v.localService);
  if (onlineUS) return onlineUS;
  // 3. en-US なら何でも
  const anyUS = voices.find((v) => v.lang === "en-US");
  if (anyUS) return anyUS;
  // 4. 英語なら何でも
  return voices.find((v) => v.lang.startsWith("en")) || null;
}

// アプリ起動時に呼ぶ — 音声が準備できたらキャッシュする
function initVoice() {
  if (!("speechSynthesis" in window)) return;

  const tryPick = () => {
    const v = pickBestVoice();
    if (v) { cachedVoice = v; voiceReady = true; }
  };

  // Chrome: voiceschanged イベントで通知される
  window.speechSynthesis.onvoiceschanged = tryPick;
  // Safari / Firefox: すでにリストがある場合もある
  tryPick();
}

// メインの speak 関数
function speak(text, rate = 0.88) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang  = "en-US";
  u.rate  = rate;
  u.pitch = 1.0;

  // キャッシュ済み音声を使う（なければブラウザデフォルト）
  if (cachedVoice) u.voice = cachedVoice;

  window.speechSynthesis.speak(u);
}

function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function SmartImage({ word, style, ...props }) {
  const [src, setSrc] = useState(word.localImg);
  return (
    <img
      src={src}
      onError={() => { if (src !== word.fallbackImg) setSrc(word.fallbackImg); }}
      style={{ ...style }}
      alt={word.word}
      {...props}
    />
  );
}

function SmartBg({ word, style }) {
  const [src, setSrc] = useState(word.localImg);
  useEffect(() => {
    const img = new Image();
    img.src = word.localImg;
    img.onerror = () => setSrc(word.fallbackImg);
    setSrc(word.localImg);
  }, [word]);
  return (
    <div style={{
      ...style,
      backgroundImage: `url(${src})`,
    }} />
  );
}

function usePreloadImages(words) {
  useEffect(() => {
    words.forEach((w) => {
      const img = new Image();
      img.src = w.localImg;
      img.onerror = () => { const fb = new Image(); fb.src = w.fallbackImg; };
    });
  }, [words]);
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function FlashcardApp() {
  // Navigation state
  const [screen, setScreen] = useState("levelSelect"); // levelSelect | unitSelect | start | play | speedQuiz | done
  const [gameMode, setGameMode] = useState("flash"); // "flash" | "speedQuiz"
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [currentWords, setCurrentWords] = useState([]);

  // Play state
  const [wordIdx, setWordIdx]       = useState(0);
  const [phaseIdx, setPhaseIdx]     = useState(0);
  const [paused, setPaused]         = useState(false);
  const [reveal, setReveal]         = useState(false);
  const [progress, setProgress]     = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [round, setRound]           = useState(1);
  const [speed, setSpeed]           = useState(1);
  const [imgSrcs, setImgSrcs]       = useState({});

  // Recall input state
  const [recallInput, setRecallInput]     = useState("");
  const [recallResult, setRecallResult]   = useState(null); // null | "correct" | "wrong"
  const [recallSubmitted, setRecallSubmitted] = useState(false);
  const inputRef = useRef(null);

  // Session tracking
  const [sessionWrong, setSessionWrong]   = useState([]); // words answered wrong in this session
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal]     = useState(0);

  // Streak & adaptive timing
  const [streak, setStreak]                       = useState(0);
  const [consecutiveWrong, setConsecutiveWrong]   = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [timingAdjust, setTimingAdjust]           = useState(0); // ms adjustment for "word" phase

  // localStorage persistence
  const [savedProgress, setSavedProgress] = useState(() => loadProgress());

  const timerRef     = useRef(null);
  const progressRef  = useRef(null);
  const startTimeRef = useRef(null);

  const word  = currentWords[wordIdx] || null;
  const phase = PHASES[phaseIdx];

  // WiseXP SDK init
  useEffect(() => {
    if (window.WiseXP) window.WiseXP.init('flashinput');
  }, []);

  // Web Speech API — アプリ起動時に最良の英語音声をキャッシュ
  useEffect(() => {
    initVoice();
    return () => stopSpeech();
  }, []);

  usePreloadImages(currentWords);

  // Precompute image src per word (with fallback)
  useEffect(() => {
    const srcs = {};
    currentWords.forEach((w) => { srcs[w.word] = w.localImg; });
    setImgSrcs(srcs);
  }, [currentWords]);

  const handleImgError = (wordKey, fallback) => {
    setImgSrcs((prev) => ({ ...prev, [wordKey]: fallback }));
  };

  // ── RECALL SUBMISSION ──────────────────────────────────────
  const handleRecallSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (!word || recallSubmitted) return;

    const answer = recallInput.trim().toLowerCase();
    const correct = answer === word.word.toLowerCase();
    setRecallResult(correct ? "correct" : "wrong");
    setRecallSubmitted(true);
    setSessionTotal((t) => t + 1);

    if (correct) {
      playCorrectSound();
      setSessionCorrect((c) => c + 1);
      setStreak((s) => s + 1);
      setConsecutiveWrong(0);
      setConsecutiveCorrect((c) => {
        const next = c + 1;
        if (next >= 5) {
          setTimingAdjust((prev) => Math.max(prev - 300, -2200)); // min 1s (3200 - 2200)
        }
        return next;
      });
      speak(word.word, 0.82);
    } else {
      playWrongSound();
      setStreak(0);
      setConsecutiveCorrect(0);
      setConsecutiveWrong((c) => {
        const next = c + 1;
        if (next >= 3) {
          setTimingAdjust((prev) => prev + 500);
        }
        return next;
      });
      if (window.WiseXP) window.WiseXP.reportWrong({ question: word.japanese, correct: word.word, playerAnswer: answer });
      setSessionWrong((prev) => {
        if (prev.find((w) => w.word === word.word)) return prev;
        return [...prev, word];
      });
      // Save wrong answer to localStorage
      setSavedProgress((prev) => {
        const key = `${selectedGrade?.key}_${selectedUnit}`;
        const wrongAnswers = { ...prev.wrongAnswers };
        if (!wrongAnswers[key]) wrongAnswers[key] = [];
        if (!wrongAnswers[key].includes(word.word)) {
          wrongAnswers[key] = [...wrongAnswers[key], word.word];
        }
        const updated = { ...prev, wrongAnswers };
        saveProgress(updated);
        return updated;
      });
      // Show correct answer after wrong
      setTimeout(() => {
        setReveal(true);
        speak(word.word, 0.82);
      }, 600);
    }
  }, [word, recallInput, recallSubmitted, selectedGrade, selectedUnit]);

  // ── ADVANCE (phase/word/round) ──────────────────────────────
  const advance = useCallback(() => {
    setTransitioning(true);
    setTimeout(() => {
      setReveal(false);
      setRecallInput("");
      setRecallResult(null);
      setRecallSubmitted(false);
      setTransitioning(false);
      if (phaseIdx < PHASES.length - 1) {
        setPhaseIdx((p) => p + 1);
      } else if (wordIdx < currentWords.length - 1) {
        setWordIdx((w) => w + 1);
        setPhaseIdx(0);
      } else {
        if (round < 2) {
          setRound(2);
          setCurrentWords((prev) => shuffleArray(prev));
          setWordIdx(0);
          setPhaseIdx(0);
        } else {
          // Save completion to localStorage
          if (selectedGrade && selectedUnit) {
            setSavedProgress((prev) => {
              const key = `${selectedGrade.key}_${selectedUnit}`;
              const completedUnits = { ...prev.completedUnits, [key]: Date.now() };
              const stats = {
                ...prev.stats,
                totalSessions: (prev.stats.totalSessions || 0) + 1,
                totalWords: (prev.stats.totalWords || 0) + currentWords.length,
              };
              const updated = { ...prev, completedUnits, stats };
              saveProgress(updated);
              return updated;
            });
          }
          setScreen("done");
          if (window.WiseXP) {
            window.WiseXP.reportGame({ score: sessionCorrect, correct: sessionCorrect, total: sessionTotal, maxCombo: 0, grade: selectedGrade?.shortLabel || '' });
          }
        }
      }
    }, 250);
  }, [phaseIdx, wordIdx, round, currentWords, selectedGrade, selectedUnit]);

  // ── PLAY TIMER EFFECT ──────────────────────────────────────
  useEffect(() => {
    if (screen !== "play" || paused || !word) return;

    const baseDur = phase.id === "word" ? Math.max(1000, phase.duration + timingAdjust) : phase.duration;
    const dur = baseDur / speed;
    startTimeRef.current = Date.now();

    if (phase.id === "word")     setTimeout(() => speak(word.word, 0.8), 300);
    if (phase.id === "sentence") setTimeout(() => speak(word.sentence, 0.92), 300);

    // Recall phase: wait for user input, auto-advance after result shown
    if (phase.id === "recall") {
      // Focus input after a short delay
      setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      // TTS: speak the japanese hint
      // If already submitted and result shown, auto-advance after delay
      if (recallSubmitted) {
        timerRef.current = setTimeout(advance, recallResult === "correct" ? 1500 : 2500);
        return () => { clearTimeout(timerRef.current); };
      }
      // No auto-timer for recall - wait for user input
      return;
    }

    setProgress(0);
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(elapsed / dur, 1));
    }, 30);
    timerRef.current = setTimeout(advance, dur);

    return () => { clearTimeout(timerRef.current); clearInterval(progressRef.current); };
  }, [screen, wordIdx, phaseIdx, paused, speed, round, recallSubmitted, recallResult, timingAdjust]);

  const togglePause = () => {
    if (paused) {
      setPaused(false);
    } else {
      clearTimeout(timerRef.current);
      clearInterval(progressRef.current);
      stopSpeech();
      setPaused(true);
    }
  };

  const handleStart = () => {
    setCurrentWords((prev) => shuffleArray(prev));
    setWordIdx(0); setPhaseIdx(0); setRound(1);
    setReveal(false); setPaused(false);
    setRecallInput(""); setRecallResult(null); setRecallSubmitted(false);
    setSessionWrong([]); setSessionCorrect(0); setSessionTotal(0);
    setStreak(0); setConsecutiveWrong(0); setConsecutiveCorrect(0); setTimingAdjust(0);
    setScreen("play");
  };

  const handleStartSpeedQuiz = () => {
    setCurrentWords((prev) => shuffleArray(prev));
    setWordIdx(0); setRound(1);
    setReveal(false); setPaused(false);
    setRecallInput(""); setRecallResult(null); setRecallSubmitted(false);
    setSessionWrong([]); setSessionCorrect(0); setSessionTotal(0);
    setStreak(0);
    setGameMode("speedQuiz");
    setScreen("speedQuiz");
  };

  const handleExitToMenu = () => {
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    stopSpeech();
    setPaused(false);
    setScreen("unitSelect");
  };

  const selectGradeUnit = (grade, unitKey) => {
    setSelectedGrade(grade);
    setSelectedUnit(unitKey);
    setCurrentWords(shuffleArray(grade.units[unitKey]));
    setScreen("start");
  };

  // ── FONT LINK ────────────────────────────────────────────
  const fontLink = (
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
  );

  const base = {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    color: "#fff",
  };

  // ══════════════════════════════════════════════════════════
  // SCREEN: LEVEL SELECT
  // ══════════════════════════════════════════════════════════
  if (screen === "levelSelect") {
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        {fontLink}
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            VOCABULARY INPUT SYSTEM
          </div>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: 0, letterSpacing: -1 }}>
            Flash<span style={{ color: "#00d4aa" }}>Input</span>
          </h1>
          <p style={{ color: "#555", fontSize: 14, marginTop: 8 }}>レベルを選択してください</p>
        </div>

        {/* Grade Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 480 }}>
          {GRADES.map((grade) => {
            const unitKeys = Object.keys(grade.units);
            const totalWords = unitKeys.reduce((sum, k) => sum + grade.units[k].length, 0);
            // First word image for preview
            const previewWord = grade.units[unitKeys[0]][0];
            return (
              <button
                key={grade.key}
                onClick={() => { setSelectedGrade(grade); setScreen("unitSelect"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "16px 20px",
                  background: "#111",
                  border: `1px solid #222`,
                  borderRadius: 16,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = grade.color; e.currentTarget.style.background = "#161616"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "#111"; }}
              >
                {/* Left accent bar */}
                <div style={{ width: 4, height: 56, borderRadius: 2, background: grade.color, flexShrink: 0 }} />
                {/* Preview thumbnail */}
                <div style={{
                  width: 52, height: 52, borderRadius: 10, overflow: "hidden",
                  flexShrink: 0, background: "#222",
                }}>
                  <img
                    src={previewWord.localImg}
                    onError={(e) => { e.target.src = previewWord.fallbackImg; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                    alt=""
                  />
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{grade.shortLabel}</span>
                    <span style={{ fontSize: 12, color: grade.color, fontFamily: "'Space Mono', monospace" }}>{grade.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{grade.description}</div>
                  <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
                    {unitKeys.length} UNITS · {totalWords} WORDS
                  </div>
                </div>
                <div style={{ color: "#444", fontSize: 18 }}>›</div>
              </button>
            );
          })}
        </div>

        <p style={{ marginTop: 40, fontSize: 12, color: "#333", fontFamily: "'Space Mono', monospace", textAlign: "center" }}>
          5-PHASE MEMORY ENCODING · 2-ROUND SYSTEM
        </p>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: UNIT SELECT
  // ══════════════════════════════════════════════════════════
  if (screen === "unitSelect" && selectedGrade) {
    const unitKeys = Object.keys(selectedGrade.units);
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        {fontLink}
        {/* Back + Title */}
        <div style={{ width: "100%", maxWidth: 480, marginBottom: 32 }}>
          <button
            onClick={() => setScreen("levelSelect")}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, fontFamily: "'Space Mono', monospace", letterSpacing: 2, padding: 0, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}
          >
            ‹ BACK
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 40, background: selectedGrade.color, borderRadius: 2 }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{selectedGrade.label}</h2>
              <p style={{ margin: 0, color: "#555", fontSize: 13 }}>ユニットを選択してください</p>
            </div>
          </div>
        </div>

        {/* Unit Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 480 }}>
          {unitKeys.map((unitKey, i) => {
            const words = selectedGrade.units[unitKey];
            const unitStorageKey = `${selectedGrade.key}_${unitKey}`;
            const isCompleted = !!savedProgress.completedUnits[unitStorageKey];
            const wrongWords = savedProgress.wrongAnswers[unitStorageKey] || [];
            return (
              <button
                key={unitKey}
                onClick={() => selectGradeUnit(selectedGrade, unitKey)}
                style={{
                  background: "#111",
                  border: isCompleted ? `1px solid ${selectedGrade.color}44` : "1px solid #222",
                  borderRadius: 14,
                  padding: "14px 18px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = selectedGrade.color; e.currentTarget.style.background = "#161616"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isCompleted ? `${selectedGrade.color}44` : "#222"; e.currentTarget.style.background = "#111"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Unit number badge */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: isCompleted ? `${selectedGrade.color}30` : `${selectedGrade.color}18`,
                    border: `1px solid ${selectedGrade.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isCompleted ? 18 : 14, fontWeight: 800, color: selectedGrade.color,
                    fontFamily: "'Space Mono', monospace", flexShrink: 0,
                  }}>
                    {isCompleted ? "✓" : String(i + 1).padStart(2, "0")}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                      Unit {String(i + 1).padStart(2, "0")}
                      {isCompleted && <span style={{ fontSize: 10, color: selectedGrade.color, marginLeft: 8 }}>COMPLETED</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                      {words.length} WORDS · {(words.length * PHASES.length * 2 * 3.36 / 60).toFixed(1)} MIN
                      {wrongWords.length > 0 && <span style={{ color: "#f87171" }}> · {wrongWords.length} TO REVIEW</span>}
                    </div>
                  </div>
                  {/* Word thumbnails */}
                  <div style={{ display: "flex", gap: 4 }}>
                    {words.slice(0, 4).map((w, j) => (
                      <div key={j} style={{ width: 28, height: 28, borderRadius: 6, overflow: "hidden", background: "#222" }}>
                        <img
                          src={w.localImg}
                          onError={(e) => { e.target.src = w.fallbackImg; }}
                          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                          alt=""
                        />
                      </div>
                    ))}
                    {words.length > 4 && (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#555" }}>
                        +{words.length - 4}
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#444", fontSize: 16 }}>›</div>
                </div>
                {/* Word list preview */}
                <div style={{ marginTop: 10, marginLeft: 52, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {words.map((w) => (
                    <span key={w.word} style={{
                      fontSize: 11, color: "#555",
                      fontFamily: "'Space Mono', monospace",
                      background: "#1a1a1a",
                      padding: "2px 7px", borderRadius: 4,
                    }}>
                      {w.word}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: START
  // ══════════════════════════════════════════════════════════
  if (screen === "start") {
    const firstWord = currentWords[0];
    return (
      <div style={{
        ...base,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, overflow: "hidden", position: "relative",
      }}>
        {fontLink}
        {/* Blurred background */}
        {firstWord && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${imgSrcs[firstWord.word] || firstWord.localImg})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.12, filter: "blur(20px)",
          }} />
        )}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520 }}>
          {/* Back button */}
          <button
            onClick={() => setScreen("unitSelect")}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 2, marginBottom: 24, display: "block", marginLeft: "auto", marginRight: "auto" }}
          >
            ‹ BACK
          </button>

          <div style={{ fontSize: 10, letterSpacing: 6, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            {selectedGrade?.label} · {selectedUnit}
          </div>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: "0 0 8px 0", letterSpacing: -1 }}>
            Flash<span style={{ color: "#00d4aa" }}>Input</span>
          </h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 36px 0", lineHeight: 1.7 }}>
            {currentWords.length} words · 5-phase memory encoding<br />
            Round 1: Full input · Round 2: Speed review
          </p>

          {/* Thumbnail grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
            {currentWords.map((w, i) => (
              <div key={i} style={{
                width: 56, height: 56, borderRadius: 10,
                overflow: "hidden", border: "2px solid #222", background: "#1a1a1a",
              }}>
                <img
                  src={w.localImg}
                  onError={(e) => { e.target.src = w.fallbackImg; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
                  alt={w.word}
                />
              </div>
            ))}
          </div>

          {/* Speed selector */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace" }}>SPEED</span>
            {[{ label: "×0.8", val: 0.8 }, { label: "×1.0", val: 1 }, { label: "×1.5", val: 1.5 }].map((s) => (
              <button key={s.val} onClick={() => setSpeed(s.val)} style={{
                padding: "6px 14px", borderRadius: 8,
                border: speed === s.val ? "1px solid #00d4aa" : "1px solid #333",
                background: speed === s.val ? "#00d4aa15" : "transparent",
                color: speed === s.val ? "#00d4aa" : "#555",
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Space Mono', monospace",
              }}>
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={handleStart} style={{
              padding: "16px 40px", fontSize: 16, fontWeight: 800,
              border: "none", borderRadius: 14,
              background: "linear-gradient(135deg, #00d4aa, #00b894)",
              color: "#0a0a0a", cursor: "pointer", letterSpacing: 2,
            }}>
              ⚡ FlashInput
            </button>
            <button onClick={handleStartSpeedQuiz} style={{
              padding: "16px 40px", fontSize: 16, fontWeight: 800,
              border: "2px solid #f59e0b",borderRadius: 14,
              background: "transparent",
              color: "#f59e0b", cursor: "pointer", letterSpacing: 2,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.background = "#f59e0b"; e.target.style.color = "#0a0a0a"; }}
            onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#f59e0b"; }}
            >
              📸 Speed Quiz
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 12, lineHeight: 1.6, textAlign: "center" }}>
            FlashInput: 5-phase memory encoding (2 rounds)<br/>
            Speed Quiz: Photo → Type the word (fast practice)
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: SPEED QUIZ
  // ══════════════════════════════════════════════════════════
  if (screen === "speedQuiz") {
    const sqWord = currentWords[wordIdx] || null;
    if (!sqWord) return null;
    const sqImgSrc = imgSrcs[sqWord.word] || sqWord.localImg;
    const sqProgress = currentWords.length > 0 ? (wordIdx / currentWords.length) : 0;

    const handleSpeedQuizSubmit = (e) => {
      if (e) e.preventDefault();
      if (recallSubmitted || !recallInput.trim()) return;
      const answer = recallInput.trim().toLowerCase();
      const correct = answer === sqWord.word.toLowerCase();
      setRecallResult(correct ? "correct" : "wrong");
      setRecallSubmitted(true);
      setSessionTotal((t) => t + 1);
      if (correct) {
        playCorrectSound();
        setSessionCorrect((c) => c + 1);
        setStreak((s) => s + 1);
        speak(sqWord.word, 0.82);
      } else {
        playWrongSound();
        setStreak(0);
        if (window.WiseXP) window.WiseXP.reportWrong({ question: sqWord.japanese, correct: sqWord.word, playerAnswer: answer });
        setSessionWrong((prev) => prev.find((w) => w.word === sqWord.word) ? prev : [...prev, sqWord]);
        setTimeout(() => { setReveal(true); speak(sqWord.word, 0.82); }, 500);
      }
      // Auto advance
      setTimeout(() => {
        setRecallInput(""); setRecallResult(null); setRecallSubmitted(false); setReveal(false);
        if (wordIdx < currentWords.length - 1) {
          setWordIdx((w) => w + 1);
        } else {
          setScreen("done");
          if (window.WiseXP) {
            window.WiseXP.reportGame({ score: sessionCorrect + (correct ? 1 : 0), correct: sessionCorrect + (correct ? 1 : 0), total: sessionTotal + 1, maxCombo: 0, grade: selectedGrade?.shortLabel || '' });
          }
        }
      }, correct ? 1200 : 2200);
    };

    return (
      <div style={{
        minHeight: "100vh", background: "#0a0a0a",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        display: "flex", flexDirection: "column",
        overflow: "hidden", position: "relative",
        userSelect: "none",
      }}>
        {fontLink}

        {/* Top bar */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleExitToMenu(); }}
            style={{
              background: "none", border: "none", color: "#444", cursor: "pointer",
              fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2,
              padding: "4px 8px",
            }}
          >
            ✕ QUIT
          </button>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#f59e0b", letterSpacing: 3 }}>
            SPEED QUIZ
          </span>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 2 }}>
            {wordIdx + 1}/{currentWords.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "0 20px 8px", position: "relative", zIndex: 10 }}>
          <div style={{ width: "100%", height: 3, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${sqProgress * 100}%`, background: "#f59e0b", borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Streak */}
        {streak >= 3 && (
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "4px 20px" }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: streak >= 10 ? "#f59e0b" : "#ff6b6b",
              fontFamily: "'Space Mono', monospace", letterSpacing: 2,
              padding: "3px 12px", borderRadius: 6,
              background: streak >= 10 ? "#f59e0b18" : "#ff6b6b15",
            }}>
              🔥 {streak} streak!
            </span>
          </div>
        )}

        {/* Main content */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px 40px", position: "relative", zIndex: 5,
        }}>
          {!recallSubmitted ? (
            <>
              {/* Photo */}
              <div style={{
                width: "min(85vw, 400px)", aspectRatio: "16/10",
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                marginBottom: 20, background: "#1a1a1a",
              }}>
                <img src={sqImgSrc} onError={() => handleImgError(sqWord.word, sqWord.fallbackImg)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
              {/* Japanese hint */}
              <div style={{ fontSize: 20, color: "#666", fontWeight: 600, marginBottom: 16 }}>{sqWord.japanese}</div>
              {/* Input */}
              <form onSubmit={handleSpeedQuizSubmit} onClick={(e) => e.stopPropagation()}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <input
                  ref={inputRef}
                  type="text" value={recallInput}
                  onChange={(e) => setRecallInput(e.target.value)}
                  placeholder="Type the English word..."
                  autoComplete="off" autoCapitalize="off" spellCheck="false"
                  autoFocus
                  style={{
                    width: "min(80vw, 320px)", padding: "12px 18px",
                    fontSize: 20, fontWeight: 700, textAlign: "center",
                    background: "#1a1a1a", border: "2px solid #333",
                    borderRadius: 12, color: "#fff", outline: "none",
                    letterSpacing: 1,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#f59e0b"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#333"; }}
                />
                <button type="submit" disabled={!recallInput.trim()} style={{
                  padding: "10px 36px", fontSize: 14, fontWeight: 700,
                  border: "none", borderRadius: 10,
                  background: recallInput.trim() ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#222",
                  color: recallInput.trim() ? "#0a0a0a" : "#555",
                  cursor: recallInput.trim() ? "pointer" : "default",
                  letterSpacing: 2,
                }}>
                  CHECK
                </button>
              </form>
            </>
          ) : recallResult === "correct" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(48px, 12vw, 80px)", fontWeight: 900, color: "#00d4aa", letterSpacing: -2 }}>
                {sqWord.word}
              </div>
              <div style={{
                fontSize: 14, fontFamily: "'Space Mono', monospace", color: "#00d4aa",
                letterSpacing: 3, marginTop: 12, padding: "6px 16px", borderRadius: 8,
                background: "#00d4aa15", border: "1px solid #00d4aa33", display: "inline-block",
              }}>
                CORRECT ✓
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, color: "#f87171", fontWeight: 600, marginBottom: 8, textDecoration: "line-through" }}>
                {recallInput}
              </div>
              <div style={{ fontSize: "clamp(40px, 10vw, 68px)", fontWeight: 900, color: reveal ? "#f59e0b" : "#f87171", letterSpacing: -2, transition: "color 0.3s" }}>
                {sqWord.word}
              </div>
              <div style={{ fontSize: 18, color: "#666", fontWeight: 600, marginTop: 8 }}>{sqWord.japanese}</div>
              <div style={{
                width: "min(70vw, 300px)", aspectRatio: "16/10", borderRadius: 12,
                overflow: "hidden", marginTop: 16, marginLeft: "auto", marginRight: "auto",
                boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              }}>
                <img src={sqImgSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: DONE
  // ══════════════════════════════════════════════════════════
  if (screen === "done") {
    const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const isPerfect = accuracy === 100 && sessionTotal > 0;
    const isExcellent = accuracy >= 90 && sessionTotal > 0;
    return (
      <div style={{ ...base, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
        {fontLink}

        {/* Celebration overlay for high accuracy */}
        {isExcellent && (
          <>
            <style>{`
              @keyframes celebrationScale {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes confettiDrift {
                0% { transform: translateY(-20px) rotate(0deg) scale(1); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg) scale(0.5); opacity: 0; }
              }
              @keyframes celebFadeOut {
                0% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; pointer-events: none; }
              }
            `}</style>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.75)",
              animation: "celebFadeOut 3.5s ease forwards",
              pointerEvents: "none",
            }}>
              {/* Confetti particles */}
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: `${Math.random() * 20 - 10}%`,
                  left: `${Math.random() * 100}%`,
                  width: 8 + Math.random() * 8,
                  height: 8 + Math.random() * 8,
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  background: ["#00d4aa", "#f59e0b", "#60a5fa", "#e879f9", "#f87171", "#4ade80"][i % 6],
                  animation: `confettiDrift ${2 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards`,
                }} />
              ))}
              <div style={{
                textAlign: "center",
                animation: "celebrationScale 0.6s ease-out forwards",
              }}>
                <div style={{ fontSize: 72, marginBottom: 8 }}>{isPerfect ? "\uD83D\uDC8E" : "\uD83C\uDF89"}</div>
                <div style={{
                  fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 900,
                  color: isPerfect ? "#f59e0b" : "#00d4aa",
                  letterSpacing: 2, textShadow: "0 0 30px rgba(0,212,170,0.5)",
                }}>
                  {isPerfect ? "PERFECT RECALL!" : `EXCELLENT! ${accuracy}%`}
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 52, marginBottom: 12, color: isPerfect ? "#f59e0b" : "#00d4aa" }}>{isPerfect ? "\uD83D\uDC8E" : isExcellent ? "\uD83C\uDF89" : "\u2726"}</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 6px 0" }}>{isPerfect ? "Perfect!" : isExcellent ? "Excellent!" : "Complete"}</h2>
          <p style={{ fontSize: 12, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            {currentWords.length} WORDS × 2 ROUNDS — ENCODED
          </p>

          {/* Session Stats */}
          {sessionTotal > 0 && (
            <div style={{
              display: "flex", gap: 16, justifyContent: "center", marginBottom: 24,
              padding: "14px 20px", background: "#111", borderRadius: 12, border: "1px solid #222",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#00d4aa" }}>{accuracy}%</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>ACCURACY</div>
              </div>
              <div style={{ width: 1, background: "#222" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{sessionCorrect}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>CORRECT</div>
              </div>
              <div style={{ width: 1, background: "#222" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: sessionWrong.length > 0 ? "#f87171" : "#555" }}>{sessionWrong.length}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>WRONG</div>
              </div>
            </div>
          )}

          {/* Wrong answers review */}
          {sessionWrong.length > 0 && (
            <div style={{ marginBottom: 24, padding: "14px 16px", background: "#1a1010", borderRadius: 12, border: "1px solid #f8717133" }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#f87171", letterSpacing: 2, marginBottom: 10 }}>
                WORDS TO REVIEW
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {sessionWrong.map((w) => (
                  <button key={w.word} onClick={() => speak(w.word, 0.82)} style={{
                    padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                    background: "#f8717118", border: "1px solid #f8717133",
                    color: "#f87171", fontSize: 13, fontWeight: 700,
                  }}>
                    {w.word} <span style={{ color: "#666", fontSize: 11 }}>({w.japanese})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 36 }}>
            {currentWords.map((w, i) => {
              const isWrong = sessionWrong.find((sw) => sw.word === w.word);
              return (
                <div key={i} style={{
                  borderRadius: 12, overflow: "hidden", position: "relative", aspectRatio: "4/3",
                  background: "#1a1a1a", border: isWrong ? "2px solid #f8717155" : "2px solid transparent",
                }}>
                  <img
                    src={w.localImg}
                    onError={(e) => { e.target.src = w.fallbackImg; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    alt=""
                  />
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "20px 8px 8px",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
                    fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1,
                    color: isWrong ? "#f87171" : "#fff",
                  }}>
                    {w.word}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={gameMode === "speedQuiz" ? handleStartSpeedQuiz : handleStart} style={{
              padding: "12px 32px", fontSize: 14, fontWeight: 700,
              border: "1px solid #333", borderRadius: 10,
              background: "transparent", color: "#fff", cursor: "pointer", letterSpacing: 1,
            }}>
              RESTART
            </button>
            {gameMode === "speedQuiz" ? (
              <button onClick={() => { setGameMode("flash"); handleStart(); }} style={{
                padding: "12px 32px", fontSize: 14, fontWeight: 700,
                border: "1px solid #00d4aa44", borderRadius: 10,
                background: "#00d4aa12", color: "#00d4aa", cursor: "pointer", letterSpacing: 1,
              }}>
                ⚡ FlashInput
              </button>
            ) : (
              <button onClick={handleStartSpeedQuiz} style={{
                padding: "12px 32px", fontSize: 14, fontWeight: 700,
                border: "1px solid #f59e0b44", borderRadius: 10,
                background: "#f59e0b12", color: "#f59e0b", cursor: "pointer", letterSpacing: 1,
              }}>
                📸 Speed Quiz
              </button>
            )}
            <button onClick={() => setScreen("unitSelect")} style={{
              padding: "12px 32px", fontSize: 14, fontWeight: 700,
              border: "1px solid #00d4aa44", borderRadius: 10,
              background: "#00d4aa12", color: "#00d4aa", cursor: "pointer", letterSpacing: 1,
            }}>
              NEXT UNIT
            </button>
          </div>

          {/* Cumulative stats */}
          <div style={{ marginTop: 24, fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace" }}>
            TOTAL SESSIONS: {savedProgress.stats.totalSessions} · TOTAL WORDS: {savedProgress.stats.totalWords}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: PLAY
  // ══════════════════════════════════════════════════════════
  if (!word) return null;
  const isRecall = phase.id === "recall";
  const bgOpacity = phase.id === "photo" ? 0.55 : isRecall && !reveal ? 0.6 : 0.18;
  const bgFilter  = isRecall && !reveal ? "blur(30px) brightness(0.7)" : phase.id === "photo" ? "none" : "blur(6px) brightness(0.6)";
  const wordImgSrc = imgSrcs[word.word] || word.localImg;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden", position: "relative",
      cursor: "pointer", userSelect: "none",
    }} onClick={togglePause}>
      {fontLink}

      {/* BACKGROUND IMAGE */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${wordImgSrc})`,
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: bgOpacity, filter: bgFilter,
        transition: "all 0.6s ease",
        transform: transitioning ? "scale(1.05)" : "scale(1.01)",
      }} />

      {/* TOP BAR */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
        <button
          onClick={(e) => { e.stopPropagation(); handleExitToMenu(); }}
          style={{
            background: "none", border: "none", color: "#444", cursor: "pointer",
            fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 2,
            padding: "4px 8px", transition: "color 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.color = "#f87171"}
          onMouseLeave={(e) => e.target.style.color = "#444"}
        >
          ✕ QUIT
        </button>
        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#00d4aa", letterSpacing: 3 }}>
          {round === 1 ? "ROUND 1" : "ROUND 2 — SPEED"}
        </span>
        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 2 }}>
          {wordIdx + 1}/{currentWords.length}
        </span>
      </div>

      {/* WORD PROGRESS BARS */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 5, padding: "0 20px 10px", justifyContent: "center" }}>
        {currentWords.map((_, i) => (
          <div key={i} style={{
            height: 3, flex: 1, maxWidth: 48, borderRadius: 2,
            background: i < wordIdx ? "#00d4aa" : i === wordIdx ? "#333" : "#1a1a1a",
            overflow: "hidden", position: "relative",
          }}>
            {i === wordIdx && (
              <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0,
                width: `${((phaseIdx + progress) / PHASES.length) * 100}%`,
                background: "#00d4aa", borderRadius: 2, transition: "width 0.1s linear",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* PHASE INDICATOR */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 4, padding: "0 20px 14px", justifyContent: "center" }}>
        {PHASES.map((p, i) => (
          <div key={i} style={{
            fontSize: 9, fontFamily: "'Space Mono', monospace", letterSpacing: 2,
            color: i === phaseIdx ? "#00d4aa" : i < phaseIdx ? "#334" : "#222",
            padding: "3px 8px", borderRadius: 4,
            background: i === phaseIdx ? "#00d4aa12" : "transparent",
            border: i === phaseIdx ? "1px solid #00d4aa33" : "1px solid transparent",
            transition: "all 0.3s",
          }}>
            {p.label}
          </div>
        ))}
      </div>

      {/* STREAK COUNTER */}
      {streak >= 3 && (
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center", padding: "0 20px 8px",
        }}>
          <span style={{
            display: "inline-block",
            fontSize: 13, fontWeight: 800, fontFamily: "'Space Mono', monospace",
            color: streak >= 10 ? "#f59e0b" : "#ff6b6b",
            letterSpacing: 2,
            padding: "4px 14px", borderRadius: 8,
            background: streak >= 10 ? "#f59e0b18" : "#ff6b6b15",
            border: `1px solid ${streak >= 10 ? "#f59e0b44" : "#ff6b6b33"}`,
            animation: "streakPulse 1s ease-in-out infinite",
          }}>
            {"\uD83D\uDD25"} {streak} streak!
          </span>
          <style>{`
            @keyframes streakPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
          `}</style>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1, position: "relative", zIndex: 5,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 24px 40px",
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? "translateY(12px)" : "translateY(0)",
        transition: "all 0.25s ease",
      }}>

        {/* ── PHASE: PHOTO ── */}
        {phase.id === "photo" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "min(85vw, 400px)", aspectRatio: "16/10", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", marginBottom: 24, background: "#1a1a1a" }}>
              <img src={wordImgSrc} onError={() => handleImgError(word.word, word.fallbackImg)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
            </div>
            <div style={{ fontSize: 12, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 4 }}>
              WHAT IS THIS IN ENGLISH?
            </div>
          </div>
        )}

        {/* ── PHASE: WORD ── */}
        {phase.id === "word" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(48px, 14vw, 88px)", fontWeight: 900, color: "#fff", letterSpacing: -2, lineHeight: 1, marginBottom: 12 }}>
              {word.word}
            </div>
            <div style={{ fontSize: 16, color: "#00d4aa", fontFamily: "'Space Mono', monospace", letterSpacing: 1, marginBottom: 8 }}>
              /{word.phonetic}/
            </div>
            <div style={{ width: 40, height: 2, background: "#333", margin: "16px auto", borderRadius: 1 }} />
            <div style={{ fontSize: 22, color: "#888", fontWeight: 600 }}>{word.japanese}</div>
            <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", letterSpacing: 3, marginTop: 14 }}>
              🔊 LISTEN
            </div>
          </div>
        )}

        {/* ── PHASE: MEANING ── */}
        {phase.id === "meaning" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "min(70vw, 320px)", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden", marginBottom: 20, position: "relative", boxShadow: "0 12px 40px rgba(0,0,0,0.4)", background: "#1a1a1a" }}>
              <img src={wordImgSrc} onError={() => handleImgError(word.word, word.fallbackImg)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 16px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))" }}>
                <div style={{ fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
                  {word.word}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#555", letterSpacing: 4 }}>
              IMAGE + WORD = MEMORY
            </div>
          </div>
        )}

        {/* ── PHASE: SENTENCE ── */}
        {phase.id === "sentence" && (
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div style={{ fontSize: "clamp(22px, 5.5vw, 32px)", color: "#ccc", fontWeight: 300, lineHeight: 1.6, letterSpacing: 0.5, marginBottom: 20 }}>
              {word.sentence.split(new RegExp(`(${word.word})`, "gi")).map((part, i) =>
                part.toLowerCase() === word.word.toLowerCase()
                  ? <span key={i} style={{ color: "#00d4aa", fontWeight: 800 }}>{part}</span>
                  : <span key={i}>{part}</span>
              )}
            </div>
            <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 3 }}>
              LISTEN & REPEAT
            </div>
          </div>
        )}

        {/* ── PHASE: RECALL ── */}
        {phase.id === "recall" && (
          <div style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            {!recallSubmitted ? (
              <>
                <div style={{ fontSize: "clamp(40px, 10vw, 72px)", fontWeight: 900, color: "#2a2a2a", letterSpacing: 8, marginBottom: 16, fontFamily: "'Space Mono', monospace" }}>
                  {"?".repeat(word.word.length)}
                </div>
                <div style={{ fontSize: 22, color: "#666", fontWeight: 600, marginBottom: 20 }}>{word.japanese}</div>
                <form onSubmit={handleRecallSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={recallInput}
                    onChange={(e) => setRecallInput(e.target.value)}
                    placeholder="Type the English word..."
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    style={{
                      width: "min(80vw, 320px)", padding: "12px 18px",
                      fontSize: 20, fontWeight: 700, textAlign: "center",
                      background: "#1a1a1a", border: "2px solid #333",
                      borderRadius: 12, color: "#fff", outline: "none",
                      fontFamily: "'Inter', sans-serif", letterSpacing: 1,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#00d4aa"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#333"; }}
                  />
                  <button type="submit" style={{
                    padding: "10px 36px", fontSize: 14, fontWeight: 700,
                    border: "none", borderRadius: 10,
                    background: recallInput.trim() ? "linear-gradient(135deg, #00d4aa, #00b894)" : "#222",
                    color: recallInput.trim() ? "#0a0a0a" : "#555",
                    cursor: recallInput.trim() ? "pointer" : "default",
                    letterSpacing: 2, transition: "all 0.2s",
                  }} disabled={!recallInput.trim()}>
                    CHECK
                  </button>
                </form>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#444", letterSpacing: 4, marginTop: 16 }}>
                  RECALL THE WORD
                </div>
              </>
            ) : recallResult === "correct" ? (
              <>
                <div style={{ fontSize: "clamp(52px, 14vw, 88px)", fontWeight: 900, color: "#00d4aa", letterSpacing: -2, lineHeight: 1 }}>
                  {word.word}
                </div>
                <div style={{
                  fontSize: 14, fontFamily: "'Space Mono', monospace", color: "#00d4aa",
                  letterSpacing: 3, marginTop: 16,
                  padding: "6px 16px", borderRadius: 8,
                  background: "#00d4aa15", border: "1px solid #00d4aa33",
                  display: "inline-block",
                }}>
                  CORRECT
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 16, color: "#f87171", fontWeight: 600, marginBottom: 8, fontFamily: "'Space Mono', monospace", textDecoration: "line-through" }}>
                  {recallInput}
                </div>
                <div style={{ fontSize: "clamp(44px, 12vw, 72px)", fontWeight: 900, color: reveal ? "#f59e0b" : "#f87171", letterSpacing: -2, lineHeight: 1, transition: "color 0.3s" }}>
                  {word.word}
                </div>
                <div style={{ fontSize: 18, color: "#666", fontWeight: 600, marginTop: 8 }}>{word.japanese}</div>
                <div style={{
                  fontSize: 14, fontFamily: "'Space Mono', monospace", color: "#f87171",
                  letterSpacing: 3, marginTop: 16,
                  padding: "6px 16px", borderRadius: 8,
                  background: "#f8717115", border: "1px solid #f8717133",
                  display: "inline-block",
                }}>
                  REVIEW THIS WORD
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* TIMER BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 3, background: "#111", zIndex: 20 }}>
        <div style={{
          height: "100%", width: `${progress * 100}%`,
          background: "#00d4aa", transition: "width 0.1s linear", borderRadius: "0 2px 2px 0",
        }} />
      </div>

      {/* PAUSE OVERLAY */}
      {paused && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.88)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 50,
        }} onClick={togglePause}>
          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: "#555", letterSpacing: 4, marginBottom: 16 }}>PAUSED</div>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginBottom: 12 }}>▶</div>
          <div style={{ fontSize: 12, color: "#444", marginBottom: 24 }}>Tap anywhere to resume</div>
          <div style={{ fontSize: 11, color: "#333", fontFamily: "'Space Mono', monospace", marginBottom: 32 }}>
            {word.word} — {word.japanese}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleExitToMenu(); }}
            style={{
              padding: "12px 32px", fontSize: 13, fontWeight: 700,
              border: "1px solid #333", borderRadius: 10,
              background: "transparent", color: "#666",
              cursor: "pointer", letterSpacing: 2,
              fontFamily: "'Space Mono', monospace",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#f87171"; e.target.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#333"; e.target.style.color = "#666"; }}
          >
            QUIT
          </button>
        </div>
      )}
    </div>
  );
}
