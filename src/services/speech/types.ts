// Speech-to-Text Service Abstraction Layer

export interface AudioInput {
  audioBuffer: Buffer | Blob;
  mimeType: string;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  durationSeconds?: number;
}

export interface SpeechToTextService {
  transcribe(audio: AudioInput): Promise<TranscriptionResult>;
}
