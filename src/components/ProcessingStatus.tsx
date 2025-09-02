import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Languages, 
  FileDown, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { ProcessingState } from "@/types";

interface ProcessingStatusProps {
  state: ProcessingState;
  fileName: string;
}

const ProcessingStatus = ({ state, fileName }: ProcessingStatusProps) => {
  const steps = [
    {
      key: "transcribing",
      title: "Transcribing Audio",
      description: "Converting speech to text with high accuracy",
      icon: FileText
    },
    {
      key: "translating", 
      title: "Translating to English",
      description: "AI-powered translation with context awareness",
      icon: Languages
    },
    {
      key: "generating",
      title: "Generating SRT File",
      description: "Creating formatted subtitle file with timestamps",
      icon: FileDown
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === state);
  };

  const getProgress = () => {
    const currentIndex = getCurrentStepIndex();
    return ((currentIndex + 1) / steps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Processing Your Video</h2>
          <p className="text-muted-foreground">{fileName}</p>
        </div>

        <div className="mb-8">
          <Progress value={getProgress()} className="h-2 mb-4" />
          <p className="text-sm text-muted-foreground">
            {Math.round(getProgress())}% Complete
          </p>
        </div>
      </Card>

      <div className="grid gap-4">
        {steps.map((step, index) => {
          const currentIndex = getCurrentStepIndex();
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;

          return (
            <Card 
              key={step.key}
              className={`p-6 transition-all duration-500 ${
                isActive 
                  ? "border-primary/50 bg-gradient-to-r from-primary/5 to-transparent" 
                  : isCompleted
                  ? "border-green-500/30 bg-green-50/50"
                  : "border-border"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isActive 
                    ? "bg-gradient-primary shadow-glow" 
                    : isCompleted
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isActive ? (
                    <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-foreground"
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <div className={`
                  text-xs px-2 py-1 rounded-full
                  ${isActive 
                    ? "bg-primary/10 text-primary" 
                    : isCompleted
                    ? "bg-green-100 text-green-600"
                    : "bg-muted text-muted-foreground"
                  }
                `}>
                  {isCompleted ? "Completed" : isActive ? "Processing..." : "Pending"}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessingStatus;