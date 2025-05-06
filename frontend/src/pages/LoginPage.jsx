import React, { useState } from 'react';
import {
  Box, Heading, Input, Button, VStack, Text, FormControl, FormLabel, Container
} from '@chakra-ui/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    console.log("Logged in with", { email, password });
    // TODO: Add API auth call
  };

  return (
    <Box py={16} bg="gray.50" minH="100vh">
      <Container maxW="md">
        <VStack spacing={6} p={8} bg="white" borderRadius="lg" boxShadow="md">
          <Heading size="lg" textAlign="center">Welcome Back</Heading>
          {error && <Text color="red.500">{error}</Text>}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button colorScheme="blue" width="full" onClick={handleLogin}>Login</Button>
          <Text fontSize="sm" color="gray.600">
            Don’t have an account? <a href="/signup" style={{ color: '#3182CE' }}>Sign Up</a>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};
