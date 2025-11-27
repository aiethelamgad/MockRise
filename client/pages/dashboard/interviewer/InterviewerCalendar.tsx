import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay, startOfDay, isPast, isToday, isTomorrow } from "date-fns";
import {
  interviewerInterviewService,
  type AssignedInterview,
} from "@/services/interviewerInterview.service";
import {
  interviewerAvailabilityService,
  type AvailableSlot,
} from "@/services/interviewerAvailability.service";
import { ROUTES } from "@/routes/routes.config";

// Helper function to format date for display
const formatDisplayDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Date not set";
  try {
    const date = parseISO(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid date";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "scheduled":
      return "default";
    case "in_progress":
      return "secondary";
    case "completed":
      return "default";
    case "cancelled":
      return "destructive";
    case "no_show":
      return "destructive";
    default:
      return "secondary";
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "cancelled":
    case "no_show":
      return XCircle;
    case "in_progress":
      return AlertTriangle;
    default:
      return CalendarIcon;
  }
};

export default function InterviewerCalendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Fetch all assigned interviews
  const {
    data: interviewsData,
    isLoading: isLoadingInterviews,
    error: interviewsError,
  } = useQuery({
    queryKey: ["interviewerAssignedInterviews"],
    queryFn: () => interviewerInterviewService.getAssignedInterviews(),
  });

  // Fetch availability slots for selected date
  const {
    data: availabilityData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useQuery({
    queryKey: ['interviewerAvailability', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'all'],
    queryFn: () => {
      const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
      return interviewerAvailabilityService.getAvailability({
        date: dateStr,
        mode: 'live',
        includeBooked: true, // Include booked slots to show scheduled interviews
      });
    },
    enabled: !!selectedDate,
  });

  const interviews: AssignedInterview[] = interviewsData?.data || [];
  const slots: AvailableSlot[] = availabilityData?.data || [];

  // Helper function to safely parse date
  const safeParseISO = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
      return parseISO(dateString);
    } catch {
      return null;
    }
  };

  // Filter interviews for selected date
  const selectedDateInterviews = selectedDate
    ? interviews.filter((interview) => {
        if (!interview.scheduledDate) return false;
        const interviewDate = safeParseISO(interview.scheduledDate);
        if (!interviewDate) return false;
        return isSameDay(interviewDate, selectedDate);
      })
    : [];

  // Get slots for selected date
  const selectedDateSlots = selectedDate
    ? slots.filter((slot) => {
        const slotDate = safeParseISO(slot.date);
        if (!slotDate) return false;
        return isSameDay(slotDate, selectedDate);
      })
    : [];

  // Create time-based schedule by combining slots and interviews
  const scheduleItems = selectedDate
    ? (() => {
        const items: Array<{
          time: string;
          type: "interview" | "available" | "booked";
          interview?: AssignedInterview;
          slot?: AvailableSlot;
        }> = [];

        // Add interviews
        selectedDateInterviews.forEach((interview) => {
          items.push({
            time: interview.timeSlot || "Unknown",
            type: "interview",
            interview,
          });
        });

        // Add slots
        selectedDateSlots.forEach((slot) => {
          // Skip if already added as interview
          const hasInterview = selectedDateInterviews.some(
            (interview) => interview.timeSlot === slot.time
          );
          if (!hasInterview) {
            items.push({
              time: slot.time,
              type: slot.isBooked ? "booked" : "available",
              slot,
            });
          }
        });

        // Sort by time
        return items.sort((a, b) => {
          const timeA = a.time.toLowerCase();
          const timeB = b.time.toLowerCase();
          return timeA.localeCompare(timeB);
        });
      })()
    : [];

  // Get upcoming interviews (all, not just selected date)
  const upcomingInterviews = interviews
    .filter((interview) => {
      if (!interview.scheduledDate) return false;
      const interviewDate = safeParseISO(interview.scheduledDate);
      if (!interviewDate) return false;
      return (
        !isPast(startOfDay(interviewDate)) &&
        interview.status !== "completed" &&
        interview.status !== "cancelled"
      );
    })
    .sort((a, b) => {
      const dateA = safeParseISO(a.scheduledDate);
      const dateB = safeParseISO(b.scheduledDate);
      if (!dateA || !dateB) return 0;
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.timeSlot || "").localeCompare(b.timeSlot || "");
    })
    .slice(0, 5); // Show only next 5 upcoming

  const handleViewInterview = (interview: AssignedInterview) => {
    navigate(ROUTES.INTERVIEWER_ASSIGNED, {
      state: { interviewId: interview._id },
    });
  };

  const handleManageAvailability = () => {
    navigate("/dashboard/interviewer/availability");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Interview Calendar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View your scheduled interviews and manage your availability
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleManageAvailability}
          className="flex-shrink-0"
        >
          <Clock className="mr-2 h-4 w-4" />
          Manage Availability
        </Button>
      </div>

      {/* Error States */}
      {(interviewsError || slotsError) && (
        <Card className="p-6 border-destructive">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Error Loading Data</h3>
              <p className="text-sm text-muted-foreground">
                {interviewsError instanceof Error
                  ? interviewsError.message
                  : slotsError instanceof Error
                  ? slotsError.message
                  : "An error occurred while loading calendar data"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Select Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              disabled={(date) => isPast(startOfDay(date)) && !isToday(date)}
            />
          </Card>

          {/* Upcoming Interviews Summary */}
          {!isLoadingInterviews && upcomingInterviews.length > 0 && (
            <Card className="p-4 sm:p-6 mt-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Interviews</h2>
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => {
                  const StatusIcon = getStatusIcon(interview.status);
                  return (
                    <motion.div
                      key={interview._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => handleViewInterview(interview)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {interview.trainee?.name || "Unknown Trainee"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDisplayDate(interview.scheduledDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {interview.timeSlot || "Time not set"}
                          </p>
                        </div>
                        <Badge
                          variant={getStatusVariant(interview.status)}
                          className="flex-shrink-0"
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {interview.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate(ROUTES.INTERVIEWER_ASSIGNED)}
              >
                View All Interviews
              </Button>
            </Card>
          )}
        </div>

        {/* Schedule Section */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedDate
                    ? format(selectedDate, "EEEE, MMMM d, yyyy")
                    : "Select a date to view schedule"}
                </h2>
                {selectedDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDateInterviews.length} interview
                    {selectedDateInterviews.length !== 1 ? "s" : ""} scheduled
                    {selectedDateSlots.length > 0 &&
                      ` • ${selectedDateSlots.filter((s) => !s.isBooked).length} available slot${
                        selectedDateSlots.filter((s) => !s.isBooked).length !== 1 ? "s" : ""
                      }`}
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {(isLoadingInterviews || (isLoadingSlots && selectedDate)) && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading schedule...</span>
              </div>
            )}

            {/* Schedule Content */}
            {!isLoadingInterviews && !(isLoadingSlots && selectedDate) && (
              <>
                {!selectedDate ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a date from the calendar to view your schedule
                    </p>
                  </div>
                ) : scheduleItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No interviews or availability slots scheduled for this date
                    </p>
                    <Button variant="outline" onClick={handleManageAvailability}>
                      Manage Availability
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduleItems.map((item, index) => {
                      const StatusIcon = item.interview
                        ? getStatusIcon(item.interview.status)
                        : CalendarIcon;

                      return (
                        <motion.div
                          key={item.time + (item.interview?._id || item.slot?._id || index)}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`p-4 border rounded-lg transition-all ${
                            item.type === "interview"
                              ? "border-primary/50 bg-primary/5 hover:border-primary"
                              : item.type === "booked"
                              ? "border-muted bg-muted/50"
                              : "border-border hover:border-primary/30"
                          } ${item.interview ? "cursor-pointer" : ""}`}
                          onClick={() => item.interview && handleViewInterview(item.interview)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex-shrink-0 w-20">
                                <p className="text-sm font-semibold">{item.time}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                {item.type === "interview" && item.interview ? (
                                  <>
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <h3 className="font-semibold">
                                        {item.interview.trainee?.name || "Unknown Trainee"}
                                      </h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                      {item.interview.focusArea && (
                                        <Badge variant="outline" className="text-xs">
                                          {item.interview.focusArea}
                                        </Badge>
                                      )}
                                      {item.interview.difficulty && (
                                        <Badge variant="secondary" className="text-xs">
                                          {item.interview.difficulty}
                                        </Badge>
                                      )}
                                      <span>• {item.interview.duration} min</span>
                                      {item.interview.language && (
                                        <span>• {item.interview.language}</span>
                                      )}
                                    </div>
                                    {item.interview.trainee?.email && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {item.interview.trainee.email}
                                      </p>
                                    )}
                                  </>
                                ) : item.type === "booked" ? (
                                  <p className="text-sm text-muted-foreground">
                                    Slot booked (not assigned to you)
                                  </p>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Available slot - ready for booking
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {item.interview && (
                                <Badge
                                  variant={getStatusVariant(item.interview.status)}
                                  className="flex items-center gap-1"
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {item.interview.status.replace("_", " ")}
                                </Badge>
                              )}
                              {item.type === "available" && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Available
                                </Badge>
                              )}
                              {item.type === "booked" && !item.interview && (
                                <Badge variant="secondary">Booked</Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

