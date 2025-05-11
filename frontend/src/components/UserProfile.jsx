import React, { useState, useEffect } from "react";
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
  Tabs,
  Grid,
  GridItem,
  Center,
  Container,
} from "@chakra-ui/react";
import { LuUser, LuMapPin, LuCalendarClock, LuSettings } from "react-icons/lu";
import useAuthStore from "../store/authStore";
import api from "../lib/api";
import { toaster } from "@/components/ui/toaster";
import AvailabilitySetting from "./AvailabilitySetting";

const UserProfile = () => {
  const { user, fetchCurrentUser } = useAuthStore();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    profilePictureUrl: user?.profilePictureUrl || "",
    bio: user?.bio || "",
    hourlyRate: user?.hourlyRate?.toString() || "",
    address: {
      street: user?.address?.street || "",
      suburb: user?.address?.suburb || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      postalCode: user?.address?.postalCode || "",
      country: user?.address?.country || "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isProvider = user?.role === "provider";

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        profilePictureUrl: user.profilePictureUrl || "",
        bio: user.bio || "",
        hourlyRate: user.hourlyRate?.toString() || "",
        address: {
          street: user.address?.street || "",
          suburb: user.address?.suburb || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          postalCode: user.address?.postalCode || "",
          country: user.address?.country || "",
        },
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.replace("address.", "");
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
    setSuccess("");
    setError("");
    try {
      await api.put(`/auth/me`, {
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        profilePictureUrl: form.profilePictureUrl,
        bio: form.bio,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        address: { ...form.address },
      });
      toaster.create({ title: "Profile updated successfully" });
      fetchCurrentUser && fetchCurrentUser();
    } catch (err) {
      console.error("Update failed:", err);
      toaster.create({ title: "Update failed", description: err.response?.data?.message || "Please try again later" });
    } finally {
      setLoading(false);
    }
  };

  // Get display name
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || "User";

  return (
    <Box py={4} position="relative" zIndex={1}>
      <Container >
        <Box
          w="100%"
          minH="950px"
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          overflow="hidden"
          p={6}
        >
          {/* User basic info section */}
          <Box >
            <VStack spacing={6} >
              <AvatarGroup>
                <Avatar.Root size="xl">
                  <Avatar.Fallback>{displayName.charAt(0)}</Avatar.Fallback>
                  <Avatar.Image
                    src={
                      user?.profilePictureUrl || "https://bit.ly/sage-adebayo"
                    }
                  />
                </Avatar.Root>
              </AvatarGroup>

              <VStack >
                <Heading size="lg">{displayName}</Heading>
                <Text color="gray.600">{user?.email}</Text>
                {user?.role && (
                  <Text color="blue.600" fontSize="sm" fontWeight="medium">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Text>
                )}
              </VStack>
            </VStack>
          </Box>

          <Box w="full" h="1px" bg="gray.200" mb={8} />

          {/* Edit Profile Section */}
          <Box mx="auto" maxW="900px">
            <form onSubmit={handleSubmit}>
              <VStack spacing={8} align="stretch">
                <Tabs.Root
                  defaultValue="personal"
                  colorPalette="blue"
                  orientation="vertical"
                  _open={{
                    animationName: "fade-in, scale-in",
                    animationDuration: "300ms",
                  }}
                  _closed={{
                    animationName: "fade-out, scale-out",
                    animationDuration: "120ms",
                  }}
                >
                  <Grid
                    templateColumns={{ base: "1fr", md: "250px 1fr" }}
                    gap={20}
                  >
                    {/* Left side: Tabs */}
                    <GridItem>
                      <Tabs.List borderRight="1px" borderRightColor="gray.200">
                        <Tabs.Trigger value="personal">
                          <LuUser />
                          <Text>Personal Information</Text>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="address">
                          <LuMapPin />
                          <Text>Address Information</Text>
                        </Tabs.Trigger>
                        
                        {isProvider && (
                          <>
                            <Tabs.Trigger value="service">
                              <LuSettings />
                              <Text>Service Settings</Text>
                            </Tabs.Trigger>
                            <Tabs.Trigger value="availability">
                              <LuCalendarClock />
                              <Text>Availability</Text>
                            </Tabs.Trigger>
                          </>
                        )}
                        
                        <Tabs.Indicator rounded="l2" />
                      </Tabs.List>
                    </GridItem>

                    {/* Right side: Form content */}

                    <Tabs.Content value="personal" w="full">
                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={6}
                      >
                        <GridItem>
                          <Field.Root>
                            <Field.Label>First Name</Field.Label>
                            <Input
                              name="firstName"
                              value={form.firstName}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem>
                          <Field.Root>
                            <Field.Label>Last Name</Field.Label>
                            <Input
                              name="lastName"
                              value={form.lastName}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Field.Root>
                            <Field.Label>Phone Number</Field.Label>
                            <Input
                              name="phoneNumber"
                              value={form.phoneNumber}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Field.Root>
                            <Field.Label>Profile Picture URL</Field.Label>
                            <Input
                              name="profilePictureUrl"
                              value={form.profilePictureUrl}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>

                      </Grid>
                      <Button
                        type="submit"
                        isLoading={loading}
                        colorPalette="blue"
                        size="md"
                        px={8}
                        mt={8}
                      >
                        Save Changes
                      </Button>
                    </Tabs.Content>

                    <Tabs.Content value="address" w="full">
                      <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={6}
                      >
                        <GridItem colSpan={{ base: 1, md: 2 }}>
                          <Field.Root>
                            <Field.Label>Street</Field.Label>
                            <Input
                              name="address.street"
                              value={form.address.street}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem>
                          <Field.Root>
                            <Field.Label>Suburb</Field.Label>
                            <Input
                              name="address.suburb"
                              value={form.address.suburb}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem>
                          <Field.Root>
                            <Field.Label>City</Field.Label>
                            <Input
                              name="address.city"
                              value={form.address.city}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem>
                          <Field.Root>
                            <Field.Label>State</Field.Label>
                            <Input
                              name="address.state"
                              value={form.address.state}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem>
                          <Field.Root>
                            <Field.Label>Postal Code</Field.Label>
                            <Input
                              name="address.postalCode"
                              value={form.address.postalCode}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                        <GridItem>
                          <Field.Root>
                            <Field.Label>Country</Field.Label>
                            <Input
                              name="address.country"
                              value={form.address.country}
                              onChange={handleChange}
                              size="md"
                            />
                          </Field.Root>
                        </GridItem>
                      </Grid>
                      <Button
                        type="submit"
                        isLoading={loading}
                        colorPalette="blue"
                        size="md"
                        px={8}
                        mt={8}
                      >
                        Save Changes
                      </Button>
                    </Tabs.Content>

                    {isProvider && (
                      <>
                        <Tabs.Content value="service" w="full">
                          <Grid
                            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                            gap={6}
                          >
                            <GridItem>
                              <Field.Root>
                                <Field.Label>Hourly Rate ($)</Field.Label>
                                <Input
                                  type="number"
                                  name="hourlyRate"
                                  value={form.hourlyRate}
                                  onChange={handleChange}
                                  placeholder="Enter hourly rate"
                                  min={0}
                                />
                              </Field.Root>
                            </GridItem>
                            <GridItem colSpan={{ base: 1, md: 2 }}>
                              <Field.Root>
                                <Field.Label>Bio</Field.Label>
                                <Textarea
                                  name="bio"
                                  value={form.bio || ""}
                                  onChange={handleChange}
                                  placeholder="Tell customers about yourself and your services"
                                  size="md"
                                  minHeight="150px"
                                />
                              </Field.Root>
                            </GridItem>
                          </Grid>
                          <Button
                            type="submit"
                            isLoading={loading}
                            colorPalette="blue"
                            size="md"
                            px={8}
                            mt={8}
                          >
                            Save Changes
                          </Button>
                        </Tabs.Content>

                        <Tabs.Content value="availability" w="full">
                          {user?._id && (
                            <AvailabilitySetting 
                              providerId={user._id}
                              providerData={user}
                            />
                          )}
                        </Tabs.Content>
                      </>
                    )}
                  </Grid>
                </Tabs.Root>
              </VStack>
            </form>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default UserProfile;
