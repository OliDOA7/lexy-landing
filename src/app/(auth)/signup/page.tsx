import SignUpForm from "@/components/auth/SignUpForm";
import AppLogo from "@/components/layout/AppLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 inline-block">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl">Create your Lexy account</CardTitle>
          <CardDescription>
            Join Lexy to access powerful AI transcription services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}
