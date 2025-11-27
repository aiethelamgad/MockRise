import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, FileText } from 'lucide-react';

interface PolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'privacy' | 'terms';
}

export function PolicyModal({ open, onOpenChange, type }: PolicyModalProps) {
  const isPrivacy = type === 'privacy';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {isPrivacy ? (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-secondary" />
              </div>
            )}
            <DialogTitle className="text-2xl">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isPrivacy
              ? 'How we collect, use, and protect your personal information'
              : 'Please read these terms carefully before using our platform'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            {isPrivacy ? (
              <>
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Our Commitment to Your Privacy</h3>
                  <p className="text-muted-foreground">
                    At MockRise, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Data Collection</h3>
                  <p className="text-muted-foreground mb-2">
                    We collect information you provide directly (name, email, profile details) and usage data (interview sessions, performance metrics). All data is encrypted and stored securely.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Personal information: Name, email address, profile picture</li>
                    <li>Interview data: Session recordings, performance scores, feedback</li>
                    <li>Usage analytics: Pages visited, features used, time spent</li>
                    <li>Technical data: IP address, browser type, device information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Data Usage</h3>
                  <p className="text-muted-foreground mb-2">
                    We use your data to provide and improve our services, personalize your experience, send important notifications, and generate anonymized analytics to enhance the platform.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Deliver and maintain our interview practice platform</li>
                    <li>Personalize your learning experience and recommendations</li>
                    <li>Analyze performance trends and provide detailed feedback</li>
                    <li>Send service updates, security alerts, and support messages</li>
                    <li>Improve our AI models and platform features</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Data Protection</h3>
                  <p className="text-muted-foreground">
                    We implement industry-standard security measures including encryption, secure servers, and regular security audits. We never sell your personal data to third parties.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Your Rights</h3>
                  <p className="text-muted-foreground">
                    You have the right to access, modify, or delete your data at any time through your account settings. For data requests or concerns, contact privacy@mockrise.com.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Cookies and Tracking</h3>
                  <p className="text-muted-foreground">
                    We use cookies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser preferences.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain your data as long as your account is active or as needed to provide services. You can request data deletion at any time, after which we'll remove your information within 30 days.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Changes to This Policy</h3>
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. We'll notify you of significant changes via email or through the platform. Continued use after changes indicates acceptance.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last updated: January 2025. For questions or concerns about this privacy policy, contact us at privacy@mockrise.com
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Agreement to Terms</h3>
                  <p className="text-muted-foreground">
                    By using MockRise, you agree to these Terms of Service. Please read them carefully before using our platform.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Account Responsibilities</h3>
                  <p className="text-muted-foreground mb-2">
                    You are responsible for maintaining the confidentiality of your account credentials and all activities under your account. You must provide accurate information and keep it updated.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Maintain secure passwords and don't share credentials</li>
                    <li>Provide accurate registration information</li>
                    <li>Notify us immediately of unauthorized access</li>
                    <li>You are responsible for all activity on your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Acceptable Use</h3>
                  <p className="text-muted-foreground mb-2">
                    You agree to use MockRise only for lawful purposes and in accordance with these terms. Prohibited activities include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Harassment, abuse, or threatening behavior toward others</li>
                    <li>Impersonation or misrepresentation of identity</li>
                    <li>Posting spam, malware, or harmful content</li>
                    <li>Attempting to access unauthorized areas or data</li>
                    <li>Violating others' intellectual property rights</li>
                    <li>Using the platform for illegal or fraudulent purposes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Intellectual Property</h3>
                  <p className="text-muted-foreground">
                    All content, features, and functionality on MockRise are owned by us and protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">User Content</h3>
                  <p className="text-muted-foreground">
                    You retain ownership of content you create on MockRise. By posting content, you grant us a license to use, display, and distribute it for platform operations and improvements.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Service Availability</h3>
                  <p className="text-muted-foreground">
                    We strive to provide reliable service but don't guarantee uninterrupted access. We may modify, suspend, or discontinue features at any time with reasonable notice.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    MockRise is provided "as is" without warranties. We are not responsible for any damages arising from your use of the platform. Our maximum liability is limited to the amount you paid us in the past 12 months.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Termination</h3>
                  <p className="text-muted-foreground">
                    We may terminate or suspend your account at any time for violations of these terms. You may close your account at any time through account settings.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Changes to Terms</h3>
                  <p className="text-muted-foreground">
                    We may update these terms from time to time. Continued use of MockRise after changes constitutes acceptance of the new terms. Significant changes will be communicated via email.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-base">Contact Information</h3>
                  <p className="text-muted-foreground">
                    For questions about these terms, contact us at legal@mockrise.com or through our support channels.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last updated: January 2025. These terms are governed by Egyptian law. By using MockRise, you agree to the exclusive jurisdiction of Egyptian courts.
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
