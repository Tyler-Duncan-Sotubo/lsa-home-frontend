"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HiMiniStar, HiOutlineStar } from "react-icons/hi2";

interface WriteReviewDialogProps {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
  user?: {
    name: string;
    email: string;
  } | null;
}

// Zod schemas
const loggedInReviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating."),
  headline: z.string().trim().min(1, "Add a headline."),
  review: z.string().trim().min(1, "Write a review."),
});

const guestReviewSchema = loggedInReviewSchema.extend({
  name: z.string().trim().min(1, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
});

export function WriteReviewDialog({
  productId,
  open,
  onOpenChange,
  onSubmitted,
  user,
}: WriteReviewDialogProps) {
  const isLoggedIn = !!user;

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [headline, setHeadline] = useState("");
  const [review, setReview] = useState("");
  const [name, setName] = useState(""); // used only when not logged in
  const [email, setEmail] = useState(""); // used only when not logged in
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate with Zod
    const data = isLoggedIn
      ? { rating, headline, review }
      : { rating, headline, review, name, email };

    const result = isLoggedIn
      ? loggedInReviewSchema.safeParse(data)
      : guestReviewSchema.safeParse(data);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message;
      setError(firstError || "Please check the form and try again.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          review,
          headline,
          name: isLoggedIn ? user?.name : name,
          email: isLoggedIn ? user?.email : email,
          // You can add more fields here if your WooCommerce endpoint needs them
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit review.");
      }

      setSuccess("Thank you! Your review has been submitted.");
      setReview("");
      setHeadline("");
      setRating(0);

      if (!isLoggedIn) {
        setName("");
        setEmail("");
      }

      if (onSubmitted) onSubmitted();
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      setError(
        "Something went wrong submitting your review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating ?? rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Share your thoughts</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logged-in info */}
          {isLoggedIn && (
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              You are logged in as{" "}
              <span className="font-medium">{user?.name}</span>{" "}
              {user?.email && (
                <>
                  (<span className="font-mono">{user.email}</span>)
                </>
              )}
              . We&apos;ll use this information for your review.
            </div>
          )}

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Rate your experience <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => {
                  const index = i + 1;
                  const active = index <= displayRating;

                  const Icon = active ? HiMiniStar : HiOutlineStar;
                  return (
                    <button
                      key={index}
                      type="button"
                      className="p-1"
                      onMouseEnter={() => setHoverRating(index)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(index)}
                    >
                      <Icon className="h-8 w-8 text-yellow-400" />
                    </button>
                  );
                })}
              </div>
              {rating > 0 && (
                <span className="text-xs text-muted-foreground">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Add a headline <span className="text-red-500">*</span>
            </Label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Summarize your experience"
            />
          </div>

          {/* Review Body */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Write a review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us what you like or dislike"
              className="min-h-[120px]"
            />
          </div>

          {/* Only show name/email when NOT logged in */}
          {!isLoggedIn && (
            <>
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Your name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we display your name?"
                />
              </div>
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Your email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="We'll send you an email to verify this review came from you."
                />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send you an email to verify this review came from
                  you.
                </p>
              </div>
            </>
          )}

          {/* Info / errors */}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
