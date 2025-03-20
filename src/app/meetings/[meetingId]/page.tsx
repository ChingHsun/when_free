"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMeetingById, addParticipant } from "@/lib/meetingService";
import { TimeGrid } from "@/components/TimeGrid";

interface TimeSlot {
  id: string;
  date: string;
  hour: number;
  minute: number;
  selected: boolean;
}

export default function AvailabilityPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [participantName, setParticipantName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [step, setStep] = useState("info"); // 'info' or 'selection'
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize timezone from browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTimezone = sessionStorage.getItem("user-timezone");
        if (storedTimezone) {
          setTimezone(storedTimezone);
        } else {
          const browserTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;
          setTimezone(browserTimezone);
          sessionStorage.setItem("user-timezone", browserTimezone);
        }
      } catch (error) {
        console.error("Error accessing sessionStorage:", error);
        const browserTimezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(browserTimezone);
      }
    }
  }, []);

  // Fetch meeting data
  useEffect(() => {
    async function loadMeeting() {
      try {
        setIsLoading(true);
        const meetingData = await getMeetingById(meetingId);
        if (!meetingData) {
          setError("Meeting not found");
          return;
        }

        setMeeting(meetingData);
      } catch (err) {
        console.error("Error loading meeting:", err);
        setError("Failed to load meeting");
      } finally {
        setIsLoading(false);
      }
    }

    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  // Toggle a single time slot
  const toggleTimeSlot = (slotId: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  // Handle drag selection of time slots
  const [isDragging, setIsDragging] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"select" | "deselect">(
    "select"
  );

  const handleMouseDown = (slotId: string) => {
    setIsDragging(true);
    // If the slot is already selected, we're in deselect mode
    const isSlotSelected = selectedSlots.includes(slotId);
    setSelectionMode(isSlotSelected ? "deselect" : "select");

    // Toggle the initial slot
    updateSlotSelection(slotId);
  };

  const handleMouseEnter = (slotId: string) => {
    if (isDragging) {
      updateSlotSelection(slotId);
    }
  };

  const updateSlotSelection = (slotId: string) => {
    if (selectionMode === "select" && !selectedSlots.includes(slotId)) {
      setSelectedSlots((prev) => [...prev, slotId]);
    } else if (selectionMode === "deselect" && selectedSlots.includes(slotId)) {
      setSelectedSlots((prev) => prev.filter((id) => id !== slotId));
    }
  };

  // Add global mouse up handler
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, []);

  // Start time selection process
  const handleStartSelection = () => {
    if (!participantName.trim()) {
      setError("Please enter your name");
      return;
    }

    setError(null);
    setStep("selection");
  };

  // Submit availability
  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      setError("Please select at least one time slot");
      return;
    }

    try {
      setIsSubmitting(true);

      // Add or update participant
      await addParticipant(meetingId, participantName, timezone, selectedSlots);

      // Navigate to results page
      router.push(
        `/meetings/${meetingId}/results?name=${encodeURIComponent(
          participantName
        )}`
      );
    } catch (err: any) {
      console.error("Error submitting availability:", err);

      if (err.message?.includes("already exists")) {
        setError("This name is already taken. Please choose another name.");
      } else {
        setError("Failed to submit your availability");
      }

      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {step === "info" ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {meeting?.title || "Select Your Availability"}
              </CardTitle>
              <CardDescription>
                {meeting?.description || "Please enter your name to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <Input
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleStartSelection}
                disabled={!participantName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setStep("info")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{meeting?.title}</CardTitle>
                <CardDescription>
                  Select your available time slots by clicking or dragging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm mb-4">
                  <p className="font-medium">Instructions:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Click on a time slot to select it</li>
                    <li>Click and drag to select multiple time slots</li>
                    <li>Click on a selected slot to deselect it</li>
                  </ul>
                </div>

                {error && (
                  <div className="text-red-500 text-sm mt-2 mb-2">{error}</div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Time Selection Grid</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TimeGrid
                  dates={meeting?.dates || []}
                  selectedSlots={selectedSlots}
                  onSlotToggle={toggleTimeSlot}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedSlots.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Your Availability
                  <Check className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
