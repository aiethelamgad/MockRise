// import { Navbar } from "@/components/common/Navbar";
// import { useState, useEffect, useCallback } from "react";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
// import { AnimatedHero } from "@/components/AnimatedHero";
// import { EnhancedCard } from "@/components/ui/enhanced-card";
// import { EnhancedButton } from "@/components/ui/enhanced-button";
// // Fixed import path for QuickActionsSlider to match correct components location
// import QuickActionsSlider from "@/components/QuickActionsSlider";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import "keen-slider/keen-slider.min.css";
// import { PolicyModal } from "@/components/PolicyModal";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import {
//   Search,
//   HelpCircle,
//   MessageSquare,
//   Phone,
//   Mail,
//   Clock,
//   CheckCircle2,
//   AlertCircle,
//   BookOpen,
//   Video,
//   FileText,
//   Download,
//   Star,
//   ThumbsUp,
//   ThumbsDown,
//   ChevronRight,
//   Sparkles,
//   Users,
//   Settings,
//   CreditCard,
//   Shield,
//   Zap,
//   Target,
//   Brain,
//   Eye,
//   Facebook,
//   Instagram,
//   Lock,
//   LinkedinIcon,
//   Twitter,
//   ChevronLeft,
// } from "lucide-react";

// export default function HelpCenter() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeTab, setActiveTab] = useState("articles");
//   const [showPrivacy, setShowPrivacy] = useState(false);
//   const [showTerms, setShowTerms] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);


//   // Mock data for help center
//   const quickActions = [
//     {
//       title: "Get Started",
//       description: "New to MockRise? Start here",
//       icon: Sparkles,
//       color: "text-primary",
//       href: "#getting-started",
//     },
//     {
//       title: "Account Setup",
//       description: "Set up your profile and preferences",
//       icon: Settings,
//       color: "text-accent",
//       href: "#account-setup",
//     },
//     {
//       title: "Billing & Plans",
//       description: "Manage your subscription",
//       icon: CreditCard,
//       color: "text-secondary",
//       href: "#billing",
//     },
//     {
//       title: "Technical Support",
//       description: "Get help with technical issues",
//       icon: Shield,
//       color: "text-warning",
//       href: "#technical",
//     },
//   ];

//   // Auto-scroll with pause/resume
// useEffect(() => {
//   if (isPaused) return;
  
//   const interval = setInterval(() => {
//     setCurrentIndex((prevIndex) => 
//       prevIndex === quickActions.length - 1 ? 0 : prevIndex + 1
//     );
//   }, 4000);

//   return () => clearInterval(interval);
// }, [quickActions.length, isPaused]);

// // Manual navigation that resets auto-scroll timer
// const goToSlide = useCallback((index: number) => {
//   setCurrentIndex(index);
//   // Optional: Add logic to reset the auto-scroll timer
// }, []);



//   return (
//     <div className="min-h-screen">
//               <Navbar />
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
//       <div className="space-y-8 pb-20 lg:pb-8">
//         {/* Animated Hero Section */}
//         <AnimatedHero
//           title="How Can We Help?"
//           subtitle="Find answers, get support, and make the most of MockRise with our comprehensive help resources"
//           badge="Help Center"
//           badgeIcon={HelpCircle}
//         />

//         {/* Search */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="container"
//         >
//             <div className="relative max-w-2xl mx-auto border border-border/50 rounded-lg overflow-hidden shadow-md">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search for help, FAQs, or topics..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 text-lg bg-background/50 border-border/50 focus:border-primary/50"
//               />
//             </div>
//         </motion.div>

//         {/* Quick Actions */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="container"
//         >
//           <h2 className="text-2xl font-bold mb-6 text-center">Quick Actions</h2>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {quickActions.map((action, index) => (
//               <motion.div
//                 key={action.title}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 whileHover={{ y: -5 }}
//                 className="cursor-pointer"
//               >
//                 <EnhancedCard className="p-6 hover-lift glass" variant="glass">
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
//                       <action.icon className={`h-6 w-6 ${action.color}`} />
//                     </div>
//                     <h3 className="font-semibold">{action.title}</h3>
//                   </div>
//                   <p className="text-sm text-muted-foreground mb-4">
//                     {action.description}
//                   </p>
//                   <EnhancedButton variant="outline" size="sm" className="w-full bg-gradient-to-tr from-primary/40 to-secondary/40 text-white hover:bg-primary/10">
//                     Get Started
//                     <ChevronRight className="h-4 w-4 ml-2" />
//                   </EnhancedButton>
//                 </EnhancedCard>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>

//         {/* Main Content Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.3 }}
//           className="container"
//         >
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//             <div className="flex justify-center">
//               <TabsList className="grid w-full max-w-2xl grid-cols-2 bg-muted/50">
//                 <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Status</TabsTrigger>
//               </TabsList>
//             </div>

