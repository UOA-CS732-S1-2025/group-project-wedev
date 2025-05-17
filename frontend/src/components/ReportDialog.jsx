"use client"

import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Field, Input, Stack, Textarea } from "@chakra-ui/react"
import useAuthStore from "../store/authStore"
import { toaster } from "@/components/ui/toaster"

const ReportDialog = forwardRef(({ bookingId, providerId, onSuccess }, ref) => {
  const { user } = useAuthStore();
  const [subject, setSubject] = useState("");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  // Expose submit method to external callers
  useImperativeHandle(ref, () => ({
    async submit() {
      if (!subject.trim() || !report.trim()) {
        toaster.create({
          title: "Please complete all fields",
          description: "Subject and report cannot be empty.",
        });
        return false;
      }
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            bookingId,
            reportedUserId: providerId,
            subject,
            description: report
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        if (onSuccess) onSuccess();
        toaster.create({
          title: "Report submitted successfully",
          description: "Your report has been submitted.",
        });
        return true;
      } catch (err) {
        toaster.create({
          title: "Failed to submit report",
          description: err.message || "Failed to submit report",
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
      <Field.Root w="100%">
        <Field.Label>Subject</Field.Label>
        <Input
          placeholder="Enter the subject of your report"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
      </Field.Root>
      <Field.Root w="100%">
        <Field.Label>Report Details</Field.Label>
        <Textarea
          placeholder="Describe your report in detail"
          value={report}
          onChange={e => setReport(e.target.value)}
          rows={5}
        />
      </Field.Root>
    </Stack>
  )
});

export default ReportDialog;
