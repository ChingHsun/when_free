"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getMeetingById,
  addParticipant,
  getParticipants,
} from "@/lib/meetingService";
import { TimeGrid } from "@/components/TimeGrid";
import { AvailabilityTabs } from "@/components/AvailabilityTabs";
import { GroupAvailabilityGrid } from "@/components/GroupAvailabilityGrid";
import { Meeting, Participant } from "@/lib/types";
import { SignupCard, SignupCardProps } from "@/components/SignupCard";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"signup" | "selection">("signup");
  const [activeTab, setActiveTab] = useState<"selection" | "overview">(
    "selection"
  );
  const [participants, setParticipants] = useState<Participant[]>([]);

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

        // Also load participants
        const participantsData = await getParticipants(meetingId);
        setParticipants(participantsData);
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

  // Start time selection process
  const handleStartSelection: SignupCardProps["onStartSelection"] = ({
    name,
  }) => {
    setParticipantName(name);
    if (!name?.trim()) {
      setError("Please enter your name");
    }
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

  if (error || !meeting) {
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
        {step === "signup" ? (
          <SignupCard
            meeting={meeting}
            error={error}
            onStartSelection={handleStartSelection}
          />
        ) : (
          <>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => setStep("signup")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
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

            <div className="mb-6">
              <AvailabilityTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                participantsCount={participants.length}
              />

              {activeTab === "selection" ? (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Select Your Available Times
                    </CardTitle>
                    <CardDescription>
                      Click and drag to select multiple time slots
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TimeGrid
                      dates={meeting.dates || []}
                      selectedSlots={selectedSlots}
                      setSelectedSlots={setSelectedSlots}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Group Availability Overview
                    </CardTitle>
                    <CardDescription>
                      See when everyone is available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <GroupAvailabilityGrid
                      dates={meeting.dates || []}
                      participants={participants}
                    />
                  </CardContent>
                  {participants.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">
                        No participants have joined yet.
                      </p>
                      <p className="text-gray-500 mt-1">
                        Be the first to add your availability!
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>

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
