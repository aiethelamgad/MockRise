import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Save, Lock, Shield, Globe, Mail, Bell, Database, Server, Key, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SystemConfig() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Form state
  const [config, setConfig] = useState({
    platformName: "MockRise Interview Platform",
    supportEmail: "support@mockrise.com",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: "30",
    maxFileUploadSize: "10",
    enableTwoFactor: false,
    passwordMinLength: "8",
    enableRateLimiting: true,
    maxLoginAttempts: "5",
    databaseBackupFrequency: "daily",
    enableAnalytics: true,
    enableErrorTracking: true,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success("System configuration saved successfully!");
  };

  const handleChange = (field: string, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
        <p className="text-muted-foreground">
          Manage system-wide settings and platform configurations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={config.platformName}
                  onChange={(e) => handleChange("platformName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable access to the platform for all users
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={config.maintenanceMode}
                  onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowRegistration">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable new user registration
                  </p>
                </div>
                <Switch
                  id="allowRegistration"
                  checked={config.allowRegistration}
                  onCheckedChange={(checked) => handleChange("allowRegistration", checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Security Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch
                  id="requireEmailVerification"
                  checked={config.requireEmailVerification}
                  onCheckedChange={(checked) => handleChange("requireEmailVerification", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to enable 2FA for their accounts
                  </p>
                </div>
                <Switch
                  id="enableTwoFactor"
                  checked={config.enableTwoFactor}
                  onCheckedChange={(checked) => handleChange("enableTwoFactor", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={config.passwordMinLength}
                  onChange={(e) => handleChange("passwordMinLength", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e) => handleChange("sessionTimeout", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableRateLimiting">Enable Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Protect against brute force attacks
                  </p>
                </div>
                <Switch
                  id="enableRateLimiting"
                  checked={config.enableRateLimiting}
                  onCheckedChange={(checked) => handleChange("enableRateLimiting", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={config.maxLoginAttempts}
                  onChange={(e) => handleChange("maxLoginAttempts", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Account will be locked after this many failed attempts
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Feature Flags</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileUploadSize">Max File Upload Size (MB)</Label>
                <Input
                  id="maxFileUploadSize"
                  type="number"
                  value={config.maxFileUploadSize}
                  onChange={(e) => handleChange("maxFileUploadSize", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAnalytics">Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Track user behavior and platform usage
                  </p>
                </div>
                <Switch
                  id="enableAnalytics"
                  checked={config.enableAnalytics}
                  onCheckedChange={(checked) => handleChange("enableAnalytics", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableErrorTracking">Enable Error Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically track and report application errors
                  </p>
                </div>
                <Switch
                  id="enableErrorTracking"
                  checked={config.enableErrorTracking}
                  onCheckedChange={(checked) => handleChange("enableErrorTracking", checked)}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Database Settings</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="databaseBackupFrequency">Backup Frequency</Label>
                <select
                  id="databaseBackupFrequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={config.databaseBackupFrequency}
                  onChange={(e) => handleChange("databaseBackupFrequency", e.target.value)}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <Alert>
                <Database className="h-4 w-4" />
                <AlertDescription>
                  Last backup: 2 hours ago. Next backup: In 22 hours
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Advanced Settings</h2>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These settings are for advanced users only. Incorrect configuration may affect platform functionality.
              </AlertDescription>
            </Alert>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Configuration</Label>
                <Input id="apiKey" type="password" placeholder="API Key" readOnly />
                <p className="text-sm text-muted-foreground">
                  API keys are managed separately for security reasons
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setConfig({
          platformName: "MockRise Interview Platform",
          supportEmail: "support@mockrise.com",
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true,
          sessionTimeout: "30",
          maxFileUploadSize: "10",
          enableTwoFactor: false,
          passwordMinLength: "8",
          enableRateLimiting: true,
          maxLoginAttempts: "5",
          databaseBackupFrequency: "daily",
          enableAnalytics: true,
          enableErrorTracking: true,
        })}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
