"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getMeetingById,
  addParticipant,
  updateParticipantAvailability,
} from "@/lib/meetingService";
import { TimeGrid } from "@/components/TimeGrid";
import { AvailabilityTabs } from "@/components/AvailabilityTabs";
import { GroupAvailabilityGrid } from "@/components/GroupAvailabilityGrid";
import { Meeting } from "@/lib/types";
import { SignupCard, SignupCardProps } from "@/components/SignupCard";
import { Fallback } from "@/components/Fallback";
import { findExistParticipant } from "@/lib/utils";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"signup" | "selection">("signup");
  const [activeTab, setActiveTab] = useState<"selection" | "overview">(
    "selection"
  );

  const handleStartSelection: SignupCardProps["onStartSelection"] = ({
    name,
  }) => {
    setName(name);
    addParticipant({ meetingId, name })
      .then(() => {
        setStep("selection");
      })
      .catch((err) => {
        setError(err);
      });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    updateParticipantAvailability({
      meetingId,
      name: name!,
      availableSlots: selectedSlots,
    })
      .then(() => {
        router.push(
          `/meetings/${meetingId}/results?name=${encodeURIComponent(name!)}`
        );
      })
      .catch((err) => {
        console.error("Error submitting availability:", err);
        setError("Failed to submit your availability");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    if (meetingId) {
      getMeetingById({ meetingId })
        .then((meetingData) => {
          setMeeting(meetingData);
          if (name !== null) {
            return findExistParticipant({ meetingData, name });
          } else {
            setStep("signup");
          }
        })
        .then((existingParticipant) => {
          if (existingParticipant) {
            setStep("selection");
            setSelectedSlots(existingParticipant.availableSlots || []);
          } else {
            setSelectedSlots([]);
            setStep("signup");
          }
        })
        .catch((err) => {
          console.error("Error:", err);
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [meetingId, name, step]);

  if (isLoading) return <Fallback status="loading" />;

  if (error || !meeting)
    return <Fallback status="error" errorMessage={error} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {step === "signup" ? (
          <SignupCard
            meeting={meeting}
            error={error}
            onStartSelection={handleStartSelection}
          />
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>
                  Select your available time slots by clicking or dragging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                  <p className="font-medium">Welcome, {name}!</p>
                  <p className="text-sm mt-1">
                    You can modify your time selections.
                  </p>
                </div>
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
                participantsCount={meeting.participants.length}
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
                      participants={meeting.participants}
                    />
                  </CardContent>
                  {meeting.participants.length === 0 && (
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
