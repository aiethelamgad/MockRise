import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Section3D } from "@/components/3D/Section3D";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle2,
  X,
  Star,
  Zap,
  Users,
  Crown,
  HelpCircle,
} from "lucide-react";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const pricingTiers = [
    {
      name: "Free",
      icon: Zap,
      description: "Perfect for getting started with interview practice",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        { name: "5 AI interview sessions per month", included: true },
        { name: "Basic feedback analysis", included: true },
        { name: "Practice with friends & family", included: true },
        { name: "Access to interview guides", included: true },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "Team collaboration tools", included: false },
        { name: "Custom interview scenarios", included: false },
      ],
      ctaText: "Get Started Free",
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: "Pro",
      icon: Star,
      description: "Ideal for serious candidates preparing for top companies",
      monthlyPrice: 29,
      yearlyPrice: 19,
      features: [
        { name: "Unlimited AI interview sessions", included: true },
        { name: "Advanced feedback analysis", included: true },
        { name: "Practice with friends & family", included: true },
        { name: "Access to interview guides", included: true },
        { name: "Advanced analytics & insights", included: true },
        { name: "Priority email support", included: true },
        { name: "Team collaboration tools", included: false },
        { name: "Custom interview scenarios", included: false },
      ],
      ctaText: "Start Pro Trial",
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: "Team",
      icon: Crown,
      description: "Perfect for organizations and interview training programs",
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Up to 50 team members", included: true },
        { name: "Team collaboration tools", included: true },
        { name: "Custom interview scenarios", included: true },
        { name: "Admin dashboard & analytics", included: true },
        { name: "Dedicated success manager", included: true },
        { name: "Custom branding options", included: true },
        { name: "API access", included: true },
      ],
      ctaText: "Contact Sales",
      ctaVariant: "outline" as const,
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
    },
    {
      question: "Is there a free trial for Pro?",
      answer: "Yes! We offer a 14-day free trial for the Pro plan. No credit card required to start your trial.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans.",
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Absolutely. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your billing period.",
    },
    {
      question: "Do you offer discounts for students or non-profits?",
      answer: "Yes! We offer special pricing for students, educators, and non-profit organizations. Contact our support team for details.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data is yours. You can export all your interview sessions and analytics before canceling. We retain data for 30 days after cancellation in case you change your mind.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <Section3D backgroundType="shapes" intensity={0.15} color="#C4B5FD" speed={0.3}>
        <div className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 px-4"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Choose Your Plan
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Select the perfect plan to accelerate your interview preparation journey
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Yearly
                  </span>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full font-medium">
                    Save 33%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-4">
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative"
                >
                  {tier.popular && (
                    <div className="absolute -top-1 right-2 transform z-10">
                      <div className="bg-gradient-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <Card className={`p-6 md:p-8 hover-lift h-full relative overflow-hidden ${
                    tier.popular
                      ? 'ring-2 ring-primary shadow-xl scale-105'
                      : 'glass'
                  }`}>
                    {tier.popular && (
                      <div className="absolute inset-0 bg-gradient-primary opacity-5 rounded-lg" />
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <tier.icon className={`h-8 w-8 ${tier.popular ? 'text-primary' : 'text-secondary'}`} />
                        <h3 className="text-xl md:text-2xl font-bold">{tier.name}</h3>
                      </div>

                      <p className="text-muted-foreground mb-6">{tier.description}</p>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl md:text-4xl font-bold">
                            ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                          </span>
                          {tier.monthlyPrice > 0 && (
                            <span className="text-muted-foreground">
                              /{isYearly ? 'month' : 'month'}
                            </span>
                          )}
                        </div>
                        {isYearly && tier.monthlyPrice > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Billed annually (${tier.yearlyPrice * 12}/year)
                          </p>
                        )}
                      </div>

                      <Button
                        className={`w-full mb-6 ${
                          tier.popular
                            ? 'bg-gradient-primary hover:opacity-90'
                            : ''
                        }`}
                        variant={tier.ctaVariant}
                        size="lg"
                      >
                        {tier.ctaText}
                      </Button>

                      <div className="space-y-3">
                        {tier.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-3">
                            {feature.included ? (
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${
                              feature.included ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section3D>

      {/* FAQ Section */}
      <Section3D backgroundType="mesh" intensity={0.1} color="#C4B5FD" speed={0.2}>
        <div className="py-20 md:py-32">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16 px-4"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about MockRise pricing and features
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover-lift glass">
                      <div className="flex items-start gap-4">
                        <HelpCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-16"
            >
              <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 mx-4 max-w-2xl mx-auto">
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Still have questions?</h3>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                  Our support team is here to help you choose the right plan for your needs.
                </p>
                <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                  Contact Support
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section3D>

      <Footer />
    </div>
  );
}
