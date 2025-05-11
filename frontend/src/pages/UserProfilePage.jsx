import React from 'react'
import { Tabs, Box } from "@chakra-ui/react"
import UserInbox from '../components/UserInbox'
import UserProfile from '../components/UserProfile'
import { useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import AdminUsersPanel from '../components/admin/AdminUsersPanel';
import AdminBookingsPanel from '../components/admin/AdminBookingsPanel';
import AdminReportsPanel from '../components/admin/AdminReportsPanel';
import AdminPaymentsPanel from '../components/admin/AdminPaymentsPanel';


const UserProfilePage = ({ defaultTab = "profile" }) => {
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const effectiveTab = tabFromUrl || defaultTab;
    const { user } = useAuthStore();
    return (
        <Box pt={10} bg="gray.50" minH="100vh">
            <Box w="95%" maxW="1200px" mx="auto">
                <Tabs.Root defaultValue={defaultTab}>
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

                        {user?.role === "admin" && (
                        <Tabs.Trigger value="users_admin">
                            User Management
                        </Tabs.Trigger>
                        )}

                        {user?.role === "admin" && (
                        <Tabs.Trigger value="bookings_admin">
                            Booking Management
                        </Tabs.Trigger>
                        )}

                        {user?.role === "admin" && (
                        <Tabs.Trigger value="reports_admin">
                            Report Management
                        </Tabs.Trigger>
                        )}

                        {user?.role === "admin" && (
                        <Tabs.Trigger value="payments_admin">
                            Payment Management
                        </Tabs.Trigger>
                        )}

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

                    <Tabs.Content value="users_admin">
                        <AdminUsersPanel/>
                    </Tabs.Content>

                    <Tabs.Content value="bookings_admin">
                        <AdminBookingsPanel/>
                    </Tabs.Content>

                    <Tabs.Content value="reports_admin">
                        <AdminReportsPanel/>
                    </Tabs.Content>

                    <Tabs.Content value="payments_admin">
                        <AdminPaymentsPanel/>
                    </Tabs.Content>

                    

                </Tabs.Root>
            </Box>
        </Box>
    )
}

export default UserProfilePage