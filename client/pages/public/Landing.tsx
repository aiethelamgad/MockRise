import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Hero3D } from "@/components/Hero3D";
import { Section3D } from "@/components/3D/Section3D";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PolicyModal } from '@/components/PolicyModal';
import {
  Brain,
  Users,
  Heart,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  Video,
  FileText,
  Award,
  CheckCircle2,
  Sparkles,
  Facebook,
  Twitter,
  Instagram,
  Linkedin as LinkedinIcon,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Star,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Handle scroll to section when navigating from other pages
  useEffect(() => {
    const stateTarget = (location.state as any)?.scrollTo as string | undefined;
    const hashTarget = location.hash ? location.hash.replace('#', '') : undefined;
    const targetId = stateTarget ?? hashTarget;

    if (targetId) {
      // Wait for page content to fully render
      const scrollToElement = () => {
        const el = document.getElementById(targetId);
        if (el) {
          // Calculate offset for sticky navbar (navbar height)
          const navbarHeight = 64; // h-16 = 64px
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth',
          });

          // Update URL hash
          window.history.replaceState(null, '', `#${targetId}`);
          
          // Force scroll spy to update after scroll completes
          // Use multiple checks at different intervals to catch the scroll completion
          const updateScrollSpy = () => {
            window.dispatchEvent(new Event('scroll'));
          };
          
          // Check immediately and after delays to ensure scroll spy updates
          updateScrollSpy();
          setTimeout(updateScrollSpy, 200);
          setTimeout(updateScrollSpy, 400);
          setTimeout(updateScrollSpy, 600);
          setTimeout(updateScrollSpy, 800);
        }
      };

      // Delay to ensure DOM is fully rendered and images/content loaded
      const timeoutId = setTimeout(scrollToElement, 150);

      // Clear the navigation state after scrolling starts
      navigate(location.pathname + location.search, { replace: true, state: null });

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.hash]); // Re-run if state or hash changes

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Interviews",
      description: "Practice with advanced AI that adapts to your responses and provides real-time feedback.",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Peer-to-Peer Practice",
      description: "Connect with other candidates to practice together and share knowledge.",
      color: "text-secondary",
    },
    {
      icon: Heart,
      title: "Family & Friends Mode",
      description: "Invite trusted people to help you practice in a comfortable environment.",
      color: "text-accent",
    },
    {
      icon: Target,
      title: "Targeted Feedback",
      description: "Get detailed insights on technical skills, communication, and confidence.",
      color: "text-primary",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your improvement over time with comprehensive analytics.",
      color: "text-secondary",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Receive immediate feedback and actionable recommendations after each session.",
      color: "text-accent",
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: "Interview Guides",
      description: "Comprehensive guides covering all types of interviews and industries.",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Learn best practices from successful candidates and industry experts.",
    },
    {
      icon: FileText,
      title: "Question Banks",
      description: "Access thousands of interview questions categorized by role and difficulty.",
    },
    {
      icon: Award,
      title: "Certification Prep",
      description: "Prepare for industry certifications with targeted mock interviews.",
    },
  ];

  const benefits = [
    "Build genuine interview confidence",
    "Get comfortable with video interviews",
    "Improve technical communication",
    "Learn from detailed feedback",
    "Practice at your own pace",
    "Track your progress over time",
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* 3D Hero Section */}
      <Hero3D />

      {/* Mobile Hero Section - Only visible on mobile */}
      <div className="block md:hidden py-12 px-4">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold mb-4">
              Master Your Interview Skills with AI
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Practice with advanced AI that adapts to your responses and provides real-time feedback.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/login?signup=true")}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 hover:scale-105"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <Section3D backgroundType="shapes" intensity={0.15} color="#C4B5FD" speed={0.3}>
        <div id="features" className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 px-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive tools and features designed to transform you into an interview expert
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-4 sm:p-6 hover-lift h-full glass">
                    <feature.icon className={`h-10 w-10 sm:h-12 sm:w-12 ${feature.color} mb-3 sm:mb-4 mx-auto`} />
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground text-center">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section3D>

      {/* How It Works Section */}
      <Section3D backgroundType="wave" intensity={0.1} color="#C4B5FD" speed={0.4}>
        <div id="how-it-works" className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 px-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes with our simple 3-step process
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
              {[
                {
                  step: "01",
                  title: "Choose Your Mode",
                  description: "Select between AI-powered interviews, peer practice, or family/friend sessions based on your comfort level.",
                  color: "text-primary",
                },
                {
                  step: "02", 
                  title: "Practice & Improve",
                  description: "Conduct realistic mock interviews with instant feedback and detailed performance analytics.",
                  color: "text-accent",
                },
                {
                  step: "03",
                  title: "Track Progress",
                  description: "Monitor your improvement over time with comprehensive analytics and personalized recommendations.",
                  color: "text-secondary",
                },
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="relative mb-4 sm:mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 glass">
                      <span className="text-lg sm:text-2xl font-bold text-primary-foreground">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section3D>

      {/* Benefits Section */}
      <Section3D backgroundType="interactive" intensity={0.2} color="#C4B5FD" speed={0.5}>
        <div className="py-20 md:py-32">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Why MockRise Works
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Our platform is designed by interview experts and powered by
                advanced AI to give you the most realistic and valuable practice experience.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
                    <span className="text-base sm:text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-primary opacity-20 blur-3xl absolute inset-0" />
              <Card className="p-6 sm:p-8 relative glass">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl sm:text-4xl font-bold">87%</span>
                    <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                  </div>
                  <p className="text-base sm:text-lg font-medium">Success Rate</p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Of users report feeling more confident and prepared after using MockRise
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        </div>
      </Section3D>

      {/* Testimonials Section */}
      <Section3D backgroundType="mesh" intensity={0.1} color="#C4B5FD" speed={0.2}>
        <div id="testimonials" className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful candidates who improved their interview skills with MockRise
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer at Google",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                content: "MockRise helped me land my dream job at Google! The AI interviewer was incredibly realistic and the feedback was spot-on. I went from being nervous to confident in just 2 weeks.",
                rating: 5,
              },
              {
                name: "Michael Rodriguez",
                role: "Product Manager at Microsoft",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
                content: "The peer practice sessions were game-changing. Practicing with other candidates gave me real-world experience and boosted my confidence tremendously.",
                rating: 5,
              },
              {
                name: "Emily Johnson",
                role: "Data Scientist at Amazon",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
                content: "The detailed analytics helped me identify my weak areas. I improved my technical communication by 40% in just one month of practice.",
                rating: 5,
              },
              {
                name: "David Kim",
                role: "Frontend Developer at Netflix",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
                content: "The family mode was perfect for me. Practicing with my sister helped me get comfortable with the interview format before the real thing.",
                rating: 5,
              },
              {
                name: "Lisa Wang",
                role: "UX Designer at Airbnb",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
                content: "The behavioral interview prep was incredible. The AI asked follow-up questions that really challenged me and prepared me for anything.",
                rating: 5,
              },
              {
                name: "Alex Thompson",
                role: "Backend Engineer at Stripe",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
                content: "I was skeptical about AI interviews, but MockRise proved me wrong. The feedback was more detailed than any human interviewer I've had.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 hover-lift h-full">
                  <div className="flex items-center gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-current text-warning" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </Section3D>

      {/* Resources Section */}
      <Section3D backgroundType="shapes" intensity={0.1} color="#C4B5FD" speed={0.3}>
        <div id="resources" className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Learning Resources
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Access our comprehensive library of interview preparation materials
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 hover-lift text-center h-full">
                  <resource.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{resource.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Resources Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16"
          >
            <Card className="p-6 sm:p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 mx-4">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Explore Resources</h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                  Articles, FAQs, and Help Guides to boost your interview skills.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/resources")}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-all duration-300 hover:scale-105"
                >
                  Learn More
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
        </div>
      </Section3D>

      {/* About Section */}
      <Section3D backgroundType="shapes" intensity={0.15} color="#C4B5FD" speed={0.3}>
        <div id="about" className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              About MockRise
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              We're on a mission to democratize interview preparation and help everyone land their dream job
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Our Mission</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                At MockRise, we believe that interview success shouldn't depend on expensive coaching or luck.
                Our AI-powered platform makes professional interview preparation accessible to everyone,
                regardless of background or budget.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                We combine cutting-edge artificial intelligence with human expertise to create the most
                realistic and effective interview practice experience available.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Users Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">87%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">4.9★</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">AI Available</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-primary opacity-20 blur-3xl absolute inset-0" />
              <Card className="p-6 sm:p-8 relative glass">
                <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Our Team</h4>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      name: "Dr. Sarah Johnson",
                      role: "CEO & Co-Founder",
                      expertise: "Former Google Engineering Manager",
                      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                    },
                    {
                      name: "Michael Chen",
                      role: "CTO & Co-Founder",
                      expertise: "AI Research at Stanford",
                      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
                    },
                    {
                      name: "Emily Rodriguez",
                      role: "Head of Product",
                      expertise: "UX Design at Apple",
                      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
                    },
                  ].map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{member.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-primary">{member.expertise}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        </div>
      </Section3D>

      {/* Contact Section */}
      <Section3D backgroundType="mesh" intensity={0.1} color="#C4B5FD" speed={0.2}>
        <div id="contact" className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We're here to help you succeed in your interview journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto px-4">
            {[
              {
                icon: Mail,
                title: "Email Support",
                description: "Get help via email within 24 hours",
                contact: "support@mockrise.com",
                action: "Send Email",
              },
              {
                icon: MessageSquare,
                title: "Live Chat",
                description: "Chat with our support team instantly",
                contact: "Available 24/7",
                action: "Start Chat",
              },
              {
                icon: Phone,
                title: "Phone Support",
                description: "Speak directly with our team",
                contact: "+1 (555) 123-4567",
                action: "Call Now",
              },
            ].map((contact, index) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-4 sm:p-6 hover-lift text-center h-full">
                  <contact.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{contact.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">{contact.description}</p>
                  <p className="text-xs sm:text-sm font-medium mb-3 sm:mb-4">{contact.contact}</p>
                  <Button variant="outline" size="sm" className="w-full hover:bg-gradient-accent hover:opacity-70 hover:scale-105 transition-all duration-200 text-xs sm:text-sm">
                    {contact.action}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        </div>
      </Section3D>

      {/* CTA Section */}
      <Section3D 
        backgroundType="mesh" 
        intensity={0.08} // Very subtle intensity
        color="#C4B5FD"
        speed={0.25} // Slower speed for elegance
        className="bg-gradient-primary"
      >
        <div className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center text-primary-foreground"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of candidates who have improved their interview skills with MockRise
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/login?signup=true")}
                className="bg-background text-foreground hover:bg-background/90 transition-all duration-300 hover:scale-105 text-base sm:text-lg px-6 sm:px-8 relative z-10"
              >
                Get Started Today
              </Button>
            </motion.div>
          </div>
        </div>
      </Section3D>

      <Footer />
    </div>
  );
}
