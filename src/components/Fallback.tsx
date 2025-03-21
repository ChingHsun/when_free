import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

interface FallbackProps {
  status: "loading" | "error";
  errorMessage?: string;
}

export const Fallback = ({ status, errorMessage }: FallbackProps) => {
  const router = useRouter();


  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{errorMessage ? errorMessage : "Something went wrong"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
};
