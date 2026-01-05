"use client";
import { useAppSelector } from "@/store/hooks";
import * as React from "react";

function formatNaira(amount: number) {
  // basic formatting; adjust locales if you want
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CreditsPage() {
  const store = useAppSelector((s) => s.runtimeConfig.store);
  // Replace these with real values from your backend/session
  const credits = 0; // e.g. 245
  const creditsToNairaRate = 0.01;
  const nairaValue = credits * creditsToNairaRate;

  const referralCredits = 100;
  const reviewCredits = 10;

  // Replace with your actual referral link generation
  const referralLink = "https://yourstore.ng/r/yourusername";

  return (
    <div className="min-h-screen">
      <main className="mx-auto px-4 pb-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h1 className="text-lg font-semibold">
            You love <span className="font-bold">{store?.name} </span> and{" "}
            {store?.name} loves you back
          </h1>

          <h1 className="text-lg mt-2">
            To thank you for your loyalty, your credit points are found here.
          </h1>

          <div className="mt-6 rounded-xl bg-gray-50 p-5 ring-1 ring-gray-100">
            <div className="text-sm text-gray-600">
              ₦{nairaValue.toFixed(2)} of credits
            </div>
            <div className="mt-1 text-xl font-semibold text-gray-900">
              You have {credits} credits
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-base font-semibold text-gray-900">
              How to win credits?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              If you’d like to, you can earn further NaijaMart credits by doing
              one of the following:
            </p>

            <div className="mt-5 space-y-3">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Invite a friend with your referral link
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Earn{" "}
                    <span className="font-semibold">{referralCredits}</span>{" "}
                    credits when your friend makes their first purchase.
                  </p>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="w-full rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-100">
                      {referralLink}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigator.clipboard.writeText(referralLink)
                      }
                      className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                    >
                      Copy link
                    </button>
                  </div>
                </div>

                <div className="shrink-0 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                  +{referralCredits}
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Leave a review on products you bought
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Earn <span className="font-semibold">{reviewCredits}</span>{" "}
                    credits per approved review.
                  </p>

                  <div className="mt-3">
                    <a
                      href="/account/orders"
                      className="text-xs font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-700"
                    >
                      Go to my orders to review →
                    </a>
                  </div>
                </div>

                <div className="shrink-0 rounded-full bg-gray-900 px-3 py-1 text-xs font-semibold text-white">
                  +{reviewCredits}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-gray-50 p-4 text-sm text-gray-700 ring-1 ring-gray-100">
              <p className="font-medium text-gray-900">As a reminder</p>
              <p className="mt-1">
                <span className="font-semibold">10 credits</span> ={" "}
                <span className="font-semibold">
                  {formatNaira(10 / creditsToNairaRate)}
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-600">
                Credits can be redeemed at checkout. Terms may apply.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} NaijaMart. All rights reserved.
        </p>
      </main>
    </div>
  );
}
