import { useEffect, useRef, useCallback, useState } from 'react';

const FADE_MS  = 800;
const STEP_MS  = 50;

function applyFade(
  audio: HTMLAudioElement,
  target: number,
  onDone?: () => void,
) {
  const steps = FADE_MS / STEP_MS;
  const delta = (target - audio.volume) / steps;
  let n = 0;
  const id = setInterval(() => {
    n++;
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
    if (n >= steps) { clearInterval(id); audio.volume = target; onDone?.(); }
  }, STEP_MS);
  return id;
}

// ── 전역: 첫 인터랙션 여부 ───────────────────
let unlocked = false;
const unlockCallbacks: Array<() => void> = [];

function registerUnlockCallback(cb: () => void) {
  if (unlocked) { cb(); return; }
  unlockCallbacks.push(cb);
}

function onFirstInteraction() {
  if (unlocked) return;
  unlocked = true;
  unlockCallbacks.splice(0).forEach((cb) => cb());
}

if (typeof document !== 'undefined') {
  document.addEventListener('click',      onFirstInteraction, { once: true });
  document.addEventListener('keydown',    onFirstInteraction, { once: true });
  document.addEventListener('touchstart', onFirstInteraction, { once: true });
}

// ── 훅 ──────────────────────────────────────
export function useBGM(track: string | null, baseVolume = 0.45) {
  const [muted, setMuted] = useState(false);

  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const trackRef  = useRef<string | null>(null);
  const mutedRef  = useRef(false);
  const fadeRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearFade = () => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  };

  // 트랙 시작: muted=true 로 즉시 재생, 첫 인터랙션 후 페이드인
  const startAudio = useCallback((src: string) => {
    const audio = new Audio(`/bgm/${src}`);
    audio.loop   = true;
    audio.volume = 0;
    audio.muted  = true; // 브라우저 자동재생 허용 조건

    audio.play().catch(() => {
      // 혹시라도 muted 재생도 막힌 환경이면 조용히 무시
    });

    audioRef.current = audio;

    // 첫 인터랙션 시 언뮤트 + 페이드인
    registerUnlockCallback(() => {
      if (audioRef.current !== audio) return; // 이미 트랙이 바뀐 경우 무시
      if (mutedRef.current) return;           // 사용자가 수동 뮤트한 경우 무시
      audio.muted = false;
      clearFade();
      fadeRef.current = applyFade(audio, baseVolume);
    });
  }, [baseVolume]);

  // 트랙 변경
  useEffect(() => {
    if (track === trackRef.current) return;
    trackRef.current = track;
    clearFade();

    const old = audioRef.current;

    const next = () => {
      if (!track) { audioRef.current = null; return; }
      startAudio(track);
      // 이미 언락된 상태면 즉시 언뮤트
      if (unlocked && !mutedRef.current && audioRef.current) {
        audioRef.current.muted = false;
        fadeRef.current = applyFade(audioRef.current, baseVolume);
      }
    };

    if (old && !old.paused) {
      fadeRef.current = applyFade(old, 0, () => {
        old.pause();
        old.src = '';
        next();
      });
    } else {
      old?.pause();
      next();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // 뮤트 토글
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);

    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    if (next) {
      fadeRef.current = applyFade(audio, 0, () => { audio.muted = true; });
    } else {
      audio.muted = false;
      fadeRef.current = applyFade(audio, baseVolume);
    }
  }, [baseVolume]);

  // 언마운트 정리
  useEffect(() => () => {
    clearFade();
    audioRef.current?.pause();
    audioRef.current = null;
    trackRef.current = null;
  }, []);

  return { muted, toggleMute };
}
