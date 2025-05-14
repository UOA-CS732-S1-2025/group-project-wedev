import {
  Box, Heading, Spinner,   Button,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react"
import { useEffect, useState } from "react";
// import { TrashIcon } from "lucide-react";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

const AdminReportsPanel = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  //const toast = useToast();
  const { token } = useAuthStore();

  const fetchReports = async () => {
    try {
<<<<<<< HEAD
      const res = await api.get("/admin/reports", {
=======
      const res = await api.get(`${import.meta.env.VITE_API_URL}/admin/reports`, {
>>>>>>> origin/main
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      //toast({ title: "加载失败", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReportsDelete = async (id) => {
    try {
<<<<<<< HEAD
      await api.delete(`/admin/reports/${id}`, {
=======
      await api.delete(`${import.meta.env.VITE_API_URL}/admin/reports/${id}`, {
>>>>>>> origin/main
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.filter((r) => r._id !== id));
      //toast({ title: "删除成功", status: "success" });
    } catch (err) {
      //toast({ title: "删除失败", description: err.message, status: "error" });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <Box>
      {/* <Heading size="md" mb={4}>Report Management</Heading> */}
      {loading ? (
        <Spinner />
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Submitter</Table.ColumnHeader>
              <Table.ColumnHeader>Content</Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reports.map((r) => (
              <Table.Row key={r._id}>
                <Table.Cell>{r.user?.username || "NULL"}</Table.Cell>
                <Table.Cell>{r.description}</Table.Cell>
                <Table.Cell>{new Date(r.createdAt).toLocaleString()}</Table.Cell>
                <Table.Cell>
                    {/* leftIcon={<TrashIcon size={14} />} */}
                  <Button onClick={() => handleReportsDelete(r._id)} size="xs" colorScheme="red" >
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

export default AdminReportsPanel;