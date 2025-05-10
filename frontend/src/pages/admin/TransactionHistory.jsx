import { useEffect, useState } from "react";
import { Table, Box, Heading, Button } from "@chakra-ui/react";
import axios from "axios";
import { toast } from "../../utils/toast";

import { FiArrowLeft } from "react-icons/fi";  // ← 1. 引入图标
import { useNavigate } from "react-router-dom"; 

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/admin/payments");
        setTransactions(data);
      } catch {
        toast({ title: "Failed to load transaction history", status: "error" });
      }
    })();
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
      <Heading size="lg" mb={4}>Transaction History</Heading>

      <Table.Root variant="simple" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Transaction ID</Table.ColumnHeader>
            <Table.ColumnHeader>Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Time</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {transactions.map(t => (
            <Table.Row key={t._id}>
              <Table.Cell>{t._id}</Table.Cell>
              <Table.Cell>¥{t.amount}</Table.Cell>
              <Table.Cell>{new Date(t.createdAt).toLocaleString()}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default TransactionHistory;
