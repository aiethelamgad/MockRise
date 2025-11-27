import { useState } from "react";
import { motion } from "framer-motion";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadarChart, CircularProgress, BarChart, LineChart } from "@/components/ui/animated-chart";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Upload,
  Download,
  TrendingUp,
  MessageSquare,
  Clock,
  Target,
  Brain,
  Volume2,
  Activity,
  CheckCircle2,
  AlertCircle,
  Star,
} from "lucide-react";

export default function SpeechAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for speech analysis
  const speechMetrics = {
    fluency: 85,
    clarity: 92,
    pace: 78,
    confidence: 88,
    vocabulary: 90,
    grammar: 87,
  };

  const radarData = [
    { skill: "Fluency", value: speechMetrics.fluency, color: "hsl(var(--primary))" },
    { skill: "Clarity", value: speechMetrics.clarity, color: "hsl(var(--accent))" },
    { skill: "Pace", value: speechMetrics.pace, color: "hsl(var(--secondary))" },
    { skill: "Confidence", value: speechMetrics.confidence, color: "hsl(var(--warning))" },
    { skill: "Vocabulary", value: speechMetrics.vocabulary, color: "hsl(var(--success))" },
    { skill: "Grammar", value: speechMetrics.grammar, color: "hsl(var(--destructive))" },
  ];

  const sentimentData = [
    { label: "Positive", value: 75, color: "bg-success" },
    { label: "Neutral", value: 20, color: "bg-muted" },
    { label: "Negative", value: 5, color: "bg-destructive" },
  ];

  const progressData = [
    { x: "Week 1", y: 65 },
    { x: "Week 2", y: 72 },
    { x: "Week 3", y: 78 },
    { x: "Week 4", y: 85 },
    { x: "Week 5", y: 88 },
  ];

  const transcript = `Good morning, thank you for having me here today. I'm really excited about this opportunity to discuss my qualifications for the software engineer position. I have over five years of experience in full-stack development, with a strong focus on React and Node.js. In my previous role at TechCorp, I led a team of four developers and successfully delivered three major projects that increased our application performance by 40%. I'm particularly passionate about creating scalable solutions and mentoring junior developers.`;

  const improvements = [
    {
      category: "Fluency",
      issue: "Slight hesitation at 0:15",
      suggestion: "Practice smooth transitions between topics",
      severity: "low",
    },
    {
      category: "Pace",
      issue: "Speaking too quickly in technical sections",
      suggestion: "Slow down when explaining complex concepts",
      severity: "medium",
    },
    {
      category: "Confidence",
      issue: "Voice pitch drops at 1:30",
      suggestion: "Maintain consistent energy throughout",
      severity: "low",
    },
  ];

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Simulate recording
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
      }, 5000);
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Simulate playback
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Speech Analysis</h1>
        <p className="text-muted-foreground">
          Analyze your speaking patterns and improve your communication skills
        </p>
      </motion.div>

      {/* Recording Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <EnhancedCard className="p-6" variant="glass">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Record New Session
            </h2>
            <Badge variant="outline" className="text-xs">
              AI-Powered Analysis
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <EnhancedButton
              onClick={handleRecord}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="flex items-center gap-2"
              motionProps={{
                whileHover: { scale: 1.05 },
                whileTap: { scale: 0.95 }
              }}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Start Recording
                </>
              )}
            </EnhancedButton>

            <EnhancedButton
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload Audio
            </EnhancedButton>

            {isRecording && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-destructive"
              >
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </motion.div>
            )}
          </div>
        </EnhancedCard>
      </motion.div>

      {/* Analysis Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Speech Radar Chart */}
              <EnhancedCard className="p-6" variant="elevated">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Speech Skills Overview
                </h3>
                <div className="flex justify-center">
                  <RadarChart data={radarData} size={300} />
                </div>
              </EnhancedCard>

              {/* Key Metrics */}
              <EnhancedCard className="p-6" variant="elevated">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Key Metrics
                </h3>
                <div className="space-y-4">
                  {Object.entries(speechMetrics).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-bold">{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </EnhancedCard>
            </div>

            {/* Progress Chart */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary" />
                Progress Over Time
              </h3>
              <div className="flex justify-center">
                <LineChart data={progressData} width={600} height={200} />
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-6">
            <EnhancedCard className="p-6" variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Speech Transcript
                </h3>
                <div className="flex items-center gap-2">
                  <EnhancedButton
                    variant="outline"
                    size="sm"
                    onClick={handlePlay}
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </EnhancedButton>
                  <EnhancedButton variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </EnhancedButton>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Duration: 2:15
                </div>
                <div className="flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />
                  Words: 127
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  AI Confidence: 94%
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sentiment Analysis */}
              <EnhancedCard className="p-6" variant="elevated">
                <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
                <div className="space-y-4">
                  {sentimentData.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{item.value}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </EnhancedCard>

              {/* Speaking Pace */}
              <EnhancedCard className="p-6" variant="elevated">
                <h3 className="text-lg font-semibold mb-4">Speaking Pace</h3>
                <div className="text-center">
                  <CircularProgress value={78} size={120} color="hsl(var(--primary))" />
                  <p className="text-sm text-muted-foreground mt-2">Words per minute</p>
                </div>
              </EnhancedCard>

              {/* Confidence Score */}
              <EnhancedCard className="p-6" variant="elevated">
                <h3 className="text-lg font-semibold mb-4">Confidence Score</h3>
                <div className="text-center">
                  <CircularProgress value={88} size={120} color="hsl(var(--accent))" />
                  <p className="text-sm text-muted-foreground mt-2">Overall confidence</p>
                </div>
              </EnhancedCard>
            </div>

            {/* Detailed Metrics */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Speech Quality</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Clarity", value: 92, color: "bg-success" },
                      { label: "Volume", value: 85, color: "bg-primary" },
                      { label: "Tone", value: 88, color: "bg-accent" },
                    ].map((item, index) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Content Analysis</h4>
                  <div className="space-y-3">
                    {[
                      { label: "Vocabulary", value: 90, color: "bg-secondary" },
                      { label: "Grammar", value: 87, color: "bg-warning" },
                      { label: "Structure", value: 82, color: "bg-destructive" },
                    ].map((item, index) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span>{item.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Improvements Tab */}
          <TabsContent value="improvements" className="space-y-6">
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Areas for Improvement
              </h3>
              <div className="space-y-4">
                {improvements.map((improvement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {improvement.severity === "high" ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : improvement.severity === "medium" ? (
                          <AlertCircle className="h-5 w-5 text-warning" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              improvement.severity === "high"
                                ? "destructive"
                                : improvement.severity === "medium"
                                ? "warning"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {improvement.category}
                          </Badge>
                          <span className="text-sm font-medium">{improvement.issue}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {improvement.suggestion}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </EnhancedCard>

            {/* Practice Recommendations */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-lg font-semibold mb-4">Practice Recommendations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Daily Exercises</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Practice tongue twisters for clarity</li>
                    <li>• Record yourself reading aloud</li>
                    <li>• Practice breathing exercises</li>
                    <li>• Slow down when explaining complex topics</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Weekly Goals</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Complete 3 mock interviews</li>
                    <li>• Practice elevator pitch</li>
                    <li>• Review and improve weak areas</li>
                    <li>• Track progress with metrics</li>
                  </ul>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
