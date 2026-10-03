import { useState, useEffect, useCallback, useRef } from "react";
import { VOCAB_DB } from "./vocabData.js";

// ─────────────────────────────────────────────────────────────
// SOUND EFFECTS — Web Audio API
// ─────────────────────────────────────────────────────────────
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playCorrectSound(combo = 0) {
  try {
    const ctx = getAudioCtx();
    // コンボが上がるほど音程が上がる（最大+5半音）
    const shift = Math.min(combo, 5) * 1.0595;
    const mult = combo > 0 ? Math.pow(1.0595, Math.min(combo, 8)) : 1;
    const freqs = [523.25, 659.25, 783.99].map(f => f * mult);
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

function playStarSound(starCount) {
  try {
    const ctx = getAudioCtx();
    const seq = [523.25, 659.25, 783.99, 1046.5].slice(0, starCount + 1);
    seq.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.18 + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.18 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.4);
    });
  } catch (e) { /* audio not available */ }
}

// ─────────────────────────────────────────────────────────────
// LOCALSTORAGE PERSISTENCE
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "flashinput_progress";
const DEFAULT_PROGRESS = {
  completedUnits: {}, wrongAnswers: {},
  stats: { totalSessions: 0, totalWords: 0 },
  unitStars: {}, highScores: {}, tutorialSeen: false,
  // こたえかた: "tiles"（もじを ならべる） | "type"（タイプする）
  // すすみかた: "auto"（おとが おわったら じどう） | "manual"（ボタンで すすむ）
  settings: { inputMode: "tiles", advanceMode: "auto" },
};

const PORTAL_URL = "https://wise-english-portal.vercel.app";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    // 旧データ移行: completedUnits に記録があれば最低1つ星を付与
    const unitStars = { ...(parsed.unitStars || {}) };
    Object.keys(parsed.completedUnits || {}).forEach((k) => {
      if (!unitStars[k]) unitStars[k] = 1;
    });
    return { ...DEFAULT_PROGRESS, ...parsed, unitStars,
      highScores: parsed.highScores || {},
      settings: { ...DEFAULT_PROGRESS.settings, ...(parsed.settings || {}) },
      stats: { ...DEFAULT_PROGRESS.stats, ...(parsed.stats || {}) } };
  } catch { return { ...DEFAULT_PROGRESS }; }
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

// ─────────────────────────────────────────────────────────────
// PHASE CONFIG — 日本語ガイド付き
// ─────────────────────────────────────────────────────────────
const PHASES = [
  { id: "photo",    duration: 2800, label: "IMAGE",   guide: "これは えいごで なんて いうかな？", icon: "👀" },
  { id: "word",     duration: 3200, label: "WORD",    guide: "こえに だして よんでみよう！", icon: "🗣️" },
  { id: "meaning",  duration: 2800, label: "MEANING", guide: "しゃしんと たんごを セットで おぼえよう", icon: "🧠" },
  { id: "sentence", duration: 3500, label: "CONTEXT", guide: "ぶんの なかで きいてみよう", icon: "👂" },
  { id: "recall",   duration: 4500, label: "RECALL",  guide: "おもいだして にゅうりょく！", icon: "✏️" },
];

// スピードクイズの制限時間（秒）
const SQ_TIME_LIMIT = 10;

// GRADE METADATA
const GRADES = [
  { key: "grade5", ...VOCAB_DB.grade5 },
  { key: "grade4", ...VOCAB_DB.grade4 },
];

// ─────────────────────────────────────────────────────────────
// DEEP LINK — ?grade=5&unit=2&input=tiles&advance=manual
//   grade   : 5 | 4（省略時は 5）
//   unit    : 1〜5（その級のユニット番号。解放制に関係なく直接ひらく）
//   input   : tiles | type
//   advance : auto | manual
// ─────────────────────────────────────────────────────────────
function parseDeepLink() {
  const out = { grade: null, unitKey: null, inputMode: null, advanceMode: null };
  try {
    const p = new URLSearchParams(window.location.search);
    const digits = (v) => (v || "").replace(/[^0-9]/g, "");
    const g = digits(p.get("grade"));
    const grade = GRADES.find((x) => x.key === `grade${g}`) || null;
    const u = parseInt(digits(p.get("unit")), 10);
    if (u >= 1) {
      const target = grade || GRADES[0];
      const keys = Object.keys(target.units);
      if (u <= keys.length) { out.grade = target; out.unitKey = keys[u - 1]; }
    }
    if (!out.grade && grade) out.grade = grade;
    const input = (p.get("input") || "").toLowerCase();
    if (input === "tiles" || input === "type") out.inputMode = input;
    const adv = (p.get("advance") || "").toLowerCase();
    if (adv === "auto" || adv === "manual") out.advanceMode = adv;
  } catch { /* ignore */ }
  return out;
}
const DEEP_LINK = parseDeepLink();

// スコア計算
function calcScore(combo, timeLeft = 0) {
  const base = 100;
  const comboBonus = Math.min(combo, 10) * 20;
  const timeBonus = Math.max(0, Math.round(timeLeft)) * 10;
  return base + comboBonus + timeBonus;
}

// 星評価: 正答率ベース
function calcStars(accuracy) {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}

// ─────────────────────────────────────────────────────────────
// HELPERS — Web Speech API
// ─────────────────────────────────────────────────────────────
let cachedVoice = null;
let voiceReady  = false;

const VOICE_PRIORITY = [
  "Google US English",
  "Google UK English Female",
  "Samantha",
  "Karen",
  "Alex",
  "Microsoft Zira Desktop",
  "Microsoft David Desktop",
  "Microsoft Mark Desktop",
];

function pickBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  for (const name of VOICE_PRIORITY) {
    const v = voices.find((v) => v.name === name);
    if (v) return v;
  }
  const enUS = voices.find((v) => v.lang === "en-US");
  if (enUS) return enUS;
  const en = voices.find((v) => v.lang && v.lang.startsWith("en"));
  return en || null;
}

function initVoice() {
  if (!("speechSynthesis" in window)) return;
  const tryPick = () => {
    const v = pickBestVoice();
    if (v) { cachedVoice = v; voiceReady = true; }
  };
  tryPick();
  if (!voiceReady) {
    window.speechSynthesis.onvoiceschanged = () => { tryPick(); };
  }
}

// 再生中の発話を保持（Chrome で GC されて onend が来なくなるのを防ぐ）
let currentUtterance = null;

// onDone: 再生完了（または失敗・非対応）時に1回だけ呼ばれる
function speak(text, rate = 0.88, onDone) {
  let finished = false;
  const done = () => { if (finished) return; finished = true; if (onDone) onDone(); };
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") { done(); return; }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = rate;
    u.pitch = 1.0;
    if (cachedVoice) u.voice = cachedVoice;
    u.onend = done;
    u.onerror = done;
    currentUtterance = u;
    window.speechSynthesis.speak(u);
  } catch { done(); }
}

