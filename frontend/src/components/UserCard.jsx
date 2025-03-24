import { Box, Text } from "@chakra-ui/react";

const UserCard = (user) => {
  return (
    <Box
      border="1px solid #ddd"
      borderRadius="8px"
      p="4"
      boxShadow="md"
      bg="white"
      maxW="200px"
      textAlign="center"
    >
      <Text fontSize="lg" fontWeight="bold">
        {user.name}
      </Text>
    </Box>
  );
};

export default UserCard;