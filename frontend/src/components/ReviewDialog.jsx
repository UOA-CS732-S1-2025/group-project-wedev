"use client"

import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Field, RatingGroup, Stack, Textarea, Heading } from "@chakra-ui/react"
import useAuthStore from "../store/authStore"
import { toaster } from "@/components/ui/toaster"

const ReviewDialog = forwardRef(({ bookingId, providerId, onSuccess }, ref) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 暴露 submit 方法给外部
  useImperativeHandle(ref, () => ({
    async submit() {
      if (!rating || !comment.trim()) {
        toaster.create({
          title: "Please complete all fields",
          description: "Rating and review cannot be empty.",
        });
        return false;
      }
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            bookingId,
            providerId,
            customerId: user._id,
            rating,
            comment
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        if (onSuccess) onSuccess();
        toaster.create({
          title: "Review submitted successfully",
          description: "Thank you for your review!",
        });
        return true;
      } catch (err) {
        toaster.create({
          title: "Failed to submit review",
          description: err.message || "Failed to submit review",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    loading
  }));

  return (
    <Stack gap="4" align="flex-start">
      <Field.Root>
        <Field.Label>Rating</Field.Label>
        <RatingGroup.Root
          count={5}
          value={rating}
          onValueChange={e => setRating(e.value)}
        >
          <RatingGroup.HiddenInput />
          <RatingGroup.Control />
        </RatingGroup.Root>
        <Heading size="sm">Review</Heading>
        <Textarea
          placeholder="Write a review"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />
      </Field.Root>
    </Stack>
  )
});

export default ReviewDialog;

