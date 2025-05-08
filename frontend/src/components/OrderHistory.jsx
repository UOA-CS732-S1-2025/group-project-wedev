// src/components/OrderHistory.jsx
import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/user";

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const { fetchOrders } = useUserStore();

    useEffect(() => {
        const loadOrders = async () => {
          const data = await fetchOrders();
          setOrders(data);
        };
        loadOrders();
      }, []);
    

  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Order ID</Th>
          <Th>Date</Th>
          <Th>Status</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {orders.map((order) => (
          <Tr key={order.id}>
            <Td>{order._id.slice(-6)}</Td>
            <Td>{new Date(order.createdAt).toLocaleDateString()}</Td>
            <Td>{order.status}</Td>
            <Td>
              <Button size="sm">Leave Review</Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}