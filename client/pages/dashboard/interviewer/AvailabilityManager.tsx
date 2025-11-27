import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, startOfDay, isBefore, isSameDay, parseISO } from "date-fns";
import {
  interviewerAvailabilityService,
  type AvailableSlot,
} from "@/services/interviewerAvailability.service";

// Default time slots
const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export default function AvailabilityManager() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  // Fetch availability slots
  const {
    data: availabilityData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useQuery({
    queryKey: ['interviewerAvailability', filterDate ? format(filterDate, 'yyyy-MM-dd') : 'all'],
    queryFn: () => {
      // Format date as YYYY-MM-DD for backend
      const dateStr = filterDate
        ? format(filterDate, 'yyyy-MM-dd')
        : undefined;
      return interviewerAvailabilityService.getAvailability({
        date: dateStr,
        mode: 'live',
        includeBooked: true,
      });
    },
    // Always enabled - when no date, fetch all slots
    enabled: true,
  });

  // Add availability mutation
  const addAvailabilityMutation = useMutation({
    mutationFn: (data: { date: string; time: string }) =>
      interviewerAvailabilityService.addAvailability({
        date: data.date,
        time: data.time,
        mode: 'live',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewerAvailability'] });
      toast.success("Availability slot added successfully!");
      setSelectedTime("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add availability slot");
    },
  });

  // Delete availability mutation
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (slotId: string) =>
      interviewerAvailabilityService.deleteAvailability(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewerAvailability'] });
      toast.success("Availability slot deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete availability slot");
    },
  });

  const slots: AvailableSlot[] = availabilityData?.data || [];

  // Filter out past slots
  const now = new Date();
  const today = startOfDay(now);
  const filteredSlots = slots.filter((slot) => {
    if (!slot.date) return false;
    
    try {
      const slotDate = parseISO(slot.date);
      if (isNaN(slotDate.getTime())) return false;
      
      const slotDay = startOfDay(slotDate);
      
      // If slot date is in the past, exclude it
      if (isBefore(slotDay, today)) {
        return false;
      }
      
      // If slot date is today, check if time is in the past
      if (isSameDay(slotDate, today)) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        // Parse slot time
        const [hours, minutes, period] = slot.time.split(/[: ]/);
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const slotMinutes = parseInt(minutes);
        const slotTimeInMinutes = hour * 60 + slotMinutes;
        
        // Only include slots that are in the future (at least 1 minute ahead)
        return slotTimeInMinutes > currentTimeInMinutes;
      }
      
      // Future dates are fine
      return true;
    } catch {
      return false;
    }
  });

  // Sort slots by date and time (backend already filters by date if filterDate is provided)
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    try {
      const dateA = parseISO(a.date).getTime();
      const dateB = parseISO(b.date).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.time.localeCompare(b.time);
    } catch {
      return 0;
    }
  });

  const handleAddSlot = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    // Check if slot already exists - compare dates using YYYY-MM-DD format to avoid timezone issues
    const existingSlot = slots.find((slot) => {
      if (!slot.date) return false;
      const slotDateStr = format(new Date(slot.date), 'yyyy-MM-dd');
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      return (
        slotDateStr === selectedDateStr &&
        slot.time === selectedTime &&
        slot.mode === 'live'
      );
    });

    if (existingSlot) {
      toast.error("This time slot already exists for this date");
      return;
    }

    // Check if date is in the past
    const today = startOfDay(new Date());
    const selected = startOfDay(selectedDate);

    if (isBefore(selected, today)) {
      toast.error("Cannot add availability for past dates");
      return;
    }

    // If adding for today, check if time is in the past
    if (isSameDay(selected, today)) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const bufferMinutes = 30; // 30 minute buffer

      // Parse slot time
      const [hours, minutes, period] = selectedTime.split(/[: ]/);
      let hour = parseInt(hours);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      const slotMinutes = parseInt(minutes);
      const slotTimeInMinutes = hour * 60 + slotMinutes;

      if (slotTimeInMinutes <= (currentTimeInMinutes + bufferMinutes)) {
        toast.error("Cannot add availability for past times. Please select a time at least 30 minutes in the future");
        return;
      }
    }

    // Format date as YYYY-MM-DD using date-fns to avoid timezone issues
    addAvailabilityMutation.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
    });
  };

  const handleDeleteSlot = (slotId: string, isBooked: boolean) => {
    if (isBooked) {
      toast.error("Cannot delete a slot that has been booked");
      return;
    }

    if (confirm("Are you sure you want to delete this availability slot?")) {
      deleteAvailabilityMutation.mutate(slotId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeSlotsForDate = (date: Date | undefined) => {
    if (!date) return TIME_SLOTS;

    // Filter out times that are in the past if date is today
    const today = startOfDay(new Date());
    const selected = startOfDay(date);

    if (isSameDay(selected, today)) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const bufferMinutes = 30; // 30 minute buffer
      
      return TIME_SLOTS.filter((time) => {
        const [hours, minutes, period] = time.split(/[: ]/);
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        const slotMinutes = parseInt(minutes);
        const slotTimeInMinutes = hour * 60 + slotMinutes;
        // Only allow slots that are at least 30 minutes in the future
        return slotTimeInMinutes > (currentTimeInMinutes + bufferMinutes);
      });
    }

    return TIME_SLOTS;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Availability Management</h1>
        <p className="text-muted-foreground">
          Set your available time slots for Live Mock Interviews
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Add Availability */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add Availability
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calendar">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md mt-2 mx-auto flex justify-center items-center"
                disabled={(date) => {
                  const today = startOfDay(new Date());
                  const dateToCheck = startOfDay(date);
                  return isBefore(dateToCheck, today);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {getTimeSlotsForDate(selectedDate).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleAddSlot}
              disabled={!selectedDate || !selectedTime || addAvailabilityMutation.isPending}
              className="w-full"
            >
              {addAvailabilityMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Right Column - Filter Calendar */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Filter by Date
          </h2>
          <Calendar
            mode="single"
            selected={filterDate}
            onSelect={(date) => {
              setFilterDate(date);
            }}
            className="rounded-md mx-auto flex justify-center items-center"
            disabled={(date) => {
              const today = startOfDay(new Date());
              const dateToCheck = startOfDay(date);
              return isBefore(dateToCheck, today);
            }}
          />
          {filterDate ? (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-muted-foreground text-center">
                Showing slots for: <span className="font-medium">{format(filterDate, 'MMMM d, yyyy')}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setFilterDate(undefined)}
                className="w-full"
              >
                Clear Filter (Show All)
              </Button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center mt-4">
              Select a date to filter slots
            </div>
          )}
        </Card>
      </div>

      {/* Availability Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Your Availability Slots
        </h2>

        {isLoadingSlots ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Loading availability slots...</p>
          </div>
        ) : slotsError ? (
          <div className="text-center py-8 text-destructive">
            Failed to load availability slots. Please try again.
          </div>
        ) : sortedSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filterDate 
              ? `No availability slots found for ${format(filterDate, 'MMMM d, yyyy')}. Try selecting a different date or add slots using the form above.`
              : "No availability slots set. Add slots using the form above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSlots.map((slot, index) => (
                  <TableRow
                    key={slot._id}
                    className={index % 2 === 0 ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-medium">
                      {formatDate(slot.date)}
                    </TableCell>
                    <TableCell>{slot.time}</TableCell>
                    <TableCell>
                      <Badge
                        variant={slot.isBooked ? "default" : "secondary"}
                        className={
                          slot.isBooked
                            ? "bg-green-500 hover:bg-green-600"
                            : ""
                        }
                      >
                        {slot.isBooked ? "Booked" : "Available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot._id, slot.isBooked)}
                        disabled={slot.isBooked || deleteAvailabilityMutation.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {deleteAvailabilityMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

