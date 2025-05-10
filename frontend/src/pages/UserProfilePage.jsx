import React from 'react'
import { Tabs, Box } from "@chakra-ui/react"
import UserInbox from '../components/UserInbox'
import UserProfile from '../components/UserProfile'
import { useSearchParams } from 'react-router-dom';

const UserProfilePage = ({ defaultTab = "profile" }) => {
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const effectiveTab = tabFromUrl || defaultTab;
    return (
        <Box bg="gray.50" minH="calc(100vh - 80px)" pt="20px">
            <Box w="95%" maxW="1200px" mx="auto" pb={4}>
                <Tabs.Root defaultValue={effectiveTab}>
                    <Tabs.List mb={3}>
                        <Tabs.Trigger value="dashboard">
                            Dashboard
                        </Tabs.Trigger>
                        <Tabs.Trigger value="messages">
                            Messages
                        </Tabs.Trigger>
                        <Tabs.Trigger value="profile">
                            Profile
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="dashboard">
                        <Box p={4}>
                            Manage your dashboard
                        </Box>
                    </Tabs.Content>
                    
                    <Tabs.Content value="messages" w="full">
                        <UserInbox />
                    </Tabs.Content>
                    
                    <Tabs.Content value="profile">
                        <UserProfile />
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
        </Box>
    )
}

export default UserProfilePage