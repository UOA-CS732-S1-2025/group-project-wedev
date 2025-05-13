import React, { useState, useEffect } from 'react';
import { Box, Input, Button, VStack, Text, Image, Field, defineStyle } from '@chakra-ui/react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from "../store/authStore";
import toast, { Toaster } from 'react-hot-toast';

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

const SignupPage = () => {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [errors, setErrors]       = useState({ comtent: '' });
  const { register, user }        = useAuthStore();
  const navigate                  = useNavigate();
  const notify                    = () => toast('Please check your email to verify.', {
    duration: 4000,
    icon: '📧',
  });

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = { comtent: '' };
    setErrors(newErrors);
    if (!firstname)   { newErrors.comtent = 'Please enter your first name.'; setErrors(newErrors); return; }
    if (!lastname)    { newErrors.comtent = 'Please enter your last name.';  setErrors(newErrors); return; }
    if (!email)       { newErrors.comtent = 'Please enter your email.';      setErrors(newErrors); return; }
    if (!password)    { newErrors.comtent = 'Please enter your password.';   setErrors(newErrors); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.comtent = 'Invalid email format'; setErrors(newErrors); return;
    }
    if (password.length <= 8) {
      newErrors.comtent = 'Password must be 8+ characters'; setErrors(newErrors); return;
    }
    if (!/[A-Z]/.test(password)) {
      newErrors.comtent = 'Password must include uppercase'; setErrors(newErrors); return;
    }
    if (!/[a-z]/.test(password)) {
      newErrors.comtent = 'Password must include lowercase'; setErrors(newErrors); return;
    }
    if (!/[0-9]/.test(password)) {
      newErrors.comtent = 'Password must include number'; setErrors(newErrors); return;
    }
    if (newErrors.comtent) {
      newErrors.comtent = 'Some Wrong? Contact Service Team!'; setErrors(newErrors); return;
    }

    const result = await register({ firstName: firstname, lastName: lastname, email, password });
    if (result.success) {
      notify();
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setErrors({ comtent: result.message });
    }
  };

  const canSwipe = firstname && lastname && email && password;

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
        {/* 🔁 Background Blob Image from S3 */}
        <Image
          src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/blob.png"
          alt="Background Blob"
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          objectFit="cover"
          zIndex={0}
          opacity={0.4}
        />

      <Box zIndex={1} w="100%" maxW="400px" p={8} bg="white" borderRadius="2xl" boxShadow="xl">
        <Box textAlign="center" mb={4}>
          <Image src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/Urban+easelogo.svg"
                 alt="Urban Ease Logo" boxSize="auto" mx="auto" mb={2} />
        </Box>

        <form onSubmit={handleSignup}>
          <Toaster />
          <VStack spacing={4}>
            <Field.Root w="100%" mb={3}>
              <Input
                className="peer"
                placeholder=""
                type="text"
                value={firstname}
                onChange={e => setFirstName(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              />
              <Field.Label css={floatingStyles}>First Name</Field.Label>
            </Field.Root>

            <Field.Root w="100%" mb={3}>
              <Input
                className="peer"
                placeholder=""
                type="text"
                value={lastname}
                onChange={e => setLastName(e.target.value.replace(/[^a-zA-Z]/g, ''))}
              />
              <Field.Label css={floatingStyles}>Last Name</Field.Label>
            </Field.Root>

            <Field.Root w="100%" mb={3}>
              <Input
                className="peer"
                placeholder=""
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Field.Label css={floatingStyles}>Email</Field.Label>
            </Field.Root>

            <Field.Root w="100%" mb={3}>
              <Input
                className="peer"
                placeholder=""
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Field.Label css={floatingStyles}>Password</Field.Label>
            </Field.Root>

            <Field.Root w="100%" mb={1} visibility={errors.comtent ? "visible" : "hidden"}>
              <Text mt={1} fontSize="sm" color="red.500">{errors.comtent || ' '}</Text>
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
                width: "0%",
                bg: "blue.500",
                transition: "width 0.3s ease",
                zIndex: 0,
              }}
              _active={canSwipe ? { _before: { width: "100%" }, color: "white" } : {}}
            >
              <Box pos="relative" zIndex={1}>Signup</Box>
            </Button>

            <Text fontSize="sm" textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2F855A', fontWeight: 'bold' }}>Login</Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default SignupPage;
