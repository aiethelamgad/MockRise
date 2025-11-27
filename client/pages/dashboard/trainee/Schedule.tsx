import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Users,
  Heart,
  Clock,
  Calendar as CalendarIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { SKILL_TREE } from "@/config/skillTree";
import {
  bookingService,
  type InterviewMode,
  type CreateBookingData,
  type ConsentFlags,
  type AvailableSlot,
} from "@/services/booking.service";
import { ROUTES } from "@/routes/routes.config";
import { format, startOfDay, isBefore, isSameDay, parseISO } from "date-fns";

type Step = 1 | 2 | 3 | 4;

// Get all category names from SKILL_TREE
const categories = Object.keys(SKILL_TREE);

export default function Schedule() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Mode selection
  const [interviewMode, setInterviewMode] = useState<InterviewMode>("ai");

  // Step 2: Date & Time
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>("");

  // Step 3: Additional requirements
  const [duration, setDuration] = useState<string>("30");
  const [difficulty, setDifficulty] = useState<string>("intermediate");
  const [focusArea, setFocusArea] = useState<string>("");
  const [language, setLanguage] = useState<"english" | "arabic">("english");
  const [recordingConsent, setRecordingConsent] = useState<boolean>(false);
  const [dataUsageConsent, setDataUsageConsent] = useState<boolean>(false);

  const modes = [
    {
      value: "ai" as InterviewMode,
      icon: Brain,
      title: "AI-Powered Interview",
      description: "Practice with our advanced AI interviewer",
      color: "text-primary",
    },
    {
      value: "peer" as InterviewMode,
      icon: Users,
      title: "Peer-to-Peer",
      description: "Connect with another candidate",
      color: "text-secondary",
    },
    {
      value: "family" as InterviewMode,
      icon: Heart,
      title: "Family & Friends",
      description: "Invite someone you trust",
      color: "text-accent",
    },
    {
      value: "live" as InterviewMode,
      icon: Video,
      title: "Live Mock Interview",
      description: "Join a real-time mock interview with a verified interviewer",
      color: "text-primary",
    },
  ];

  // Fetch available slots when date and mode are selected
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
  } = useQuery({
    queryKey: ["availableSlots", date, interviewMode],
    queryFn: () => {
      if (!date || !interviewMode) return Promise.resolve({ success: true, data: { slots: [] } });
      return bookingService.getAvailableSlots(date, interviewMode);
    },
    enabled: !!date && !!interviewMode && currentStep >= 2,
  });

  // Filter out past slots from the response
  const rawSlots = slotsData?.data?.slots || [];
  const availableSlots = rawSlots.filter((slot: AvailableSlot) => {
    if (!date) return false;
    
    // If slot is for today, check if time is in the past
    if (isSameDay(date, new Date())) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const bufferMinutes = 30; // 30 minute buffer

      // Parse slot time
      const [hours, minutes, period] = slot.time.split(/[: ]/);
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const slotMinutes = parseInt(minutes);
      const slotTimeInMinutes = hour * 60 + slotMinutes;

      // Only include slots that are at least 30 minutes in the future
      return slotTimeInMinutes > (currentTimeInMinutes + bufferMinutes);
    }
    
    // Future dates are fine
    return true;
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: (bookingData: CreateBookingData) => bookingService.createBooking(bookingData),
    onSuccess: () => {
      toast.success("Interview booked successfully!");
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      navigate(ROUTES.TRAINEE_SESSIONS);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to book interview. Please try again.");
    },
  });

  // Reset selected time when date or mode changes
  useEffect(() => {
    setSelectedTime("");
    setSelectedSlotId("");
    setSelectedInterviewerId("");
  }, [date, interviewMode]);

  // Validation functions
  const canProceedToStep2 = () => {
    return !!interviewMode;
  };

  const canProceedToStep3 = () => {
    if (!date) return false;
    if (interviewMode === "live") {
      return !!selectedTime && !!selectedInterviewerId;
    }
    return !!selectedTime;
  };

  const canProceedToStep4 = () => {
    if (!duration || !language || !difficulty) return false;

    // Focus area is required for all interview modes
    if (!focusArea) return false;

    // Check recording consent if required (for modes that support recording)
    const modesRequiringConsent = ["ai", "live"];
    if (modesRequiringConsent.includes(interviewMode) && !recordingConsent) {
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedToStep4()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleConfirmBooking = () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    // Validate Focus Area is required for peer, family, and live modes
    const modesRequiringFocusArea: InterviewMode[] = ["peer", "family", "live"];
    if (modesRequiringFocusArea.includes(interviewMode) && !focusArea) {
      toast.error("Please select a focus area");
      return;
    }

    if (!focusArea) {
      toast.error("Please select a focus area");
      return;
    }

    const bookingData: CreateBookingData = {
      mode: interviewMode,
      scheduledDate: format(date, 'yyyy-MM-dd'), // Use YYYY-MM-DD format to avoid timezone issues
      timeSlot: selectedTime,
      duration: parseInt(duration),
      language: language,
      difficulty: difficulty as CreateBookingData["difficulty"],
      focusArea: focusArea, // Required for all modes
      consentFlags: {
        recording: recordingConsent,
        dataUsage: dataUsageConsent,
      },
      interviewerId: selectedInterviewerId || undefined,
      slotId: selectedSlotId || undefined, // Include slot ID for direct lookup
    };

    bookingMutation.mutate(bookingData);
  };

  const handleTimeSlotSelect = (slot: AvailableSlot) => {
    if (!slot.available) return;
    setSelectedTime(slot.time);
    if (slot.id) {
      setSelectedSlotId(slot.id);
    }
    if (slot.interviewer?.id) {
      setSelectedInterviewerId(slot.interviewer.id);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Schedule Interview</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Complete the steps below to book your interview session
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1 min-w-[80px] sm:min-w-0">
            <div className="flex flex-col items-center flex-1 w-full">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  currentStep >= step
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {currentStep > step ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <span className="font-semibold text-sm sm:text-base">{step}</span>
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs mt-1 sm:mt-2 text-center whitespace-nowrap ${
                  currentStep >= step ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {step === 1 && "Select Mode"}
                {step === 2 && "Date & Time"}
                {step === 3 && "Requirements"}
                {step === 4 && "Confirmation"}
              </span>
            </div>
            {step < 4 && (
              <div
                className={`h-0.5 flex-1 mx-1 sm:mx-2 hidden sm:block ${
                  currentStep > step ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Select Mode */}
          {currentStep === 1 && (
          <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Select Interview Mode</h2>
              <RadioGroup
                value={interviewMode}
                onValueChange={(value) => setInterviewMode(value as InterviewMode)}
              >
              <div className="space-y-3">
                {modes.map((mode, index) => (
                  <motion.div
                    key={mode.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Label
                      htmlFor={mode.value}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-muted/50 ${
                        interviewMode === mode.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={mode.value} id={mode.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <mode.icon className={`h-5 w-5 ${mode.color}`} />
                          <span className="font-semibold">{mode.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                      </div>
                    </Label>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </Card>
          )}

          {/* Step 2: Select Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date
                </h2>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    // Update date and reset time slot selection when date changes
                    setDate(newDate);
                    setSelectedTime("");
                    setSelectedSlotId("");
                    setSelectedInterviewerId("");
                  }}
                  className="rounded-md mx-auto flex justify-center items-center"
                  disabled={(date) => {
                    // Only disable dates that are strictly in the past (before today)
                    // Compare dates at midnight to avoid time-of-day issues
                    const today = startOfDay(new Date());
                    const dateToCheck = startOfDay(date);
                    return isBefore(dateToCheck, today);
                  }}
                />
              </Card>

              {date && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Available Times
                  </h2>
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading available slots...</span>
                    </div>
                  ) : availableSlots && availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {availableSlots.map((slot, index) => {
                        // Additional check: ensure slot is not in the past
                        let isPastSlot = false;
                        if (date && isSameDay(date, new Date())) {
                          const now = new Date();
                          const currentHour = now.getHours();
                          const currentMinute = now.getMinutes();
                          const currentTimeInMinutes = currentHour * 60 + currentMinute;
                          const bufferMinutes = 30;

                          const [hours, minutes, period] = slot.time.split(/[: ]/);
                          let hour = parseInt(hours);
                          if (period === 'PM' && hour !== 12) hour += 12;
                          if (period === 'AM' && hour === 12) hour = 0;
                          const slotMinutes = parseInt(minutes);
                          const slotTimeInMinutes = hour * 60 + slotMinutes;

                          isPastSlot = slotTimeInMinutes <= (currentTimeInMinutes + bufferMinutes);
                        }

                        return (
                          <motion.div
                            key={slot.id || slot.time || index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <Button
                              variant={selectedTime === slot.time && selectedInterviewerId === (slot.interviewer?.id || "") ? "default" : "outline"}
                              disabled={!slot.available || isPastSlot}
                              className={`w-full transition-all ${
                                selectedTime === slot.time && selectedInterviewerId === (slot.interviewer?.id || "")
                                  ? "bg-primary text-primary-foreground"
                                  : isPastSlot || !slot.available
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-primary hover:text-primary-foreground"
                              }`}
                              onClick={() => !isPastSlot && slot.available && handleTimeSlotSelect(slot)}
                            >
                              <div className="flex flex-col items-start">
                                <span>{slot.time}</span>
                                {slot.interviewer && (
                                  <span className="text-xs opacity-80">{slot.interviewer.name}</span>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No available slots for this date. Please select another date.
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Additional Requirements */}
          {currentStep === 3 && (
          <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Requirements</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                {/* Focus Area is required for all interview modes */}
              <div className="space-y-2">
                  <Label htmlFor="focus">Focus Area *</Label>
                  <Select value={focusArea} onValueChange={setFocusArea}>
                  <SelectTrigger id="focus">
                      <SelectValue placeholder="Select a focus area" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as "english" | "arabic")}
                  >
                    <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                {(interviewMode === "ai" || interviewMode === "live") && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="recording"
                        checked={recordingConsent}
                        onCheckedChange={(checked) => setRecordingConsent(checked === true)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="recording" className="cursor-pointer">
                          Recording Consent *
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I consent to this session being recorded for review and feedback purposes.
                        </p>
            </div>
        </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="dataUsage"
                        checked={dataUsageConsent}
                        onCheckedChange={(checked) => setDataUsageConsent(checked === true)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="dataUsage" className="cursor-pointer">
                          Data Usage Consent
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          I consent to my session data being used for improving the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </Card>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
          <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Review Your Booking</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Mode</Label>
                    <p className="font-semibold">{modes.find((m) => m.value === interviewMode)?.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date</Label>
                    <p className="font-semibold">{date ? formatDate(date) : "Not selected"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Time</Label>
                    <p className="font-semibold">{selectedTime || "Not selected"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-semibold">{duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Language</Label>
                    <p className="font-semibold">{language.charAt(0).toUpperCase() + language.slice(1)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Difficulty</Label>
                    <p className="font-semibold">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Focus Area</Label>
                    <p className="font-semibold">{focusArea || "Not selected"}</p>
            </div>
        </div>
      </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canProceedToStep2()) ||
              (currentStep === 2 && !canProceedToStep3()) ||
              (currentStep === 3 && !canProceedToStep4())
            }
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirmBooking}
            disabled={bookingMutation.isPending}
            size="lg"
            className="bg-gradient-primary text-primary-foreground"
          >
            {bookingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirm Booking
              </>
            )}
          </Button>
        )}
        </div>
    </div>
  );
}
