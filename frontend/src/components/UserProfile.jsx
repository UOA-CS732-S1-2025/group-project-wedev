<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
"use client";

import React, { useState, useEffect, useRef } from "react";
>>>>>>> origin/main
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
<<<<<<< HEAD
  Grid,
  GridItem,
  Center,
  Container,
=======
  SimpleGrid,
  GridItem,
  Center,
  Container,
  Select,
  createListCollection,
  NumberInput,
  FileUpload,
>>>>>>> origin/main
} from "@chakra-ui/react";
import { LuUser, LuMapPin, LuCalendarClock, LuSettings } from "react-icons/lu";
import useAuthStore from "../store/authStore";
import api from "../lib/api";
import { toaster } from "@/components/ui/toaster";
import AvailabilitySetting from "./AvailabilitySetting";
<<<<<<< HEAD

const UserProfile = () => {
  const { user, fetchCurrentUser } = useAuthStore();
=======
import { LuBriefcase } from "react-icons/lu";
import { MdOutlineFileUpload } from "react-icons/md";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const UserProfile = () => {
  const { user, fetchCurrentUser } = useAuthStore();
  const [value, setValue] = useState();
  const serviceTypes = createListCollection({
    items: [
      { label: "Plumbing", value: "Plumbing" },
      { label: "Garden & Lawn", value: "Garden & Lawn" },
      { label: "Home Repairs", value: "Home Repairs" },
      { label: "Painting", value: "Painting" },
      { label: "House Cleaning", value: "House Cleaning" },
      { label: "Appliance Repair", value: "Appliance Repair" },
    ],
  });
>>>>>>> origin/main
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
<<<<<<< HEAD
  });
  const [loading, setLoading] = useState(false);
