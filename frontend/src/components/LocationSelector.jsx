import React, { useState, useEffect } from 'react';
import { 
  Field, 
  Input, 
  Stack, 
  Box, 
  Text,
  VStack,
  Flex,
  Icon,
  Center
} from "@chakra-ui/react";
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationSelector = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // List of major New Zealand cities
  const nzCities = [
    { city: 'Auckland', country: 'New Zealand' },
    { city: 'Wellington', country: 'New Zealand' },
    { city: 'Christchurch', country: 'New Zealand' },
    { city: 'Hamilton', country: 'New Zealand' },
    { city: 'Tauranga', country: 'New Zealand' },
    { city: 'Napier-Hastings', country: 'New Zealand' },
    { city: 'Dunedin', country: 'New Zealand' },
    { city: 'Palmerston North', country: 'New Zealand' },
    { city: 'Nelson', country: 'New Zealand' },
    { city: 'Rotorua', country: 'New Zealand' },
    { city: 'New Plymouth', country: 'New Zealand' },
    { city: 'Whangarei', country: 'New Zealand' },
    { city: 'Invercargill', country: 'New Zealand' },
    { city: 'Whanganui', country: 'New Zealand' },
    { city: 'Gisborne', country: 'New Zealand' }
  ];

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filteredCities = nzCities.filter(item => 
      item.city.toLowerCase().includes(inputValue.toLowerCase())
    );

    setSuggestions(filteredCities.slice(0, 5)); // Limit to 5 suggestions
  }, [inputValue]);

  const handleSuggestionClick = (suggestion) => {
    setInputValue(`${suggestion.city}, ${suggestion.country}`);
    setSuggestions([]);
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  return (
    <Stack gap="4" width="100%">
      <Field.Root>
        <Input 
          placeholder="Input your city" 
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setSuggestions(nzCities)}
        />
      </Field.Root>
      
      {suggestions.length > 0 ? (
        <Box 
          mt={1} 
          borderWidth="1px" 
          borderRadius="md" 
          boxShadow="sm"
          bg="white"
          minH="120px"  
          maxH="200px"
          overflowY="auto"
        >
          <VStack align="stretch" spacing={0}>
            {suggestions.map((suggestion, index) => (
              <Flex
                key={index}
                p={2}
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Text fontWeight="medium">{suggestion.city}, {suggestion.country}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      ) : (
        <Box 
          mt={1} 
          borderWidth="1px" 
          borderRadius="md" 
          boxShadow="sm"
          bg="white"
          height="120px"
          position="relative"
        >
          <Center h="full">
            <Icon 
              as={FaMapMarkerAlt} 
              boxSize={10} 
              color="gray.300" 
              opacity={0.7}
            />
          </Center>
        </Box>
      )}
    </Stack>
  );
};

export default LocationSelector;