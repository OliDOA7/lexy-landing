import LoginForm from "@/components/auth/LoginForm";
import AppLogo from "@/components/layout/AppLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mb-4 inline-block">
            <AppLogo />
          </div>
          <CardTitle className="text-2xl">Welcome back to Lexy</CardTitle>
          <CardDescription>
            Log in to continue to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
