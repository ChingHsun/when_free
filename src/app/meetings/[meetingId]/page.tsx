"use client";

import { useState, useEffect } from "react";
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
import { TimeGrid } from "@/components/TimeGrid";
import { AvailabilityTabs } from "@/components/AvailabilityTabs";
import { GroupAvailabilityGrid } from "@/components/GroupAvailabilityGrid";
import { SignupCard, SignupCardProps } from "@/components/SignupCard";
import { Fallback } from "@/components/Fallback";
import { useMeetingStore } from "@/store/meetingStore";
import { TimezoneSelect } from "@/components/TimezoneSelect";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const {
    meeting,
    currentUser,
    participants,
    selectedTZSlots,
    fetchMeeting,
    signupMeeting,
    updateAvailability,
  } = useMeetingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"signup" | "selection">("signup");
  const [activeTab, setActiveTab] = useState<"selection" | "overview">(
    "selection"
  );

  const handleSignup: SignupCardProps["onSignup"] = ({ name }) => {
    signupMeeting({ meetingId, name })
      .then(() => {
        setStep("selection");
      })
      .catch((err) => {
        setError(err);
      });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    updateAvailability({
      meetingId,
      name: currentUser!.name,
      availableSlots: selectedTZSlots,
    })
      .then(() => {
        router.push(
          `/meetings/${meetingId}/results?name=${encodeURIComponent(
            currentUser!.name
          )}`
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
    fetchMeeting({ meetingId })
      .then(() => {
        if (currentUser) {
          setStep("selection");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentUser, fetchMeeting, meetingId]);

  if (isLoading) return <Fallback status="loading" />;

  if (error || !meeting || !participants)
    return <Fallback status="error" errorMessage={error} />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {step === "signup" ? (
          <SignupCard meeting={meeting} error={error} onSignup={handleSignup} />
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                  <p className="font-medium">Welcome, {currentUser?.name}!</p>
                </div>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>{meeting.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <TimezoneSelect />
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
                      <div className="text-sm mb-4">
                        <p className="font-medium">Instructions:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Click on a time slot to select it</li>
                          <li>Click and drag to select multiple time slots</li>
                          <li>Click on a selected slot to deselect it</li>
                        </ul>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <TimeGrid />
                  </CardContent>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Group Availability Preview
                    </CardTitle>
                    <CardDescription>
                      Preview when everyone is available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <GroupAvailabilityGrid />
                  </CardContent>
                </Card>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedTZSlots.length === 0}
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
