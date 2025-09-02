import { useState } from "react";
import VideoUpload from "@/components/VideoUpload";
import ProcessingStatus from "@/components/ProcessingStatus";
import SRTViewer from "@/components/SRTViewer";
import { VideoFile, ProcessingState } from "@/types";
import { transcriptionService } from "@/services/transcriptionService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [uploadedVideo, setUploadedVideo] = useState<VideoFile | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [srtContent, setSrtContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleVideoUpload = async (file: VideoFile) => {
    setUploadedVideo(file);
    setIsProcessing(true);
    
    try {
      console.log("Starting video processing for:", file.name);
      
      const srtResult = await transcriptionService.processVideo(
        file.file,
        (step: string, progress: number) => {
          console.log(`Processing step: ${step}, progress: ${progress}%`);
          
          if (step === "transcribing") {
            setProcessingState("transcribing");
          } else if (step === "translating") {
            setProcessingState("translating");
          } else if (step === "generating") {
            setProcessingState("generating");
          } else if (step === "completed") {
            setProcessingState("completed");
          }
        }
      );
      
      setSrtContent(srtResult);
      
      toast({
        title: "Processing Complete!",
        description: "Your video has been successfully transcribed and translated to English."
      });
      
    } catch (error) {
      console.error("Video processing failed:", error);
      
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your video.",
        variant: "destructive"
      });
      
      // Reset to upload state on error
      setProcessingState("idle");
      setUploadedVideo(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedVideo(null);
    setProcessingState("idle");
    setSrtContent(null);
    setIsProcessing(false);
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