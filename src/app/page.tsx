"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Music helpers                                                      */
/* ------------------------------------------------------------------ */
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BLACK_INDICES = new Set([1, 3, 6, 8, 10]);

function noteToMidi(note: string, octave: number): number {
  return (octave + 1) * 12 + NOTE_NAMES.indexOf(note);
}
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
function midiName(midi: number): string {
  return NOTE_NAMES[midi % 12];
}
function midiOctave(midi: number): number {
  return Math.floor(midi / 12) - 1;
}
function isBlackMidi(midi: number): boolean {
  return BLACK_INDICES.has(midi % 12);
}

/* ------------------------------------------------------------------ */
/*  Lessons                                                            */
/* ------------------------------------------------------------------ */
interface Lesson {
  id: string;
  name: string;
  hint: string;
  notes: { note: string; octave: number }[];
}
const N = (s: string): { note: string; octave: number }[] =>
  s.split(" ").map((t) => ({ note: t.slice(0, -1), octave: Number(t.slice(-1)) }));

const LESSONS: Lesson[] = [
  { id: "l1", name: "First 5 Notes", hint: "C D E F G — the beginning of everything", notes: N("C4 D4 E4 F4 G4") },
  { id: "l2", name: "Up & Down", hint: "Climb up and come back down", notes: N("C4 D4 E4 F4 G4 F4 E4 D4 C4") },
  { id: "l3", name: "Mary Had a Little Lamb", hint: "A gentle first melody", notes: N("E4 D4 C4 D4 E4 E4 E4 D4 D4 D4 E4 G4 G4") },
  { id: "l4", name: "Twinkle Twinkle", hint: "Everyone's favourite", notes: N("C4 C4 G4 G4 A4 A4 G4 F4 F4 E4 E4 D4 D4 C4") },
  { id: "l5", name: "Ode to Joy", hint: "Beethoven made easy", notes: N("E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4 D4 D4") },
];

