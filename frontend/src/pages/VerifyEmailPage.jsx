import React, { useEffect, useState } from "react";
import { Box, Spinner, Text, Heading } from "@chakra-ui/react";
import { useSearchParams, useNavigate  } from "react-router-dom";
import api from "../lib/api";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        if (res.status === 200) {
          setStatus("success");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    if (token) {
      verify();
    } else {
      setStatus("invalid");
    }
  }, [token]);

  return (
    <Box textAlign="center" mt="40">
      {status === "loading" && (
        <>
          <Spinner size="xl" />
          <Text mt="4">Verifying your email...</Text>
        </>
      )}

      {status === "success" && (
        <>
          <Heading>Email Verified Successfully ✅</Heading>
          <Text mt="4">You can now log in.</Text>
        </>
      )}

      {status === "error" && (
        <>
          <Heading color="red.500">Verification Failed ❌</Heading>
          <Text mt="4">The link is invalid or has expired. Please register again.</Text>
        </>
      )}

      {status === "invalid" && (
        <>
          <Heading color="orange.400">Invalid Request ⚠️</Heading>
          <Text mt="4">Verification token is missing.</Text>
        </>
      )}
    </Box>
  );
};

export default VerifyEmailPage;
