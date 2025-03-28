import React from "react";
import { Users, CalendarClock } from "lucide-react";

interface AvailabilityTabsProps {
  activeTab: "selection" | "overview";
  onTabChange: (tab: "selection" | "overview") => void;
  participantsCount: number;
}

export function AvailabilityTabs({
  activeTab,
  onTabChange,
  participantsCount,
}: AvailabilityTabsProps) {
  return (
    <div className="flex border-b mb-6">
      <button
        className={`flex items-center px-4 py-3 border-b-2 ${
          activeTab === "selection"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => onTabChange("selection")}
      >
        <CalendarClock className="w-5 h-5 mr-2" />
        <span className="font-medium">Your Availability</span>
      </button>

      <button
        className={`flex items-center px-4 py-3 border-b-2 ${
          activeTab === "overview"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-600 hover:text-gray-800"
        }`}
        onClick={() => onTabChange("overview")}
      >
        <Users className="w-5 h-5 mr-2" />
        <span className="font-medium">Group Preview</span>
        {participantsCount > 0 && (
          <span className="ml-2 bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs">
            {participantsCount}
          </span>
        )}
      </button>
    </div>
  );
}
