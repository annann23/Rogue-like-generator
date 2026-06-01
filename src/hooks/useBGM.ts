import { useEffect, useRef, useCallback, useState } from 'react';

const FADE_MS = 800;
const STEP_MS = 50;

function applyFade(audio: HTMLAudioElement, target: number, onDone?: () => void) {
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

export function useBGM(track: string | null, baseVolume = 0.45) {
  const [muted,   setMuted]   = useState(false);
  const [blocked, setBlocked] = useState(false);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const trackRef   = useRef<string | null>(null);
  const mutedRef   = useRef(false);
  const fadeRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef  = useRef(baseVolume);

  volumeRef.current = baseVolume;

  // ── 페이드 취소 ─────────────────────────────
  const clearFade = () => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  };

  // ── 실제 재생 시도 ──────────────────────────
  const tryPlay = useCallback((audio: HTMLAudioElement) => {
    audio.play()
      .then(() => {
        setBlocked(false);
        if (!mutedRef.current) {
          clearFade();
          fadeRef.current = applyFade(audio, volumeRef.current);
        }
      })
      .catch(() => setBlocked(true));
  }, []);

  // ── 트랙 변경 ──────────────────────────────
  useEffect(() => {
    if (track === trackRef.current) return;
    trackRef.current = track;
    clearFade();

    const old = audioRef.current;

    const startNew = () => {
      if (!track) { audioRef.current = null; return; }

      const next = new Audio(`/bgm/${track}`);
      next.loop   = true;
      next.volume = 0;
      audioRef.current = next;
      tryPlay(next);
    };

    if (old && !old.paused) {
      fadeRef.current = applyFade(old, 0, () => { old.pause(); old.src = ''; startNew(); });
    } else {
      old?.pause();
      startNew();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // ── 뮤트 토글 ──────────────────────────────
  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);

    const audio = audioRef.current;
    if (!audio) return;
    clearFade();
    fadeRef.current = applyFade(audio, next ? 0 : volumeRef.current);
  }, []);

  // ── 첫 인터랙션 → 차단된 오디오 재시도 ────
  useEffect(() => {
    const retry = () => {
      const audio = audioRef.current;
      if (audio && audio.paused) tryPlay(audio);
    };
    document.addEventListener('click',   retry, { once: true });
    document.addEventListener('keydown', retry, { once: true });
    return () => {
      document.removeEventListener('click',   retry);
      document.removeEventListener('keydown', retry);
    };
  }, [tryPlay]);

  // ── 언마운트 정리 ───────────────────────────
  useEffect(() => () => {
    clearFade();
    audioRef.current?.pause();
    audioRef.current = null;
    trackRef.current = null;
  }, []);

  return { muted, blocked, toggleMute };
}
