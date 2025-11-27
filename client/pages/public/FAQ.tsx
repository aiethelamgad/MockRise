import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedHero } from "@/components/AnimatedHero";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PolicyModal } from "@/components/PolicyModal";
import { ROUTES } from "@/routes/routes.config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Search,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Video,
  FileText,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Sparkles,
  Users,
  Settings,
  CreditCard,
  Shield,
  Zap,
  Target,
  Brain,
  Eye,
  CircleHelp,
  Lightbulb,
  TrendingUp,
  Facebook,
  Instagram,
  Lock,
  LinkedinIcon,
  Twitter,
} from "lucide-react";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Mock data for FAQ
  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Sparkles,
      questions: [
        {
          question: "How do I create an account on MockRise?",
          answer: "Creating an account is simple! Click the 'Sign Up' button on our homepage, enter your email and password, choose your role (Trainee or Interviewer), and complete the verification process. For interviewers, you'll need to provide additional information and wait for approval."
        },
        {
          question: "What's the difference between Trainee and Interviewer roles?",
          answer: "Trainees use MockRise to practice interviews and improve their skills. Interviewers conduct mock interviews for trainees and earn money. Interviewers need to be approved by our team and provide relevant experience credentials."
        },
        {
          question: "How much does MockRise cost?",
          answer: "MockRise offers a freemium model. Basic features are free for trainees, with premium features available through subscription plans. Interviewers earn money for conducting interviews, with MockRise taking a small commission."
        },
        {
          question: "Do I need to download any software?",
          answer: "No downloads required! MockRise is a web-based platform that works in your browser. We recommend using Chrome, Firefox, or Safari for the best experience."
        }
      ]
    },
    {
      id: "interviews",
      title: "Interviews & Practice",
      icon: Target,
      questions: [
        {
          question: "What types of interviews can I practice?",
          answer: "MockRise supports technical interviews, behavioral interviews, system design sessions, coding challenges, and industry-specific interviews. You can choose from AI-powered interviews, peer practice, or family/friend sessions."
        },
        {
          question: "How realistic are the AI interviews?",
          answer: "Our AI interviews are highly realistic, featuring natural conversation flow, follow-up questions, and industry-specific scenarios. The AI adapts to your responses and provides detailed feedback on your performance."
        },
        {
          question: "Can I practice with real people?",
          answer: "Yes! MockRise offers peer-to-peer practice sessions where you can interview with other candidates, and family/friend mode where you can practice with people you know."
        },
        {
          question: "How long do interviews typically last?",
          answer: "Interview duration varies by type: Technical interviews (30-60 minutes), Behavioral interviews (20-30 minutes), System design (45-90 minutes), and Coding challenges (15-45 minutes). You can set custom durations."
        }
      ]
    },
    {
      id: "feedback",
      title: "Feedback & Analytics",
      icon: TrendingUp,
      questions: [
        {
          question: "What kind of feedback do I receive?",
          answer: "You'll receive comprehensive feedback including communication skills, technical knowledge, problem-solving approach, confidence level, and specific improvement suggestions. Our AI analyzes your speech patterns, response quality, and interview performance."
        },
        {
          question: "How detailed are the performance analytics?",
          answer: "Our analytics include progress tracking over time, skill assessments, confidence metrics, response time analysis, and personalized recommendations for improvement areas."
        },
        {
          question: "Can I track my improvement over time?",
          answer: "Absolutely! MockRise provides detailed progress tracking with visual charts, skill development timelines, and performance comparisons to help you see your growth."
        },
        {
          question: "Is my interview data private?",
          answer: "Yes, all your interview data is encrypted and private. We never share your personal information or interview recordings with third parties without your explicit consent."
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Support",
      icon: Settings,
      questions: [
        {
          question: "What browsers are supported?",
          answer: "MockRise works best on Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for optimal performance."
        },
        {
          question: "Do I need a microphone and camera?",
          answer: "A microphone is required for interviews. A camera is optional but recommended for a more realistic interview experience. We support both audio-only and video interviews."
        },
        {
          question: "What if I experience technical issues during an interview?",
          answer: "If you encounter technical problems, you can pause the interview and resume later. Our support team is available 24/7 to help resolve any issues quickly."
        },
        {
          question: "Can I use MockRise on mobile devices?",
          answer: "Yes! MockRise is fully responsive and works on smartphones and tablets. However, we recommend using a desktop or laptop for the best interview experience."
        }
      ]
    },
    {
      id: "billing",
      title: "Billing & Payments",
      icon: CreditCard,
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment system."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied with MockRise, contact our support team for a full refund."
        },
        {
          question: "How do interviewers get paid?",
          answer: "Interviewers are paid weekly via bank transfer or PayPal. Payments are processed automatically, and you can track your earnings in your dashboard."
        }
      ]
    },
    {
      id: "safety",
      title: "Safety & Privacy",
      icon: Shield,
      questions: [
        {
          question: "How do you ensure user safety?",
          answer: "We have strict community guidelines, content moderation, and reporting systems. All users must verify their identity, and we monitor for inappropriate behavior."
        },
        {
          question: "Can I report inappropriate behavior?",
          answer: "Yes, you can report any inappropriate behavior through our reporting system. We take all reports seriously and investigate promptly."
        },
        {
          question: "Is my personal information secure?",
          answer: "Absolutely. We use enterprise-grade encryption, secure servers, and comply with GDPR and other privacy regulations. Your data is never sold or shared."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Yes, you can delete your account and all associated data at any time from your account settings. This action is irreversible, so please download any data you want to keep first."
        }
      ]
    }
  ];

  const popularQuestions = [
    {
      question: "How do I get started with MockRise?",
      answer: "Simply create an account, choose your role, and start practicing! We'll guide you through your first interview.",
      category: "Getting Started",
      icon: Sparkles
    },
    {
      question: "What makes MockRise different from other platforms?",
      answer: "MockRise combines AI technology with human expertise to provide the most realistic interview experience available.",
      category: "Platform",
      icon: Brain
    },
    {
      question: "Can I practice specific company interviews?",
      answer: "Yes! We have company-specific interview formats for major tech companies like Google, Amazon, Microsoft, and more.",
      category: "Interviews",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="space-y-8 pb-20 lg:pb-8">
          {/* Animated Hero Section */}
          <AnimatedHero
            title="Got Questions?"
            subtitle="Find answers to common questions about MockRise, interviews, and how to get the most out of our platform"
            badge="Frequently Asked Questions"
            badgeIcon={CircleHelp}
          />

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="container"
          >
              <div className="relative max-w-2xl mx-auto border border-border/50 rounded-lg overflow-hidden shadow-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-lg bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
          </motion.div>

          {/* Popular Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Popular Questions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {popularQuestions.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                >
                  <EnhancedCard className="p-6 hover-lift glass" variant="glass">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <faq.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs hover:bg-primary/70 hover:text-white">
                        {faq.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="container"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
            <div className="space-y-6">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                >
                  <EnhancedCard className="p-6 glass" variant="glass">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold">{category.title}</h3>
                    </div>
                    <Accordion type="single" collapsible className="space-y-2">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="border-border/50">
                          <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pt-2">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="container"
          >
            <EnhancedCard className="p-8 text-center glass" variant="glass">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
                <p className="text-muted-foreground mb-6">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <EnhancedButton className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Live Chat
                  </EnhancedButton>
                  <EnhancedButton variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </EnhancedButton>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Footer */}
          <footer className="bg-background border-t border-border py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-5 gap-8 mb-8">
                <div>
                  <Link to={ROUTES.HOME} className="flex items-center space-x-2 group">
                    <div className="relative">
                      <Sparkles className="h-6 w-6 text-primary transition-all duration-300 group-hover:text-secondary group-hover:rotate-12" />
                      <div className="absolute inset-0 blur-lg bg-primary/20 group-hover:bg-secondary/30 transition-all duration-300 -z-10" />
                    </div>
                    <span className="text-xl font-bold gradient-text">MockRise</span>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Empowering job seekers with AI-powered interview practice for a brighter future.
                  </p>

                  {/* Social Media Icons */}
                  <div className="flex gap-2">
                    {[
                      { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                      { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
                      { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                      { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
                    ].map((social, i) => (
                      <motion.a
                        key={i}
                        href={social.href}
                        aria-label={social.label}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.2, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-xl bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <social.icon className="h-5 w-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Product</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><Link to={ROUTES.RESOURCES} className="hover:text-primary transition-colors">Resources</Link></li>
                    {/* <li><Link to={ROUTES.HELP} className="hover:text-primary transition-colors">Help Center</Link></li> */}
                    <li><Link to={ROUTES.FAQ} className="hover:text-primary transition-colors">FAQ</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                    <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                    <li><a href="#resources" className="hover:text-primary transition-colors">Careers</a></li>
                    <li><a href="#resources" className="hover:text-primary transition-colors">Blog</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-lg">Legal</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>
                      <button
                        onClick={() => setShowPrivacy(true)}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Lock className="h-3 w-3" />
                        Privacy Policy
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setShowTerms(true)}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <FileText className="h-3 w-3" />
                        Terms of Service
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                <p>&copy; 2025 MockRise. All rights reserved.</p>
              </div>
            </div>
          </footer>

          {/* Modals */}
          <PolicyModal
            open={showPrivacy}
            onOpenChange={setShowPrivacy}
            type="privacy"
          />
          <PolicyModal
            open={showTerms}
            onOpenChange={setShowTerms}
            type="terms"
          />
        </div>
      </div>
    </div>
  );
}
