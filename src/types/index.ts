export interface VideoFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

export type ProcessingState = "idle" | "transcribing" | "translating" | "generating" | "completed";