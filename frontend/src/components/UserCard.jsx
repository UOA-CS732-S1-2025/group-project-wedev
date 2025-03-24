import { Box, Spacer, Text, HStack, Container } from "@chakra-ui/react"

const UserCard = (user) => {
  return (
    <Container>

            
            <Text>{user.name}</Text>
            <Spacer />
            <Text>{user.email}</Text>

    
        </Container>
  )
}

export default UserCard;
