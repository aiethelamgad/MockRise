import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Sparkles, Menu, X, ChevronDown, BookOpen, HelpCircle, MessageSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardRoute } from "@/utils/routing";
import { useSectionNavigation } from "@/hooks/useSectionNavigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { navigateToSection, navigateToPage } = useSectionNavigation();
  const activeSection = useScrollSpy(['features', 'how-it-works', 'testimonials', 'resources', 'about', 'contact']);
  
  // Get dashboard route based on user role
  const dashboardRoute = user ? getDashboardRoute(user.role) : null;

  // On landing page, treat rejected or pending users as not signed in for navbar purposes
  const isLandingPage = location.pathname === '/';
  const isRejectedUser = user?.status === 'rejected';
  const isPendingUser = user?.status === 'pending_verification';
  const shouldShowSignedInUI = user && !(isLandingPage && (isRejectedUser || isPendingUser));

  const menuItems = [
    { label: "Features", sectionId: "features" },
    { label: "How It Works", sectionId: "how-it-works" },
    { label: "Testimonials", sectionId: "testimonials" },
    { label: "About", sectionId: "about" },
    { label: "Contact", sectionId: "contact" },
  ];

  const resourcesItems = [
    // { label: "Pricing", href: "/pricing", icon: Sparkles },
    { label: "Resources", href: "/resources", icon: BookOpen },
    // { label: "Help Center", href: "/help", icon: HelpCircle },
    { label: "FAQ", href: "/faq", icon: MessageSquare },
  ];

  

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-primary transition-all duration-300 group-hover:text-secondary group-hover:rotate-12" />
            <div className="absolute inset-0 blur-lg bg-primary/20 group-hover:bg-secondary/30 transition-all duration-300 -z-10" />
          </div>
          <span className="text-xl font-bold gradient-text">MockRise</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center justify-center space-x-2 xl:space-x-4 mx-auto absolute left-1/2 transform -translate-x-1/2">
          {menuItems.slice(0, 3).map((item) => {
            const isActive = activeSection === item.sectionId;
            const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              navigateToSection(item.sectionId);
            };

            return (
              <button
                key={item.label}
                onClick={handleClick}
                className={`text-sm xl:text-base font-medium transition-all duration-200 relative px-2 py-1 ${
                  isActive
                    ? "text-primary font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Resources Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`text-sm xl:text-base font-medium transition-all duration-200 relative p-2 h-auto ${
                  activeSection === 'resources'
                    ? "text-primary font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-foreground/80 hover:bg-transparent hover:text-primary"
                }`}
              >
                Resources
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {resourcesItems.map((item) => (
                <DropdownMenuItem 
                  key={item.label}
                  onClick={() => navigateToPage(item.href)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {menuItems.slice(3).map((item) => {
            const isActive = activeSection === item.sectionId;
            const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              navigateToSection(item.sectionId);
            };

            return (
              <button
                key={item.label}
                onClick={handleClick}
                className={`text-sm xl:text-base font-medium transition-all duration-200 relative px-2 py-1 ${
                  isActive
                    ? "text-primary font-semibold after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <ThemeToggle />
          {/* Show Sign In button only when user is NOT signed in (or rejected on landing page) */}
          {!loading && !shouldShowSignedInUI && (
            <Button 
              variant="ghost" 
              onClick={() => navigate("/login")}
              className="hover:bg-gradient-primary hover:opacity-40 hover:scale-105 transition-all duration-200 text-primary"
            >
              Sign In
            </Button>
          )}
          {/* Show Dashboard button when signed in (and not rejected on landing), Get Started when not signed in */}
          {!loading && (
            <Button 
              onClick={() => {
                if (shouldShowSignedInUI && dashboardRoute) {
                  navigate(dashboardRoute);
                } else {
                  navigate("/login?signup=true");
                }
              }}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {shouldShowSignedInUI ? "Dashboard" : "Get Started"}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background"
          >
            <div className="container py-4 space-y-4">
              {menuItems.map((item) => {
                const handleClick = () => {
                  setMobileMenuOpen(false);
                  navigateToSection(item.sectionId);
                };
                
                return (
                  <button
                    key={item.label}
                    onClick={handleClick}
                    className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors text-left w-full"
                  >
                    {item.label}
                  </button>
                );
              })}
              
              {/* Mobile Resources */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground/60">Resources</div>
                {resourcesItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigateToPage(item.href);
                    }}
                    className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary transition-colors ml-4 text-left w-full"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col space-y-2 pt-4">
                {/* Show Sign In button only when user is NOT signed in (or rejected on landing page) */}
                {!loading && !shouldShowSignedInUI && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                )}
                {/* Show Dashboard button when signed in (and not rejected on landing), Get Started when not signed in */}
                {!loading && (
                  <Button 
                    onClick={() => {
                      if (shouldShowSignedInUI && dashboardRoute) {
                        navigate(dashboardRoute);
                      } else {
                        navigate("/login?signup=true");
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="bg-gradient-primary text-primary-foreground"
                  >
                    {shouldShowSignedInUI ? "Dashboard" : "Get Started"}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
