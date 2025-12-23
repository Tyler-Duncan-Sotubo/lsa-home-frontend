// app/account/page.tsx
import { auth } from "@/lib/auth/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

// React Icons
import { FaBox, FaLock, FaMapMarkedAlt } from "react-icons/fa";

export default async function AccountPage() {
  const session = await auth();
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto mt-3">
      <h1 className="text-3xl font-semibold">Your Account</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* YOUR ORDERS */}
        <Link href="/account/orders" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaBox className="text-blue-600 text-xl" />
                Your Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track, return, cancel an order, download invoice or buy again.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* LOGIN & SECURITY */}
        <Link href="/account/security" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaLock className="text-green-600 text-xl" />
                Login & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your password, email, and phone number.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* ADDRESSES */}
        <Link href="/account/addresses" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FaMapMarkedAlt className="text-orange-600 text-xl" />
                Your Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Edit, remove, or set a default address.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
