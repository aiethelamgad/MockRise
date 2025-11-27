import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { SKILL_TREE, CategoryName } from "@/config/skillTree";
import { format, startOfDay, isBefore, parseISO } from "date-fns";
import { bookingService, type RescheduleRequest, type Interview as Session, type AvailableSlotsResponse } from "@/services/booking.service";
const { getAvailableSlots, rescheduleBooking, getBookings } = bookingService;
const getUserSessions = async () => {
  const res = await getBookings();
  return { data: res.data };
};

type Step = 1 | 2 | 3;

export default function RescheduleSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  
  // Fetch session data
  const { 
    data: sessionsData,
    isLoading: isLoadingSession,
  } = useQuery({
    queryKey: ["userSessions"],
    queryFn: getUserSessions,
  });

  const sessions: Session[] = sessionsData?.data || [];
  const session = sessions.find((s: Session) => s._id === sessionId);

  // Form state - initialize with session data
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [selectedInterviewerId, setSelectedInterviewerId] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [focusArea, setFocusArea] = useState<string>("");
  const [language, setLanguage] = useState<"english" | "arabic">("english");

  // Initialize form with session data
  useEffect(() => {
    if (session) {
      // Parse scheduledDate to get the date part
      let sessionDate: Date | undefined;
      if (session.scheduledDate) {
        try {
          sessionDate = parseISO(session.scheduledDate);
          if (isNaN(sessionDate.getTime())) {
            sessionDate = undefined;
          }
        } catch {
          sessionDate = undefined;
        }
      }
      
      // Set the date from scheduledDate
      if (sessionDate) {
      setDate(sessionDate);
      }
      
      // Set time from timeSlot (it's already in "h:mm a" format)
      if (session.timeSlot) {
        setSelectedTime(session.timeSlot);
      }
      
      setDuration(session.duration.toString());
      setDifficulty(session.difficulty || "intermediate");
      setFocusArea(session.focusArea || "");
      setLanguage((session.language as "english" | "arabic") || "english");
      
      // Note: interviewerId will be set when user selects a slot from available slots
    }
  }, [session]);

  // Get all category names from SKILL_TREE
  const categories = Object.keys(SKILL_TREE) as CategoryName[];

  // Fetch available slots when date and mode are selected
  const { data: slotsData, isLoading: isLoadingSlots } = useQuery<AvailableSlotsResponse>({
    queryKey: ["availableSlots", date, session?.mode],
    queryFn: () => {
      if (!date || !session?.mode) {
        return Promise.resolve({ success: true, data: { date: "", mode: session?.mode || "ai", slots: [] } });
      }
      return getAvailableSlots(date, session.mode);
    },
    enabled: !!date && !!session?.mode && currentStep >= 1,
  });

  const availableSlots = slotsData?.data?.slots || [];

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: (updateData: RescheduleRequest) => {
      if (!sessionId) throw new Error("Session ID is required");
      return rescheduleBooking(sessionId, updateData);
    },
    onSuccess: () => {
      toast.success("Session rescheduled successfully!");
      // Invalidate sessions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      navigate("/dashboard/trainee/sessions");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule session. Please try again.");
    },
  });

  // Track the calendar date (day only) to detect actual calendar date changes
  const lastCalendarDateRef = useRef<string>("");
  
  // Reset selected time when calendar date or mode changes (only when user changes calendar date)
  useEffect(() => {
    if (!date) {
      setSelectedTime("");
      setSelectedSlotId("");
      setSelectedInterviewerId("");
      lastCalendarDateRef.current = "";
      return;
    }

    // Create a key based only on the calendar date (year-month-day), ignoring time
    const newDateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    // Only reset if the calendar date actually changed (user selected different day)
    if (lastCalendarDateRef.current && newDateKey !== lastCalendarDateRef.current) {
      setSelectedTime("");
      setSelectedSlotId("");
      setSelectedInterviewerId("");
    }
    
    // Update the calendar date key
    if (newDateKey !== lastCalendarDateRef.current) {
      lastCalendarDateRef.current = newDateKey;
    }
  }, [date?.getFullYear(), date?.getMonth(), date?.getDate(), session?.mode]);

  // Validation functions
  const canProceedToStep2 = () => {
    if (!date) return false;
    if (session?.mode === "live") {
      // For Live Mock Interview, require slotId and optionally interviewerId
      return !!selectedTime && !!selectedSlotId;
    }
    // For other modes (AI, Peer-to-Peer, Family & Friends), only require selectedTime
    return !!selectedTime;
  };

  const canProceedToStep3 = () => {
    if (!duration || !language || !difficulty) return false;
    if (!focusArea) return false;
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleConfirmReschedule = () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    // Validate live mode slot selection
    if (session?.mode === 'live' && !selectedSlotId) {
      toast.error("Please select an available time slot.");
      return;
    }

    // Format date as YYYY-MM-DD for backend
    if (!date || isNaN(date.getTime())) {
      toast.error("Please select a valid date");
        return;
    }
    const formattedDate = format(date, 'yyyy-MM-dd');

    const updateData: RescheduleRequest = {
      scheduledDate: formattedDate,
      timeSlot: selectedTime,
    };

    // For Live Mock Interview mode, include slotId and interviewerId
    if (session?.mode === 'live') {
      if (!selectedSlotId) {
        toast.error("Please select a time slot");
        return;
      }
      updateData.slotId = selectedSlotId;
      if (selectedInterviewerId) {
        updateData.interviewerId = selectedInterviewerId;
      }
    }

    rescheduleMutation.mutate(updateData);
  };

  const handleTimeSlotSelect = (slotId: string, time: string, interviewerId?: string) => {
    // Set slot selection state - always set slotId and time for all modes
    setSelectedSlotId(slotId);
    setSelectedTime(time);
    
    // Capture interviewerId if provided (required for Live Mock Interview, optional for others)
    if (interviewerId) {
      setSelectedInterviewerId(interviewerId);
    }
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date || isNaN(date.getTime())) {
      return "Invalid date";
    }
    try {
    return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Loading state
  if (isLoadingSession) {
    return (
      <div className="max-w-4xl space-y-8 pb-20 lg:pb-8">
        <Card className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading session details...</p>
        </Card>
      </div>
    );
  }

  // Error state - session not found
  if (!session) {
    return (
      <div className="max-w-4xl space-y-8 pb-20 lg:pb-8">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The session you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate("/dashboard/trainee/sessions")}>
            Back to Sessions
          </Button>
        </Card>
      </div>
    );
  }

  // Check if session can be rescheduled
  if (session.status === 'completed' || session.status === 'cancelled') {
    return (
      <div className="max-w-4xl space-y-8 pb-20 lg:pb-8">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Cannot Reschedule</h3>
          <p className="text-muted-foreground mb-4">
            This session cannot be rescheduled because it is {session.status === 'completed' ? 'already completed' : 'cancelled'}.
          </p>
          <Button onClick={() => navigate("/dashboard/trainee/sessions")}>
            Back to Sessions
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard/trainee/sessions")}
          className="mb-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Sessions</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reschedule Interview</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Update the date, time, and details for your interview session
        </p>
      </div>

      {/* Current Session Info */}
      {session && (
      <Card className="p-4 sm:p-6 bg-muted/50">
        <h3 className="font-semibold mb-3 text-base sm:text-lg">Current Session Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Date & Time</Label>
              <p className="font-medium">
                {(() => {
                  try {
                    if (session?.scheduledDate) {
                      const date = parseISO(session.scheduledDate);
                      if (!isNaN(date.getTime())) {
                        const dateStr = format(date, "EEEE, MMMM d, yyyy");
                        const timeStr = session.timeSlot || "Time not set";
                        return `${dateStr} at ${timeStr}`;
                      }
                    }
                    return session?.timeSlot ? `Date not set at ${session.timeSlot}` : "Date and time not set";
                  } catch {
                    return session?.timeSlot || "Date and time not set";
                  }
                })()}
              </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Duration</Label>
            <p className="font-medium">{session.duration} minutes</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Language</Label>
            <p className="font-medium capitalize">{session.language}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Difficulty</Label>
            <p className="font-medium capitalize">{session.difficulty || "Not set"}</p>
          </div>
          {session.focusArea && (
            <div>
              <Label className="text-muted-foreground">Focus Area</Label>
              <p className="font-medium">{session.focusArea}</p>
            </div>
          )}
        </div>
      </Card>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1 min-w-[100px] sm:min-w-0">
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
                {step === 1 && "Date & Time"}
                {step === 2 && "Details"}
                {step === 3 && "Confirmation"}
              </span>
            </div>
            {step < 3 && (
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
          {/* Step 1: Select Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select New Date
                </h2>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setSelectedTime("");
                    setSelectedSlotId("");
                    setSelectedInterviewerId("");
                  }}
                  className="rounded-md mx-auto flex justify-center items-center"
                  disabled={(date) => {
                    const today = startOfDay(new Date());
                    const dateToCheck = startOfDay(date);
                    return isBefore(dateToCheck, today);
                  }}
                />
              </Card>

              {date && (
                <>
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
                    ) : availableSlots && availableSlots.length > 0 && date ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {availableSlots.map((slot, index) => {
                          // Check if slot is in the past or unavailable
                          const slotTime = slot.time;
                          const [timeStr, period] = slotTime.split(' ');
                          const [hours, minutes] = timeStr.split(':');
                          let hour24 = parseInt(hours);
                          if (period === 'PM' && hour24 !== 12) hour24 += 12;
                          if (period === 'AM' && hour24 === 12) hour24 = 0;
                          
                          if (!date || isNaN(date.getTime())) {
                            return null; // Skip rendering if date is invalid
                          }
                          const slotDateTime = new Date(date);
                          slotDateTime.setHours(hour24, parseInt(minutes), 0, 0);
                          const now = new Date();
                          const isPast = isBefore(slotDateTime, now);
                          const isSelected = selectedSlotId === slot.id;

                          return (
                            <motion.div
                              key={slot.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <Button
                                variant={isSelected ? "default" : "outline"}
                                disabled={isPast}
                                className={`w-full h-auto py-4 transition-all ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                                    : isPast
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-primary hover:text-primary-foreground"
                                }`}
                                onClick={() => handleTimeSlotSelect(slot.id || "", slot.time, slot.interviewer?.id || undefined)}
                              >
                                <div className="flex flex-col items-center gap-1 w-full">
                                  <span className="font-semibold text-base">{slot.time}</span>
                                  {slot.interviewer && (
                                    <>
                                      <span className="text-xs opacity-90 font-medium">{slot.interviewer.name}</span>
                                      <span className="text-[10px] opacity-75">Interviewer</span>
                                    </>
                                  )}
                                  {!slot.interviewer && session?.mode !== 'live' && (
                                    <span className="text-xs opacity-75">{session?.mode === 'ai' ? 'AI Interview' : 'Available'}</span>
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

                  {/* Selected Slot Confirmation */}
                  {selectedSlotId && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-4 sm:p-6 bg-primary/5 border-primary/20 border-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold text-base sm:text-lg">Time Slot Selected</h3>
                            </div>
                            <div className="space-y-2 text-sm sm:text-base">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">{selectedTime}</span>
                              </div>
                              {selectedInterviewerId && availableSlots.find(s => s.id === selectedSlotId)?.interviewer && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-primary" />
                                  <span className="text-muted-foreground">
                                    Interviewer: <span className="font-medium text-foreground">
                                      {availableSlots.find(s => s.id === selectedSlotId)?.interviewer?.name}
                                    </span>
                                  </span>
                                </div>
                              )}
                              {date && (
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-primary" />
                                  <span className="text-muted-foreground">
                                    {date ? formatDate(date) : "Not selected"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSlotId("");
                                setSelectedTime("");
                                setSelectedInterviewerId("");
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 2: Update Details */}
          {currentStep === 2 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Update Session Details</h2>
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
                  <Select value={language} onValueChange={(value) => setLanguage(value as "english" | "arabic")}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Confirm Reschedule</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                  {focusArea && (
                    <div>
                      <Label className="text-muted-foreground">Focus Area</Label>
                      <p className="font-semibold">{focusArea}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canProceedToStep2()) ||
              (currentStep === 2 && !canProceedToStep3())
            }
            className={
              currentStep === 1 && canProceedToStep2()
                ? "bg-gradient-primary text-primary-foreground hover:opacity-90"
                : ""
            }
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleConfirmReschedule}
            disabled={rescheduleMutation.isPending}
            size="lg"
            className="bg-gradient-primary text-primary-foreground"
          >
            {rescheduleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rescheduling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirm Reschedule
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

