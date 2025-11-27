import { useState } from "react";
import { motion } from "framer-motion";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { RadarChart, CircularProgress, BarChart, LineChart } from "@/components/ui/animated-chart";
import {
  Palette,
  Type,
  Layout,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Star,
  Heart,
  ThumbsUp,
  Download,
  Upload,
  Settings,
  User,
  Mail,
  Phone,
  Globe,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Brain,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
} from "lucide-react";

export default function StyleGuide() {
  const [activeTab, setActiveTab] = useState("colors");
  const [sliderValue, setSliderValue] = useState([50]);
  const [switchValue, setSwitchValue] = useState(false);
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Color palette data
  const colorPalette = {
    primary: [
      { name: "Primary 50", value: "hsl(239, 100%, 97%)", hex: "#F0F4FF" },
      { name: "Primary 100", value: "hsl(239, 100%, 94%)", hex: "#E0E9FF" },
      { name: "Primary 200", value: "hsl(239, 100%, 88%)", hex: "#C1D3FF" },
      { name: "Primary 300", value: "hsl(239, 100%, 80%)", hex: "#A2BDFF" },
      { name: "Primary 400", value: "hsl(239, 100%, 70%)", hex: "#83A7FF" },
      { name: "Primary 500", value: "hsl(239, 84%, 60%)", hex: "#6366F1" },
      { name: "Primary 600", value: "hsl(239, 84%, 50%)", hex: "#4F46E5" },
      { name: "Primary 700", value: "hsl(239, 84%, 40%)", hex: "#4338CA" },
      { name: "Primary 800", value: "hsl(239, 84%, 30%)", hex: "#3730A3" },
      { name: "Primary 900", value: "hsl(239, 84%, 20%)", hex: "#312E81" },
    ],
    secondary: [
      { name: "Secondary 50", value: "hsl(265, 100%, 97%)", hex: "#F5F3FF" },
      { name: "Secondary 100", value: "hsl(265, 100%, 94%)", hex: "#EDE9FE" },
      { name: "Secondary 200", value: "hsl(265, 100%, 88%)", hex: "#DDD6FE" },
      { name: "Secondary 300", value: "hsl(265, 100%, 80%)", hex: "#C4B5FD" },
      { name: "Secondary 400", value: "hsl(265, 100%, 70%)", hex: "#A78BFA" },
      { name: "Secondary 500", value: "hsl(265, 75%, 65%)", hex: "#8B5CF6" },
      { name: "Secondary 600", value: "hsl(265, 75%, 55%)", hex: "#7C3AED" },
      { name: "Secondary 700", value: "hsl(265, 75%, 45%)", hex: "#6D28D9" },
      { name: "Secondary 800", value: "hsl(265, 75%, 35%)", hex: "#5B21B6" },
      { name: "Secondary 900", value: "hsl(265, 75%, 25%)", hex: "#4C1D95" },
    ],
    accent: [
      { name: "Accent 50", value: "hsl(158, 100%, 97%)", hex: "#F0FDF4" },
      { name: "Accent 100", value: "hsl(158, 100%, 94%)", hex: "#DCFCE7" },
      { name: "Accent 200", value: "hsl(158, 100%, 88%)", hex: "#BBF7D0" },
      { name: "Accent 300", value: "hsl(158, 100%, 80%)", hex: "#86EFAC" },
      { name: "Accent 400", value: "hsl(158, 100%, 70%)", hex: "#4ADE80" },
      { name: "Accent 500", value: "hsl(158, 64%, 52%)", hex: "#22C55E" },
      { name: "Accent 600", value: "hsl(158, 64%, 42%)", hex: "#16A34A" },
      { name: "Accent 700", value: "hsl(158, 64%, 32%)", hex: "#15803D" },
      { name: "Accent 800", value: "hsl(158, 64%, 22%)", hex: "#166534" },
      { name: "Accent 900", value: "hsl(158, 64%, 12%)", hex: "#14532D" },
    ],
  };

  // Typography scale
  const typographyScale = [
    { name: "Display 1", size: "4.5rem", weight: "700", lineHeight: "1.1", usage: "Hero headings" },
    { name: "Display 2", size: "3.75rem", weight: "700", lineHeight: "1.2", usage: "Section headings" },
    { name: "H1", size: "3rem", weight: "600", lineHeight: "1.3", usage: "Page titles" },
    { name: "H2", size: "2.25rem", weight: "600", lineHeight: "1.4", usage: "Section titles" },
    { name: "H3", size: "1.875rem", weight: "600", lineHeight: "1.5", usage: "Subsection titles" },
    { name: "H4", size: "1.5rem", weight: "600", lineHeight: "1.5", usage: "Card titles" },
    { name: "H5", size: "1.25rem", weight: "600", lineHeight: "1.6", usage: "Component titles" },
    { name: "H6", size: "1.125rem", weight: "600", lineHeight: "1.6", usage: "Small titles" },
    { name: "Body Large", size: "1.125rem", weight: "400", lineHeight: "1.7", usage: "Large body text" },
    { name: "Body", size: "1rem", weight: "400", lineHeight: "1.6", usage: "Regular body text" },
    { name: "Body Small", size: "0.875rem", weight: "400", lineHeight: "1.5", usage: "Small body text" },
    { name: "Caption", size: "0.75rem", weight: "400", lineHeight: "1.4", usage: "Captions and labels" },
  ];

  // Spacing scale
  const spacingScale = [
    { name: "xs", value: "0.25rem", pixels: "4px", usage: "Tight spacing" },
    { name: "sm", value: "0.5rem", pixels: "8px", usage: "Small spacing" },
    { name: "md", value: "1rem", pixels: "16px", usage: "Medium spacing" },
    { name: "lg", value: "1.5rem", pixels: "24px", usage: "Large spacing" },
    { name: "xl", value: "2rem", pixels: "32px", usage: "Extra large spacing" },
    { name: "2xl", value: "3rem", pixels: "48px", usage: "Section spacing" },
    { name: "3xl", value: "4rem", pixels: "64px", usage: "Page spacing" },
    { name: "4xl", value: "6rem", pixels: "96px", usage: "Hero spacing" },
  ];

  // Component examples
  const buttonVariants = [
    { name: "Default", variant: "default" },
    { name: "Destructive", variant: "destructive" },
    { name: "Outline", variant: "outline" },
    { name: "Secondary", variant: "secondary" },
    { name: "Ghost", variant: "ghost" },
    { name: "Link", variant: "link" },
    { name: "Gradient", variant: "gradient" },
    { name: "Success", variant: "success" },
    { name: "Warning", variant: "warning" },
  ];

  const buttonSizes = [
    { name: "Small", size: "sm" },
    { name: "Default", size: "default" },
    { name: "Large", size: "lg" },
    { name: "Extra Large", size: "xl" },
    { name: "Icon", size: "icon" },
  ];

  const badgeVariants = [
    { name: "Default", variant: "default" },
    { name: "Secondary", variant: "secondary" },
    { name: "Destructive", variant: "destructive" },
    { name: "Outline", variant: "outline" },
  ];

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">MockRise Design System</h1>
        <p className="text-muted-foreground">
          Comprehensive design system documentation and component library
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div className="space-y-8">
              {Object.entries(colorPalette).map(([colorName, colors]) => (
                <motion.div
                  key={colorName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <EnhancedCard className="p-6" variant="elevated">
                    <h3 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      {colorName} Colors
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {colors.map((color, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className="w-full h-16 rounded-lg border border-border"
                            style={{ backgroundColor: color.value }}
                          />
                          <div className="text-xs">
                            <div className="font-medium">{color.name}</div>
                            <div className="text-muted-foreground">{color.hex}</div>
                            <div className="text-muted-foreground">{color.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </EnhancedCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Typography Scale
              </h3>
              <div className="space-y-4">
                {typographyScale.map((type, index) => (
                  <motion.div
                    key={type.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{type.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {type.size} • {type.weight} • {type.lineHeight}
                      </div>
                    </div>
                    <div
                      className="text-foreground"
                      style={{
                        fontSize: type.size,
                        fontWeight: type.weight,
                        lineHeight: type.lineHeight,
                      }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Usage: {type.usage}
                    </div>
                  </motion.div>
                ))}
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-6">
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Spacing Scale
              </h3>
              <div className="space-y-4">
                {spacingScale.map((space, index) => (
                  <motion.div
                    key={space.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-16 text-sm font-medium">{space.name}</div>
                    <div className="flex-1">
                      <div
                        className="bg-primary rounded"
                        style={{ width: space.value, height: "1rem" }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground w-20">
                      {space.value}
                    </div>
                    <div className="text-sm text-muted-foreground w-12">
                      {space.pixels}
                    </div>
                    <div className="text-sm text-muted-foreground w-32">
                      {space.usage}
                    </div>
                  </motion.div>
                ))}
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            {/* Buttons */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Buttons
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">Button Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    {buttonVariants.map((variant) => (
                      <EnhancedButton
                        key={variant.name}
                        variant={variant.variant as any}
                        size="default"
                      >
                        {variant.name}
                      </EnhancedButton>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Button Sizes</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {buttonSizes.map((size) => (
                      <EnhancedButton
                        key={size.name}
                        variant="default"
                        size={size.size as any}
                      >
                        {size.name}
                      </EnhancedButton>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Button States</h4>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButton variant="default">Default</EnhancedButton>
                    <EnhancedButton variant="default" disabled>Disabled</EnhancedButton>
                    <EnhancedButton variant="default" loading>Loading</EnhancedButton>
                    <EnhancedButton variant="default" className="animate-pulse">Pulsing</EnhancedButton>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* Badges */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Badges
              </h3>
              <div className="flex flex-wrap gap-3">
                {badgeVariants.map((variant) => (
                  <Badge key={variant.name} variant={variant.variant as any}>
                    {variant.name}
                  </Badge>
                ))}
                <Badge className="bg-green-100 text-green-800">Success</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                <Badge className="bg-blue-100 text-blue-800">Info</Badge>
              </div>
            </EnhancedCard>

            {/* Form Elements */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Form Elements
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="input-example">Input Field</Label>
                    <Input id="input-example" placeholder="Enter text..." />
                  </div>
                  <div>
                    <Label htmlFor="textarea-example">Textarea</Label>
                    <Textarea id="textarea-example" placeholder="Enter message..." />
                  </div>
                  <div>
                    <Label>Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="checkbox-example" checked={checked} onCheckedChange={(value) => setChecked(value === true)} />
                    <Label htmlFor="checkbox-example">Checkbox</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option1" id="radio1" />
                        <Label htmlFor="radio1">Option 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option2" id="radio2" />
                        <Label htmlFor="radio2">Option 2</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="switch-example" checked={switchValue} onCheckedChange={setSwitchValue} />
                    <Label htmlFor="switch-example">Switch</Label>
                  </div>
                  <div>
                    <Label>Slider</Label>
                    <Slider
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">Value: {sliderValue[0]}</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* Progress and Status */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Progress & Status
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Progress Bar</Label>
                  <Progress value={75} className="mt-2" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Success</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Error</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Info</span>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* Charts */}
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Animated Charts
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="text-lg font-medium mb-4">Radar Chart</h4>
                  <RadarChart
                    data={[
                      { skill: "Technical", value: 85, color: "hsl(var(--primary))" },
                      { skill: "Communication", value: 92, color: "hsl(var(--accent))" },
                      { skill: "Problem Solving", value: 78, color: "hsl(var(--secondary))" },
                      { skill: "Leadership", value: 88, color: "hsl(var(--warning))" },
                    ]}
                    size={200}
                  />
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-medium mb-4">Circular Progress</h4>
                  <CircularProgress value={75} size={120} />
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Design Patterns
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">Card Patterns</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <EnhancedCard className="p-4" variant="default">
                      <h5 className="font-medium mb-2">Default Card</h5>
                      <p className="text-sm text-muted-foreground">Standard card with subtle border</p>
                    </EnhancedCard>
                    <EnhancedCard className="p-4" variant="elevated">
                      <h5 className="font-medium mb-2">Elevated Card</h5>
                      <p className="text-sm text-muted-foreground">Card with enhanced shadow</p>
                    </EnhancedCard>
                    <EnhancedCard className="p-4" variant="glass">
                      <h5 className="font-medium mb-2">Glass Card</h5>
                      <p className="text-sm text-muted-foreground">Glass morphism effect</p>
                    </EnhancedCard>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Animation Patterns</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 rounded-lg border border-border cursor-pointer"
                    >
                      <h5 className="font-medium mb-2">Hover Scale</h5>
                      <p className="text-sm text-muted-foreground">Hover to see scale effect</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -2 }}
                      className="p-4 rounded-lg border border-border cursor-pointer"
                    >
                      <h5 className="font-medium mb-2">Hover Lift</h5>
                      <p className="text-sm text-muted-foreground">Hover to see lift effect</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <EnhancedCard className="p-6" variant="elevated">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Accessibility Guidelines
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-3">Color Contrast</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                      <h5 className="font-medium mb-2">Primary Text</h5>
                      <p className="text-sm">WCAG AA compliant contrast ratio</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted text-muted-foreground">
                      <h5 className="font-medium mb-2">Muted Text</h5>
                      <p className="text-sm">Sufficient contrast for readability</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Focus States</h4>
                  <div className="space-y-2">
                    <EnhancedButton className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      Focusable Button
                    </EnhancedButton>
                    <Input placeholder="Focusable input" className="focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-3">Semantic HTML</h4>
                  <div className="space-y-2 text-sm">
                    <div>• Use proper heading hierarchy (h1, h2, h3...)</div>
                    <div>• Include alt text for images</div>
                    <div>• Use ARIA labels for complex interactions</div>
                    <div>• Ensure keyboard navigation works</div>
                    <div>• Provide screen reader friendly content</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
