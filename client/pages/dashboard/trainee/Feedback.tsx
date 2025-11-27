import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  MessageSquare,
  Target,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Download,
  Star,
} from "lucide-react";

export default function Feedback() {
  const overallScore = 87;

  const categories = [
    {
      name: "Technical Skills",
      score: 85,
      feedback: "Strong understanding of core concepts. Great problem-solving approach.",
      icon: Brain,
      color: "text-primary",
    },
    {
      name: "Communication",
      score: 78,
      feedback: "Clear articulation. Could improve on structuring responses using frameworks.",
      icon: MessageSquare,
      color: "text-secondary",
    },
    {
      name: "Problem Solving",
      score: 92,
      feedback: "Excellent analytical skills. Good at breaking down complex problems.",
      icon: Target,
      color: "text-accent",
    },
    {
      name: "Cultural Fit",
      score: 80,
      feedback: "Good alignment with company values. Showed enthusiasm for the role.",
      icon: Award,
      color: "text-warning",
    },
    {
      name: "Confidence & Clarity",
      score: 75,
      feedback: "Confident delivery. Maintain better eye contact to enhance engagement.",
      icon: Star,
      color: "text-primary",
    },
    {
      name: "Time Management",
      score: 88,
      feedback: "Great pacing. Answered all questions within allocated time.",
      icon: Clock,
      color: "text-secondary",
    },
  ];

  const recentSessions = [
    {
      date: "Today",
      type: "AI Technical",
      score: 87,
      duration: "45 min",
      status: "completed",
    },
    {
      date: "Yesterday",
      type: "Peer-to-Peer",
      score: 82,
      duration: "60 min",
      status: "completed",
    },
    {
      date: "3 days ago",
      type: "Behavioral",
      score: 79,
      duration: "30 min",
      status: "completed",
    },
    {
      date: "1 week ago",
      type: "System Design",
      score: 85,
      duration: "90 min",
      status: "completed",
    },
  ];

  const strengths = [
    "Strong technical foundation",
    "Excellent problem-solving skills",
    "Good time management",
    "Clear and structured thinking",
  ];

  const improvements = [
    "Practice STAR method for behavioral questions",
    "Improve eye contact during video interviews",
    "Work on articulating thought process",
    "Enhance cultural fit responses",
  ];

  return (
    <div className="max-w-6xl space-y-8 pb-20 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Interview Feedback</h1>
        <p className="text-muted-foreground">
          Detailed performance analysis and recommendations for improvement
        </p>
      </div>

      {/* Overall Score */}
      <Card className="p-8 bg-gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Overall Performance</h2>
            <p className="text-sm opacity-90">Based on your last interview session</p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{overallScore}</div>
            <div className="text-sm opacity-90">out of 100</div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <Progress value={overallScore} className="flex-1 bg-primary-foreground/20 h-3" />
          <Badge className="bg-accent text-accent-foreground">
            <TrendingUp className="h-3 w-3 mr-1" />
            +5% from last time
          </Badge>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                      </div>
                    </div>
                    <span className="text-2xl font-bold">{category.score}</span>
                  </div>
                  <Progress value={category.score} className="mb-3 h-2" />
                  <p className="text-sm text-muted-foreground">{category.feedback}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Sessions</h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          {recentSessions.map((session, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{session.score}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{session.type}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-semibold">Your Strengths</h3>
              </div>
              <div className="space-y-3">
                {strengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/10"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Areas for Improvement */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-warning" />
                <h3 className="text-xl font-semibold">Areas to Improve</h3>
              </div>
              <div className="space-y-3">
                {improvements.map((improvement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-warning/10"
                  >
                    <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-xl font-semibold mb-4">Personalized Recommendations</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Focus on Behavioral Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Schedule 2-3 sessions focusing specifically on behavioral questions using the STAR method.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Practice Video Presence</h4>
                  <p className="text-sm text-muted-foreground">
                    Work on maintaining eye contact with the camera to build stronger engagement in virtual interviews.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
