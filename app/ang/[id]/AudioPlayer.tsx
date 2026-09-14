"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, AlertCircle } from "lucide-react";

interface AudioPlayerProps {
  angId: number;
}

type AudioStatus = "idle" | "loading" | "ready" | "error";

const SEARCH_CACHE = new Map<number, string | null>();

export default function AudioPlayer({ angId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [trackName, setTrackName] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted || volume === 0 ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.onended = () => setIsPlaying(false);
    return () => { audioRef.current?.pause(); };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAudioUrl() {
      if (SEARCH_CACHE.has(angId)) {
        const cached = SEARCH_CACHE.get(angId)!;
        if (!cancelled) {
          setAudioSrc(cached);
          setStatus(cached ? "ready" : "error");
        }
        return;
      }

      if (!cancelled) {
        setAudioSrc(null);
        setStatus("loading");
        setIsPlaying(false);
      }

      try {
        const q = encodeURIComponent(`ang ${angId} AND mediatype:audio AND collection:(audio)`);
        const res = await fetch(
          `https://archive.org/advancedsearch.php?q=${q}&fl[]=identifier,title,downloads&rows=3&sort[]=downloads desc&output=json`
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        const docs: { identifier: string; title: string; downloads: number }[] =
          data?.response?.docs ?? [];

        if (docs.length === 0) {
          SEARCH_CACHE.set(angId, null);
          if (!cancelled) {
            setAudioSrc(null);
            setStatus("error");
          }
          return;
        }

        const best = docs[0];
        const metaRes = await fetch(
          `https://archive.org/metadata/${best.identifier}?fl=files`
        );
        if (!metaRes.ok) throw new Error("Metadata failed");
        const meta = await metaRes.json();

        const mp3 = (meta.files ?? []).find(
          (f: { name: string; format?: string }) =>
            f.name?.endsWith(".mp3") &&
            (f.format?.includes("MP3") || f.format?.includes("VBR"))
        );

        if (!mp3) {
          SEARCH_CACHE.set(angId, null);
          if (!cancelled) {
            setAudioSrc(null);
            setStatus("error");
          }
          return;
        }

        const streamUrl = `https://archive.org/download/${best.identifier}/${encodeURIComponent(mp3.name)}`;
        SEARCH_CACHE.set(angId, streamUrl);
        if (!cancelled) {
          setAudioSrc(streamUrl);
          setTrackName(best.title || mp3.name);
          setStatus("ready");
        }
      } catch {
        SEARCH_CACHE.set(angId, null);
        if (!cancelled) {
          setAudioSrc(null);
          setStatus("error");
        }
      }
    }

    fetchAudioUrl();
    return () => { cancelled = true; };
  }, [angId]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [audioSrc]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
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

  const handleEnded = useCallback(() => setIsPlaying(false), []);

  if (status === "error" && !audioSrc) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-4 py-2 text-xs text-[var(--text-muted)] shadow-[var(--shadow-popover)] backdrop-blur-md">
        <AlertCircle size={14} />
        <span>Audio not available for Ang {angId}</span>
      </div>
    );
  }

  return (
    <>
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onEnded={handleEnded}
          onError={() => setIsPlaying(false)}
        />
      )}
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 px-5 py-3 shadow-[var(--shadow-popover)] backdrop-blur-md transition-all hover:shadow-[var(--shadow-subtle)]"
        role="region"
        aria-label="Audio player"
      >
        {status === "loading" ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Music size={14} className="animate-pulse" />
            <span className="text-[10px] font-mono">Loading audio…</span>
          </div>
        ) : audioSrc ? (
          <>
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
          </>
        ) : null}
      </div>
    </>
  );
}
