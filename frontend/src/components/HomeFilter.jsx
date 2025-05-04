import React from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Icon,
  Popover, Portal, Input
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase } from 'react-icons/fa';
import { useState } from 'react';
import ServiceSelector from './ServiceSelector';

const HomeFilter = () => {
  const [serviceOpen, setServiceOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setServiceOpen(false);
  };

  return (
    <Box px={4} py={8} position="relative">
      <Box
        width="1200px"
        mx="auto"
        bg="white"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="xl"
        height="auto"
        my={8}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="stretch"
          minH={{ md: "80px" }}
          p={4} // 给 Flex 加内边距，不需要子项再 m / p
          gap={4}
        >
          {/* Service Type */}
          <Box
            flex="1.2"
            bg="transparent" // 去掉背景
            boxShadow="none" // 去掉阴影
            border="none" // 去掉边框
          >
            <Popover.Root 
              positioning={{ offset: { crossAxis: 100, mainAxis: 16 } }} 
              size={'lg'} 
              open={serviceOpen} 
              onOpenChange={(e) => setServiceOpen(e.open)}
            >
              <Popover.Trigger asChild transition="all 0.2s ease-in-out">
                <Flex
                  p={4}
                  align="center"
                  h="full"
                  cursor="pointer"
                  role="group"
                  _hover={{ bg: 'gray.200' }}
                  transition={'background-color 0.2s ease'}
                  borderRadius={'md'}
                  onMouseDown={() => setIsPressed(true)}
                  onMouseUp={() => setIsPressed(false)}
                  onMouseLeave={() => setIsPressed(false)}
                  bg={isPressed ? 'gray.300' : undefined}
                  transform={isPressed ? 'scale(0.98)' : undefined}
                >
                  <Icon 
                    as={selectedService?.icon || FaBriefcase} 
                    mr={3} 
                    color="green.500" 
                    boxSize={5} 
                  />
                  <Box minWidth="120px" height="42px">
                    <Text fontSize="xs" color="gray.500">I'm looking for</Text>
                    <Text fontWeight="medium" isTruncated>
                      {selectedService ? selectedService.title : "Service Type"}
                    </Text>
                  </Box>
                </Flex>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content width="550px">
                    <Popover.Body p={3}>
                      <ServiceSelector onSelect={handleServiceSelect} />
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>

          </Box>

          {/* Location */}
          <Box
            flex="1.2"
            bg="transparent"
            boxShadow="none"
            border="none"
          >
            <Popover.Root positioning={{ offset: { crossAxis: 100, mainAxis: 0 } }} size={'lg'} open={locationOpen} onOpenChange={(e) => setLocationOpen(e.open)}>
              <Popover.Trigger asChild _active={{
                bg: 'gray.300',
                transform: 'scale(0.98)'
              }} transition="all 0.2s ease-in-out">
                <Flex
                  p={4}
                  align="center"
                  h="full"
                  cursor="pointer"
                  role="group"
                  _hover={{ bg: 'gray.200' }}
                  onClick={() => { }}
                  transition={'background-color 0.2s ease'}
                  borderRadius={'md'}
                >
                  <Icon as={FaMapMarkerAlt} mr={3} color="green.500" boxSize={5} />
                  <Box>
                    <Text fontSize="xs" color="gray.500">Near</Text>
                    <Text fontWeight="medium">Enter your city</Text>
                  </Box>
                </Flex>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Body p={3}>
                      {/* Location content goes here */}
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          </Box>

          {/* Date Selection */}
          <Box
            flex="1.2"
            bg="transparent"
            boxShadow="none"
            border="none"
          >
            <Popover.Root positioning={{ offset: { crossAxis: 100, mainAxis: 0 } }} size={'lg'} open={dateOpen} onOpenChange={(e) => setDateOpen(e.open)}>
              <Popover.Trigger asChild _active={{
                bg: 'gray.300',
                transform: 'scale(0.98)'
              }} transition="all 0.2s ease-in-out">
                <Flex
                  p={4}
                  align="center"
                  h="full"
                  cursor="pointer"
                  role="group"
                  _hover={{ bg: 'gray.200' }}
                  onClick={() => { }}
                  transition={'background-color 0.2s ease'}
                  borderRadius={'md'}
                >
                  <Icon as={FaCalendarAlt} mr={3} color="green.500" boxSize={5} />
                  <Box>
                    <Text fontSize="xs" color="gray.500">On</Text>
                    <Text fontWeight="medium">Enter date</Text>
                  </Box>
                </Flex>
              </Popover.Trigger>
              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Body p={3}>
                      {/* Date selection content goes here */}
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          </Box>

          {/* Search Button */}
          <Box flex={{ base: '1', md: '0.8' }}>
            <Button
              h="full"
              w="full"
              colorScheme="green"
              borderRadius={{ base: 'md', md: 'md' }}
              px={{ base: 4, md: 6 }}
              py={{ base: 4, md: 6 }}
              _hover={{ bg: 'green.600' }}
              _active={{
                bg: 'green.700',
                transform: 'scale(0.98)'
              }}
              transition="all 0.2s ease-in-out"
            >
              <HStack>
                <Icon as={FaSearch} />
                <Text>Find a service</Text>
              </HStack>
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default HomeFilter;