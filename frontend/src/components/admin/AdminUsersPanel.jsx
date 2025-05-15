import {  Group, Table } from "@chakra-ui/react";
import { 
  Button, 
  Spinner, 
  Box,   
  Field,
  Input,
  Popover,
  Portal,
  Stack,
} from "@chakra-ui/react";
import React from "react";
import { useEffect, useState, useRef} from "react";
import api from "../../lib/api";
import useAuthStore from "../../store/authStore";



const AdminUsersPanel = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editValuesMap, setEditValuesMap] = useState({});
  const inputRefsMap = useRef({});


const fetchUserById = async (userId) => {
  try {

    const res = await api.get(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {

      headers: { Authorization: `Bearer ${token}` },
    });

    const u = res.data;

    const values = {
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      phoneNumber: u.phoneNumber || "",
      profilePic: u.profilePictureUrl || "",
      street: u.address?.street || "",
      suburb: u.address?.suburb || "",
      city: u.address?.city || "",
      state: u.address?.state || "",
      postalCode: u.address?.postalCode || "",
      country: u.address?.country || "",
    };

    setEditValuesMap((prev) => ({
      ...prev,
      [userId]: values,
    }));


    if (!inputRefsMap.current[userId]) {
      inputRefsMap.current[userId] = {
        firstName: React.createRef(),
        lastName: React.createRef(),
        phoneNumber: React.createRef(),
        profilePic: React.createRef(),
        street: React.createRef(),
        suburb: React.createRef(),
        city: React.createRef(),
        state: React.createRef(),
        postalCode: React.createRef(),
        country: React.createRef(),
      };
    }
  } catch (err) {
    console.error("get user info error", err);
  }
};

  const fetchUsers = async () => {
    try {
      const res = await api.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };

  const handleUsersDelete = async (id) => {
    try {
      await api.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    
    } catch (err) {
    
    }
  };

  const handleSubmitUpdate = async (userId) => {
  const refs = inputRefsMap.current[userId];
  if (!refs) return;

  const newValues = {
    firstName: refs.firstName.current?.value || "",
    lastName: refs.lastName.current?.value || "",
    phoneNumber: refs.phoneNumber.current?.value || "",
    profilePic: refs.profilePic.current?.value || "",
    street: refs.street.current?.value || "",
    suburb: refs.suburb.current?.value || "",
    city: refs.city.current?.value || "",
    state: refs.state.current?.value || "",
    postalCode: refs.postalCode.current?.value || "",
    country: refs.country.current?.value || "",
  };

  try {
    const payload = {
      firstName: newValues.firstName,
      lastName: newValues.lastName,
      phoneNumber: newValues.phoneNumber,
      profilePic: newValues.profilePic,
      address: {
        street: newValues.street,
        suburb: newValues.suburb,
        city: newValues.city,
        state: newValues.state,
        postalCode: newValues.postalCode,
        country: newValues.country,
      },
    };


    await api.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, payload, {

      headers: { Authorization: `Bearer ${token}` },
    });

    fetchUsers();

    setEditValuesMap((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  } catch (err) {
    console.error("upload error", err);
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


                <Popover.Root>
                <Popover.Trigger asChild>
                  <Button 
                  size="xs"
                   onClick={() => fetchUserById(u._id)}
                  >
                    Edit
                  </Button>
                </Popover.Trigger>
                <Portal>
                  <Popover.Positioner>
                    <Popover.Content>
                      <Popover.Arrow />
                      <Popover.Body>
                        <Stack gap="2">
                          <Group>
                          <Field.Root>
                            <Field.Label>First Name</Field.Label>
                            <Input  
                                    ref={inputRefsMap.current[u._id]?.firstName}
                                    defaultValue={editValuesMap[u._id]?.firstName ?? ""}
                                    placeholder={editValuesMap[u._id]?.firstName ?? ""}
                              />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Last Name</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.lastName}
                            defaultValue={editValuesMap[u._id]?.lastName ?? ""}
                            placeholder={editValuesMap[u._id]?.lastName ?? ""}
                            />
                          </Field.Root>
                          </Group>

                          <Field.Root>
                            <Field.Label>Phone Number</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.phoneNumber}
                            defaultValue={editValuesMap[u._id]?.phoneNumber ?? ""}
                            placeholder={editValuesMap[u._id]?.phoneNumber ?? ""}
                            />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Profile Picture URL</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.profilePic}
                            defaultValue={editValuesMap[u._id]?.profilePic ?? ""}
                            placeholder={editValuesMap[u._id]?.profilePic ?? ""}
                            />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Street</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.street}
                            defaultValue={editValuesMap[u._id]?.street ?? ""}
                            placeholder={editValuesMap[u._id]?.street ?? ""}
                            />
                          </Field.Root>

                          <Group>
                          <Field.Root>
                            <Field.Label>Suburb</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.suburb}
                            defaultValue={editValuesMap[u._id]?.suburb ?? ""}
                            placeholder={editValuesMap[u._id]?.suburb ?? ""}
                            />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>City</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.city}
                            defaultValue={editValuesMap[u._id]?.city ?? ""}
                            placeholder={editValuesMap[u._id]?.city ?? ""}
                            />
                          </Field.Root>
                          </Group>

                          <Group>
                          <Field.Root>
                            <Field.Label>State</Field.Label>
                            <Input  
                            ref={inputRefsMap.current[u._id]?.state}
                            defaultValue={editValuesMap[u._id]?.state ?? ""}
                            placeholder={editValuesMap[u._id]?.state ?? ""}
                            />
                          </Field.Root>
                          <Field.Root>
                            <Field.Label>Postal Code</Field.Label>
                            <Input 
                            ref={inputRefsMap.current[u._id]?.postalCode}
                            defaultValue={editValuesMap[u._id]?.postalCode ?? ""}
                            placeholder={editValuesMap[u._id]?.postalCode ?? ""}
                            />
                          </Field.Root>
                          </Group>

                          <Group >
                          <Field.Root>
                            <Field.Label>Country</Field.Label>
                            <Input  
                            ref={inputRefsMap.current[u._id]?.country}
                            defaultValue={editValuesMap[u._id]?.country ?? ""}
                            placeholder={editValuesMap[u._id]?.country ?? ""}
                              width="135px"/>
                          </Field.Root>
                          </Group>
                          

                          <Group>
                            
                          <Field.Root>
                          <Button  width="135px" onClick={() => handleSubmitUpdate(u._id)}>
                            Submit
                          </Button>
                          </Field.Root>



                          <Field.Root>
                          <Button  width="135px"
                          onClick={() => {
                              const refs = inputRefsMap.current[u._id];
                              const values = editValuesMap[u._id];
                              if (refs && values) {
                                refs.firstName.current.value = values.firstName;
                                refs.lastName.current.value = values.lastName;
                                refs.phoneNumber.current.value = values.phoneNumber;
                                refs.profilePic.current.value = values.profilePic;
                                refs.street.current.value = values.street;
                                refs.suburb.current.value = values.suburb;
                                refs.city.current.value = values.city;
                                refs.state.current.value = values.state;
                                refs.postalCode.current.value = values.postalCode;
                                refs.country.current.value = values.country;
                              }
                            }}
                          >
                            Reset
                          </Button>
                          </Field.Root>
                          </Group>

                          </Stack>
                      </Popover.Body>
                      <Popover.CloseTrigger />
                    </Popover.Content>
                  </Popover.Positioner>
                </Portal>
              </Popover.Root>
                  <Button onClick={() => handleUsersDelete(u._id)} size="xs" ml={2}>
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