// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";
import { TimezoneSelect } from "@/components/TimezoneSelect";
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
import { DatePicker } from "@/components/DatePicker";
import { createMeeting } from "@/lib/meetingService";

// Types
export interface Meeting {
  title: string;
  description: string;
  organizerName: string;
  selectedTimezone: string;
  selectedDates: string[];
  availableTimeSlots: unknown[];
}
const TIMEZONE_STORAGE_KEY = "user-timezone";
export default function Home() {
  const router = useRouter();
  // Initialize with browser timezone
  const [meeting, setMeeting] = useState<Meeting>({
    title: "",
    description: "",
    organizerName: "",
    selectedTimezone: "",
    selectedDates: [],
    availableTimeSlots: [],
  });

  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        options.push(`${hourStr}:${minuteStr}`);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleCreateMeeting = async (event) => {
    console.log("Creating meeting:", meeting);

    event.preventDefault();
    try {
      const { id, shareCode } = await createMeeting(
        meeting.title,
        meeting.description,
        meeting.selectedDates
      );

      // 導航到下一頁
      router.push(`/meetings/${id}`);
    } catch (error) {
      console.error("Error creating meeting:", error);
    }
    alert("Meeting created! You would be redirected to share the link.");
  };

  useEffect(() => {
    // 現在安全地訪問 sessionStorage
    const storedTimezone = sessionStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (storedTimezone) {
      setMeeting((meeting) => ({
        ...meeting,
        selectedTimezone: storedTimezone,
      }));
    } else {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setMeeting((meeting) => ({
        ...meeting,
        selectedTimezone: browserTimezone,
      }));

      sessionStorage.setItem("user-timezone", browserTimezone);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Meeting Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Meeting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Organizer Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <Input
                    value={meeting.organizerName}
                    onChange={(e) =>
                      setMeeting({ ...meeting, organizerName: e.target.value })
                    }
                    placeholder="Enter your name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Timezone
                  </label>
                  <TimezoneSelect
                    value={meeting.selectedTimezone}
                    onChange={(timezone) =>
                      setMeeting({ ...meeting, selectedTimezone: timezone })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Meeting Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Meeting Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title
                  </label>
                  <Input
                    value={meeting.title}
                    onChange={(e) =>
                      setMeeting({ ...meeting, title: e.target.value })
                    }
                    placeholder="Enter meeting title"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={meeting.description}
                    onChange={(e) =>
                      setMeeting({ ...meeting, description: e.target.value })
                    }
                    placeholder="Enter meeting description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Selection First */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Select Available Dates</CardTitle>
            <CardDescription>
              Choose multiple dates for your meeting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DatePicker
              selectedDates={meeting.selectedDates}
              onChange={(dates) =>
                setMeeting((meeting) => ({ ...meeting, selectedDates: dates }))
              }
              timezone={meeting.selectedTimezone}
            />
          </CardContent>
          <CardFooter>
            <div className="text-sm text-gray-500">
              {meeting.selectedDates.length} date
              {meeting.selectedDates.length !== 1 ? "s" : ""} selected
            </div>
          </CardFooter>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Flexible Scheduling
            </h3>
            <p className="text-gray-600">
              Choose multiple dates that work for you
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <Clock className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Timezone Smart</h3>
            <p className="text-gray-600">
              Times automatically convert to each participant&apos;s timezone
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Easy Sharing</h3>
            <p className="text-gray-600">
              Share a simple link with your participants
            </p>
          </div>
        </div>

        {/* Create Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 py-6 text-lg"
          disabled={
            !meeting.organizerName ||
            !meeting.title ||
            meeting.selectedDates.length === 0
          }
          onClick={handleCreateMeeting}
        >
          Create Meeting
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
