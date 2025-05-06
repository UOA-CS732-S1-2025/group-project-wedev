import React, { useState } from 'react';
import {
  Box, Heading, Input, Button, VStack, Text, FormControl, FormLabel, Container
} from '@chakra-ui/react';

const SignupPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      setError('All fields are required');
      return;
    }
    setError('');
    console.log("Signed up with", form);
    // TODO: Add API signup call
  };

  return (
    <Box py={16} bg="gray.50" minH="100vh">
      <Container maxW="md">
        <VStack spacing={6} p={8} bg="white" borderRadius="lg" boxShadow="md">
          <Heading size="lg" textAlign="center">Create Your Account</Heading>
          {error && <Text color="red.500">{error}</Text>}
          <FormControl>
            <FormLabel>First Name</FormLabel>
            <Input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Last Name</FormLabel>
            <Input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
          </FormControl>
          <Button colorScheme="blue" width="full" onClick={handleSignup}>Sign Up</Button>
          <Text fontSize="sm" color="gray.600">
            Already have an account? <a href="/login" style={{ color: '#3182CE' }}>Login</a>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default SignupPage;
