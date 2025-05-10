import { Box, Flex, VStack, Text, Heading, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Flex minH="100vh">
      {/* Sidebar */}
      <VStack w="250px" bg="gray.800" color="white" spacing={4} p={6} align="stretch">
        <Heading size="md" mb={6}>Admin Panel</Heading>
        <Button variant="ghost" onClick={() => navigate("/admin/users")}>Manage Users</Button>
        <Button variant="ghost" onClick={() => navigate("/admin/orders")}>Manage Orders</Button>
        <Button variant="ghost" onClick={() => navigate("/admin/transactions")}>Transaction History</Button>
        <Button variant="ghost" onClick={() => navigate("/admin/reports")}>Customer Report</Button>
      </VStack>

      {/* Main Content */}
      <Box flex="1" p={10} bg="gray.800">
        <Heading mb={4}>Welcome, Admin!</Heading>
        <Text>Use the side menu to manage platform users and view analytics.</Text>
      </Box>
    </Flex>
  );
};

export default AdminDashboard;
