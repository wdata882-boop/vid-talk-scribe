import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileVideo, X } from "lucide-react";
import { VideoFile } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  onUpload: (file: VideoFile) => void;
}

const VideoUpload = ({ onUpload }: VideoUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<VideoFile | null>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm"];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, MOV, AVI, MKV, WebM)",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 500MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (validateFile(file)) {
      const videoFile: VideoFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        file
      };
      setSelectedFile(videoFile);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleStartProcessing = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-all duration-300">
        <div
          className={`relative transition-all duration-300 ${
            isDragOver ? "transform scale-105" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Video</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your video file here, or click to browse
              </p>
              
              <Button 
                variant="outline" 
                className="relative overflow-hidden"
                onClick={() => document.getElementById("video-input")?.click()}
              >
                <FileVideo className="w-4 h-4 mr-2" />
                Choose Video File
              </Button>
              
              <input
                id="video-input"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              Supported formats: MP4, MOV, AVI, MKV, WebM (Max: 500MB)
            </div>
          </div>
        </div>
      </Card>

      {selectedFile && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">{selectedFile.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelectedFile}
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
              <Button
                onClick={handleStartProcessing}
                className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
              >
                Start Processing
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoUpload;