import React from 'react'
import { Tabs, Box } from "@chakra-ui/react"
import UserInbox from '../components/UserInbox'

const UserProfilePage = () => {
    return (
        <Box pt={10} bg="gray.50" minH="100vh">
            <Box w="95%" maxW="1200px" mx="auto">
                <Tabs.Root defaultValue="messages">
                    <Tabs.List>
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
                        <Box p={4}>
                            Manage your profile settings
                        </Box>
                    </Tabs.Content>
                </Tabs.Root>
            </Box>
        </Box>
    )
}

export default UserProfilePage