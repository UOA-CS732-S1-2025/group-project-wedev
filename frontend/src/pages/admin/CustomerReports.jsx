import { useEffect, useState } from "react";
import { Table, Button, Box, Heading } from "@chakra-ui/react";
import axios from "axios";
import { toast } from "../../utils/toast";

import { FiArrowLeft } from "react-icons/fi";  // ← 1. 引入图标
import { useNavigate } from "react-router-dom"; 

const CustomerReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/admin/reports");
      setReports(data);
    } catch {
      toast({ title: "Failed to load report", status: "error" });
    }
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/admin/reports/${id}`, { description: "The administrator has processed" });
      toast({ title: "Report updated", status: "success" });
      fetchReports();
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  useEffect(() => { fetchReports(); }, []);

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
      <Heading size="lg" mb={4}>Customer Report Management</Heading>

      <Table.Root variant="simple" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Report ID</Table.ColumnHeader>
            <Table.ColumnHeader>content</Table.ColumnHeader>
            <Table.ColumnHeader>operation</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {reports.map(r => (
            <Table.Row key={r._id} interactive>
              <Table.Cell>{r._id}</Table.Cell>
              <Table.Cell>{r.description}</Table.Cell>
              <Table.Cell>
                <Button size="sm" onClick={() => alert(JSON.stringify(r))}>Check</Button>
                <Button size="sm" colorScheme="green" ml={2}
                        onClick={() => handleUpdate(r._id)}>Update Status</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default CustomerReports;
