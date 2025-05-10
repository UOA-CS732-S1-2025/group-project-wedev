import { useEffect, useState } from "react";
import { Table, Button, Box, Heading } from "@chakra-ui/react";
import axios from "axios";
import { toast } from "../../utils/toast";

import { FiArrowLeft } from "react-icons/fi";  // ← 1. 引入图标
import { useNavigate } from "react-router-dom"; 

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get("/api/admin/bookings");
      setOrders(data);
    } catch {
      toast({ title: "Failed to load orders", status: "error" });
    }
  };

  const handleStatusChange = async (id) => {
    try {
      await axios.put(`/api/admin/bookings/${id}`, { notes: "Status Changed" });
      toast({ title: "Status updated", status: "success" });
      fetchOrders();
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Box p={6}>
      <Button
        size="sm"
        leftIcon={<FiArrowLeft />}
        mb={4}
       onClick={() => navigate("/admin")}   // 回到 Dashboard
      >
        Back
      </Button>
      <Heading size="lg" mb={4}>Order Management</Heading>

      <Table.Root variant="simple" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Order ID</Table.ColumnHeader>
            <Table.ColumnHeader>client</Table.ColumnHeader>
            <Table.ColumnHeader>state</Table.ColumnHeader>
            <Table.ColumnHeader>operation</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {orders.map(o => (
            <Table.Row key={o._id} interactive>
              <Table.Cell>{o._id}</Table.Cell>
              <Table.Cell>{o.customerName || "unknown"}</Table.Cell>
              <Table.Cell>{o.status || "Stateless"}</Table.Cell>
              <Table.Cell>
                <Button size="sm" onClick={() => alert(JSON.stringify(o))}>Check</Button>
                <Button size="sm" colorScheme="blue" ml={2}
                        onClick={() => handleStatusChange(o._id)}>Change Status</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default OrderManagement;
