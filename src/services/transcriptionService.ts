import { pipeline } from "@huggingface/transformers";

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedLanguage: string;
}

class TranscriptionService {
  private transcriber: any = null;
  private translator: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    try {
      console.log("Initializing transcription models...");
      
      // Initialize Whisper for transcription with timestamps
      this.transcriber = await pipeline(
        "automatic-speech-recognition",
        "onnx-community/whisper-tiny.en",
        { device: "webgpu" }
      );

      // Initialize translation model for various languages to English
      this.translator = await pipeline(
        "translation",
        "Helsinki-NLP/opus-mt-zh-en", // Chinese to English, we'll expand this
        { device: "webgpu" }
      );

      this.initialized = true;
      console.log("Models initialized successfully");
    } catch (error) {
      console.error("Failed to initialize models:", error);
      throw new Error("Failed to initialize AI models. Please try again.");
    }
  }

  async extractAudioFromVideo(videoFile: File): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = async () => {
        try {
          // Create audio context
          const audioContext = new AudioContext();
          
          // Create MediaElementSource from video
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          
          // Record audio
          const mediaRecorder = new MediaRecorder(destination.stream);
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };
          
          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: 'audio/wav' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            resolve(audioBuffer);
          };
          
          mediaRecorder.start();
          video.play();
          
          video.onended = () => {
            mediaRecorder.stop();
          };
          
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = reject;
      video.src = URL.createObjectURL(videoFile);
    });
  }

  async transcribeAudio(audioUrl: string): Promise<TranscriptionSegment[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      console.log("Starting transcription...");
      const result = await this.transcriber(audioUrl);

      console.log("Transcription result:", result);

      // Process the result to extract segments with timestamps
      const segments: TranscriptionSegment[] = [];
      
      if (result.chunks && result.chunks.length > 0) {
        result.chunks.forEach((chunk: any, index: number) => {
          segments.push({
            start: chunk.timestamp[0] || index * 5,
            end: chunk.timestamp[1] || (index + 1) * 5,
            text: chunk.text.trim()
          });
        });
      } else {
        // Fallback: split text into segments
        const text = result.text || "";
        const words = text.split(' ');
        const wordsPerSegment = 10;
        
        for (let i = 0; i < words.length; i += wordsPerSegment) {
          const segmentWords = words.slice(i, i + wordsPerSegment);
          const startTime = (i / wordsPerSegment) * 5;
          const endTime = ((i + wordsPerSegment) / wordsPerSegment) * 5;
          
          segments.push({
            start: startTime,
            end: endTime,
            text: segmentWords.join(' ')
          });
        }
      }

      return segments;
    } catch (error) {
      console.error("Transcription failed:", error);
      throw new Error("Failed to transcribe audio. Please try again.");
    }
  }

  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const chinesePattern = /[\u4e00-\u9fff]/;
    const arabicPattern = /[\u0600-\u06ff]/;
    const thaiPattern = /[\u0e00-\u0e7f]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7af]/;
    const myanmarPattern = /[\u1000-\u109f]/;

    if (chinesePattern.test(text)) return "Chinese";
    if (arabicPattern.test(text)) return "Arabic";
    if (thaiPattern.test(text)) return "Thai";
    if (japanesePattern.test(text)) return "Japanese";
    if (koreanPattern.test(text)) return "Korean";
    if (myanmarPattern.test(text)) return "Myanmar";
    
    return "English"; // Default assumption
  }

  async translateToEnglish(text: string, sourceLanguage: string): Promise<string> {
    try {
      // For Chinese text, use the translation model
      if (sourceLanguage === "Chinese") {
        const result = await this.translator(text);
        return result[0].translation_text;
      }
      
      // For other languages, we'll use a simple API call or return as-is for now
      // In production, you'd want to use a proper translation service
      if (sourceLanguage === "English") {
        return text;
      }
      
      // Placeholder for other languages - in production, integrate with translation API
      console.log(`Translation needed for ${sourceLanguage}:`, text);
      return `[Translated from ${sourceLanguage}] ${text}`;
      
    } catch (error) {
      console.error("Translation failed:", error);
      return text; // Return original text if translation fails
    }
  }

  formatTimeForSRT(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  }

  generateSRT(segments: TranscriptionSegment[]): string {
    let srtContent = "";
    
    segments.forEach((segment, index) => {
      const startTime = this.formatTimeForSRT(segment.start);
      const endTime = this.formatTimeForSRT(segment.end);
      
      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${segment.text}\n\n`;
    });
    
    return srtContent.trim();
  }

  async processVideo(videoFile: File, onProgress: (step: string, progress: number) => void): Promise<string> {
    try {
      await this.initialize();
      
      onProgress("transcribing", 25);
      
      // Create object URL for the video file to pass to transcriber
      const videoUrl = URL.createObjectURL(videoFile);
      
      // Transcribe the video (Whisper can handle video files directly)
      const segments = await this.transcribeAudio(videoUrl);
      
      onProgress("translating", 60);
      
      // Process each segment for translation
      const translatedSegments: TranscriptionSegment[] = [];
      
      for (const segment of segments) {
        const detectedLanguage = this.detectLanguage(segment.text);
        const translatedText = await this.translateToEnglish(segment.text, detectedLanguage);
        
        translatedSegments.push({
          start: segment.start,
          end: segment.end,
          text: translatedText
        });
      }
      
      onProgress("generating", 90);
      
      // Generate SRT content
      const srtContent = this.generateSRT(translatedSegments);
      
      // Clean up
      URL.revokeObjectURL(videoUrl);
      
      onProgress("completed", 100);
      
      return srtContent;
      
    } catch (error) {
      console.error("Video processing failed:", error);
      throw error;
    }
  }
}

export const transcriptionService = new TranscriptionService();