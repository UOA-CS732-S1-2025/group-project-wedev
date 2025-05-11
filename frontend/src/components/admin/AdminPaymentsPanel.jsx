"use client";

import {
  Box, Heading, Spinner, 
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

const AdminPaymentsPanel = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  //const toast = useToast();
  const { token } = useAuthStore();

  const fetchPayments = async () => {
    try {
      const res = await api.get("/admin/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayments(res.data);
    } catch (err) {
      //toast({ title: "加载失败", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <Box>
      {/* <Heading size="md" mb={4}>Payment Management</Heading> */}
      {loading ? (
        <Spinner />
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Customer</Table.ColumnHeader>
              <Table.ColumnHeader>Provider</Table.ColumnHeader>
              <Table.ColumnHeader>Service</Table.ColumnHeader>
              <Table.ColumnHeader>Amount</Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
              <Table.ColumnHeader>Payment Method</Table.ColumnHeader>
              <Table.ColumnHeader>Payment Status</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {payments.map((p) => (
              <Table.Row key={p._id}>
                <Table.Cell>{p.customer?.username || "NULL"}</Table.Cell>
                <Table.Cell>{p.provider?.username || "NULL"}</Table.Cell>
                <Table.Cell>{p.booking?.serviceType || "NULL"}</Table.Cell>
                <Table.Cell>${p.amount?.toFixed(2)}</Table.Cell>
                <Table.Cell>{new Date(p.createdAt).toLocaleString()}</Table.Cell>
                <Table.Cell>{p.method || "-"}</Table.Cell>
                <Table.Cell>{p.status || "-"}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};

export default AdminPaymentsPanel;
