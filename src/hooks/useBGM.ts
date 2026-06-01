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
 * iOS 대응: Audio 요소를 user gesture 컨텍스트(unlock/toggleMute) 내에서 생성+play()
 * → 페이지 로드 시 미리 생성한 Audio를 나중에 play()하면 iOS에서 차단됨
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

  // ── 오디오 시작 (crossfade) ──────────────────
  // unlock() 또는 track 전환 시 호출. iOS에서는 unlock() 내부(gesture context)에서만 호출.
  const startAudio = useCallback((src: string) => {
    stopFade();
    const old = audioRef.current;

    const doStart = () => {
      const a = new Audio(`/bgm/${src}`);
      a.loop   = true;
      a.volume = 0;
      audioRef.current = a;
      a.play()
        .then(() => { stopFade(); fadeRef.current = fade(a, baseVolume); })
        .catch(() => {});
    };

    if (old && !old.paused) {
      fadeRef.current = fade(old, 0, () => { old.pause(); old.src = ''; doStart(); });
    } else {
      old?.pause();
      if (old) old.src = '';
      doStart();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseVolume]);

  // ── 트랙 전환 감지 ───────────────────────────
  useEffect(() => {
    if (track === trackRef.current) return;
    trackRef.current = track;

    if (lockedRef.current || mutedRef.current) {
      // 아직 잠금 상태 → 현재 오디오만 정리. unlock() 시 trackRef 값으로 시작
      stopFade();
      audioRef.current?.pause();
      audioRef.current = null;
      return;
    }

    // 이미 unlock된 상태 → 트랙 전환 (unlock 이후 play()는 iOS도 허용)
    if (track) {
      startAudio(track);
    } else {
      stopFade();
      audioRef.current?.pause();
      audioRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // ── 잠금 해제 (첫 인터랙션) ─────────────────
  // iOS 핵심: 이 함수는 반드시 user gesture 핸들러(click/touch) 내에서 동기적으로 호출돼야 함
  const unlock = useCallback(() => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    setLocked(false);

    if (mutedRef.current) return;

    const t = trackRef.current;
    if (t) startAudio(t); // gesture context 내에서 Audio 생성 + play()
  }, [startAudio]);

  // ── 사용자 뮤트 토글 ────────────────────────
  const toggleMute = useCallback(() => {
    const newMuted = !mutedRef.current;
    mutedRef.current = newMuted;
    setMuted(newMuted);

    if (lockedRef.current) return;

    if (newMuted) {
      const a = audioRef.current;
      if (!a) return;
      stopFade();
      fadeRef.current = fade(a, 0, () => { a.pause(); });
    } else {
      // 음소거 해제 → gesture context에서 재시작 (모바일 호환)
      const t = trackRef.current;
      if (t) startAudio(t);
    }
  }, [startAudio]);

  // ── 전역 첫 인터랙션 감지 → 자동 unlock ────
  useEffect(() => {
    const handler = () => unlock();
    document.addEventListener('click',      handler, { once: true });
    document.addEventListener('keydown',    handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true, passive: true });
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
