"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Music helpers                                                      */
/* ------------------------------------------------------------------ */
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK_INDICES = new Set([1, 3, 6, 8, 10]);
const noteToMidi = (note: string, octave: number) => (octave + 1) * 12 + NOTE_NAMES.indexOf(note);
const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const midiName = (midi: number) => NOTE_NAMES[midi % 12];
const midiOctave = (midi: number) => Math.floor(midi / 12) - 1;
const isBlackMidi = (midi: number) => BLACK_INDICES.has(midi % 12);

type Pair = { note: string; octave: number };
const N = (s: string): Pair[] => s.split(/\s+/).filter(Boolean).map((t) => ({ note: t.slice(0, -1), octave: Number(t.slice(-1)) }));

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/*  NOTE: All song patterns below are ORIGINAL beginner exercises      */
/*  inspired by each artist's general style. They are NOT the actual   */
/*  copyrighted melodies of any song.                                  */
/* ------------------------------------------------------------------ */
interface Exercise { id: string; title: string; subtitle: string; notes: Pair[]; songId?: string; level?: number; lessonId?: string }

const LESSONS: { id: string; name: string; hint: string; notes: Pair[] }[] = [
  { id: "l1", name: "First 5 Notes", hint: "C D E F G — the beginning of everything", notes: N("C4 D4 E4 F4 G4") },
  { id: "l2", name: "Up & Down", hint: "Climb up and come back down", notes: N("C4 D4 E4 F4 G4 F4 E4 D4 C4") },
  { id: "l3", name: "Little Steps", hint: "A gentle first melody", notes: N("E4 D4 C4 D4 E4 E4 E4 D4 D4 D4 E4 G4 G4") },
  { id: "l4", name: "Twinkle Pattern", hint: "A calm, familiar shape", notes: N("C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4") },
  { id: "l5", name: "Joyful Theme", hint: "Smooth and happy", notes: N("E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4") },
];

interface Song { id: string; title: string; artist: string; emoji: string; levels: { name: string; notes: Pair[] }[] }
const SONGS: Song[] = [
  { id: "s1", title: "Acoustic Sunset", artist: "Ed Sheeran style", emoji: "🎸", levels: [
    { name: "Melody (Easy)", notes: N("C4 E4 G4 E4 C4 D4 E4 D4") },
    { name: "Fuller Version", notes: N("C4 E4 G4 E4 C4 D4 F4 E4 D4 C4 D4 E4 G4 E4 C4") } ] },
  { id: "s2", title: "Soulful Ballad", artist: "Adele style", emoji: "🎤", levels: [
    { name: "Melody (Easy)", notes: N("E4 G4 A4 G4 E4 D4 C4") },
    { name: "Fuller Version", notes: N("E4 G4 A4 G4 F4 E4 D4 C4 D4 E4 D4 C4") } ] },
  { id: "s3", title: "Feel-Good Groove", artist: "Bruno Mars style", emoji: "🕺", levels: [
    { name: "Melody (Easy)", notes: N("G4 G4 A4 G4 F4 E4") },
    { name: "Fuller Version", notes: N("G4 G4 A4 G4 F4 E4 F4 G4 E4 C4 D4 E4") } ] },
  { id: "s4", title: "Whisper Pop", artist: "Billie Eilish style", emoji: "🌙", levels: [
    { name: "Melody (Easy)", notes: N("E4 D4 C4 D4 E4 E4") },
    { name: "Fuller Version", notes: N("E4 D4 C4 D4 E4 E4 D4 C4 B4 C4 D4 C4") } ] },
  { id: "s5", title: "Storyteller", artist: "Taylor Swift style", emoji: "✨", levels: [
    { name: "Melody (Easy)", notes: N("C4 D4 E4 G4 E4 D4") },
    { name: "Fuller Version", notes: N("C4 D4 E4 G4 E4 D4 C4 E4 G4 A4 G4 E4") } ] },
  { id: "s6", title: "Sky Full of Light", artist: "Coldplay style", emoji: "🌌", levels: [
    { name: "Melody (Easy)", notes: N("G4 A4 G4 E4 C4") },
    { name: "Fuller Version", notes: N("G4 A4 G4 E4 C4 D4 E4 G4 A4 G4 E4 D4") } ] },
  { id: "s7", title: "Counting Steps", artist: "OneRepublic style", emoji: "🥁", levels: [
    { name: "Melody (Easy)", notes: N("C4 E4 D4 F4 E4 G4") },
    { name: "Fuller Version", notes: N("C4 E4 D4 F4 E4 G4 F4 A4 G4 E4 C4") } ] },
  { id: "s8", title: "Heartfelt", artist: "Lewis Capaldi style", emoji: "💛", levels: [
    { name: "Melody (Easy)", notes: N("A4 G4 E4 G4 A4") },
    { name: "Fuller Version", notes: N("A4 G4 E4 G4 A4 C5 A4 G4 E4 D4 C4") } ] },
  { id: "s9", title: "Neon Nights", artist: "The Weeknd style", emoji: "🌆", levels: [
    { name: "Melody (Easy)", notes: N("E4 G4 A4 C5 A4 G4") },
    { name: "Fuller Version", notes: N("E4 G4 A4 C5 A4 G4 E4 D4 E4 G4 E4 C4") } ] },
];