//           {/* Status Tab */}
//           <TabsContent value="status" className="space-y-6">
//             <EnhancedCard className="p-6 h-full" variant="elevated">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
//                 <h3 className="text-xl font-semibold">All Systems Operational</h3>
//               </div>
//               <div className="grid md:grid-cols-3 gap-6">
//                 {[
//                   { service: "Web Application", status: "Operational", uptime: "99.9%" },
//                   { service: "Video Interviews", status: "Operational", uptime: "99.8%" },
//                   { service: "AI Services", status: "Operational", uptime: "99.7%" },
//                   { service: "Payment Processing", status: "Operational", uptime: "99.9%" },
//                   { service: "Email Services", status: "Operational", uptime: "99.6%" },
//                   { service: "File Storage", status: "Operational", uptime: "99.8%" },
//                 ].map((service, index) => (
//                   <motion.div
//                     key={service.service}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                     className="p-4 rounded-lg border border-border"
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="font-medium">{service.service}</span>
//                       <Badge className="bg-green-100 text-green-800 hover:bg-accent/40 hover:text-accent-foreground">
//                         {service.status}
//                       </Badge>
//                     </div>
//                     <div className="text-sm text-muted-foreground">
//                       Uptime: {service.uptime}
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </EnhancedCard>
//           </TabsContent>
//         </Tabs>
//       </motion.div>

//       {/* Footer */}
//             <footer className="bg-background border-t border-border py-12">
//               <div className="container mx-auto px-4">
//                 <div className="grid md:grid-cols-5 gap-8 mb-8">
//                   <div>
//                     <Link to="/" className="flex items-center space-x-2 group">
//                       <div className="relative">
//                         <Sparkles className="h-6 w-6 text-primary transition-all duration-300 group-hover:text-secondary group-hover:rotate-12" />
//                         <div className="absolute inset-0 blur-lg bg-primary/20 group-hover:bg-secondary/30 transition-all duration-300 -z-10" />
//                       </div>
//                       <span className="text-xl font-bold gradient-text">MockRise</span>
//                     </Link>
//                     <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
//                       Empowering job seekers with AI-powered interview practice for a brighter future.
//                     </p>
      
//                     {/* Social Media Icons */}
//                     <div className="flex gap-2">
//                       {[
//                         { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
//                         { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
//                         { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
//                         { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
//                       ].map((social, i) => (
//                         <motion.a
//                           key={i}
//                           href={social.href}
//                           aria-label={social.label}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           whileHover={{ scale: 1.2, y: -2 }}
//                           whileTap={{ scale: 0.95 }}
//                           className="p-2 rounded-xl bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
//                         >
//                           <social.icon className="h-5 w-5" />
//                         </motion.a>
//                       ))}
//                     </div>
//                   </div>
      
//                   <div>
//                     <h4 className="font-semibold mb-4 text-lg">Product</h4>
//                     <ul className="space-y-2 text-sm text-muted-foreground">
//                       <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
//                       <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
//                     </ul>
//                   </div>
      
//                   <div>
//                     <h4 className="font-semibold mb-4 text-lg">Resources</h4>
//                     <ul className="space-y-2 text-sm text-muted-foreground">
//                       <li><Link to="/resources" className="hover:text-primary transition-colors">Resources</Link></li>
//                       <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
//                       <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
//                     </ul>
//                   </div>
                  
//                   <div>
//                     <h4 className="font-semibold mb-4 text-lg">Company</h4>
//                     <ul className="space-y-2 text-sm text-muted-foreground">
//                       <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
//                       <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
//                       <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
//                       <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
//                     </ul>
//                   </div>
      
//                   <div>
//                     <h4 className="font-semibold mb-4 text-lg">Legal</h4>
//                     <ul className="space-y-2 text-sm text-muted-foreground">
//                       <li>
//                         <button
//                           onClick={() => setShowPrivacy(true)}
//                           className="hover:text-primary transition-colors flex items-center gap-2"
//                         >
//                           <Lock className="h-3 w-3" />
//                           Privacy Policy
//                         </button>
//                       </li>
//                       <li>
//                         <button
//                           onClick={() => setShowTerms(true)}
//                           className="hover:text-primary transition-colors flex items-center gap-2"
//                         >
//                           <FileText className="h-3 w-3" />
//                           Terms of Service
//                         </button>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
      
//                 <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
//                   <p>&copy; 2025 MockRise. All rights reserved.</p>
//                 </div>
//               </div>
//             </footer>
      
//             {/* Modals */}
//             <PolicyModal
//               open={showPrivacy}
//               onOpenChange={setShowPrivacy}
//               type="privacy"
//             />
//             <PolicyModal
//               open={showTerms}
//               onOpenChange={setShowTerms}
//               type="terms"
//             />
//       </div>
//     </div>
//     </div>
//   );
// }
