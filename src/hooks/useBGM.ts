import { useEffect, useRef } from 'react';

const FADE_DURATION = 800; // ms
const FADE_INTERVAL = 50;  // ms

function fadeVolume(
  audio: HTMLAudioElement,
  targetVolume: number,
  onComplete?: () => void,
) {
  const steps = FADE_DURATION / FADE_INTERVAL;
  const delta = (targetVolume - audio.volume) / steps;
  let tick = 0;

  const timer = setInterval(() => {
    tick++;
    audio.volume = Math.min(1, Math.max(0, audio.volume + delta));

    if (tick >= steps) {
      clearInterval(timer);
      audio.volume = targetVolume;
      onComplete?.();
    }
  }, FADE_INTERVAL);

  return timer;
}

export function useBGM(track: string | null, volume = 0.45) {
  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const trackRef   = useRef<string | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (track === trackRef.current) return;

    const oldAudio = audioRef.current;

    // 기존 페이드 타이머 제거
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const playNew = (newTrack: string) => {
      const audio = new Audio(`/bgm/${newTrack}`);
      audio.loop = true;
      audio.volume = 0;
      audioRef.current = audio;
      trackRef.current = newTrack;

      audio.play().catch(() => {
        // 브라우저 자동재생 정책으로 실패 시 조용히 무시
      });

      timerRef.current = fadeVolume(audio, volume);
    };

    if (oldAudio && !oldAudio.paused) {
      // 기존 트랙 페이드 아웃 후 새 트랙 재생
      timerRef.current = fadeVolume(oldAudio, 0, () => {
        oldAudio.pause();
        oldAudio.src = '';
        if (track) playNew(track);
        else { audioRef.current = null; trackRef.current = null; }
      });
    } else {
      if (track) playNew(track);
      else trackRef.current = null;
    }

    return undefined;
  }, [track, volume]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);
}
