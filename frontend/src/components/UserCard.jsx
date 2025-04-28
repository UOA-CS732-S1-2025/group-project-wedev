import { Box, Spacer, Text, HStack, Container } from "@chakra-ui/react"

const UserCard = (user) => {
  return (
    <Container>

            
            <Text>{user.username}</Text>
            
            <Spacer />


    
        </Container>
  )
}

export default UserCard;