function stopSpeech() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// ─────────────────────────────────────────────────────────────
// IMAGE HELPERS
// ─────────────────────────────────────────────────────────────
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
// スコアポップアップ（+140! の浮き上がり演出）
// ─────────────────────────────────────────────────────────────
function ScorePopup({ popup }) {
  if (!popup) return null;
  return (
    <div key={popup.id} style={{
      position: "absolute", top: "28%", left: "50%",
      transform: "translateX(-50%)",
      zIndex: 60, pointerEvents: "none",
      fontSize: "clamp(28px, 7vw, 44px)", fontWeight: 900,
      color: popup.combo >= 5 ? "#f59e0b" : "#00d4aa",
      textShadow: "0 0 24px rgba(0,212,170,0.6)",
      animation: "scoreFloat 1s ease-out forwards",
      fontFamily: "'Space Mono', monospace",
    }}>
      +{popup.points}
      {popup.combo >= 2 && (
        <span style={{ fontSize: "0.5em", marginLeft: 8, color: "#ff6b6b" }}>
          x{popup.combo} COMBO!
        </span>
      )}
      <style>{`
        @keyframes scoreFloat {
          0% { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.7); }
          25% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-48px) scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// チュートリアル（あそびかた）オーバーレイ
// ─────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    icon: "👀🗣️",
    title: "みて、きいて、まねしよう",
    body: "しゃしんと たんごが じゅんばんに でてくるよ。\nおとを きいて、こえに だして まねしてね。",
  },
  {
    icon: "✏️",
    title: "さいごは おもいだしクイズ！",
    body: "「？？？」が でたら、たんごを おもいだして\nもじを ならべるか、キーボードで タイプしよう。\nせいかいすると スコアと コンボが たまるよ！",
  },
  {
    icon: "⭐🔓",
    title: "ほしを あつめて つぎへ！",
    body: "せいかいりつが たかいほど ほしが もらえるよ。\n★1つで つぎの ユニットが アンロック！\n★3を めざそう！",
  },
];

function TutorialOverlay({ onClose }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.92)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        maxWidth: 420, width: "100%", textAlign: "center",
        background: "#141414", border: "1px solid #2a2a2a", borderRadius: 24,
        padding: "36px 28px 28px",
        animation: "tutorialPop 0.35s ease-out",
      }}>
        <style>{`
          @keyframes tutorialPop {
            0% { transform: scale(0.85); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#00d4aa", fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>
          あそびかた {step + 1}/{TUTORIAL_STEPS.length}
        </div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{s.icon}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{s.title}</div>
        <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.9, whiteSpace: "pre-line", marginBottom: 28 }}>{s.body}</div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i === step ? "#00d4aa" : "#333",
              transition: "background 0.2s",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              padding: "12px 24px", fontSize: 14, fontWeight: 700,
              border: "1px solid #333", borderRadius: 12,
              background: "transparent", color: "#888", cursor: "pointer",
            }}>
              もどる
            </button>
          )}
          <button onClick={() => isLast ? onClose() : setStep(step + 1)} style={{
            padding: "12px 36px", fontSize: 15, fontWeight: 800,
            border: "none", borderRadius: 12,
            background: "linear-gradient(135deg, #00d4aa, #00b894)",
            color: "#0a0a0a", cursor: "pointer", letterSpacing: 1,
          }}>
            {isLast ? "はじめる！" : "つぎへ"}
          </button>
        </div>
        {!isLast && (
          <button onClick={onClose} style={{
            marginTop: 14, background: "none", border: "none",
            color: "#444", fontSize: 12, cursor: "pointer",
          }}>
            スキップ
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// こたえの入力: 「もじを ならべる」（タップ）
// ─────────────────────────────────────────────────────────────
function LetterTiles({ answer, onChange, accent }) {
  const [tiles] = useState(() => {
    const chars = answer.split("").map((ch, id) => ({ ch, id }));
    let t = shuffleArray(chars);
    for (let n = 0; n < 8 && chars.length > 1 && t.map((x) => x.ch).join("") === answer; n++) t = shuffleArray(chars);
    return t;
  });
  const [picked, setPicked] = useState([]); // えらんだ タイルid（じゅんばん）
  const update = (next) => { setPicked(next); onChange(next.map((id) => answer[id]).join("")); };
  const slot = {
    width: 34, height: 44, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 22, fontWeight: 800, fontFamily: "'Space Mono', monospace", padding: 0,
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* こたえの わく（タップで もどせる） */}
      <div data-testid="tile-slots" style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", maxWidth: "92vw" }}>
        {answer.split("").map((_, i) => {
          const id = picked[i];
          const filled = id !== undefined;
          return (
            <button type="button" key={i} disabled={!filled}
              onClick={() => update(picked.filter((_, j) => j !== i))}
              aria-label={filled ? `${answer[id]} を もどす` : "あき"}
              style={{ ...slot,
                background: filled ? `${accent}22` : "#141414",
                border: filled ? `2px solid ${accent}` : "2px dashed #3a3a3a",
                color: "#fff", cursor: filled ? "pointer" : "default",
              }}>
              {filled ? answer[id] : ""}
            </button>
          );
        })}
      </div>
      {/* もじタイル */}
      <div data-testid="tile-pool" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: "92vw" }}>
        {tiles.map((t) => {
          const used = picked.includes(t.id);
          return (
            <button type="button" key={t.id} disabled={used}
              onClick={() => update([...picked, t.id])}
              style={{ ...slot, width: 46, height: 50, fontSize: 24,
                background: used ? "#151515" : "#262626",
                border: used ? "2px solid #1e1e1e" : "2px solid #555",
                color: used ? "#2a2a2a" : "#fff", cursor: used ? "default" : "pointer",
              }}>
              {t.ch}
            </button>
          );
        })}
      </div>
      <button type="button" disabled={!picked.length} onClick={() => update(picked.slice(0, -1))} style={{
        background: "none", border: "1px solid #333", borderRadius: 8, padding: "6px 14px",
        color: picked.length ? "#aaa" : "#333", fontSize: 12, fontWeight: 700,
        cursor: picked.length ? "pointer" : "default",
      }}>
        ⌫ ひとつ もどす
      </button>
    </div>
  );
}

// こたえの入力エリア（ならべる / タイプ 共通）
function AnswerArea({ word, inputMode, value, onChange, onSubmit, inputRef, accent, accentDark }) {
  const tilesMode = inputMode === "tiles";
  const canSubmit = tilesMode ? value.length === word.word.length : !!value.trim();
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSubmit(); }} onClick={(e) => e.stopPropagation()}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {tilesMode ? (
        <LetterTiles answer={word.word} onChange={onChange} accent={accent} />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ここに にゅうりょく..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          autoFocus
          style={{
            width: "min(80vw, 320px)", padding: "12px 18px",
            fontSize: 20, fontWeight: 700, textAlign: "center",
            background: "#1a1a1a", border: "2px solid #333",
            borderRadius: 12, color: "#fff", outline: "none",
            fontFamily: "'Inter', sans-serif", letterSpacing: 1,
          }}
          onFocus={(e) => { e.target.style.borderColor = accent; }}
          onBlur={(e) => { e.target.style.borderColor = "#333"; }}
        />
      )}
      <button type="submit" disabled={!canSubmit} style={{
        padding: "10px 36px", fontSize: 14, fontWeight: 700,
        border: "none", borderRadius: 10,
        background: canSubmit ? `linear-gradient(135deg, ${accent}, ${accentDark})` : "#222",
        color: canSubmit ? "#0a0a0a" : "#555",
        cursor: canSubmit ? "pointer" : "default",
        letterSpacing: 2, transition: "all 0.2s",
      }}>
        こたえる！
      </button>
    </form>
  );
}

