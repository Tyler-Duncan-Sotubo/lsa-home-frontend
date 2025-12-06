// app/account/page.tsx
import { auth } from "@/app/api/auth/[...nextauth]/route";

export default async function AccountPage() {
  const session = await auth(); // 👈 server-side session

  if (!session) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">You are not logged in</h2>
        <p className="text-muted-foreground mt-2">
          Please sign in to access your account.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">My Account</h1>

      <div className="rounded-lg border p-4 space-y-2">
        <p>
          <strong>Name:</strong> {session.user?.name}
        </p>
        <p>
          <strong>Email:</strong> {session.user?.email}
        </p>

        {/* This is your WordPress JWT token */}
        <p className="text-xs break-all text-muted-foreground">
          <strong>Access Token:</strong> {session.accessToken}
        </p>
      </div>
    </div>
  );
}
