// components/account/account-tabs.tsx
"use client";

import type { Session } from "next-auth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrdersTab } from "./orders-tab";

interface AccountTabsProps {
  session: Session;
}

export function AccountTabs({ session }: AccountTabsProps) {
  return (
    <Tabs defaultValue="account" className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Account</h1>
      </div>

      <TabsList>
        <TabsTrigger value="account">Account details</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
      </TabsList>

      {/* ACCOUNT DETAILS */}
      <TabsContent value="account" className="space-y-4">
        <div className="rounded-lg border p-4 space-y-2">
          <p>
            <strong>Name:</strong> {session.user?.name}
          </p>
          <p>
            <strong>Email:</strong> {session.user?.email}
          </p>
        </div>
      </TabsContent>

      {/* ORDERS TAB */}
      <TabsContent value="orders" className="space-y-4">
        <OrdersTab />
      </TabsContent>
    </Tabs>
  );
}
