"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  angId: number;
}

export default function AudioPlayer({ angId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const paddedId = String(angId).padStart(4, "0");
  const audioUrl = `https://archive.org/stream/sggs-ang-${paddedId}/ang-${paddedId}.mp3`;

  useEffect(() => {
    if (!audioRef.current) return;
    if (isMuted || volume === 0) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.load();
    setIsPlaying(false);
  }, [angId]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!isMuted) {
      audio.muted = true;
      setIsMuted(true);
    } else {
      audio.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      setVolume(val);
      setIsMuted(val === 0);
      if (audioRef.current) {
        audioRef.current.volume = val;
        audioRef.current.muted = val === 0;
      }
    },
    []
  );

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onEnded={handleEnded}
        onError={() => setIsPlaying(false)}
      />
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-5 py-3 shadow-[var(--shadow-popover)] backdrop-blur-md transition-all hover:shadow-[var(--shadow-subtle)]"
        role="region"
        aria-label="Audio player"
      >
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          title={isPlaying ? "Pause" : "Play"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:opacity-90 active:scale-[0.92]"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isMuted ? "Unmute" : "Mute"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:text-[var(--text)]"
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="h-1 w-20 cursor-pointer accent-[var(--accent)]"
          />
        </div>

        <span className="text-[10px] font-mono text-[var(--text-faint)]">
          Ang {angId}
        </span>
      </div>
    </>
  );
}
