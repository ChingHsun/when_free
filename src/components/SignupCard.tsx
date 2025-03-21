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
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export interface SignupCardProps {
  meeting: Meeting;
  error: string | null;
  onStartSelection: ({ name }: { name: string | null }) => void;
}

export const SignupCard = ({
  meeting,
  error,
  onStartSelection,
}: SignupCardProps) => {
  const [userName, setUserName] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{meeting.title}</CardTitle>
        <CardDescription>
          {meeting.description + "Please enter your name to continue"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <Input
            value={userName || ""}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => onStartSelection({ name: userName })}
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
