import { Tabs, Box } from "@chakra-ui/react";
import AdminBookingsPanel from "../components/admin/AdminBookingsPanel";
import AdminPaymentsPanel from "../components/admin/AdminPaymentsPanel";
import AdminReportsPanel from "../components/admin/AdminReportsPanel";
import AdminUsersPanel from "../components/admin/AdminUsersPanel";


const AdminView = ({ defaultTab = "User" }) => {
  const effectiveTab =  defaultTab;
  return (
    <Box bg="gray.50" minH="calc(100vh - 80px)" pt="20px">
      <Box w="95%" maxW="1200px" mx="auto" pb={4}>
        <Tabs.Root defaultValue={effectiveTab} colorPalette="white">
          <Tabs.List mb={3}>
            <Tabs.Trigger value="User">User Management</Tabs.Trigger>
            <Tabs.Trigger value="Booking">Booking Management</Tabs.Trigger>
            <Tabs.Trigger value="Report">Report Management</Tabs.Trigger>
            <Tabs.Trigger value="Payment">Payment Management</Tabs.Trigger>
            <Tabs.Indicator rounded="l2" />
          </Tabs.List>

          <Tabs.Content
            value="User"
            _open={{
              animationName: "fade-in, scale-in",
              animationDuration: "300ms",
            }}
            _closed={{
              animationName: "fade-out, scale-out",
              animationDuration: "120ms",
            }}
          >
            <AdminUsersPanel />
          </Tabs.Content>

          <Tabs.Content
            value="Booking"
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
            <AdminBookingsPanel />
          </Tabs.Content>

          <Tabs.Content
            value="Report"
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
            <AdminReportsPanel />
          </Tabs.Content>

          <Tabs.Content
            value="Payment"
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
            <AdminPaymentsPanel />
          </Tabs.Content>

        </Tabs.Root>
      </Box>
    </Box>
  );
};

export default AdminView;
