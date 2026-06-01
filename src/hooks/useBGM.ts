import { useEffect, useRef, useCallback, useState } from 'react';

const FADE_MS = 800;
const STEP_MS = 50;

function fade(
  audio: HTMLAudioElement,
  to: number,
  done?: () => void,
) {
  const steps = FADE_MS / STEP_MS;
  const delta = (to - audio.volume) / steps;
  let n = 0;
  const id = setInterval(() => {
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
    if (++n >= steps) { clearInterval(id); audio.volume = to; done?.(); }
  }, STEP_MS);
  return id;
}

/**
 * locked : 브라우저 자동재생 잠금 — 첫 인터랙션 전까지 true
 * muted  : 사용자가 수동으로 음소거한 상태
 *
 * 실제 소리 출력 = !locked && !muted
 */
export function useBGM(track: string | null, baseVolume = 0.45) {
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const trackRef  = useRef<string | null>(null);
  const fadeRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedRef = useRef(true);
  const mutedRef  = useRef(false);

  const [locked, setLocked] = useState(true);
  const [muted,  setMuted]  = useState(false);

  const stopFade = () => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  };

  // ── 새 오디오 시작 (항상 무음으로) ──────────
  const launchAudio = useCallback((src: string) => {
    const a = new Audio(`/bgm/${src}`);
    a.loop   = true;
    a.volume = 0;
    a.muted  = true; // 자동재생 정책 통과
    a.play().catch(() => {}); // Safari 등에서 실패해도 unlock()이 재시도
    audioRef.current = a;
  }, []);

  // ── 트랙 전환 ────────────────────────────────
  useEffect(() => {
    if (track === trackRef.current) return;
    trackRef.current = track;
    stopFade();

    const old = audioRef.current;
    const startNext = () => {
      if (!track) { audioRef.current = null; return; }
      launchAudio(track);
      // 잠금 해제 상태면 바로 페이드인
      if (!lockedRef.current && !mutedRef.current && audioRef.current) {
        audioRef.current.muted = false;
        fadeRef.current = fade(audioRef.current, baseVolume);
      }
    };

    if (old && !old.paused) {
      fadeRef.current = fade(old, 0, () => { old.pause(); old.src = ''; startNext(); });
    } else {
      old?.pause();
      startNext();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // ── 잠금 해제 (첫 인터랙션) ─────────────────
  // - 멱등성 보장: 이미 해제된 상태면 아무것도 안 함
  // - 뮤트 버튼 클릭 → 버블링으로 document click → 이 함수 → 안전하게 처리
  const unlock = useCallback(() => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    setLocked(false);

    if (mutedRef.current) return; // 사용자가 수동 뮤트 상태면 소리 안 냄

    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => {}); // Safari fallback
    a.muted = false;
    stopFade();
    fadeRef.current = fade(a, baseVolume);
  }, [baseVolume]);

  // ── 사용자 뮤트 토글 ────────────────────────
  const toggleMute = useCallback(() => {
    const newMuted = !mutedRef.current;
    mutedRef.current = newMuted;
    setMuted(newMuted);

    if (lockedRef.current) return; // 잠긴 상태에서 토글은 상태만 변경

    const a = audioRef.current;
    if (!a) return;
    stopFade();
    if (newMuted) {
      fadeRef.current = fade(a, 0, () => { a.muted = true; });
    } else {
      a.muted = false;
      fadeRef.current = fade(a, baseVolume);
    }
  }, [baseVolume]);

  // ── 전역 첫 인터랙션 감지 → 자동 unlock ────
  useEffect(() => {
    const handler = () => unlock();
    document.addEventListener('click',      handler, { once: true });
    document.addEventListener('keydown',    handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });
    return () => {
      document.removeEventListener('click',      handler);
      document.removeEventListener('keydown',    handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [unlock]);

  // ── 언마운트 정리 ─────────────────────────────
  useEffect(() => () => {
    stopFade();
    audioRef.current?.pause();
    audioRef.current = null;
    trackRef.current = null;
  }, []);

  return { locked, muted, unlock, toggleMute };
}
