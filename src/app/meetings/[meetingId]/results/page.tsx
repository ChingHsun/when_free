"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Clock, Users, CalendarClock, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Fallback } from "@/components/Fallback";
import { useMeetingStore } from "@/store/meetingStore";
import { format, parseISO } from "date-fns";
import { getOverlappingSlots } from "@/lib/meetingService";
import { AvailabilityResult } from "@/lib/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const meetingId = params.meetingId as string;
  const name = searchParams.get("name");

  const { meeting, participants, fetchMeeting } = useMeetingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [resultsByDate, setResultsByDate] = useState<
    Record<string, AvailabilityResult[]>
  >({});
  const [timezone, setTimezone] = useState<string>("");
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  useEffect(() => {
    // Set the timezone
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    async function fetchData() {
      setIsLoading(true);
      try {
        await fetchMeeting({ meetingId });
        const results = await getOverlappingSlots(meetingId);

        // Process the results
        const processedResults: Record<string, AvailabilityResult[]> = {};

        results.forEach((result) => {
          // Parse the slot ID format: date_hour_minute
          const [dateStr, hourStr, minuteStr] = result.slot.split("_");
          const hour = parseInt(hourStr);
          const minute = parseInt(minuteStr);

          // Create formatted time strings
          const startTime = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;
          const endMinute = minute === 30 ? 0 : 30;
          const endHour = minute === 30 ? (hour + 1) % 24 : hour;
          const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
            .toString()
            .padStart(2, "0")}`;

          if (!processedResults[dateStr]) {
            processedResults[dateStr] = [];
          }

          processedResults[dateStr].push({
            slotId: result.slot,
            date: dateStr,
            startTime,
            endTime,
            participants: result.participants,
            count: result.count,
            totalParticipants: participants?.length || 0,
            // Update percentage calculation to handle zero participants case
            percentage: participants?.length
              ? Math.round((result.count / participants.length) * 100)
              : 0,
          });
        });

        setResultsByDate(processedResults);
      } catch (err) {
        console.error("Error fetching meeting data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load meeting results"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [fetchMeeting, meetingId, participants?.length]);

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const formatTime = (timeStr: string) => {
    // Format from 24h to 12h format
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr);
    const minute = minuteStr;

    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM

    return `${hour12}:${minute} ${period}`;
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.origin + `/meetings/${meetingId}`;
    navigator.clipboard.writeText(shareUrl);
    setShowCopiedMessage(true);
    setTimeout(() => setShowCopiedMessage(false), 2000);
  };

  if (isLoading) return <Fallback status="loading" />;

  if (error) return <Fallback status="error" errorMessage={error} />;

  // Check if two slots are consecutive
  const areConsecutiveSlots = (
    slot1: AvailabilityResult,
    slot2: AvailabilityResult
  ) => {
    // Must be same date and same percentage
    if (slot1.date !== slot2.date || slot1.percentage !== slot2.percentage)
      return false;

    // Must have same participants
    if (slot1.participants.length !== slot2.participants.length) return false;
    if (!slot1.participants.every((p) => slot2.participants.includes(p)))
      return false;

    // Check if endTime of slot1 is startTime of slot2
    return slot1.endTime === slot2.startTime;
  };

  // Calculate duration between two time strings (in minutes)
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    // eslint-disable-next-line prefer-const
    let [endHour, endMinute] = endTime.split(":").map(Number);

    // Adjust for next day if needed
    if (
      endHour < startHour ||
      (endHour === startHour && endMinute < startMinute)
    ) {
      endHour += 24;
    }

    const totalStartMinutes = startHour * 60 + startMinute;
    const totalEndMinutes = endHour * 60 + endMinute;

    return totalEndMinutes - totalStartMinutes;
  };

  // Format duration in hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} minutes`;
    } else if (mins === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins} minutes`;
    }
  };

  // Prepare result data for display
  const prepareResultData = () => {
    // Flatten all results to sort them globally
    const allResults: (AvailabilityResult & { formattedDate: string })[] = [];

    Object.entries(resultsByDate).forEach(([date, dateResults]) => {
      dateResults.forEach((result) => {
        allResults.push({
          ...result,
          formattedDate: formatDate(date),
        });
      });
    });

    // Sort by percentage, prioritizing 100% matches
    allResults.sort((a, b) => {
      // First prioritize 100% matches
      if (a.percentage === 100 && b.percentage !== 100) return -1;
      if (b.percentage === 100 && a.percentage !== 100) return 1;

      // Then sort by percentage
      if (a.percentage !== b.percentage) return b.percentage - a.percentage;

      // If tied, sort by date
      const dateComparison =
        new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison !== 0) return dateComparison;

      // If same date, sort by time
      const [aHour, aMinute] = a.startTime.split(":").map(Number);
      const [bHour, bMinute] = b.startTime.split(":").map(Number);
      const aMinutes = aHour * 60 + aMinute;
      const bMinutes = bHour * 60 + bMinute;
      return aMinutes - bMinutes;
    });

    // Group consecutive slots
    const groupedResults: (AvailabilityResult & {
      formattedDate: string;
      duration: number;
      formattedDuration: string;
    })[] = [];

    let currentGroup: (AvailabilityResult & { formattedDate: string })[] = [];

    allResults.forEach((result, index) => {
      if (index === 0) {
        currentGroup = [result];
      } else {
        const prevResult = allResults[index - 1];

        if (areConsecutiveSlots(prevResult, result)) {
          currentGroup.push(result);
        } else {
          // Process the current group
          if (currentGroup.length > 0) {
            const firstSlot = currentGroup[0];
            const lastSlot = currentGroup[currentGroup.length - 1];
            const duration = calculateDuration(
              firstSlot.startTime,
              lastSlot.endTime
            );

            groupedResults.push({
              ...firstSlot,
              endTime: lastSlot.endTime,
              duration,
              formattedDuration: formatDuration(duration),
            });
          }

          // Start a new group
          currentGroup = [result];
        }
      }

      // Process the last group if we're at the end
      if (index === allResults.length - 1 && currentGroup.length > 0) {
        const firstSlot = currentGroup[0];
        const lastSlot = currentGroup[currentGroup.length - 1];
        const duration = calculateDuration(
          firstSlot.startTime,
          lastSlot.endTime
        );

        groupedResults.push({
          ...firstSlot,
          endTime: lastSlot.endTime,
          duration,
          formattedDuration: formatDuration(duration),
        });
      }
    });

    // Check if any results have >= 50% availability
    const hasResultsAbove50Percent = groupedResults.some(
      (result) => result.percentage >= 50
    );

    // Filter to >= 50% if some results meet that criteria
    const filteredResults = hasResultsAbove50Percent
      ? groupedResults.filter((result) => result.percentage >= 50)
      : groupedResults;

    return {
      filteredResults,
      hasResultsAbove50Percent,
      allResults: groupedResults,
    };
  };

  const { filteredResults, hasResultsAbove50Percent, allResults } =
    prepareResultData();
  const anyResultsExist = allResults.length > 0;
  const noResultsAbove50Percent = anyResultsExist && !hasResultsAbove50Percent;

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
                <span>{participants?.length || 0} participants</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  {showCopiedMessage ? "Copied!" : "Share Meeting"}
                  {!showCopiedMessage && <Copy className="h-4 w-4" />}
                </Button>
                <Button onClick={() => router.push(`/meetings/${meetingId}`)}>
                  Update Availability
                </Button>
              </div>
            </div>

            {name && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                <p className="font-medium">You joined as: {name}</p>
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
              {participants && participants.length > 0 ? (
                participants.map((participant) => (
                  <div
                    key={participant.name}
                    className={`p-3 rounded-md border ${
                      name === participant.name
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
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-gray-500">
                  <p>No participants have joined yet.</p>
                  <p className="mt-2">Share the link to invite others!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results section */}
        {anyResultsExist ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Best Meeting Times</CardTitle>
              {filteredResults.length > 0 &&
                filteredResults[0].percentage === 100 && (
                  <CardDescription className="text-green-600 font-medium">
                    Perfect matches found! Everyone is available at the
                    following times.
                  </CardDescription>
                )}
              {noResultsAbove50Percent && (
                <CardDescription className="text-amber-600 font-medium">
                  No times with majority availability found. Showing all
                  options.
                </CardDescription>
              )}
              {hasResultsAbove50Percent &&
                filteredResults[0].percentage !== 100 && (
                  <CardDescription>
                    Showing times with at least 50% participant availability.
                  </CardDescription>
                )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredResults.map((result) => (
                  <div
                    key={result.slotId}
                    className={`p-3 border rounded-md flex flex-col sm:flex-row sm:items-center justify-between ${
                      result.percentage === 100
                        ? "bg-green-50 border-green-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-start flex-col">
                      <div className="flex items-center mb-1">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="font-medium">
                          {formatTime(result.startTime)} -{" "}
                          {formatTime(result.endTime)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 ml-7">
                        {result.formattedDate}
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-0 flex items-center">
                      <div className="w-full sm:w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className={`h-2.5 rounded-full ${
                            result.percentage === 100
                              ? "bg-green-600"
                              : result.percentage >= 75
                              ? "bg-blue-600"
                              : "bg-blue-400"
                          }`}
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

              {hasResultsAbove50Percent &&
                allResults.length > filteredResults.length && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="text-sm text-gray-500">
                      {allResults.length - filteredResults.length} time slots
                      with less than 50% availability are hidden.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
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
                onClick={() => router.push(`/meetings/${meetingId}`)}
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
