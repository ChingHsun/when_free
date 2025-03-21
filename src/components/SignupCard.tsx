import { Meeting } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import { useState } from "react";
import { useMeetingStore } from "@/store/meetingStore";

export interface SignupCardProps {
  meeting: Meeting;
  error: string | undefined;
  onSignup: ({ name }: { name: string }) => void;
}

export const SignupCard = ({ error, onSignup }: SignupCardProps) => {
  const [userName, setUserName] = useState<string | null>(null);
  const { meeting, participants } = useMeetingStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Please enter your name to continue
            <p className="mt-1 text-sm text-gray-500">
              Your name will be used as a unique identifier. If you&apos;ve
              participated before, entering the same name will load your
              previous selections.
            </p>
          </label>
          <Input
            value={userName || ""}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {participants && participants.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-gray-500" />
              Existing Participants ({participants.length}):
            </h3>
            <div className="max-h-48 overflow-y-auto pr-2">
              <ul className="space-y-1">
                {participants.map((participant) => (
                  <li
                    key={participant.id}
                    className="text-sm text-gray-600 flex items-center truncate"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                    {participant.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => onSignup({ name: userName! })}
          disabled={!userName?.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
