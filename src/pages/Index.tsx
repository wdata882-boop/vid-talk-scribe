import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import ProcessingStatus from "@/components/ProcessingStatus";
import SRTViewer from "@/components/SRTViewer";
import { VideoFile, ProcessingState } from "@/types";

const Index = () => {
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [srtContent, setSrtContent] = useState<string | null>(null);

  const handleVideoUpload = (file: VideoFile) => {
    setUploadedVideo(file);
    setProcessingState("transcribing");
    
    // Simulate processing workflow
    setTimeout(() => {
      setProcessingState("translating");
      setTimeout(() => {
        setProcessingState("generating");
        setTimeout(() => {
          setProcessingState("completed");
          // Mock SRT content
          setSrtContent(`1
00:00:00,000 --> 00:00:04,500
Welcome to our video transcription service.

2
00:00:04,500 --> 00:00:08,000
This tool automatically transcribes and translates your videos.

3
00:00:08,000 --> 00:00:12,500
The accuracy is enhanced with word-level timestamps and speaker diarization.`);
        }, 2000);
      }, 3000);
    }, 2000);
  };

  const handleReset = () => {
    setUploadedVideo(null);
    setProcessingState("idle");
    setSrtContent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            AI Video Transcription
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your videos and get accurate English transcriptions with SRT files
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          {processingState === "idle" ? (
            <VideoUpload onUpload={handleVideoUpload} />
          ) : processingState === "completed" ? (
            <SRTViewer 
              content={srtContent!} 
              fileName={uploadedVideo?.name.replace(/\.[^/.]+$/, ".srt") || "transcript.srt"}
              onReset={handleReset}
            />
          ) : (
            <ProcessingStatus 
              state={processingState} 
              fileName={uploadedVideo?.name || ""}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;