/* Computer keyboard → semitone offset from the low C on screen */
const KEY_OFFSETS: Record<string, number> = {
  a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11,
  k: 12, o: 13, l: 14, p: 15, ";": 16,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function PianoSimulator() {
  const OCTAVES = 2;
  const [baseOctave, setBaseOctave] = useState(4);
  const [volume, setVolume] = useState(0.7);
  const [showNames, setShowNames] = useState(true);

  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [wrongKey, setWrongKey] = useState<number | null>(null);

  const [lessonId, setLessonId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Pick a lesson to start learning, or just tap the keys to explore.");

  const [isPlaying, setIsPlaying] = useState(false);
  const [demoMidi, setDemoMidi] = useState<number | null>(null);

  const [metronome, setMetronome] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [beat, setBeat] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const volumeRef = useRef(volume);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metroTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const keyboardDown = useRef<Set<string>>(new Set());

  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const lesson = LESSONS.find((l) => l.id === lessonId) || null;
  const lessonMidis = lesson ? lesson.notes.map((n) => noteToMidi(n.note, n.octave)) : [];
  const targetMidi = lesson && !isPlaying && step < lessonMidis.length ? lessonMidis[step] : null;

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

  const playTone = useCallback(
    (midi: number) => {
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

      const partials: [number, number, OscillatorType][] = [
        [1, 1, "triangle"], [2, 0.45, "sine"], [3, 0.2, "sine"], [4, 0.1, "sine"],
      ];
      partials.forEach(([mult, g, type]) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = freq * mult;
        const pg = ctx.createGain();
        pg.gain.value = g;
        o.connect(pg);
        pg.connect(env);
        o.start(now);
        o.stop(now + 1.8);
      });
    },
    [getCtx],
  );

  const flashActive = useCallback((midi: number, ms = 220) => {
    setActiveKeys((prev) => new Set(prev).add(midi));
    setTimeout(() => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
    }, ms);
  }, []);

  /* --- press a key (practice logic lives here) --- */
  const pressKey = useCallback(
    (midi: number) => {
      playTone(midi);
      flashActive(midi);
      if (!lesson || isPlaying) return;

      const expected = lessonMidis[step];
      if (midi === expected) {
        const nextStep = step + 1;
        setScore((s) => s + 10);
        if (nextStep >= lessonMidis.length) {
          setStep(nextStep);
          setMessage("🎉 Lesson complete! Great job. Press Restart to practise again.");
        } else {
          setStep(nextStep);
          setMessage("Nice! Keep going.");
        }
      } else {
        setMistakes((m) => m + 1);
        setWrongKey(midi);
        setMessage("Almost! Press the green highlighted key.");
        setTimeout(() => setWrongKey(null), 420);
      }
    },
    [playTone, flashActive, lesson, isPlaying, lessonMidis, step],
  );

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
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [baseOctave, pressKey]);

  /* --- metronome --- */
  useEffect(() => {
    if (!metronome) {
      if (metroTimer.current) clearInterval(metroTimer.current);
      setBeat(false);
      return;
    }
    const tick = () => {
      const ctx = getCtx();
      if (ctx) {
        const now = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 1100;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.25 * volumeRef.current + 0.05, now + 0.001);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.06);
      }
      setBeat((b) => !b);
    };
    tick();
    metroTimer.current = setInterval(tick, 60000 / bpm);
    return () => { if (metroTimer.current) clearInterval(metroTimer.current); };
  }, [metronome, bpm, getCtx]);

  /* --- lesson demo (Listen) --- */
  const stopDemo = useCallback(() => {
    if (demoTimer.current) clearTimeout(demoTimer.current);
    demoTimer.current = null;
    setIsPlaying(false);
    setDemoMidi(null);
  }, []);

  const startDemo = useCallback(() => {
    if (!lesson) return;
    stopDemo();
    setIsPlaying(true);
    const midis = lesson.notes.map((n) => noteToMidi(n.note, n.octave));
    const gap = Math.max(320, 60000 / bpm);
    let i = 0;
    const playNext = () => {
      if (i >= midis.length) { stopDemo(); setMessage("That's the tune! Now play it yourself. 🎹"); return; }
      const m = midis[i];
      setDemoMidi(m);
      playTone(m);
      i += 1;
      demoTimer.current = setTimeout(playNext, gap);
    };
    playNext();
  }, [lesson, bpm, playTone, stopDemo]);

  const selectLesson = useCallback((id: string) => {
    stopDemo();
    setLessonId(id);
    setStep(0);
    setScore(0);
    setMistakes(0);
    setBaseOctave(4);
    setMessage("Follow the green key. Press it to move to the next note!");
  }, [stopDemo]);

  const restart = useCallback(() => {
    stopDemo();
    setStep(0);
    setScore(0);
    setMistakes(0);
    setMessage(lesson ? "Restarted. Follow the green key!" : "Pick a lesson to begin.");
  }, [stopDemo, lesson]);

  useEffect(() => () => { stopDemo(); if (metroTimer.current) clearInterval(metroTimer.current); }, [stopDemo]);

  /* --- build keys for the visible range --- */
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

  const progressPct = lesson ? Math.round((Math.min(step, lessonMidis.length) / lessonMidis.length) * 100) : 0;

  /* ---------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-3 py-5 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-5 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">🎹 Piano Learning Simulator</h1>
          <p className="mt-1 text-sm text-slate-400">Learn piano from zero — tap the keys, follow the lessons.</p>
        </header>

        {/* Lessons */}
        <section className="mb-4 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">Beginner Lessons:</span>
            <button
              onClick={() => { stopDemo(); setLessonId(null); setMessage("Free play — explore any key."); }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${!lessonId ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}
            >
              Free Play
            </button>
            {LESSONS.map((l) => (
              <button
                key={l.id}
                onClick={() => selectLesson(l.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${lessonId === l.id ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}
              >
                {l.name}
              </button>
            ))}
          </div>

          {lesson ? (
            <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center rounded-xl bg-slate-900 px-4 py-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Next note</span>
                  <span data-testid="next-note" className="text-3xl font-bold text-emerald-400">
                    {step < lessonMidis.length ? midiName(lessonMidis[step]) : "✓"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!isPlaying ? (
                    <button onClick={startDemo} className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium hover:bg-indigo-400">▶ Listen</button>
                  ) : (
                    <button onClick={stopDemo} className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium hover:bg-amber-400">⏸ Pause</button>
                  )}
                  <button onClick={restart} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium hover:bg-slate-600">↺ Restart</button>
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                  <span>{lesson.hint}</span>
                  <span data-testid="score">Score: <b className="text-slate-100">{score}</b> · Progress {progressPct}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          ) : null}
          <p className="mt-3 text-center text-sm text-slate-300">{message}</p>
        </section>

        {/* Controls */}
        <section className="mb-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl bg-slate-800/60 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Octave</span>
            <button onClick={() => setBaseOctave((o) => Math.max(1, o - 1))} className="h-8 w-8 rounded-lg bg-slate-700 text-lg hover:bg-slate-600">−</button>
            <span className="w-12 text-center text-sm font-semibold">C{baseOctave}–B{baseOctave + OCTAVES - 1}</span>
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
            <button
              onClick={() => setMetronome((m) => !m)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${metronome ? "bg-rose-500 hover:bg-rose-400" : "bg-slate-700 hover:bg-slate-600"}`}
            >
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
            {/* white keys */}
            <div className="flex h-full w-full gap-[3px]">
              {whites.map(({ midi }) => {
                const isActive = activeKeys.has(midi);
                const isTarget = targetMidi === midi;
                const isWrong = wrongKey === midi;
                const isDemo = demoMidi === midi;
                return (
                  <button
                    key={midi}
                    data-midi={midi}
                    onPointerDown={(e) => { e.preventDefault(); pressKey(midi); }}
                    className={`relative flex flex-1 items-end justify-center rounded-b-lg border border-slate-300 pb-2 transition-colors duration-75
                      ${isWrong ? "bg-rose-400" : isTarget ? "bg-emerald-100 ring-4 ring-emerald-400" : isDemo ? "bg-indigo-200" : isActive ? "bg-indigo-100" : "bg-white"}`}
                  >
                    {showNames ? (
                      <span className={`text-xs font-semibold ${isTarget ? "text-emerald-700" : "text-slate-500"}`}>
                        {midiName(midi)}
                        <span className="text-[9px] text-slate-400">{midiOctave(midi)}</span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {/* black keys */}
            {blacks.map(({ midi, boundary }) => {
              const isActive = activeKeys.has(midi);
              const isTarget = targetMidi === midi;
              const isWrong = wrongKey === midi;
              const isDemo = demoMidi === midi;
              const leftPct = (boundary / totalWhites) * 100;
              const widthPct = (100 / totalWhites) * 0.62;
              return (
                <button
                  key={midi}
                  data-midi={midi}
                  onPointerDown={(e) => { e.preventDefault(); pressKey(midi); }}
                  style={{ left: `${leftPct}%`, width: `${widthPct}%`, transform: "translateX(-50%)" }}
                  className={`absolute top-0 z-10 flex h-[62%] items-end justify-center rounded-b-md pb-1 text-[9px] font-semibold text-white shadow-lg transition-colors duration-75
                    ${isWrong ? "bg-rose-500" : isTarget ? "bg-emerald-500 ring-4 ring-emerald-300" : isDemo ? "bg-indigo-500" : isActive ? "bg-indigo-600" : "bg-slate-900"}`}
                >
                  {showNames ? midiName(midi) : null}
                </button>
              );
            })}
          </div>
        </section>

        <p className="mt-4 text-center text-xs text-slate-500">
          Tip: on a computer you can also play with your keyboard — <b>A S D F G H J</b> for white keys and <b>W E T Y U</b> for black keys.
        </p>
      </div>
    </main>
  );
}
