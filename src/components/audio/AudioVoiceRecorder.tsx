"use client";

import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";

interface AudioVoiceRecorderProps {
  onTranscriptReady: (transcript: string, durationSeconds: number) => void;
  timeLimitSeconds?: number;
}

export default function AudioVoiceRecorder({
  onTranscriptReady,
  timeLimitSeconds = 120,
}: AudioVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check Speech Recognition API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(finalTranscript.trim());
      };

      recognition.onerror = () => {
        // Fallback gracefully
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function handleStartRecording() {
    try {
      setAudioUrl(null);
      setTranscript("");
      setRecordingDuration(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore if already active
        }
      }

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= timeLimitSeconds) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      // Microphone blocked or unavailable -> switch to text input mode
      setManualMode(true);
    }
  }

  function handleStopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }

  function handlePlaybackAudio() {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  }

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "14px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border-subtle)",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Mic size={18} color="var(--accent-cyan)" />
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {manualMode ? "Spoken Transcript Input" : "Audio Voice Recorder & Speech Recognition"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setManualMode((prev) => !prev)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <FileText size={13} />
          <span>{manualMode ? "Switch to Voice Mic" : "Type Transcript Directly"}</span>
        </button>
      </div>

      {!manualMode ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          {/* Recording Button & Wave Status */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                  border: "none",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 0 24px rgba(244, 63, 94, 0.4)",
                  transition: "transform 0.15s ease",
                }}
              >
                <Mic size={28} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#f43f5e",
                  border: "none",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  animation: "pulse 1.5s infinite",
                  boxShadow: "0 0 30px rgba(244, 63, 94, 0.6)",
                }}
              >
                <Square size={24} />
              </button>
            )}

            {audioUrl && !isRecording && (
              <button
                type="button"
                onClick={handlePlaybackAudio}
                className="btn-secondary"
                style={{ padding: "10px 16px", fontSize: "0.85rem", gap: "6px" }}
              >
                {isPlayingAudio ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlayingAudio ? "Pause Recording" : "Play Recording"}</span>
              </button>
            )}
          </div>

          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: isRecording ? "#f43f5e" : "var(--text-muted)" }}>
            {isRecording ? `Recording... (${recordingDuration}s / ${timeLimitSeconds}s)` : recordingDuration > 0 ? `Captured: ${recordingDuration} seconds` : "Click red button to start speaking"}
          </div>

          {/* Live Transcript Stream */}
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "6px" }}>
              Live Recognized Transcript (editable):
            </label>
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech will appear here in real-time as you speak..."
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
            Type your full spoken response (simulated speech transcript):
          </label>
          <textarea
            rows={5}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type your complete C1 response here. Use the target C1 expressions..."
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
      )}

      {/* Commit Transcript Button */}
      {transcript.trim().length > 0 && !isRecording && (
        <div style={{ marginTop: "16px" }}>
          <button
            type="button"
            onClick={() => onTranscriptReady(transcript, recordingDuration || 45)}
            className="btn-primary"
            style={{ width: "100%", padding: "12px" }}
          >
            <span>Analyze Spoken Utterance</span>
            <Sparkles size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
