import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Heading,
  Flex,
  AvatarGroup,
  Avatar,
  Button,
  Fieldset,
  Field,
  Input,
  Stack,
  Textarea,
} from '@chakra-ui/react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import { toaster } from "@/components/ui/toaster";

const UserProfile = () => {
  const { user, fetchCurrentUser } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    profilePictureUrl: user?.profilePictureUrl || '',
    bio: user?.bio || '',
    address: {
      street: user?.address?.street || '',
      suburb: user?.address?.suburb || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.replace('address.', '');
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.put(`/auth/me`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        profilePictureUrl: form.profilePictureUrl,
        bio: form.bio,
        address: { ...form.address },
      });
      toaster.create({ title: 'Profile updated successfully' });
      fetchCurrentUser && fetchCurrentUser();
    } catch (err) {
      toaster.create({ title: 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  // Get display name
  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User";

  return (
    <Box bg="gray.50" minH="100vh" py={8} px={4}>
      <Box 
        w={{ base: "95%", md: "85%", lg: "90%" }} 
        minH="500px"
        mx="auto" 
        bg="white" 
        borderRadius="lg" 
        boxShadow="md" 
        overflow="hidden"
        p={6}
      >
        <VStack spacing={6} align="start">
          <HStack spacing={6}>
            <AvatarGroup>
              <Avatar.Root>
                <Avatar.Fallback>{displayName.charAt(0)}</Avatar.Fallback>
                <Avatar.Image src={user?.profilePictureUrl || "https://bit.ly/sage-adebayo"} />
              </Avatar.Root>
            </AvatarGroup>
            
            <VStack align="start" spacing={2}>
              <Heading size="lg">{displayName}</Heading>
              <Text color="gray.600">{user?.email}</Text>
              <Text 
                bg="green.100" 
                color="green.700" 
                px={2} 
                py={1} 
                borderRadius="md"
                fontSize="sm"
              >
                {user?.role === 'provider' ? 'Service Provider' : 'Customer'}
              </Text>
            </VStack>
          </HStack>
          
          <Box w="full" h="1px" bg="gray.200" />
          
          <Box w="full">
            <Heading size="md" mb={4}>Personal Information</Heading>
            <Flex wrap="wrap" gap={6}>
              <VStack align="start" minW="200px">
                <Text color="gray.500" fontSize="sm">Phone Number</Text>
                <Text>{user?.phoneNumber || "Not provided"}</Text>
              </VStack>
              
              <VStack align="start" minW="200px">
                <Text color="gray.500" fontSize="sm">Address</Text>
                <Text>
                  {user?.address?.city && user?.address?.country
                    ? `${user.address.city}, ${user.address.country}`
                    : "Not provided"}
                </Text>
              </VStack>
              
              {user?.role === 'provider' && (
                <>
                  <VStack align="start" minW="200px">
                    <Text color="gray.500" fontSize="sm">Service Type</Text>
                    <Text>{user?.serviceType || "Not specified"}</Text>
                  </VStack>
                  
                  <VStack align="start" minW="200px">
                    <Text color="gray.500" fontSize="sm">Hourly Rate</Text>
                    <Text>{user?.hourlyRate ? `$${user.hourlyRate.toFixed(2)}` : "Not specified"}</Text>
                  </VStack>
                </>
              )}
            </Flex>
          </Box>
          
          {user?.role === 'provider' && (
            <>
              <Box w="full" h="1px" bg="gray.200" />
              <Box w="full">
                <Heading size="md" mb={4}>Provider Information</Heading>
                <VStack align="start" spacing={4}>
                  <VStack align="start">
                    <Text color="gray.500" fontSize="sm">Bio</Text>
                    <Text>{user?.bio || "No bio provided"}</Text>
                  </VStack>
                  
                  <VStack align="start">
                    <Text color="gray.500" fontSize="sm">Rating</Text>
                    <Text>{user?.averageRating ? `${user.averageRating.toFixed(1)}/5.0 (${user.reviewCount} reviews)` : "No ratings yet"}</Text>
                  </VStack>
                </VStack>
              </Box>
            </>
          )}
        </VStack>
        {/* 编辑表单 */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Fieldset.Root size="lg" maxW="md" mb={8}>
            <Stack>
              <Fieldset.Legend>Edit Profile</Fieldset.Legend>
              <Fieldset.HelperText>You can update your profile information below.</Fieldset.HelperText>
            </Stack>
            <Fieldset.Content>
              <Field.Root>
                <Field.Label>First Name</Field.Label>
                <Input name="firstName" value={form.firstName} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Last Name</Field.Label>
                <Input name="lastName" value={form.lastName} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Phone Number</Field.Label>
                <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Profile Picture URL</Field.Label>
                <Input name="profilePictureUrl" value={form.profilePictureUrl} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Bio</Field.Label>
                <Textarea name="bio" value={form.bio} onChange={handleChange} />
              </Field.Root>
              <Fieldset.Legend mt={6}>Address</Fieldset.Legend>
              <Field.Root>
                <Field.Label>Street</Field.Label>
                <Input name="address.street" value={form.address.street} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Suburb</Field.Label>
                <Input name="address.suburb" value={form.address.suburb} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>City</Field.Label>
                <Input name="address.city" value={form.address.city} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>State</Field.Label>
                <Input name="address.state" value={form.address.state} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Postal Code</Field.Label>
                <Input name="address.postalCode" value={form.address.postalCode} onChange={handleChange} />
              </Field.Root>
              <Field.Root>
                <Field.Label>Country</Field.Label>
                <Input name="address.country" value={form.address.country} onChange={handleChange} />
              </Field.Root>
            </Fieldset.Content>
            <Button type="submit" alignSelf="flex-start" isLoading={loading} mt={2}>
              Save Changes
            </Button>
          </Fieldset.Root>
        </form>
        
        
      </Box>
    </Box>
  );
};

export default UserProfile;