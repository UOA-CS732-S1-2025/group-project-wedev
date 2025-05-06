import React, { useState } from 'react';
import {
  Box, Input, Button, VStack, Heading, Text, Image,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', email, password);
  };

  return (
    <Box
      position="relative"
      minH="100vh"
      bgGradient="linear(to-br, green.100, green.50)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      overflow="hidden"
    >
      {/* Decorative Background SVG */}
      <Box position="absolute" top="-80px" right="-100px" zIndex={0} opacity={0.15}>
        <svg width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#48BB78" d="M50.4,-61.2C65.5,-49.7,77.7,-32.4,77.6,-16.1C77.6,0.2,65.3,15.7,54.4,31.6C43.4,47.5,33.8,63.8,20.2,66.2C6.5,68.5,-11.2,56.9,-27.2,46.1C-43.3,35.2,-57.8,25.1,-66.7,9.5C-75.5,-6.1,-78.6,-28.1,-68.3,-42.6C-58,-57.1,-34.2,-64,-12.4,-61.6C9.4,-59.2,18.8,-47.7,50.4,-61.2Z" transform="translate(100 100)" />
        </svg>
      </Box>

      {/* Login Card */}
      <Box
        zIndex={1}
        w="100%"
        maxW="400px"
        p={8}
        bg="white"
        borderRadius="2xl"
        boxShadow="xl"
      >
        {/* Logo */}
        <Box textAlign="center" mb={4}>
          <Image
            src="https://cdn-icons-png.flaticon.com/512/809/809957.png"
            alt="Urban Ease Logo"
            boxSize="60px"
            mx="auto"
            mb={2}
          />
          <Heading size="md" color="green.600">Urban Ease</Heading>
        </Box>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              focusBorderColor="green.400"
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              focusBorderColor="green.400"
            />
            <Button type="submit" colorScheme="green" width="100%">
              Login
            </Button>
            <Text fontSize="sm" textAlign="center">
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
