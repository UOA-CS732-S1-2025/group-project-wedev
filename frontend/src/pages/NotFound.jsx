import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Heading, Text, Spinner, Image } from "@chakra-ui/react";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5); // Initial countdown seconds

  useEffect(() => {
    // Decrease countdown every second
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Redirect when it reaches 0
    const timeout = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <Box position="relative"
    minH="90vh"
    bgGradient="linear(to-br, green.100, green.50)"
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    px={4}
    overflow="hidden">

        <Image
          src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/back+ground+log.png"
          alt="Background Blob"
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          objectFit="cover"
          zIndex={0}
          opacity={0.15}
        />
      <Heading size="lg">404 - Page Not Found</Heading>
      <Text mt={4}>Redirecting to homepage in {countdown} second{countdown !== 1 && 's'}...</Text>
      <Spinner mt={6} size="xl" />
    </Box>
  );
};

export default NotFound;
