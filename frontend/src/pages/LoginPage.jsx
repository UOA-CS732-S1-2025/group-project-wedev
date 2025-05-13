import React, { useState, useEffect } from 'react';
import {
  Field, Box, Input, Button, VStack, Text, Image, defineStyle
} from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from "../store/authStore";

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({ comtent: '' });
  const { login, user }         = useAuthStore();
  const navigate                = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = { comtent: '' };
    setErrors(newErrors);
    if (!email) {
      newErrors.comtent = 'Please enter your email.';
      setErrors(newErrors);
      return;
    }
    if (!password) {
      newErrors.comtent = 'Please enter your password.';
      setErrors(newErrors);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.comtent = 'Invalid email format';
      setErrors(newErrors);
      return;
    }
    if (password.length <= 8) {
      newErrors.comtent = 'Password must be 8+ characters';
      setErrors(newErrors);
      return;
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.comtent = 'Password must include uppercase';
      setErrors(newErrors);
      return;
    }
    if (!/[a-z]/.test(password)) {
      newErrors.comtent = 'Password must include lowercase';
      setErrors(newErrors);
      return;
    }
    if (!/[0-9]/.test(password)) {
      newErrors.comtent = 'Password must include number';
      setErrors(newErrors);
      return;
    }
    if (newErrors.comtent) {
      newErrors.comtent = 'Some Wrong? Contact Service Team!';
      setErrors(newErrors);
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setErrors({ comtent: result.message });
    } else {
      navigate("/");
    }
  };

  const floatingStyles = defineStyle({
    pos: "absolute",
    bg: "bg",
    px: "0.5",
    top: "-3",
    insetStart: "2",
    fontWeight: "normal",
    pointerEvents: "none",
    transition: "position",
    _peerPlaceholderShown: {
      color: "fg.muted",
      top: "2.5",
      insetStart: "3",
    },
    _peerFocusVisible: {
      color: "fg",
      top: "-3",
      insetStart: "2",
    },
  });

  const canSwipe = email !== '' && password !== ''; // added: only enable swipe when fields filled

  return (
    <Box
      position="relative"
      minH="90vh"
      bgGradient="linear(to-br, green.100, green.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      overflow="hidden"
    >
      <Box position="absolute" top="-80px" right="-100px" zIndex={0} opacity={0.15}>
        <svg width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#48BB78" d="M50.4,-61.2C65.5,-49.7,77.7,-32.4,77.6,-16.1C77.6,0.2,65.3,15.7,54.4,31.6C43.4,47.5,33.8,63.8,20.2,66.2C6.5,68.5,-11.2,56.9,-27.2,46.1C-43.3,35.2,-57.8,25.1,-66.7,9.5C-75.5,-6.1,-78.6,-28.1,-68.3,-42.6C-58,-57.1,-34.2,-64,-12.4,-61.6C9.4,-59.2,18.8,-47.7,50.4,-61.2Z" transform="translate(100 100)" />
        </svg>
      </Box>

      <Box
        zIndex={1}
        w="100%"
        maxW="400px"
        p={8}
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
      >
        <Box textAlign="center" mb={4}>
          <Image
            src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/Urban+easelogo.svg"
            alt="Urban Ease Logo"
            boxSize="auto"
            mx="auto"
            mb={2}
          />
        </Box>

        <form onSubmit={handleLogin}>
          <VStack spacing={10}>
            <Field.Root w="100%" mb={3}>
              <Input
                className="peer"
                placeholder=""
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field.Label css={floatingStyles}>Email</Field.Label>
            </Field.Root>

            <Field.Root w="100%" mb={3}>
              <Input
                className="peer"
                placeholder=""
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Field.Label css={floatingStyles}>Password</Field.Label>
            </Field.Root>

            <Field.Root w="100%" mb={1} visibility={errors.comtent ? "visible" : "hidden"}>
              <Text mt={1} fontSize="sm" color="red.500">
                {errors.comtent || "space"}
              </Text>
            </Field.Root>

            <Button
              type="submit"
              width="100%"
              pos="relative"
              overflow="hidden"
              bg="black"
              color="white"
              transition="color 0.2s ease"
              isDisabled={!canSwipe}
              _before={{
                content: '""',
                pos: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                w: "0%",
                bg: "green.600",
                transition: "width 0.3s ease",
                zIndex: 0,
              }}
              _active={ canSwipe
                ? { _before: { width: "100%" }, color: "white" }
                : {}
              }
            >
              <Box pos="relative" zIndex={1}>
                Login
              </Box>
            </Button>

            <Text fontSize="xs" textAlign="center">
              New here?{' '}
              <Link to="/signup" style={{ color: '#2F855A', fontWeight: 'bold' }}>
                Sign up
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;
