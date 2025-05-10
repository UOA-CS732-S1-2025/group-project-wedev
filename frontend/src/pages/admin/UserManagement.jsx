import { useEffect, useState } from 'react';
import {
  Table, Button, Box, Heading,
} from '@chakra-ui/react';
import axios from 'axios';
import { toast } from "../../utils/toast";

import { FiArrowLeft } from "react-icons/fi";  // ← 1. 引入图标
import { useNavigate } from "react-router-dom"; 

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
        const { data } = await axios.get("/api/admin/users");
        setUsers(data);
      } catch {
        toast({ title: "Failed to load user", status: "error" });
      }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/users/${id}`);
      toast({ title: "User deleted", status: "success" });
      fetchUsers();
    } catch {
      toast({ title: "Deletion failed", status: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box p={6}>
      
       {/*  Back 按钮 */}
      <Button
        size="sm"
        leftIcon={<FiArrowLeft />}
        mb={4}
       onClick={() => navigate("/admin")}   // 回到 Dashboard
      >
        Back
      </Button>
      <Heading size="lg" mb={4}>User Management</Heading>

      <Table.Root variant="simple" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Name</Table.ColumnHeader>
            <Table.ColumnHeader>Email</Table.ColumnHeader>
            <Table.ColumnHeader>Operation</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {users.map((u) => (
            <Table.Row key={u._id} interactive>
              <Table.Cell>{u.name}</Table.Cell>
              <Table.Cell>{u.email}</Table.Cell>
              <Table.Cell>
                <Button size="sm" onClick={() => alert(JSON.stringify(u))}>Check</Button>
                <Button size="sm" colorScheme="yellow" ml={2}>Enable/Disable</Button>
                <Button size="sm" colorScheme="red" ml={2}
                        onClick={() => handleDelete(u._id)}>
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default UserManagement;
