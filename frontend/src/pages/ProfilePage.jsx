// src/pages/ProfilePage.jsx
import { useState } from "react";
import { Box, Button, Flex, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import UserProfileForm from "../components/UserProfileForm";
import OrderHistory from "../components/OrderHistory";

import { useEffect } from "react";
import { useUserStore } from "../store/user";

export default function ProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const { currentUser, fetchCurrentUser } = useUserStore();

  // 初始化加载用户数据
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return (
    <Box p={4}>
        
        {/* 头部显示用户邮箱（示例） */}
      <Text mb={4}>Logged in as: {currentUser?.email}</Text>

      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">My Profile</Heading>
        <Button onClick={() => setIsEditMode(!isEditMode)}>
          {isEditMode ? "Cancel" : "Edit Profile"}
        </Button>
      </Flex>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Order History</Tab>
          <Tab>Reviews</Tab>
          {/* Provider Only: */}
          {user?.isProvider && <Tab>Availability</Tab>}
        </TabList>

        <TabPanels>
          <TabPanel>
            <UserProfileForm isEditMode={isEditMode} />
          </TabPanel>
          <TabPanel>
            <OrderHistory />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}