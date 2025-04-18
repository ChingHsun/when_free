import { useState, useEffect } from "react";
import { Globe, Search } from "lucide-react";
import { ALL_TIME_ZONES } from "@/lib/constants";
import { useMeetingStore } from "@/store/meetingStore";

export function TimezoneSelect() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTimezones, setFilteredTimezones] =
    useState<string[]>(ALL_TIME_ZONES);

  const { userTimezone, setUserTimezone } = useMeetingStore();

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTimezones(ALL_TIME_ZONES);
    } else {
      const filtered = ALL_TIME_ZONES.filter((tz) =>
        tz.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTimezones(filtered);
    }
  }, [searchTerm]);

  return (
    <div className="relative">
      <div
        className="relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-800">
          {userTimezone}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search timezone..."
                className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredTimezones.map((timezone) => (
              <div
                key={timezone}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  userTimezone === timezone ? "bg-blue-50 text-blue-700" : ""
                }`}
                onClick={() => {
                  setUserTimezone(timezone);
                  setIsOpen(false);
                }}
              >
                {timezone}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
