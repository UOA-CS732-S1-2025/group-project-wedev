import React from "react";
import { Tabs, Box } from "@chakra-ui/react";
import UserInbox from "../components/UserInbox";
import UserProfile from "../components/UserProfile";
import { useSearchParams } from "react-router-dom";
import UserDashboard from "../components/UserDashboard";
import BookingsView from "../components/BookingsView";
import AdminView from "../components/AdminView";
import useAuthStore from "../store/authStore";


const UserProfilePage = ({ defaultTab = "profile" }) => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const effectiveTab = tabFromUrl || defaultTab;
  const { user  } = useAuthStore();
  return (
    <Box bg="gray.50" minH="calc(100vh - 80px)" pt="20px">
      <Box w="95%" maxW="1200px" mx="auto" pb={4}>
        <Tabs.Root defaultValue={effectiveTab} colorPalette="white">
          <Tabs.List mb={3}>
            <Tabs.Trigger value="dashboard">Dashboard</Tabs.Trigger>
            <Tabs.Trigger value="messages">Messages</Tabs.Trigger>
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="orders">My Orders</Tabs.Trigger>

            {user?.role === "admin" && (
              <Tabs.Trigger value="admin">Admin</Tabs.Trigger>
            )}


            <Tabs.Indicator rounded="l2" />
          </Tabs.List>

          <Tabs.Content
            value="dashboard"
            _open={{
              animationName: "fade-in, scale-in",
              animationDuration: "300ms",
            }}
            _closed={{
              animationName: "fade-out, scale-out",
              animationDuration: "120ms",
            }}
          >
            <UserDashboard />
          </Tabs.Content>

          <Tabs.Content
            value="messages"
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
            <UserInbox />
          </Tabs.Content>

          <Tabs.Content
            value="profile"
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
            <UserProfile />
          </Tabs.Content>

          <Tabs.Content
            value="orders"
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
            <BookingsView />
          </Tabs.Content>
            {user?.role === "admin" && (
          <Tabs.Content
            value="admin"
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
            <AdminView />
          </Tabs.Content>
          )}
        </Tabs.Root>
      </Box>
    </Box>
  );
};

export default UserProfilePage;
