import {
  Box, Heading, Spinner,  Button,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react"
import { useEffect, useState } from "react";
// import { TrashIcon } from "lucide-react";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

const AdminBookingsPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  //const toast = useToast();
  const { token } = useAuthStore();

  const fetchBookings = async () => {
    try {
      const res = await api.get(`${import.meta.env.VITE_API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      //toast({ title: "加载失败", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingsDelete = async (id) => {
    try {
      await api.delete(`${import.meta.env.VITE_API_URL}/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings((prev) => prev.filter((b) => b._id !== id));
      //toast({ title: "已删除", status: "success" });
    } catch (err) {
      //toast({ title: "删除失败", description: err.message, status: "error" });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <Box>
      {/* <Heading size="md" mb={4}>Booking Management</Heading> */}
      {loading ? (
        <Spinner />
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Service</Table.ColumnHeader>
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Provider</Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
              <Table.ColumnHeader>Note</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {bookings.map((b) => (
              <Table.Row key={b._id}>
                <Table.Cell>{b.serviceType || "NULL"}</Table.Cell>
                <Table.Cell>{b.customer?.username || "NULL"}</Table.Cell>
                <Table.Cell>{b.provider?.username || "NULL"}</Table.Cell>
                <Table.Cell>{new Date(b.createdAt).toLocaleString()}</Table.Cell>
                <Table.Cell>{b.notes || "NULL"}</Table.Cell>
                <Table.Cell>
                    {/* leftIcon={<TrashIcon size={14} />} */}
                  <Button onClick={() => handleBookingsDelete(b._id)} size="xs" colorScheme="red" >
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};

export default AdminBookingsPanel;