// 設定の えらぶボタン列
function SettingRow({ label, options, value, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
      <span style={{ fontSize: 11, color: "#777", fontWeight: 700, minWidth: 70, textAlign: "right" }}>{label}</span>
      {options.map((o) => (
        <button key={o.val} onClick={() => onSelect(o.val)} aria-pressed={value === o.val} style={{
          padding: "7px 12px", borderRadius: 8,
          border: value === o.val ? "1px solid #00d4aa" : "1px solid #333",
          background: value === o.val ? "#00d4aa15" : "transparent",
          color: value === o.val ? "#00d4aa" : "#777",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function PortalLink({ style }) {
  return (
    <a href={PORTAL_URL} style={{
      display: "inline-block", fontSize: 12, color: "#777", textDecoration: "none",
      border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 16px", ...style,
    }}>
      🏠 学習ホームにもどる
    </a>
  );
}

// 星の表示コンポーネント
function Stars({ count, size = 22, animate = false }) {
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          fontSize: size,
          filter: i < count ? "none" : "grayscale(1) opacity(0.25)",
          animation: animate && i < count ? `starPop 0.4s ease-out ${0.3 + i * 0.25}s both` : "none",
        }}>⭐</span>
      ))}
      {animate && (
        <style>{`
          @keyframes starPop {
            0% { transform: scale(0); opacity: 0; }
            60% { transform: scale(1.5); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function FlashcardApp() {
  // Navigation state
  // ディープリンク（?grade=5&unit=2）があれば そのユニットの スタート画面から はじめる
  const [screen, setScreen] = useState(DEEP_LINK.unitKey ? "start" : DEEP_LINK.grade ? "unitSelect" : "levelSelect"); // levelSelect | unitSelect | start | play | speedQuiz | done
  const [gameMode, setGameMode] = useState("flash"); // "flash" | "speedQuiz"
  const [selectedGrade, setSelectedGrade] = useState(DEEP_LINK.grade);
  const [selectedUnit, setSelectedUnit] = useState(DEEP_LINK.unitKey);
  const [currentWords, setCurrentWords] = useState(() =>
    DEEP_LINK.unitKey ? shuffleArray(DEEP_LINK.grade.units[DEEP_LINK.unitKey]) : []);
  // 先生がリンクで指定したユニット（解放制に関係なく ひらける）
  const teacherUnitKey = DEEP_LINK.unitKey ? `${DEEP_LINK.grade.key}_${DEEP_LINK.unitKey}` : null;

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
  const [recallResult, setRecallResult]   = useState(null);
  const [recallSubmitted, setRecallSubmitted] = useState(false);
  const inputRef = useRef(null);

  // Session tracking
  const [sessionWrong, setSessionWrong]   = useState([]);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal]     = useState(0);

  // ゲーム要素: スコア・コンボ
  const [score, setScore]         = useState(0);
  const [combo, setCombo]         = useState(0);
  const [maxCombo, setMaxCombo]   = useState(0);
  const [scorePopup, setScorePopup] = useState(null);
  const popupIdRef = useRef(0);

  // スピードクイズ: タイムアタック
  const [sqTimeLeft, setSqTimeLeft] = useState(SQ_TIME_LIMIT);
  const sqTimerRef = useRef(null);
  const [sqTimedOut, setSqTimedOut] = useState(false);   // いまの もんだいが じかんぎれ か
  const [sessionTimeouts, setSessionTimeouts] = useState(0); // じかんぎれの かず（まちがいと べつに かぞえる）

  // 結果画面用（星確定値）
  const [earnedStars, setEarnedStars] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // チュートリアル
  const [showTutorial, setShowTutorial] = useState(false);

  // Streak & adaptive timing
  const [consecutiveWrong, setConsecutiveWrong]   = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [timingAdjust, setTimingAdjust]           = useState(0);

  // localStorage persistence
  const [savedProgress, setSavedProgress] = useState(() => {
    const p = loadProgress();
    if (DEEP_LINK.inputMode || DEEP_LINK.advanceMode) {
      p.settings = { ...p.settings,
        ...(DEEP_LINK.inputMode ? { inputMode: DEEP_LINK.inputMode } : {}),
        ...(DEEP_LINK.advanceMode ? { advanceMode: DEEP_LINK.advanceMode } : {}) };
      saveProgress(p);
    }
    return p;
  });
  const inputMode = savedProgress.settings.inputMode;
  const advanceMode = savedProgress.settings.advanceMode;
  const updateSetting = (key, val) => {
    setSavedProgress((prev) => {
      const updated = { ...prev, settings: { ...prev.settings, [key]: val } };
      saveProgress(updated);
      return updated;
    });
  };

  const timerRef     = useRef(null);
  const progressRef  = useRef(null);
  const startTimeRef = useRef(null);
  const advanceRef   = useRef(null);   // さいしんの advance
  const advLockRef   = useRef(false);  // にじゅう すすみ ぼうし
  const replayRef    = useRef(null);   // いまの フェーズの おとを もういちど

  const word  = currentWords[wordIdx] || null;
  const phase = PHASES[phaseIdx];

  // WiseXP SDK init
  useEffect(() => {
    if (window.WiseXP) window.WiseXP.init('flashinput');
  }, []);

  // 初回起動時にチュートリアル表示
  useEffect(() => {
    if (!savedProgress.tutorialSeen) setShowTutorial(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    setSavedProgress((prev) => {
      const updated = { ...prev, tutorialSeen: true };
      saveProgress(updated);
      return updated;
    });
  };

  // Web Speech API
  useEffect(() => {
    initVoice();
    return () => stopSpeech();
  }, []);

  usePreloadImages(currentWords);

  useEffect(() => {
    const srcs = {};
    currentWords.forEach((w) => { srcs[w.word] = w.localImg; });
    setImgSrcs(srcs);
  }, [currentWords]);

  const handleImgError = (wordKey, fallback) => {
    setImgSrcs((prev) => ({ ...prev, [wordKey]: fallback }));
  };

  // スコア加算 + ポップアップ
  const addScore = useCallback((newCombo, timeLeft = 0) => {
    const points = calcScore(newCombo - 1, timeLeft);
    setScore((s) => s + points);
    popupIdRef.current += 1;
    setScorePopup({ id: popupIdRef.current, points, combo: newCombo });
    setTimeout(() => {
      setScorePopup((p) => (p && p.id === popupIdRef.current ? null : p));
    }, 1000);
    return points;
  }, []);

  // ── RECALL SUBMISSION（フラッシュモード）──────────────────
  const handleRecallSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (!word || recallSubmitted) return;

    const answer = recallInput.trim().toLowerCase();
    const correct = answer === word.word.toLowerCase();
    setRecallResult(correct ? "correct" : "wrong");
    setRecallSubmitted(true);
    setSessionTotal((t) => t + 1);

    if (correct) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      playCorrectSound(newCombo);
      addScore(newCombo);
      setSessionCorrect((c) => c + 1);
      setConsecutiveWrong(0);
      setConsecutiveCorrect((c) => {
        const next = c + 1;
        if (next >= 5) setTimingAdjust((prev) => Math.max(prev - 300, -2200));
        return next;
      });
      speak(word.word, 0.82);
    } else {
      playWrongSound();
      setCombo(0);
      setConsecutiveCorrect(0);
      setConsecutiveWrong((c) => {
        const next = c + 1;
        if (next >= 3) setTimingAdjust((prev) => prev + 500);
        return next;
      });
      if (window.WiseXP) window.WiseXP.reportWrong({ question: word.japanese, correct: word.word, playerAnswer: answer });
      setSessionWrong((prev) => {
        if (prev.find((w) => w.word === word.word)) return prev;
        return [...prev, word];
      });
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
      setTimeout(() => {
        setReveal(true);
        speak(word.word, 0.82);
      }, 600);
    }
  }, [word, recallInput, recallSubmitted, selectedGrade, selectedUnit, combo, addScore]);

  // ── セッション完了処理（星・ハイスコア保存）────────────────
  const finishSession = useCallback((finalCorrect, finalTotal, finalScore, finalMaxCombo, finalWrong) => {
    const acc = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0;
    const stars = calcStars(acc);
    setEarnedStars(stars);
    if (stars > 0) setTimeout(() => playStarSound(stars), 500);

    if (selectedGrade && selectedUnit) {
      const key = `${selectedGrade.key}_${selectedUnit}`;
      setIsNewRecord(finalScore > (savedProgress.highScores[key] || 0));
      setSavedProgress((prev) => {
        const completedUnits = { ...prev.completedUnits, [key]: Date.now() };
        const unitStars = { ...prev.unitStars, [key]: Math.max(prev.unitStars[key] || 0, stars) };
        const prevHigh = prev.highScores[key] || 0;
        const highScores = { ...prev.highScores, [key]: Math.max(prevHigh, finalScore) };
        const stats = {
          ...prev.stats,
          totalSessions: (prev.stats.totalSessions || 0) + 1,
          totalWords: (prev.stats.totalWords || 0) + currentWords.length,
        };
        const updated = { ...prev, completedUnits, unitStars, highScores, stats };
        saveProgress(updated);
        return updated;
      });
    }
    setScreen("done");

    if (window.WiseXP) {
      window.WiseXP.reportGame({ score: finalScore, correct: finalCorrect, total: finalTotal, maxCombo: finalMaxCombo, grade: selectedGrade?.shortLabel || '' });
    }
    try {
      window.WiseGame && window.WiseGame.reportComplete({
        score: finalScore, maxScore: finalTotal * calcScore(10, SQ_TIME_LIMIT), accuracy: acc,
        metadata: { grade: selectedGrade?.shortLabel || '', unit: selectedUnit || '', stars, maxCombo: finalMaxCombo,
          wrongAnswers: finalWrong.slice(0, 20).map(w => ({ q: w.japanese || '', correct: w.word || '', chosen: '', tag: 'sight_word' })) }
      });
    } catch(e) {}
  }, [selectedGrade, selectedUnit, currentWords.length, savedProgress.highScores]);

  // ── ADVANCE (phase/word/round) ──────────────────────────────
  const advance = useCallback(() => {
    if (advLockRef.current) return;
    advLockRef.current = true;
    setTransitioning(true);
    setTimeout(() => {
      advLockRef.current = false;
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
          finishSession(sessionCorrect, sessionTotal, score, maxCombo, sessionWrong);
        }
      }
    }, 250);
  }, [phaseIdx, wordIdx, round, currentWords, sessionCorrect, sessionTotal, score, maxCombo, sessionWrong, finishSession]);

  advanceRef.current = advance;

  // ── PLAY TIMER EFFECT ──────────────────────────────────────
  // word / sentence フェーズは「さいてい ひょうじ時間」と「おんせいの さいせい かんりょう」の
  // りょうほうを まってから すすむ。てどうモードでは ボタンを おすまで すすまない。
  useEffect(() => {
    if (screen !== "play" || paused || !word) return;

    if (phase.id === "recall") {
      setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
      if (recallSubmitted && advanceMode === "auto") {
        timerRef.current = setTimeout(() => advanceRef.current(), recallResult === "correct" ? 1500 : 2500);
        return () => { clearTimeout(timerRef.current); };
      }
      return;
    }

    const baseDur = phase.id === "word" ? Math.max(1000, phase.duration + timingAdjust) : phase.duration;
    const dur = baseDur / speed;
    const speechText = phase.id === "word" ? word.word : phase.id === "sentence" ? word.sentence : null;
    const speechRate = phase.id === "word" ? 0.8 : 0.92;

    let alive = true;
    let minDone = false;
    let speechDone = !speechText;
    let playId = 0;
    const timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(() => { if (alive) fn(); }, ms)); };
    const tryAdvance = () => {
      if (alive && advanceMode === "auto" && minDone && speechDone) advanceRef.current();
    };
    const playSpeech = () => {
      const id = ++playId;
      speechDone = false;
      let settled = false;
      const settle = () => {
        if (!alive || settled || id !== playId) return;
        settled = true;
        // よみおわってから ひとこきゅう おいて すすむ
        later(() => { if (id === playId) { speechDone = true; tryAdvance(); } }, 600);
      };
      speak(speechText, speechRate, settle);
      // onend が こない ブラウザむけの ほけん（もじ数から ながさを みつもる）
      later(settle, 1500 + speechText.length * 120);
    };
    replayRef.current = speechText ? playSpeech : null;
    if (speechText) later(playSpeech, 300);

    setProgress(0);
    if (advanceMode === "auto") {
      startTimeRef.current = Date.now();
      progressRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setProgress(Math.min(elapsed / dur, 1));
      }, 30);
    }
    later(() => { minDone = true; tryAdvance(); }, dur);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      clearInterval(progressRef.current);
      replayRef.current = null;
    };
  }, [screen, wordIdx, phaseIdx, paused, speed, round, recallSubmitted, recallResult, timingAdjust, advanceMode]);

  // てどうで つぎへ
  const handleManualNext = (e) => {
    if (e) e.stopPropagation();
    stopSpeech();
    advance();
  };

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

  const resetSession = () => {
    setWordIdx(0); setPhaseIdx(0); setRound(1);
    setReveal(false); setPaused(false);
    setRecallInput(""); setRecallResult(null); setRecallSubmitted(false);
    setSessionWrong([]); setSessionCorrect(0); setSessionTotal(0);
    setCombo(0); setMaxCombo(0); setScore(0); setScorePopup(null);
    setEarnedStars(0); setIsNewRecord(false);
    setSqTimedOut(false); setSessionTimeouts(0);
    advLockRef.current = false;
    setConsecutiveWrong(0); setConsecutiveCorrect(0); setTimingAdjust(0);
  };

  const handleStart = () => {
    setCurrentWords((prev) => shuffleArray(prev));
    resetSession();
    setGameMode("flash");
    setScreen("play");
  };

  const handleStartSpeedQuiz = () => {
    setCurrentWords((prev) => shuffleArray(prev));
    resetSession();
    setSqTimeLeft(SQ_TIME_LIMIT);
    setGameMode("speedQuiz");
    setScreen("speedQuiz");
  };

  const handleExitToMenu = () => {
    clearTimeout(timerRef.current);
    clearInterval(progressRef.current);
    clearInterval(sqTimerRef.current);
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

  // ?unit=5-1 で自動選択（FlashInput 共通語彙の直接起動）
  const unitAutoStarted = useRef(false);
  useEffect(() => {
    if (unitAutoStarted.current) return;
    const p = new URLSearchParams(window.location.search);
    const u = p.get("unit");
    if (!u) return;
    const m = u.match(/^([45])-([1-5])$/);
    if (!m) return;
    const gradeKey = m[1] === "5" ? "grade5" : "grade4";
    const unitKey = `Unit0${m[2]}`;
    const grade = VOCAB_DB[gradeKey];
    if (grade && grade.units[unitKey]) {
      unitAutoStarted.current = true;
      selectGradeUnit(grade, unitKey);
    }
  }, []);

  // ユニットのアンロック判定: 最初のユニット or 前のユニットで★1以上
  const isUnitUnlocked = (grade, unitIndex, unitKeys) => {
    if (unitIndex === 0) return true;
    if (teacherUnitKey && teacherUnitKey === `${grade.key}_${unitKeys[unitIndex]}`) return true;
    const prevKey = `${grade.key}_${unitKeys[unitIndex - 1]}`;
    return (savedProgress.unitStars[prevKey] || 0) >= 1;
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

  const tutorialOverlay = showTutorial ? <TutorialOverlay onClose={closeTutorial} /> : null;

  // ══════════════════════════════════════════════════════════
  // SCREEN: LEVEL SELECT
  // ══════════════════════════════════════════════════════════
  if (screen === "levelSelect") {
    return (
      <div style={{ ...base, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
        {fontLink}
        {tutorialOverlay}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            VOCABULARY INPUT SYSTEM
          </div>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: 0, letterSpacing: -1 }}>
            Flash<span style={{ color: "#00d4aa" }}>Input</span>
          </h1>
          <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>しゃしんで たんごを おぼえよう！レベルを えらんでね</p>
          <button onClick={() => setShowTutorial(true)} style={{
            marginTop: 14, padding: "8px 20px", fontSize: 13, fontWeight: 700,
            border: "1px solid #00d4aa44", borderRadius: 10,
            background: "#00d4aa10", color: "#00d4aa", cursor: "pointer",
          }}>
            ❓ あそびかた
          </button>
        </div>

        {/* Grade Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 480 }}>
          {GRADES.map((grade) => {
            const unitKeys = Object.keys(grade.units);
            const totalWords = unitKeys.reduce((sum, k) => sum + grade.units[k].length, 0);
            const previewWord = grade.units[unitKeys[0]][0];
            const totalStars = unitKeys.reduce((sum, k) => sum + (savedProgress.unitStars[`${grade.key}_${k}`] || 0), 0);
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
                <div style={{ width: 4, height: 56, borderRadius: 2, background: grade.color, flexShrink: 0 }} />
                <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#222" }}>
                  <img
                    src={previewWord.localImg}
                    onError={(e) => { e.target.src = previewWord.fallbackImg; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                    alt=""
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{grade.shortLabel}</span>
                    <span style={{ fontSize: 12, color: grade.color, fontFamily: "'Space Mono', monospace" }}>{grade.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{grade.description}</div>
                  <div style={{ fontSize: 11, color: "#444", fontFamily: "'Space Mono', monospace", marginTop: 4 }}>
                    {unitKeys.length} UNITS · {totalWords} WORDS · ⭐{totalStars}/{unitKeys.length * 3}
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
        <PortalLink style={{ marginTop: 8 }} />
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
        {tutorialOverlay}
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
              <p style={{ margin: 0, color: "#888", fontSize: 13 }}>ユニットを えらんでね（★1つで つぎが アンロック！）</p>
            </div>
          </div>
        </div>

        {/* Unit Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 480 }}>
          {unitKeys.map((unitKey, i) => {
            const words = selectedGrade.units[unitKey];
            const unitStorageKey = `${selectedGrade.key}_${unitKey}`;
            const stars = savedProgress.unitStars[unitStorageKey] || 0;
            const highScore = savedProgress.highScores[unitStorageKey] || 0;
            const wrongWords = savedProgress.wrongAnswers[unitStorageKey] || [];
            const unlocked = isUnitUnlocked(selectedGrade, i, unitKeys);
            const unitTitle = selectedGrade.unitTitles?.[unitKey] || "";
            return (
              <button
                key={unitKey}
                onClick={() => unlocked && selectGradeUnit(selectedGrade, unitKey)}
                disabled={!unlocked}
                style={{
                  background: "#111",
                  border: stars > 0 ? `1px solid ${selectedGrade.color}44` : "1px solid #222",
                  borderRadius: 14,
                  padding: "14px 18px",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  textAlign: "left",
                  transition: "all 0.2s",
                  opacity: unlocked ? 1 : 0.45,
                }}
                onMouseEnter={(e) => { if (unlocked) { e.currentTarget.style.borderColor = selectedGrade.color; e.currentTarget.style.background = "#161616"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = stars > 0 ? `${selectedGrade.color}44` : "#222"; e.currentTarget.style.background = "#111"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: stars > 0 ? `${selectedGrade.color}30` : `${selectedGrade.color}18`,
                    border: `1px solid ${selectedGrade.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: unlocked ? 14 : 18, fontWeight: 800, color: selectedGrade.color,
                    fontFamily: "'Space Mono', monospace", flexShrink: 0,
                  }}>
                    {unlocked ? String(i + 1).padStart(2, "0") : "🔒"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      Unit {String(i + 1).padStart(2, "0")}
                      {unitTitle && <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>{unitTitle}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", fontFamily: "'Space Mono', monospace", marginTop: 2 }}>
                      {words.length} WORDS
                      {highScore > 0 && <span style={{ color: "#f59e0b" }}> · BEST {highScore}</span>}
                      {wrongWords.length > 0 && <span style={{ color: "#f87171" }}> · {wrongWords.length} TO REVIEW</span>}
                    </div>
                  </div>
                  {/* 星表示 */}
                  <Stars count={stars} size={16} />
                  <div style={{ color: "#444", fontSize: 16 }}>›</div>
                </div>
                {unlocked ? (
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
                ) : (
                  <div style={{ marginTop: 10, marginLeft: 52, fontSize: 12, color: "#666" }}>
                    まえの ユニットで ★1つ とると あそべるよ！
                  </div>
                )}
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
    const unitStorageKey = `${selectedGrade?.key}_${selectedUnit}`;
    const highScore = savedProgress.highScores[unitStorageKey] || 0;
    return (
      <div style={{
        ...base,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, overflow: "hidden", position: "relative",
      }}>
        {fontLink}
        {tutorialOverlay}
        {firstWord && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${imgSrcs[firstWord.word] || firstWord.localImg})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.12, filter: "blur(20px)",
          }} />
        )}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 520 }}>
          <button
            onClick={() => setScreen("unitSelect")}
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: 2, marginBottom: 24, display: "block", marginLeft: "auto", marginRight: "auto" }}
          >
            ‹ BACK
          </button>

          <div style={{ fontSize: 10, letterSpacing: 6, color: "#555", fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            {selectedGrade?.label} · {selectedUnit} {selectedGrade?.unitTitles?.[selectedUnit] ? `· ${selectedGrade.unitTitles[selectedUnit]}` : ""}
          </div>
          <h1 style={{ fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: "0 0 8px 0", letterSpacing: -1 }}>
            Flash<span style={{ color: "#00d4aa" }}>Input</span>
          </h1>
          {highScore > 0 && (
            <div style={{ fontSize: 13, color: "#f59e0b", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>
              🏆 BEST SCORE: {highScore}
            </div>
          )}
          <p style={{ fontSize: 14, color: "#888", margin: "0 0 28px 0", lineHeight: 1.8 }}>
            {currentWords.length}この たんごに チャレンジ！<br />
            みて → きいて → おもいだして こたえよう
          </p>
          {teacherUnitKey === unitStorageKey && (
            <div style={{ fontSize: 12, color: "#00d4aa", fontWeight: 700, marginTop: -18, marginBottom: 20 }}>
              📌 きょうの ユニット（せんせいの してい）
            </div>
          )}

          {/* Thumbnail grid */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
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
          <SettingRow label="こたえかた" value={inputMode} onSelect={(v) => updateSetting("inputMode", v)}
            options={[{ label: "🔤 もじを ならべる", val: "tiles" }, { label: "⌨️ タイプする", val: "type" }]} />
          <SettingRow label="すすみかた" value={advanceMode} onSelect={(v) => updateSetting("advanceMode", v)}
            options={[{ label: "▶ じどう（おとの あと）", val: "auto" }, { label: "👆 じぶんで（ボタン）", val: "manual" }]} />
          <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginBottom: 28 }}>
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
              padding: "16px 36px", fontSize: 16, fontWeight: 800,
              border: "none", borderRadius: 14,
              background: "linear-gradient(135deg, #00d4aa, #00b894)",
              color: "#0a0a0a", cursor: "pointer", letterSpacing: 1,
            }}>
              ⚡ おぼえるモード
            </button>
            <button onClick={handleStartSpeedQuiz} style={{
              padding: "16px 36px", fontSize: 16, fontWeight: 800,
              border: "2px solid #f59e0b", borderRadius: 14,
              background: "transparent",
              color: "#f59e0b", cursor: "pointer", letterSpacing: 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.background = "#f59e0b"; e.target.style.color = "#0a0a0a"; }}
            onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#f59e0b"; }}
            >
              ⏱️ タイムアタック
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 14, lineHeight: 1.8, textAlign: "center" }}>
            おぼえるモード: じっくり 2しゅうで おぼえる<br/>
            タイムアタック: {SQ_TIME_LIMIT}びょう いないに こたえよう！はやいほど こうとくてん
          </div>
          <PortalLink style={{ marginTop: 18 }} />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // SCREEN: SPEED QUIZ（タイムアタック）
  // ══════════════════════════════════════════════════════════
  if (screen === "speedQuiz") {
    const sqWord = currentWords[wordIdx] || null;
    if (!sqWord) return null;
    const sqImgSrc = imgSrcs[sqWord.word] || sqWord.localImg;
    const sqProgress = currentWords.length > 0 ? (wordIdx / currentWords.length) : 0;
    const timePct = sqTimeLeft / SQ_TIME_LIMIT;
    const timeColor = timePct > 0.5 ? "#00d4aa" : timePct > 0.25 ? "#f59e0b" : "#f87171";

    const handleSpeedQuizAnswer = (submittedAnswer, timedOut = false) => {
      if (recallSubmitted) return;
      clearInterval(sqTimerRef.current);
      const answer = (submittedAnswer || "").trim().toLowerCase();
      const correct = !timedOut && answer === sqWord.word.toLowerCase();
      setRecallResult(correct ? "correct" : "wrong");
      setRecallSubmitted(true);
      setSessionTotal((t) => t + 1);
      setSqTimedOut(timedOut);
      if (timedOut) setSessionTimeouts((n) => n + 1);

      let nextCorrect = sessionCorrect;
      let nextScore = score;
      let nextMaxCombo = maxCombo;
      let nextWrong = sessionWrong;

      if (correct) {
        const newCombo = combo + 1;
        setCombo(newCombo);
        nextMaxCombo = Math.max(maxCombo, newCombo);
        setMaxCombo(nextMaxCombo);
        playCorrectSound(newCombo);
        const points = calcScore(newCombo - 1, sqTimeLeft);
        nextScore = score + points;
        setScore(nextScore);
        popupIdRef.current += 1;
        setScorePopup({ id: popupIdRef.current, points, combo: newCombo });
        nextCorrect = sessionCorrect + 1;
        setSessionCorrect(nextCorrect);
        speak(sqWord.word, 0.82);
      } else {
        playWrongSound();
        setCombo(0);
        if (window.WiseXP) window.WiseXP.reportWrong({ question: sqWord.japanese, correct: sqWord.word, playerAnswer: timedOut ? "(time up)" : answer });
        if (!sessionWrong.find((w) => w.word === sqWord.word)) {
          nextWrong = [...sessionWrong, sqWord];
          setSessionWrong(nextWrong);
        }
        setTimeout(() => { setReveal(true); speak(sqWord.word, 0.82); }, 500);
      }
      // Auto advance
      setTimeout(() => {
        setRecallInput(""); setRecallResult(null); setRecallSubmitted(false); setReveal(false);
        setScorePopup(null);
        if (wordIdx < currentWords.length - 1) {
          setSqTimeLeft(SQ_TIME_LIMIT);
          setWordIdx((w) => w + 1);
        } else {
          finishSession(nextCorrect, sessionTotal + 1, nextScore, nextMaxCombo, nextWrong);
        }
      }, correct ? 1200 : 2200);
    };

    const handleSpeedQuizSubmit = () => {
      if (!recallInput.trim()) return;
      handleSpeedQuizAnswer(recallInput);
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
        <ScorePopup popup={scorePopup} />
        <SpeedQuizTimer
          active={!recallSubmitted}
          wordIdx={wordIdx}
          timeLeft={sqTimeLeft}
          setTimeLeft={setSqTimeLeft}
          timerRef={sqTimerRef}
          onTimeout={() => handleSpeedQuizAnswer("", true)}
        />

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
            ✕ やめる
          </button>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#f59e0b", letterSpacing: 3 }}>
            ⏱️ TIME ATTACK
          </span>
          <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: "#f59e0b", letterSpacing: 1, fontWeight: 700 }}>
            {score}pt
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ padding: "0 20px 4px", position: "relative", zIndex: 10 }}>
          <div style={{ width: "100%", height: 3, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${sqProgress * 100}%`, background: "#f59e0b", borderRadius: 3, transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* Time bar */}
        <div style={{ padding: "4px 20px 8px", position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: timeColor, fontFamily: "'Space Mono', monospace", minWidth: 36, textAlign: "right" }}>
            {Math.ceil(sqTimeLeft)}s
          </span>
          <div style={{ flex: 1, height: 8, background: "#1a1a1a", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${timePct * 100}%`,
              background: timeColor, borderRadius: 4,
              transition: "width 0.1s linear, background 0.3s",
            }} />
          </div>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#444" }}>
            {wordIdx + 1}/{currentWords.length}
          </span>
        </div>

        {/* Combo */}
        {combo >= 2 && (
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "4px 20px" }}>
            <span style={{
              fontSize: 12, fontWeight: 800, color: combo >= 6 ? "#f59e0b" : "#ff6b6b",
              fontFamily: "'Space Mono', monospace", letterSpacing: 2,
              padding: "3px 12px", borderRadius: 6,
              background: combo >= 6 ? "#f59e0b18" : "#ff6b6b15",
            }}>
              🔥 {combo} COMBO!
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
              <div style={{
                width: "min(85vw, 400px)", aspectRatio: "16/10",
                borderRadius: 16, overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                marginBottom: 16, background: "#1a1a1a",
              }}>
                <img src={sqImgSrc} onError={() => handleImgError(sqWord.word, sqWord.fallbackImg)}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
              <div style={{ fontSize: 20, color: "#888", fontWeight: 600, marginBottom: 4 }}>{sqWord.japanese}</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 14 }}>
                {inputMode === "tiles" ? "もじを ならべて えいごに しよう！" : "えいごで タイプしよう！"}
              </div>
              <AnswerArea key={`sq-${wordIdx}-${sqWord.word}`} word={sqWord} inputMode={inputMode}
                value={recallInput} onChange={setRecallInput} onSubmit={handleSpeedQuizSubmit}
                inputRef={inputRef} accent="#f59e0b" accentDark="#d97706" />
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
                せいかい！ ✓
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              {!sqTimedOut && recallInput ? (
                <div style={{ fontSize: 16, color: "#f87171", fontWeight: 600, marginBottom: 8, textDecoration: "line-through" }}>
                  {recallInput}
                </div>
              ) : (
                <div style={{ fontSize: 14, color: "#f87171", fontWeight: 700, marginBottom: 8 }}>⏱️ タイムアップ！</div>
              )}
              <div style={{ fontSize: "clamp(40px, 10vw, 68px)", fontWeight: 900, color: reveal ? "#f59e0b" : "#f87171", letterSpacing: -2, transition: "color 0.3s" }}>
                {sqWord.word}
              </div>
              <div style={{ fontSize: 18, color: "#888", fontWeight: 600, marginTop: 8 }}>{sqWord.japanese}</div>
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
    const unitKeys = selectedGrade ? Object.keys(selectedGrade.units) : [];
    const currentUnitIndex = unitKeys.indexOf(selectedUnit);
    const nextUnitKey = currentUnitIndex >= 0 && currentUnitIndex < unitKeys.length - 1 ? unitKeys[currentUnitIndex + 1] : null;
    const unlockedNext = nextUnitKey && earnedStars >= 1;
    return (
      <div style={{ ...base, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
        {fontLink}

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
                  {isPerfect ? "パーフェクト！" : `すごい！ ${accuracy}%`}
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", maxWidth: 480 }}>
          {/* 星評価 */}
          <div style={{ marginBottom: 8 }}>
            <Stars count={earnedStars} size={40} animate />
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 6px 0" }}>
            {isPerfect ? "パーフェクト！" : isExcellent ? "すごい！" : earnedStars >= 1 ? "クリア！" : "おつかれさま！"}
          </h2>

          {/* スコア */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: "#f59e0b", fontFamily: "'Space Mono', monospace" }}>{score}</span>
            <span style={{ fontSize: 16, color: "#666", marginLeft: 6 }}>pt</span>
            {isNewRecord && score > 0 && (
              <div style={{
                display: "inline-block", marginLeft: 12,
                fontSize: 12, fontWeight: 800, color: "#0a0a0a",
                background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                padding: "4px 12px", borderRadius: 8, letterSpacing: 1,
                animation: "recordBlink 0.8s ease-in-out 3",
              }}>
                🏆 しんきろく！
              </div>
            )}
            <style>{`
              @keyframes recordBlink {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.12); }
              }
            `}</style>
          </div>

          {/* 次ユニット解放通知 */}
          {unlockedNext && (
            <div style={{
              fontSize: 14, color: "#00d4aa", fontWeight: 700,
              marginBottom: 16, padding: "8px 16px",
              background: "#00d4aa12", border: "1px solid #00d4aa33",
              borderRadius: 10, display: "inline-block",
            }}>
              🔓 つぎの ユニットが アンロックされたよ！
            </div>
          )}

          {/* Session Stats */}
          {sessionTotal > 0 && (
            <div style={{
              display: "flex", gap: 16, justifyContent: "center", marginBottom: 24, marginTop: 8,
              padding: "14px 20px", background: "#111", borderRadius: 12, border: "1px solid #222",
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#00d4aa" }}>{accuracy}%</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>せいかいりつ</div>
              </div>
              <div style={{ width: 1, background: "#222" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{sessionCorrect}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>せいかい</div>
              </div>
              <div style={{ width: 1, background: "#222" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#ff6b6b" }}>{maxCombo}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'Space Mono', monospace", letterSpacing: 2 }}>さいだいコンボ</div>
              </div>
            </div>
          )}
          {gameMode === "speedQuiz" && sessionTotal > sessionCorrect && (
            <div style={{ fontSize: 12, color: "#888", marginTop: -14, marginBottom: 20 }}>
              まちがい {sessionTotal - sessionCorrect - sessionTimeouts}こ ・ じかんぎれ {sessionTimeouts}こ
            </div>
          )}

          {/* Wrong answers review */}
          {sessionWrong.length > 0 && (
            <div style={{ marginBottom: 24, padding: "14px 16px", background: "#1a1010", borderRadius: 12, border: "1px solid #f8717133" }}>
              <div style={{ fontSize: 12, color: "#f87171", fontWeight: 700, marginBottom: 10 }}>
                もういちど れんしゅうしよう（タップで おとが きけるよ）
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {sessionWrong.map((w) => (
                  <button key={w.word} onClick={() => speak(w.word, 0.82)} style={{
                    padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                    background: "#f8717118", border: "1px solid #f8717133",
                    color: "#f87171", fontSize: 13, fontWeight: 700,
                  }}>
                    🔊 {w.word} <span style={{ color: "#666", fontSize: 11 }}>({w.japanese})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 32 }}>
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
              padding: "12px 28px", fontSize: 14, fontWeight: 700,
              border: "1px solid #333", borderRadius: 10,
              background: "transparent", color: "#fff", cursor: "pointer", letterSpacing: 1,
            }}>
              もういちど
            </button>
            {gameMode === "speedQuiz" ? (
              <button onClick={() => { setGameMode("flash"); handleStart(); }} style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 700,
                border: "1px solid #00d4aa44", borderRadius: 10,
                background: "#00d4aa12", color: "#00d4aa", cursor: "pointer", letterSpacing: 1,
              }}>
                ⚡ おぼえるモード
              </button>
            ) : (
              <button onClick={handleStartSpeedQuiz} style={{
                padding: "12px 28px", fontSize: 14, fontWeight: 700,
                border: "1px solid #f59e0b44", borderRadius: 10,
                background: "#f59e0b12", color: "#f59e0b", cursor: "pointer", letterSpacing: 1,
              }}>
                ⏱️ タイムアタック
              </button>
            )}
            <button onClick={() => setScreen("unitSelect")} style={{
              padding: "12px 28px", fontSize: 14, fontWeight: 700,
              border: "1px solid #00d4aa44", borderRadius: 10,
              background: "#00d4aa12", color: "#00d4aa", cursor: "pointer", letterSpacing: 1,
            }}>
              ユニットを えらぶ
            </button>
          </div>
          <PortalLink style={{ marginTop: 20 }} />

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
      <ScorePopup popup={scorePopup} />

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
          ✕ やめる
        </button>
        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: "#00d4aa", letterSpacing: 3 }}>
          {round === 1 ? "ラウンド 1／2" : "ラウンド 2／2 — もういちど"}
        </span>
        <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", color: "#f59e0b", letterSpacing: 1, fontWeight: 700 }}>
          {score}pt
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
      <div style={{ position: "relative", zIndex: 10, display: "flex", gap: 4, padding: "0 20px 8px", justifyContent: "center" }}>
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

      {/* 日本語フェーズガイド */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 20px 6px" }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: "#ccc",
          padding: "5px 16px", borderRadius: 20,
          background: "rgba(0,0,0,0.5)", border: "1px solid #333",
          display: "inline-block",
        }}>
          {phase.icon} {phase.guide}
        </span>
      </div>

      {/* COMBO COUNTER */}
      {combo >= 2 && (
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center", padding: "0 20px 8px",
        }}>
          <span style={{
            display: "inline-block",
            fontSize: 13, fontWeight: 800, fontFamily: "'Space Mono', monospace",
            color: combo >= 6 ? "#f59e0b" : "#ff6b6b",
            letterSpacing: 2,
            padding: "4px 14px", borderRadius: 8,
            background: combo >= 6 ? "#f59e0b18" : "#ff6b6b15",
            border: `1px solid ${combo >= 6 ? "#f59e0b44" : "#ff6b6b33"}`,
            animation: "streakPulse 1s ease-in-out infinite",
          }}>
            {"\uD83D\uDD25"} {combo} COMBO!
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
            <div style={{ fontSize: 14, color: "#bbb", fontWeight: 700 }}>
              これは えいごで なんて いうかな？ 🤔
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
            <div style={{ fontSize: 13, color: "#bbb", fontWeight: 700, marginTop: 14 }}>
              🔊 きこえたとおりに いってみよう！
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
            <div style={{ fontSize: 13, color: "#bbb", fontWeight: 700 }}>
              しゃしんと たんごを セットで おぼえよう 🧠
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
            <div style={{ fontSize: 13, color: "#bbb", fontWeight: 700 }}>
              👂 きいて まねして いってみよう
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
                <div style={{ fontSize: 22, color: "#888", fontWeight: 600, marginBottom: 6 }}>{word.japanese}</div>
                <div style={{ fontSize: 13, color: "#bbb", fontWeight: 700, marginBottom: 16 }}>
                  {inputMode === "tiles" ? "✏️ おもいだして もじを ならべよう！" : "✏️ おもいだして タイプしよう！"}
                </div>
                <AnswerArea key={`r${round}-${wordIdx}-${word.word}`} word={word} inputMode={inputMode}
                  value={recallInput} onChange={setRecallInput} onSubmit={handleRecallSubmit}
                  inputRef={inputRef} accent="#00d4aa" accentDark="#00b894" />
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
                  せいかい！ ✓
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
                <div style={{ fontSize: 18, color: "#888", fontWeight: 600, marginTop: 8 }}>{word.japanese}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: "#f87171",
                  marginTop: 16,
                  padding: "6px 16px", borderRadius: 8,
                  background: "#f8717115", border: "1px solid #f8717133",
                  display: "inline-block",
                }}>
                  だいじょうぶ！つぎで おぼえよう 💪
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* てどう送り・もういちど きく */}
      {(!isRecall || recallSubmitted) && !paused && (
        <div style={{ position: "relative", zIndex: 30, display: "flex", gap: 10, justifyContent: "center", padding: "0 20px 28px" }}>
          {!isRecall && (phase.id === "word" || phase.id === "sentence") && (
            <button onClick={(e) => { e.stopPropagation(); if (replayRef.current) replayRef.current(); }} style={{
              padding: "12px 18px", fontSize: 14, fontWeight: 700, borderRadius: 12,
              border: "1px solid #444", background: "rgba(0,0,0,0.55)", color: "#ddd", cursor: "pointer",
            }}>
              🔊 もういちど
            </button>
          )}
          <button onClick={handleManualNext} style={{
            padding: "12px 28px", fontSize: 15, fontWeight: 800, borderRadius: 12, cursor: "pointer",
            border: advanceMode === "manual" ? "none" : "1px solid #00d4aa66",
            background: advanceMode === "manual" ? "linear-gradient(135deg, #00d4aa, #00b894)" : "rgba(0,0,0,0.55)",
            color: advanceMode === "manual" ? "#0a0a0a" : "#00d4aa",
          }}>
            つぎへ ▶
          </button>
        </div>
      )}

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
          <div style={{ fontSize: 12, color: "#888", letterSpacing: 2, marginBottom: 16, fontWeight: 700 }}>いったん ストップ中</div>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", marginBottom: 12 }}>▶</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>がめんを タップすると つづきから！</div>
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
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#f87171"; e.target.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#333"; e.target.style.color = "#666"; }}
          >
            やめる
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// スピードクイズ用カウントダウンタイマー（内部コンポーネント）
// ─────────────────────────────────────────────────────────────
function SpeedQuizTimer({ active, wordIdx, timeLeft, setTimeLeft, timerRef, onTimeout }) {
  const timeoutFiredRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (!active) { clearInterval(timerRef.current); return; }
    timeoutFiredRef.current = false;
    const start = Date.now();
    const initial = SQ_TIME_LIMIT;
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, initial - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0 && !timeoutFiredRef.current) {
        timeoutFiredRef.current = true;
        clearInterval(timerRef.current);
        onTimeoutRef.current();
      }
    }, 100);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, wordIdx]);

  return null;
}