const KEY_OFFSETS: Record<string, number> = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ";": 16 };
const UNLOCK_ACCURACY = 70;

type ProgressMap = Record<string, { best: Record<number, number>; completed: number[] }>;

/* ------------------------------------------------------------------ */
export default function PianoSimulator() {
  const OCTAVES = 2;
  const [baseOctave, setBaseOctave] = useState(4);
  const [volume, setVolume] = useState(0.7);
  const [showNames, setShowNames] = useState(true);

  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [wrongKey, setWrongKey] = useState<number | null>(null);

  const [tab, setTab] = useState<"songs" | "basics" | "progress">("songs");
  const [ex, setEx] = useState<Exercise | null>(null);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Choose a song and I'll teach it to you note by note. 🎹");

  const [isPlaying, setIsPlaying] = useState(false);
  const [demoMidi, setDemoMidi] = useState<number | null>(null);
  const [speed, setSpeed] = useState<"slow" | "normal">("slow");

  const [metronome, setMetronome] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [beat, setBeat] = useState(false);

  const [progress, setProgress] = useState<ProgressMap>({});

  const audioRef = useRef<AudioContext | null>(null);
  const volumeRef = useRef(volume);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metroTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyboardDown = useRef<Set<string>>(new Set());

  useEffect(() => { volumeRef.current = volume; }, [volume]);

  /* progress persistence */
  useEffect(() => {
    try { const raw = localStorage.getItem("piano_progress"); if (raw) setProgress(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("piano_progress", JSON.stringify(progress)); } catch { /* ignore */ }
  }, [progress]);

  const midis = ex ? ex.notes.map((n) => noteToMidi(n.note, n.octave)) : [];
  const completed = !!ex && step >= midis.length;
  const target = ex && !isPlaying && !completed ? midis[step] : null;
  const accuracy = ex ? Math.round((midis.length / (midis.length + mistakes)) * 100) : 0;
  const stars = accuracy >= 95 ? 3 : accuracy >= 80 ? 2 : 1;
  const progressPct = ex ? Math.round((Math.min(step, midis.length) / midis.length) * 100) : 0;

  const isLevelUnlocked = useCallback(
    (songId: string, level: number) => level === 0 || (progress[songId]?.best?.[level - 1] ?? 0) >= UNLOCK_ACCURACY,
    [progress],
  );

  /* --- audio --- */
  const getCtx = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioRef.current = new Ctx();
    }
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  }, []);

  const playTone = useCallback((midi: number) => {
    const ctx = getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = midiToFreq(midi);
    const master = ctx.createGain();
    master.gain.value = Math.max(0.0001, volumeRef.current);
    master.connect(ctx.destination);
    const env = ctx.createGain();
    env.connect(master);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(1, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);
    const partials: [number, number, OscillatorType][] = [[1, 1, "triangle"], [2, 0.45, "sine"], [3, 0.2, "sine"], [4, 0.1, "sine"]];
    partials.forEach(([mult, g, type]) => {
      const o = ctx.createOscillator();
      o.type = type; o.frequency.value = freq * mult;
      const pg = ctx.createGain(); pg.gain.value = g;
      o.connect(pg); pg.connect(env); o.start(now); o.stop(now + 1.8);
    });
  }, [getCtx]);

  const flashActive = useCallback((midi: number, ms = 220) => {
    setActiveKeys((prev) => new Set(prev).add(midi));
    setTimeout(() => setActiveKeys((prev) => { const n = new Set(prev); n.delete(midi); return n; }), ms);
  }, []);

  const recordCompletion = useCallback((songId: string, level: number, acc: number) => {
    setProgress((prev) => {
      const cur = prev[songId] || { best: {}, completed: [] };
      return {
        ...prev,
        [songId]: {
          best: { ...cur.best, [level]: Math.max(cur.best[level] || 0, acc) },
          completed: cur.completed.includes(level) ? cur.completed : [...cur.completed, level],
        },
      };
    });
  }, []);

  /* --- press a key --- */
  const pressKey = useCallback((midi: number) => {
    playTone(midi);
    flashActive(midi);
    if (!ex || isPlaying || completed) return;
    if (midi === midis[step]) {
      const nextStep = step + 1;
      setScore((s) => s + 10);
      setStep(nextStep);
      if (nextStep >= midis.length) {
        const acc = Math.round((midis.length / (midis.length + mistakes)) * 100);
        if (ex.songId && ex.level != null) {
          recordCompletion(ex.songId, ex.level, acc);
          const song = SONGS.find((s) => s.id === ex.songId);
          const hasNext = song && ex.level + 1 < song.levels.length;
          setMessage(hasNext && acc >= UNLOCK_ACCURACY ? "🔓 Great — next level unlocked!" : "🎉 Song complete!");
        } else {
          setMessage("🎉 Lesson complete!");
        }
      } else {
        setMessage("Nice! Keep going.");
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongKey(midi);
      setMessage("Almost! Press the glowing green key.");
      setTimeout(() => setWrongKey(null), 420);
    }
  }, [playTone, flashActive, ex, isPlaying, completed, midis, step, mistakes, recordCompletion]);

  /* --- computer keyboard --- */
  useEffect(() => {
    const lowC = noteToMidi("C", baseOctave);
    const onDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();
      if (!(k in KEY_OFFSETS) || keyboardDown.current.has(k)) return;
      keyboardDown.current.add(k);
      pressKey(lowC + KEY_OFFSETS[k]);
    };
    const onUp = (e: KeyboardEvent) => keyboardDown.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [baseOctave, pressKey]);

  /* --- metronome --- */
  useEffect(() => {
    if (!metronome) { if (metroTimer.current) clearInterval(metroTimer.current); setBeat(false); return; }
    const tick = () => {
      const ctx = getCtx();
      if (ctx) {
        const now = ctx.currentTime;
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.frequency.value = 1100;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.25 * volumeRef.current + 0.05, now + 0.001);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now + 0.06);
      }
      setBeat((b) => !b);
    };
    tick();
    metroTimer.current = setInterval(tick, 60000 / bpm);
    return () => { if (metroTimer.current) clearInterval(metroTimer.current); };
  }, [metronome, bpm, getCtx]);

  /* --- demo (Play / Listen) --- */
  const stopDemo = useCallback(() => {
    if (demoTimer.current) clearTimeout(demoTimer.current);
    demoTimer.current = null; setIsPlaying(false); setDemoMidi(null);
  }, []);

  const startDemo = useCallback(() => {
    if (!ex) return;
    stopDemo(); setIsPlaying(true);
    const seq = ex.notes.map((n) => noteToMidi(n.note, n.octave));
    const gap = speed === "slow" ? 850 : 500;
    let i = 0;
    const next = () => {
      if (i >= seq.length) { stopDemo(); setMessage("That's the tune! Now play it yourself. 🎹"); return; }
      const m = seq[i]; setDemoMidi(m); playTone(m); i += 1;
      demoTimer.current = setTimeout(next, gap);
    };
    next();
  }, [ex, speed, playTone, stopDemo]);

  /* --- start / restart --- */
  const startExercise = useCallback((exercise: Exercise) => {
    stopDemo(); setEx(exercise); setStep(0); setScore(0); setMistakes(0); setBaseOctave(4);
    setMessage("Follow the glowing green key — press it to move to the next note!");
  }, [stopDemo]);

  const restart = useCallback(() => {
    stopDemo(); setStep(0); setScore(0); setMistakes(0);
    setMessage(ex ? "Restarted — follow the green key!" : "Pick a song to begin.");
  }, [stopDemo, ex]);

  const selectLesson = (l: (typeof LESSONS)[number]) =>
    startExercise({ id: `lesson:${l.id}`, title: l.name, subtitle: l.hint, notes: l.notes, lessonId: l.id });
  const selectSong = (song: Song, level: number) => {
    if (!isLevelUnlocked(song.id, level)) return;
    startExercise({ id: `song:${song.id}:${level}`, title: `${song.title}`, subtitle: `${song.artist} · ${song.levels[level].name}`, notes: song.levels[level].notes, songId: song.id, level });
  };

  useEffect(() => () => { stopDemo(); if (metroTimer.current) clearInterval(metroTimer.current); }, [stopDemo]);

  /* --- next level / lesson for completion screen --- */
  const song = ex?.songId ? SONGS.find((s) => s.id === ex.songId) : undefined;
  const nextLevel = song && ex?.level != null && ex.level + 1 < song.levels.length ? ex.level + 1 : null;
  const nextLevelUnlocked = song && nextLevel != null ? isLevelUnlocked(song.id, nextLevel) : false;
  const lessonIdx = ex?.lessonId ? LESSONS.findIndex((l) => l.id === ex.lessonId) : -1;
  const nextLesson = lessonIdx >= 0 ? LESSONS[lessonIdx + 1] : undefined;

  /* --- keys --- */
  const startMidi = noteToMidi("C", baseOctave);
  const endMidi = noteToMidi("B", baseOctave + OCTAVES - 1);
  const whites: { midi: number }[] = [];
  const blacks: { midi: number; boundary: number }[] = [];
  let whiteCount = 0;
  for (let m = startMidi; m <= endMidi; m++) {
    if (isBlackMidi(m)) blacks.push({ midi: m, boundary: whiteCount });
    else { whites.push({ midi: m }); whiteCount += 1; }
  }
  const totalWhites = whites.length;

  const songsDone = Object.values(progress).filter((s) => s.completed.length > 0).length;

  /* ---------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-3 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">🎹 Piano — Learn Pop Songs</h1>
          <p className="mt-1 text-sm text-slate-400">Pick a song → I teach it slowly → you play it → you improve.</p>
        </header>

        {/* NOW PLAYING banner */}
        {ex ? (
          <section className="mb-4 rounded-2xl bg-slate-800/70 p-4 ring-1 ring-white/10">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{ex.title}</span>
              <span>{ex.subtitle}</span>
            </div>

            {!completed ? (
              <>
                <div className="rounded-2xl bg-slate-900 py-5 text-center">
                  <p className="text-sm text-slate-400">{isPlaying ? "Listen and watch the keys…" : "Now play"}</p>
                  <p className="mt-1 text-5xl font-black tracking-wide text-emerald-400 sm:text-6xl">
                    Play <span data-testid="next-note">{midiName(midis[step])}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Press the glowing green key below 👇</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {!isPlaying ? (
                    <button onClick={startDemo} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400">▶ Play (Listen)</button>
                  ) : (
                    <button onClick={stopDemo} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium hover:bg-amber-400">⏸ Pause</button>
                  )}
                  <button onClick={restart} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-600">↺ Restart</button>
                  {/* speed */}
                  <span className="ml-1 inline-flex overflow-hidden rounded-lg ring-1 ring-white/10">
                    <button onClick={() => setSpeed("slow")} className={`px-3 py-2 text-xs font-medium ${speed === "slow" ? "bg-emerald-500 text-white" : "bg-slate-700"}`}>Slow</button>
                    <button onClick={() => setSpeed("normal")} className={`px-3 py-2 text-xs font-medium ${speed === "normal" ? "bg-emerald-500 text-white" : "bg-slate-700"}`}>Normal</button>
                  </span>
                  <span data-testid="score" className="ml-1 text-xs text-slate-400">Note {Math.min(step + 1, midis.length)} of {midis.length} · Score {score}</span>
                </div>
                <div className="mx-auto mt-3 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </>
            ) : (
              <div data-testid="lesson-complete" className="rounded-2xl bg-slate-900 py-6 text-center">
                <p className="text-4xl">🎉</p>
                <p className="mt-2 text-2xl font-bold text-emerald-400">{ex.songId ? "Song" : "Lesson"} Complete!</p>
                <p className="mt-1 text-3xl tracking-widest">{"⭐".repeat(stars)}<span className="opacity-20">{"⭐".repeat(3 - stars)}</span></p>
                <div className="mt-3 flex items-center justify-center gap-6 text-sm">
                  <span>Accuracy <b data-testid="accuracy" className="text-lg text-emerald-400">{accuracy}%</b></span>
                  <span>Notes <b className="text-lg">{midis.length}</b></span>
                  <span>Score <b className="text-lg">{score}</b></span>
                </div>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button onClick={restart} className="rounded-lg bg-emerald-500 px-5 py-2.5 font-semibold text-white hover:bg-emerald-400">↺ Practice Again</button>
                  {nextLevel != null && song ? (
                    nextLevelUnlocked ? (
                      <button onClick={() => selectSong(song, nextLevel)} className="rounded-lg bg-indigo-500 px-5 py-2.5 font-semibold text-white hover:bg-indigo-400">Next Level: {song.levels[nextLevel].name} →</button>
                    ) : (
                      <span className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm text-slate-400">Reach {UNLOCK_ACCURACY}% to unlock the next level</span>
                    )
                  ) : nextLesson ? (
                    <button onClick={() => selectLesson(nextLesson)} className="rounded-lg bg-indigo-500 px-5 py-2.5 font-semibold text-white hover:bg-indigo-400">Next Lesson →</button>
                  ) : null}
                  <button onClick={() => { stopDemo(); setEx(null); setMessage("Pick another song!"); }} className="rounded-lg bg-slate-700 px-5 py-2.5 font-semibold hover:bg-slate-600">Choose another</button>
                </div>
              </div>
            )}
            {!completed ? <p className="mt-3 text-center text-sm text-slate-300">{message}</p> : null}
          </section>
        ) : null}

        {/* Tabs */}
        <div className="mb-3 flex justify-center gap-2">
          {([["songs", "🎵 Songs"], ["basics", "🔰 Basics"], ["progress", "📈 My Progress"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === t ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>{label}</button>
          ))}
        </div>

        {/* SONGS */}
        {tab === "songs" ? (
          <section className="mb-4 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SONGS.map((s) => {
                const done = progress[s.id]?.completed ?? [];
                const best = progress[s.id]?.best ?? {};
                return (
                  <div key={s.id} className="rounded-xl bg-slate-900 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{s.title}</p>
                        <p className="truncate text-xs text-slate-400">{s.artist}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col gap-2">
                      {s.levels.map((lv, i) => {
                        const unlocked = isLevelUnlocked(s.id, i);
                        return (
                          <button key={i} disabled={!unlocked} onClick={() => selectSong(s, i)}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${unlocked ? "bg-slate-700 hover:bg-indigo-500" : "cursor-not-allowed bg-slate-800 text-slate-500"}`}>
                            <span>{unlocked ? (i === 0 ? "▶ " : "🎶 ") : "🔒 "}{lv.name}</span>
                            <span className="flex items-center gap-1">
                              {done.includes(i) ? <span className="text-emerald-400">✓</span> : null}
                              {best[i] ? <span className="text-slate-400">{best[i]}%</span> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
              These are original beginner practice patterns inspired by each artist&apos;s style — not the actual songs.
              Start with the easy melody; the fuller version unlocks when you reach {UNLOCK_ACCURACY}% accuracy.
            </p>
          </section>
        ) : null}

        {/* BASICS */}
        {tab === "basics" ? (
          <section className="mb-4 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
            <p className="mb-3 text-sm text-slate-300">New to piano? Start here — learn the first notes step by step.</p>
            <div className="flex flex-wrap gap-2">
              {LESSONS.map((l) => (
                <button key={l.id} onClick={() => selectLesson(l)} className="rounded-full bg-slate-700 px-4 py-2 text-xs font-medium hover:bg-emerald-500">{l.name}</button>
              ))}
              <button onClick={() => { stopDemo(); setEx(null); setMessage("Free play — explore any key."); }} className="rounded-full bg-slate-700 px-4 py-2 text-xs font-medium hover:bg-indigo-500">🎹 Free Play</button>
            </div>
          </section>
        ) : null}

        {/* MY PROGRESS */}
        {tab === "progress" ? (
          <section className="mb-4 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">My Progress</h2>
              <span data-testid="songs-done" className="text-sm text-slate-300">Songs completed: <b className="text-emerald-400">{songsDone}</b> / {SONGS.length}</span>
            </div>
            <div className="space-y-2">
              {SONGS.map((s) => {
                const p = progress[s.id];
                const bestAcc = p ? Math.max(0, ...Object.values(p.best)) : 0;
                const doneCount = p?.completed.length ?? 0;
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2">{s.emoji} {s.title} <span className="text-xs text-slate-500">· {s.artist}</span></span>
                    <span className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">{doneCount}/{s.levels.length} levels</span>
                      {bestAcc > 0 ? <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">Best {bestAcc}%</span> : <span className="text-slate-600">not started</span>}
                    </span>
                  </div>
                );
              })}
            </div>
            {songsDone > 0 ? (
              <button onClick={() => { if (confirm("Reset all progress?")) setProgress({}); }} className="mt-3 text-xs text-slate-500 underline hover:text-slate-300">Reset progress</button>
            ) : null}
          </section>
        ) : null}

        {/* Controls */}
        <section className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Octave</span>
            <button onClick={() => setBaseOctave((o) => Math.max(1, o - 1))} className="h-8 w-8 rounded-lg bg-slate-700 text-lg hover:bg-slate-600">−</button>
            <span className="w-14 text-center text-sm font-semibold">C{baseOctave}–B{baseOctave + OCTAVES - 1}</span>
            <button onClick={() => setBaseOctave((o) => Math.min(6, o + 1))} className="h-8 w-8 rounded-lg bg-slate-700 text-lg hover:bg-slate-600">+</button>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Volume</span>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-28 accent-indigo-400" />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
            <input type="checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} className="h-4 w-4 accent-indigo-400" />
            Show note names
          </label>
          <div className="flex items-center gap-2">
            <button onClick={() => setMetronome((m) => !m)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${metronome ? "bg-rose-500 hover:bg-rose-400" : "bg-slate-700 hover:bg-slate-600"}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${metronome && beat ? "bg-white" : "bg-white/30"}`} />
              Metronome
            </button>
            <input type="range" min={40} max={200} step={1} value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="w-24 accent-rose-400" />
            <span className="w-14 text-xs text-slate-400">{bpm} BPM</span>
          </div>
        </section>

        {/* Keyboard */}
        <section className="overflow-x-auto rounded-2xl bg-slate-800/60 p-3 ring-1 ring-white/10">
          <div className="relative mx-auto select-none" style={{ minWidth: totalWhites * 46, height: 190 }}>
            <div className="flex h-full w-full gap-[3px]">
              {whites.map(({ midi }) => {
                const isActive = activeKeys.has(midi), isTarget = target === midi, isWrong = wrongKey === midi, isDemo = demoMidi === midi;
                return (
                  <button key={midi} data-midi={midi} onPointerDown={(e) => { e.preventDefault(); pressKey(midi); }}
                    className={`relative flex flex-1 items-end justify-center rounded-b-lg border border-slate-300 pb-2 transition-colors duration-75
                      ${isWrong ? "bg-rose-400" : isTarget ? "bg-emerald-100 ring-4 ring-emerald-400" : isDemo ? "bg-indigo-200" : isActive ? "bg-indigo-100" : "bg-white"}`}>
                    {showNames ? <span className={`text-xs font-semibold ${isTarget ? "text-emerald-700" : "text-slate-500"}`}>{midiName(midi)}<span className="text-[9px] text-slate-400">{midiOctave(midi)}</span></span> : null}
                  </button>
                );
              })}
            </div>
            {blacks.map(({ midi, boundary }) => {
              const isActive = activeKeys.has(midi), isTarget = target === midi, isWrong = wrongKey === midi, isDemo = demoMidi === midi;
              return (
                <button key={midi} data-midi={midi} onPointerDown={(e) => { e.preventDefault(); pressKey(midi); }}
                  style={{ left: `${(boundary / totalWhites) * 100}%`, width: `${(100 / totalWhites) * 0.62}%`, transform: "translateX(-50%)" }}
                  className={`absolute top-0 z-10 flex h-[62%] items-end justify-center rounded-b-md pb-1 text-[9px] font-semibold text-white shadow-lg transition-colors duration-75
                    ${isWrong ? "bg-rose-500" : isTarget ? "bg-emerald-500 ring-4 ring-emerald-300" : isDemo ? "bg-indigo-500" : isActive ? "bg-indigo-600" : "bg-slate-900"}`}>
                  {showNames ? midiName(midi) : null}
                </button>
              );
            })}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Tip: on a computer you can also play with your keyboard — <b>A S D F G H J</b> for white keys, <b>W E T Y U</b> for black keys.
        </p>
      </div>
    </main>
  );
}
