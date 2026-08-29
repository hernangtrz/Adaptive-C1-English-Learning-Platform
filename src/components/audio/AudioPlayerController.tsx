"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sliders,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";

interface AudioPlayerControllerProps {
  spokenText: string;
  phoneticTranscription?: string;
  translationEs?: string;
  onPlayCountChange?: (count: number) => void;
  accentPreference?: "en-US" | "en-GB";
}

export default function AudioPlayerController({
  spokenText,
  phoneticTranscription,
  translationEs,
  onPlayCountChange,
  accentPreference = "en-US",
}: AudioPlayerControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.75 | 1.0 | 1.25>(1.0);
  const [selectedAccent, setSelectedAccent] = useState<"en-US" | "en-GB">(accentPreference);
  const [playCount, setPlayCount] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  function handlePlay() {
    if (!synthRef.current) return;

    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = playbackSpeed;
    utterance.lang = selectedAccent;

    // Pick appropriate voice if available
    const voices = synthRef.current.getVoices();
    const voice = voices.find((v) => v.lang.includes(selectedAccent.replace("-", "_")) || v.lang.includes(selectedAccent));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      const newCount = playCount + 1;
      setPlayCount(newCount);
      onPlayCountChange?.(newCount);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }

  function handleStop() {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  }

  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: "14px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--border-subtle)",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        {/* Main Audio Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={isPlaying ? handleStop : handlePlay}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: isPlaying ? "var(--accent-cyan)" : "var(--primary)",
              border: "none",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
              transition: "transform 0.15s ease",
            }}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: "2px" }} />}
          </button>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Volume2 size={16} color="var(--accent-cyan)" />
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {isPlaying ? "Audio Playing..." : "Native Audio Synthesis"}
              </span>
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Played {playCount} time{playCount === 1 ? "" : "s"} • {selectedAccent === "en-US" ? "American English" : "British English"}
            </div>
          </div>
        </div>

        {/* Speed & Accent Adjustments */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Speed Buttons */}
          <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.04)", borderRadius: "8px", padding: "3px" }}>
            {([0.75, 1.0, 1.25] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: playbackSpeed === spd ? "var(--primary)" : "transparent",
                  color: playbackSpeed === spd ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Accent Toggle */}
          <button
            type="button"
            onClick={() => setSelectedAccent((prev) => (prev === "en-US" ? "en-GB" : "en-US"))}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {selectedAccent === "en-US" ? "🇺🇸 US Accent" : "🇬🇧 UK Accent"}
          </button>
        </div>
      </div>

      {/* Transcript Reveal Option */}
      <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.04)", paddingTop: "12px" }}>
        <button
          type="button"
          onClick={() => setShowTranscript((prev) => !prev)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: 0,
          }}
        >
          {showTranscript ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{showTranscript ? "Hide Transcript & Phonetics" : "Reveal Transcript"}</span>
        </button>

        {showTranscript && (
          <div
            style={{
              marginTop: "10px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ fontSize: "0.95rem", fontStyle: "italic", marginBottom: "6px" }}>
              &ldquo;{spokenText}&rdquo;
            </div>
            {phoneticTranscription && (
              <div style={{ fontSize: "0.82rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
                {phoneticTranscription}
              </div>
            )}
            {translationEs && (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Spanish: {translationEs}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
