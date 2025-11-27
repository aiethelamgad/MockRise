import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Clock,
  Brain,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SessionScreen() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [notes, setNotes] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining] = useState(27); // minutes

  const questions = [
    "Tell me about yourself and your professional background.",
    "What interests you most about this role?",
    "Describe a challenging project you've worked on.",
    "How do you handle tight deadlines?",
    "Where do you see yourself in 5 years?",
  ];

  const aiSuggestions = [
    "Provide specific examples from your experience",
    "Use the STAR method (Situation, Task, Action, Result)",
    "Maintain eye contact with the camera",
    "Speak clearly and at a moderate pace",
  ];

  const handleEndSession = () => {
    toast.success("Session ended. Generating feedback...");
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      toast.success("Next question loaded");
    }
  };

  return (
    <div className="max-w-7xl space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Interview Session</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeRemaining} min remaining
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Progress value={(currentQuestion / questions.length) * 100} className="w-32" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Display */}
          <Card className="p-0 overflow-hidden">
            <div className="aspect-video bg-muted relative flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center">
                  <VideoOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Camera is off</p>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Your video feed</p>
                  </div>
                </div>
              )}

              {/* AI Interviewer Picture-in-Picture */}
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-secondary/40 to-accent/40 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <Button
                  size="icon"
                  variant={isMuted ? "destructive" : "secondary"}
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full h-12 w-12"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  size="icon"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className="rounded-full h-12 w-12"
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleEndSession}
                  className="rounded-full h-12 w-12"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Current Question */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <MessageSquare className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Current Question</h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg text-foreground/90"
                  >
                    {questions[currentQuestion]}
                  </motion.p>
                </AnimatePresence>
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  className="mt-4"
                >
                  Next Question
                </Button>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Your Notes</h3>
            <Textarea
              placeholder="Take notes during the interview..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px]"
            />
          </Card>
        </div>

        {/* Sidebar - AI Feedback */}
        <div className="space-y-6">
          {/* Live AI Feedback */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Feedback</h3>
            </div>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <p className="text-muted-foreground">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Performance Indicators */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Live Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Clarity</span>
                  <span className="text-accent font-medium">Good</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Pacing</span>
                  <span className="text-accent font-medium">Great</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Eye Contact</span>
                  <span className="text-warning font-medium">Needs Work</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Confidence</span>
                  <span className="text-accent font-medium">Excellent</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3">💡 Quick Tip</h3>
            <p className="text-sm text-muted-foreground">
              Remember to smile and maintain a positive body language. 
              It significantly improves your interview performance!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
