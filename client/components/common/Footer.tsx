import { Link } from "react-router-dom";
import { Sparkles, Lock, FileText, Facebook, Twitter, Instagram, Linkedin as LinkedinIcon } from "lucide-react";
import { PolicyModal } from '@/components/PolicyModal';
import { useState } from 'react';
import { motion } from "framer-motion";
import { useSectionNavigation } from "@/hooks/useSectionNavigation";

export function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { navigateToSection, navigateToPage } = useSectionNavigation();

  return (
    <>
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 group">
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
                <li>
                  <button
                    onClick={() => navigateToSection('features')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToSection('resources')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    Resources
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToPage('/pricing')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => navigateToPage('/resources')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    Resources
                  </button>
                </li>
                {/* <li>
                  <button
                    onClick={() => navigateToPage('/help')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    Help Center
                  </button>
                </li> */}
                <li>
                  <button
                    onClick={() => navigateToPage('/faq')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button
                    onClick={() => navigateToSection('about')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToSection('contact')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToSection('/resources')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                    disabled
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigateToSection('/resources')}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                    disabled
                  >
                    Blog
                  </button>
                </li>
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
    </>
  );
}
