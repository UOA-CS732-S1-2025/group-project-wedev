"use client";

import {  Table } from "@chakra-ui/react";
import { Button, Spinner, Box,   Input  } from "@chakra-ui/react";


// import { TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";

const AdminUsersPanel = () => {
//   const toast = useToast();
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
    //   toast({ title: "获取失败", description: err.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    //   toast({ title: "删除成功", status: "success" });
    } catch (err) {
    //   toast({ title: "删除失败", description: err.message, status: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box>
      {/* <Heading size="md" mb={4}>User Management</Heading> */}
      <Input 
        placeholder="Search Username..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        mb={4}
      />
      {loading ? (
        <Spinner />
      ) : (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Username</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((u) => (
              <Table.Row key={u._id}>
                <Table.Cell>{u.firstName} {u.lastName}</Table.Cell>
                <Table.Cell>{u.username}</Table.Cell>
                <Table.Cell>{u.role}</Table.Cell>
                <Table.Cell>{new Date(u.createdAt).toLocaleString()}</Table.Cell>
                <Table.Cell>
                    {/* leftIcon={<TrashIcon size={14} />} */}
                  <Button  size="xs" >
                    Edit
                  </Button>
                  {/* 稍后增加交互式表格对信息更改 */}
                  <Button onClick={() => handleDelete(u._id)} size="xs" ml={2}>
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

export default AdminUsersPanel;