=======
    location: {
      type: "Point",
      coordinates: user?.location?.coordinates || [],
    },
  });
  const [loading, setLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
>>>>>>> origin/main
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isProvider = user?.role === "provider";
<<<<<<< HEAD

  useEffect(() => {
    if (user) {
      setForm(prev => ({
=======
  const isCustomer = user?.role === "customer";

  const streetInputRef = useRef(null);
  const places = useMapsLibrary("places");
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
>>>>>>> origin/main
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
<<<<<<< HEAD
=======
        location: {
          type: "Point",
          coordinates: user.location?.coordinates || [],
        },
>>>>>>> origin/main
      }));
    }
  }, [user]);

<<<<<<< HEAD
=======
  // Initialize Autocomplete
  useEffect(() => {

    if (!places || !streetInputRef.current) {
      if (!streetInputRef.current) console.error("[UserProfile] Street input ref is not available. Autocomplete cannot be initialized.");
      return;
    }

    try {
      const autocomplete = new places.Autocomplete(streetInputRef.current, {
        fields: ["address_components", "formatted_address", "geometry"],
        types: ["address"], // Restrict to addresses
      });
      setPlaceAutocomplete(autocomplete);
      console.log("[UserProfile] Autocomplete initialized:", autocomplete);
    } catch (e) {
      console.error("[UserProfile] Error initializing Autocomplete:", e);
    }
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    const listener = placeAutocomplete.addListener("place_changed", () => {
      const placeResult = placeAutocomplete.getPlace();
      console.log("Place selected:", placeResult);

      let newLocation = form.location;
      if (placeResult && placeResult.geometry && placeResult.geometry.location) {
        const lat = placeResult.geometry.location.lat();
        const lng = placeResult.geometry.location.lng();
        newLocation = {
          type: "Point",
          coordinates: [lng, lat],
        };
        console.log("[UserProfile] Location coordinates set:", newLocation.coordinates);
      }

      if (placeResult && placeResult.address_components) {
        const addressComponents = placeResult.address_components;
        const getAddressComponent = (type) => {
          const component = addressComponents.find((c) =>
            c.types.includes(type)
          );
          return component ? component.long_name : "";
        };
        const getStreetAddress = () => {
          const streetNumber = getAddressComponent("street_number");
          const route = getAddressComponent("route");
          if (streetNumber && route) {
            return `${streetNumber} ${route}`;
          }
          return route || placeResult.formatted_address || "";
        };

        setForm((prev) => ({
          ...prev,
          address: {
            street: getStreetAddress(),
            suburb: getAddressComponent("locality"),
            city: getAddressComponent("administrative_area_level_2") || getAddressComponent("locality"),
            state: getAddressComponent("administrative_area_level_1"),
            postalCode: getAddressComponent("postal_code"),
            country: getAddressComponent("country"),
          },
          location: newLocation,
        }));
      } else if (placeResult && placeResult.formatted_address) {
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            street: placeResult.formatted_address,
            suburb: "",
            city: "",
            state: "",
            postalCode: "",
            country: ""
          },
          location: newLocation,
        }));
      }
    });

    return () => {
      if (google && google.maps && google.maps.event && listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [placeAutocomplete, setForm]);

  const handleProfilePictureUpload = async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) {
      toaster.create({
        title: "No file selected",
        description: "Please select an image file to upload.",
      });
      return;
    }
    const file = acceptedFiles[0];
    setImageUploadLoading(true);
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      // The user router is typically mounted at /api/users on the backend.
      // So, the actual request will be PUT /api/users/me/profile-picture
      const response = await api.put("/users/me/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toaster.create({
        title: "Profile picture updated",
        description: "Your new profile picture has been uploaded successfully.",
      });
      if (fetchCurrentUser) {
        fetchCurrentUser(); // Refresh user data to get new URL and publicId
      }
    } catch (err) {
      console.error("Profile picture upload failed:", err);
      toaster.create({
        title: "Upload failed",
        description:
          err.response?.data?.message ||
          "Could not upload profile picture. Please try again.",
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

>>>>>>> origin/main
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
<<<<<<< HEAD
=======
        location: (form.location && form.location.coordinates && form.location.coordinates.length === 2)
          ? form.location
          : undefined,
>>>>>>> origin/main
      });
      toaster.create({ title: "Profile updated successfully" });
      fetchCurrentUser && fetchCurrentUser();
    } catch (err) {
      console.error("Update failed:", err);
<<<<<<< HEAD
      toaster.create({ title: "Update failed", description: err.response?.data?.message || "Please try again later" });
=======
      toaster.create({
        title: "Update failed",
        description: err.response?.data?.message || "Please try again later",
      });
>>>>>>> origin/main
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
<<<<<<< HEAD
      <Container >
=======
      <Container maxW="full">
>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
          <Box>
            <VStack spacing={6} alignItems="center" mb={8}>
              <HStack spacing={{ base: 4, md: 8 }} alignItems="center">
                <VStack spacing={3} alignItems="center">
                  <AvatarGroup>
                    <Avatar.Root size="2xl">
                      <Avatar.Fallback>{displayName.charAt(0)}</Avatar.Fallback>
                      <Avatar.Image
                        src={user?.profilePictureUrl}
                        alt={displayName}
                      />
                    </Avatar.Root>
                  </AvatarGroup>
                </VStack>

                {/* Right side: User Text Info */}
                <VStack
                  alignItems={{ base: "center", md: "flex-start" }}
                  spacing={1}
                >
                  <Heading size="lg">{displayName}</Heading>
                  <Text color="gray.600">{user?.email}</Text>
                  {user?.role && (
                    <Text color="blue.600" fontSize="sm" fontWeight="medium">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Text>
                  )}
                </VStack>
              </HStack>
>>>>>>> origin/main
            </VStack>
          </Box>

          <Box w="full" h="1px" bg="gray.200" mb={8} />

          {/* Edit Profile Section */}
<<<<<<< HEAD
          <Box mx="auto" maxW="900px">
=======
          <Box mx="auto" maxW="full">
>>>>>>> origin/main
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
<<<<<<< HEAD
                  <Grid
                    templateColumns={{ base: "1fr", md: "250px 1fr" }}
                    gap={20}
                  >
                    {/* Left side: Tabs */}
                    <GridItem>
=======
                  <SimpleGrid columns={{ base: 1, md: 4 }} gap={20}>
                    {/* Left side: Tabs */}
                    <GridItem colSpan={{ base: 1, md: 1 }}>
>>>>>>> origin/main
                      <Tabs.List borderRight="1px" borderRightColor="gray.200">
                        <Tabs.Trigger value="personal">
                          <LuUser />
                          <Text>Personal Information</Text>
                        </Tabs.Trigger>
                        <Tabs.Trigger value="address">
                          <LuMapPin />
                          <Text>Address Information</Text>
                        </Tabs.Trigger>
<<<<<<< HEAD
                        
=======
                        {isCustomer && (
                          <Tabs.Trigger value="becomeProfessional">
                            <LuBriefcase />
                            <Text>Become a Professional</Text>
                          </Tabs.Trigger>
                        )}

>>>>>>> origin/main
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
<<<<<<< HEAD
                        
=======

>>>>>>> origin/main
                        <Tabs.Indicator rounded="l2" />
                      </Tabs.List>
                    </GridItem>

                    {/* Right side: Form content */}
<<<<<<< HEAD

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
=======
                    <GridItem colSpan={{ base: 1, md: 3 }}>
                      <Tabs.Content
                        value="personal"
                        w="full"
                        _open={{
                          animationName: "fade-in, scale-in",
                          animationDuration: "300ms",
                        }}
                      >
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
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
                            <FileUpload.Root
                              onFileAccept={(details) =>
                                handleProfilePictureUpload(details.files)
                              }
                              maxFiles={1}
                              accept="image/*"
                            >
                              <FileUpload.HiddenInput />
                              <FileUpload.Trigger asChild>
                                <Button variant="outline" size="sm">
                                  <MdOutlineFileUpload />
                                  Change Avatar
                                </Button>
                              </FileUpload.Trigger>
                            </FileUpload.Root>
                          </GridItem>
                        </SimpleGrid>
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

                      <Tabs.Content
                        value="address"
                        w="full"
                        _open={{
                          animationName: "fade-in, scale-in",
                          animationDuration: "300ms",
                        }}
                        _closed={{
                          animationName: "fade-out, scale-out",
                          animationDuration: "120ms",
                        }}
                      >
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Field.Root>
                              <Field.Label>Street</Field.Label>
                              <Input
                                ref={streetInputRef}
                                name="address.street"
                                value={form.address.street}
                                onChange={handleChange}
                                size="md"
                                placeholder="Start typing your street address..."
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
                        </SimpleGrid>
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

                      <Tabs.Content
                        value="becomeProfessional"
                        w="full"
                        _open={{
                          animationName: "fade-in, scale-in",
                          animationDuration: "300ms",
                        }}
                        _closed={{
                          animationName: "fade-out, scale-out",
                          animationDuration: "120ms",
                        }}
                      >
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Field.Root>
                              <Field.Label>Service Type</Field.Label>
                              <Select.Root
                                collection={serviceTypes}
                                width="full"
                                value={value}
                                onValueChange={(e) => {
                                  console.log(
                                    "Service type selected:",
                                    e.value,
                                    "Type:",
                                    typeof e.value
                                  );
                                  setValue(e.value);
                                  setForm((prev) => ({
                                    ...prev,
                                    serviceType: e.value,
                                  }));
                                }}
                              >
                                <Select.HiddenSelect />
                                <Select.Label />

                                <Select.Control>
                                  <Select.Trigger>
                                    <Select.ValueText placeholder="Select service type" />
                                  </Select.Trigger>
                                  <Select.IndicatorGroup>
                                    <Select.Indicator />
                                    <Select.ClearTrigger />
                                  </Select.IndicatorGroup>
                                </Select.Control>

                                <Select.Positioner>
                                  <Select.Content>
                                    {serviceTypes.items.map((serviceType) => (
                                      <Select.Item
                                        item={serviceType}
                                        key={serviceType.value}
                                      >
                                        {serviceType.label}
                                        <Select.ItemIndicator />
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select.Positioner>
                              </Select.Root>
                            </Field.Root>
                          </GridItem>
                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Field.Root>
                              <Field.Label>Hourly Rate ($)</Field.Label>
                              <NumberInput.Root
                                width="full"
                                value={form.hourlyRate}
                                onValueChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    hourlyRate: e.value,
                                  }))
                                }
                                min={0}
                              >
                                <NumberInput.Control />
                                <NumberInput.Input placeholder="Enter hourly rate" />
                              </NumberInput.Root>
                            </Field.Root>
                          </GridItem>
                          <GridItem colSpan={{ base: 1, md: 2 }}>
                            <Field.Root>
                              <Field.Label>Bio</Field.Label>
                              <Textarea
                                name="bio"
                                value={form.bio || ""}
                                onChange={handleChange}
                                placeholder="Tell us about yourself and your services"
                                size="md"
                                minHeight="100px"
                                w="100%"
                              />
                            </Field.Root>
                          </GridItem>
                        </SimpleGrid>
                        <Button
                          colorPalette="blue"
                          size="md"
                          px={8}
                          mt={8}
                          isLoading={loading}
                          onClick={async (e) => {
                            e.preventDefault();
                            setLoading(true);
                            try {
                              // Remove nested objects from form spread to prevent unexpected issues
                              const {
                                firstName,
                                lastName,
                                phoneNumber,
                                profilePictureUrl,
                                bio,
                              } = form;
                              const payload = {
                                firstName,
                                lastName,
                                phoneNumber,
                                profilePictureUrl,
                                bio,
                                role: "provider",
                                serviceType:
                                  typeof value === "string"
                                    ? value
                                    : value
                                      ? value.toString()
                                      : "",
                                hourlyRate: form.hourlyRate
                                  ? Number(form.hourlyRate)
                                  : undefined,
                                address: form.address,
                                location: (form.location && form.location.coordinates && form.location.coordinates.length === 2)
                                  ? form.location
                                  : undefined,
                              };

                              console.log("Request payload (become-provider):", payload);

                              // Submit update with provider role change - use dedicated endpoint
                              const response = await api.put(
                                "/auth/me/become-provider",
                                payload
                              );

                              console.log("Response data:", response.data);

                              toaster.create({
                                title:
                                  "Congratulations! You are now a service provider",
                                description:
                                  "Your professional profile has been successfully created",
                              });

                              // Refresh user information
                              fetchCurrentUser && fetchCurrentUser();
                            } catch (err) {
                              console.error("Update failed:", err);
                              console.error(
                                "Error details:",
                                err.response?.data
                              );
                              toaster.create({
                                title: "Update failed",
                                description:
                                  err.response?.data?.message ||
                                  "Please try again later",
                              });
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Become a Professional Service Provider
                        </Button>
                      </Tabs.Content>

                      {isProvider && (
                        <>
                          <Tabs.Content
                            value="service"
                            w="full"
                            _open={{
                              animationName: "fade-in, scale-in",
                              animationDuration: "300ms",
                            }}
                          >
                            <SimpleGrid columns={1} gap="40px">
                              <GridItem>
                                <Field.Root w="full">
                                  <Field.Label>Hourly Rate ($)</Field.Label>
                                  <NumberInput.Root
                                    w="full"
                                    value={form.hourlyRate}
                                    onValueChange={(e) =>
                                      setForm((prev) => ({
                                        ...prev,
                                        hourlyRate: e.value,
                                      }))
                                    }
                                    min={0}
                                  >
                                    <NumberInput.Control />
                                    <NumberInput.Input placeholder="Enter hourly rate" />
                                  </NumberInput.Root>
                                </Field.Root>
                              </GridItem>
                            </SimpleGrid>
                            <SimpleGrid columns={1} gap="40px">
                              <GridItem>
                                <Field.Root w="full">
                                  <Field.Label>Bio</Field.Label>
                                  <Textarea
                                    name="bio"
                                    value={form.bio || ""}
                                    onChange={handleChange}
                                    placeholder="Tell customers about yourself and your services"
                                  />
                                </Field.Root>
                              </GridItem>
                            </SimpleGrid>

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

                          <Tabs.Content
                            value="availability"
                            w="full"
                            _open={{
                              animationName: "fade-in, scale-in",
                              animationDuration: "300ms",
                            }}
                          >
                            {user?._id && (
                              <AvailabilitySetting
                                providerId={user._id}
                                providerData={user}
                              />
                            )}
                          </Tabs.Content>
                        </>
                      )}
                    </GridItem>
                  </SimpleGrid>
>>>>>>> origin/main
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
