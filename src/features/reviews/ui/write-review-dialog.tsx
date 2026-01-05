"use client";

import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { HiMiniStar, HiOutlineStar } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import { getStorefrontErrorMessage } from "@/shared/api/storefront-error";
import { useCreateReview } from "../hooks/create-review";

interface WriteReviewDialogProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
  user?: {
    name: string;
    email: string;
  } | null;
  slug: string;
}

const loggedInReviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating."),
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
  slug,
}: WriteReviewDialogProps) {
  const router = useRouter();
  const isLoggedIn = !!user;
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const createReview = useCreateReview(String(productId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const data = isLoggedIn
      ? { rating, review }
      : { rating, review, name, email };

    const result = isLoggedIn
      ? loggedInReviewSchema.safeParse(data)
      : guestReviewSchema.safeParse(data);

    if (!result.success) {
      setError(result.error.issues[0]?.message || "Please check the form.");
      return;
    }

    try {
      setSubmitting(true);

      await createReview({
        rating,
        review,
        name: (isLoggedIn ? user?.name : name) ?? "",
        email: (isLoggedIn ? user?.email : email) ?? "",
        slug,
      });

      setSuccess("Thank you! Your review has been submitted.");
      setReview("");
      setRating(0);

      if (!isLoggedIn) {
        setName("");
        setEmail("");
      }

      // ✅ ensures the server-rendered reviews + rating summary updates immediately
      router.refresh();
      setSuccess("");
      onSubmitted?.();
      onOpenChange(false);
    } catch (err) {
      const msg = getStorefrontErrorMessage(err);
      setError(msg || "An error occurred while submitting your review.");
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
          {isLoggedIn && (
            <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              You are logged in as{" "}
              <span className="font-medium">{user?.name}</span>{" "}
              {user?.email && (
                <>
                  (<span className="font-mono">{user.email}</span>)
                </>
              )}
              .
            </div>
          )}

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

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Write a review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us what you like or dislike"
              className="min-h-30"
            />
          </div>

          {!isLoggedIn && (
            <>
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

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Your email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="We'll use this for moderation/contact if needed."
                />
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="clean"
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
