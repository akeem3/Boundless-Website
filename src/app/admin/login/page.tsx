import { LoginClient } from "./login-client";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Boundless FC</h1>
          <p className="mt-1 text-sm text-foreground/60">Admin Panel</p>
        </div>
        <LoginClient />
      </div>
    </div>
  );
}
