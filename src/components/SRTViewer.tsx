import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Download, 
  FileText, 
  Copy, 
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SRTViewerProps {
  content: string;
  fileName: string;
  onReset: () => void;
}

const SRTViewer = ({ content, fileName, onReset }: SRTViewerProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${fileName} has been downloaded successfully`
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "SRT content has been copied to your clipboard"
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard",
        variant: "destructive"
      });
    }
  };

  const formatSRTContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      const isTimestamp = line.includes('-->');
      const isNumber = /^\d+$/.test(line.trim());
      
      return (
        <div 
          key={index}
          className={`
            ${isNumber ? 'text-primary font-semibold text-sm' : ''}
            ${isTimestamp ? 'text-muted-foreground font-mono text-sm' : ''}
            ${!isNumber && !isTimestamp && line.trim() ? 'text-foreground py-1' : ''}
            ${!line.trim() ? 'h-2' : ''}
          `}
        >
          {line || '\u00A0'}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-transparent border-green-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-green-700 mb-1">
              Processing Complete!
            </h2>
            <p className="text-green-600">
              Your video has been successfully transcribed and translated
            </p>
          </div>
        </div>
      </Card>

      {/* File Info & Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{fileName}</h3>
              <p className="text-sm text-muted-foreground">
                SRT Subtitle File • {content.split('\n').filter(line => /^\d+$/.test(line.trim())).length} subtitles
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="transition-all duration-200"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
            
            <Button
              onClick={handleDownload}
              className="bg-gradient-primary shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download SRT
            </Button>
          </div>
        </div>
      </Card>

      {/* SRT Content Viewer */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">SRT File Preview</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Process Another Video
          </Button>
        </div>
        
        <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-muted/30">
          <div className="font-mono text-sm space-y-1">
            {formatSRTContent(content)}
          </div>
        </ScrollArea>
      </Card>

      {/* Features Info */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
        <h4 className="font-semibold mb-3">Features Used</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Word-level timestamps</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Speaker diarization</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>AI-powered translation</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SRTViewer;