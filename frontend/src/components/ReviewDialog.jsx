"use client"

import { Button, Field, RatingGroup, Stack, Textarea } from "@chakra-ui/react"
import React, { useState } from 'react'
import useAuthStore from "../store/authStore"

const ReviewDialog = ({ bookingId, providerId, onSuccess }) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return alert("请评分");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
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
    } catch (err) {
      alert(err.message || "提交失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
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
          <Textarea
            placeholder="Write a review"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </Field.Root>
        <Button size="sm" type="submit" colorPalette="blue" isLoading={loading}>
          Submit
        </Button>
      </Stack>
    </form>
  )
}

export default ReviewDialog

