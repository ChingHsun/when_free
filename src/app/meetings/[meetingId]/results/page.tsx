"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { Copy, Check, Clock, Users, CalendarClock } from "lucide-react";
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
  getParticipants,
  getOverlappingSlots,
} from "@/lib/meetingService";

interface AvailabilityResult {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
  count: number;
  totalParticipants: number;
  percentage: number;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = params.meetingId as string;
  const participantName = searchParams.get("name");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [results, setResults] = useState<AvailabilityResult[]>([]);
  const [timezone, setTimezone] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Load meeting data, participants, and calculate overlapping slots
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Load meeting data
        const meetingData = await getMeetingById(meetingId);
        if (!meetingData) {
          setError("Meeting not found");
          return;
        }
        setMeeting(meetingData);

        // Load participants
        const participantsData = await getParticipants(meetingId);
        setParticipants(participantsData);

        // Calculate overlapping time slots
        const overlappingSlots = await getOverlappingSlots(meetingId);

        // Process results for display
        const processedResults = processResults(
          overlappingSlots,
          participantsData.length
        );
        setResults(processedResults);
      } catch (err) {
        console.error("Error loading results:", err);
        setError("Failed to load meeting results");
      } finally {
        setIsLoading(false);
      }
    }

    if (meetingId) {
      loadData();
    }
  }, [meetingId]);

  // Process raw overlapping slots data into a more structured format
  const processResults = (
    overlappingData: any[],
    totalParticipants: number
  ) => {
    return overlappingData
      .map((item) => {
        // Parse slot ID to extract date and time info
        // Format: date_hour_minute (e.g., "2023-04-15_14_30")
        const [date, hourStr, minuteStr] = item.slot.split("_");
        const hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        // Calculate end time (30 minutes later)
        let endHour = hour;
        let endMinute = minute + 30;

        if (endMinute >= 60) {
          endHour += 1;
          endMinute = 0;
        }

        const startTime = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
          .toString()
          .padStart(2, "0")}`;

        return {
          slotId: item.slot,
          date,
          startTime,
          endTime,
          participants: item.participants || [],
          count: item.count,
          totalParticipants,
          percentage: item.percentage,
        };
      })
      .sort((a, b) => {
        // Sort by date first
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }

        // Then by start time
        return a.startTime.localeCompare(b.startTime);
      });
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return format(new Date(2000, 0, 1, hours, minutes), "h:mm a");
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/meetings/${meetingId}/availability`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Group results by date
  const resultsByDate = results.reduce<Record<string, AvailabilityResult[]>>(
    (acc, result) => {
      if (!acc[result.date]) {
        acc[result.date] = [];
      }
      acc[result.date].push(result);
      return acc;
    },
    {}
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{meeting?.title}</CardTitle>
            {meeting?.description && (
              <CardDescription>{meeting.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="mr-2 h-4 w-4" />
                <span>{participants.length} participants</span>
              </div>

              <Button
                onClick={copyShareLink}
                variant="outline"
                className="flex items-center"
              >
                {linkCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Invitation Link
                  </>
                )}
              </Button>
            </div>

            {participantName && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <p className="font-medium">You joined as: {participantName}</p>
                <p className="text-sm mt-1">
                  You can update your availability by joining again with the
                  same name.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participants list */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {participants.map((participant) => (
                <div
                  key={participant.name}
                  className={`p-3 rounded-md border ${
                    participantName === participant.name
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {participant.availableSlots?.length || 0} time slots
                    selected
                  </p>
                </div>
              ))}

              {participants.length === 0 && (
                <div className="col-span-full text-center py-6 text-gray-500">
                  <p>No participants have joined yet.</p>
                  <p className="mt-2">Share the link to invite others!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results by date */}
        {Object.keys(resultsByDate).length > 0 ? (
          Object.entries(resultsByDate).map(([date, dateResults]) => (
            <Card key={date} className="mb-6">
              <CardHeader>
                <CardTitle>{formatDate(date)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dateResults
                    .sort((a, b) => b.percentage - a.percentage)
                    .map((result) => (
                      <div
                        key={result.slotId}
                        className="p-3 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-500 mr-2" />
                          <span className="font-medium">
                            {formatTime(result.startTime)} -{" "}
                            {formatTime(result.endTime)}
                          </span>
                        </div>

                        <div className="mt-2 sm:mt-0 flex items-center">
                          <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm whitespace-nowrap">
                            {result.count}/{result.totalParticipants} people
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <CalendarClock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Common Time Slots Yet
              </h3>
              <p className="text-gray-500 mb-6">
                There are no time slots with overlapping availability yet. Share
                the link to invite more participants!
              </p>

              <Button
                onClick={() =>
                  router.push(`/meetings/${meetingId}/availability`)
                }
                className="bg-blue-600 hover:bg-blue-700"
              >
                Select Your Availability
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All times shown in your timezone: {timezone}</p>
        </div>
      </div>
    </div>
  );
}
