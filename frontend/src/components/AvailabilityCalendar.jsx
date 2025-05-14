import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Field,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FaCalendarAlt, FaPlus, FaClock } from 'react-icons/fa';

// Day of week mapping
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilityCalendar = ({ providerId, currentUser, providerData, selectedDate, setSelectedDate }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [specialDates, setSpecialDates] = useState([]);
  const [dateRanges, setDateRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize current month and next month
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Calculate next month's values
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
  const nextMonth = nextMonthDate.getMonth();
  const nextYear = nextMonthDate.getFullYear();

  // Check if current user is the provider
  useEffect(() => {
    if (currentUser && providerId) {
      setIsEditable(currentUser._id === providerId);
    }
  }, [currentUser, providerId]);

  // Load availability data
  useEffect(() => {
    if (providerId) {
      setLoading(true);
      
      // If we already have provider data passed in, use it
      if (providerData) {
        setAvailability(providerData.availability || []);
        setSpecialDates(providerData.specialDates || []);
        setDateRanges(providerData.dateRanges || []);
        setLoading(false);
        return;
      }
      
      // Otherwise fetch it
      fetch(`${import.meta.env.VITE_API_URL}/api/users/providers/${providerId}/availability`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAvailability(data.availability || []);
            setSpecialDates(data.specialDates || []);
            setDateRanges(data.dateRanges || []);
          } else {
            setError(data.message || 'Failed to load availability data');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching availability:', err);
          setError('Failed to load availability data');
          setLoading(false);
        });
    }
  }, [providerId, providerData]);

  // Handle month navigation
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Get the first day of month
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Check if a date is available
  const isDateAvailable = (date) => {
    if (!date) return false;
    
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    // First check special dates (they override everything)
    const specialDate = specialDates.find(sd => 
      new Date(sd.date).toISOString().split('T')[0] === dateString
    );
    
    if (specialDate) {
      return specialDate.isAvailable;
    }
    
    // Then check date ranges
    for (const range of dateRanges) {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      if (date >= startDate && date <= endDate) {
        return range.isAvailable;
      }
    }
    
    // Finally check weekly availability
    const weeklyAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
    return weeklyAvailability ? weeklyAvailability.isAvailable : false;
  };

  // Handle date click
  const handleDateClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);
    
    // 检查日期是否可用，如果不可用则直接返回
    if (!isDateAvailable(clickedDate)) return;
    
    setSelectedDate && setSelectedDate(clickedDate.toISOString());

    // Get time slots for this date
    const timeSlots = getTimeSlotsForDate(clickedDate);
    
    // If we have an onClick handler, call it with the date and availability info
    if (providerData && providerData.onDateSelect) {
      providerData.onDateSelect(clickedDate, {
        isAvailable: true, // 我们知道日期是可用的，因为我们已经检查过了
        timeSlots: timeSlots
      });
    }
  };

  // Get time slots for a specific date
  const getTimeSlotsForDate = (date) => {
    if (!date) return [];
    
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];
    
    // First check special dates
    const specialDate = specialDates.find(sd => 
      new Date(sd.date).toISOString().split('T')[0] === dateString
    );
    
    if (specialDate) {
      if (!specialDate.isAvailable) return [];
      if (specialDate.startTime && specialDate.endTime) {
        return [{ start: specialDate.startTime, end: specialDate.endTime }];
      }
    }
    
    // Then check date ranges
    for (const range of dateRanges) {
      const startDate = new Date(range.startDate);
      const endDate = new Date(range.endDate);
      
      if (date >= startDate && date <= endDate) {
        if (!range.isAvailable) return [];
        if (range.startTime && range.endTime) {
          return [{ start: range.startTime, end: range.endTime }];
        }
      }
    }
    
    // Finally check weekly availability
    const weeklyAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
    if (weeklyAvailability && weeklyAvailability.isAvailable) {
      return [{ 
        start: weeklyAvailability.startTime, 
        end: weeklyAvailability.endTime 
      }];
    }
    
    return [];
  };

  // Get month name
  const getMonthName = (month) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month];
  };

  // Check if a day is today
  const isToday = (day, month, year) => {
    const todayDate = new Date();
    return day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
  };

  // Render calendar for a specific month/year
  const renderCalendar = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDayOfMonth = getFirstDayOfMonth(month, year);
    const days = [];

    // Render weekday headers
    const weekdayHeaders = DAYS_OF_WEEK.map((day) => (
      <GridItem key={`header-${day}-${month}`} textAlign="center" py={2}>
        <Text fontSize="sm" color="gray.600">
          {day}
        </Text>
      </GridItem>
    ));

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <GridItem key={`empty-${i}-${month}`} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const available = isDateAvailable(date);
      const isSelectedDay = selectedDate && 
                           day === new Date(selectedDate).getDate() && 
                           month === new Date(selectedDate).getMonth() && 
                           year === new Date(selectedDate).getFullYear();
      const isTodayDay = isToday(day, month, year);
      
      days.push(
        <GridItem 
          key={`day-${day}-${month}`}
          onClick={() => available ? handleDateClick(day, month, year) : null}
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="36px"
          cursor={available ? "pointer" : "default"}
          borderRadius="full"
          bg={isSelectedDay ? "blue.500" : "transparent"}
          _hover={{
            _before: {
              content: available ? '""' : 'none',
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              borderRadius: "full",
              border: !isSelectedDay && available ? "2px solid" : "none",
              borderColor: "blue.700"
            }
          }}
        >
          <Text 
            fontWeight={isTodayDay ? "bold" : "normal"} 
            color={isSelectedDay ? "white" : available ? "black" : "gray.400"}
          >
            {day}
          </Text>
        </GridItem>
      );
    }

    return (
      <Box>
        <HStack justifyContent="center" alignItems="center" mb={2}>
          <Text fontWeight="bold">
            {getMonthName(month)} {year}
          </Text>
        </HStack>
        
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {weekdayHeaders}
          {days}
        </Grid>
      </Box>
    );
  };

  // Display selected date info
  const renderSelectedDateInfo = () => {
    if (!selectedDate) return null;
    const dateObj = new Date(selectedDate);
    const timeSlots = getTimeSlotsForDate(dateObj);
    const available = isDateAvailable(dateObj);
    return (
      <Box mt={6} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
        <Heading size="sm" mb={3}>
          {dateObj.toLocaleDateString()} Availability
        </Heading>
        {available ? (
          timeSlots.length > 0 ? (
            <VStack align="start" spacing={2}>
              {timeSlots.map((slot, idx) => (
                <Flex key={idx} align="center">
                  <FaClock size="14px" />
                  <Text ml={2} fontSize="sm">{slot.start} - {slot.end}</Text>
                </Flex>
              ))}
            </VStack>
          ) : (
            <Text fontSize="sm" color="green.500">Available (no specific hours set)</Text>
          )
        ) : (
          <Text fontSize="sm" color="red.500">Not available</Text>
        )}
      </Box>
    );
  };

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="md">
      <Heading size="md" mb={4}>Availability Calendar</Heading>
      
      {loading ? (
        <Text>Loading availability data...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          <HStack justifyContent="space-between" alignItems="center">
            <Button onClick={goToPrevMonth} size="sm" variant="ghost">
              &lt;
            </Button>
            <Text>{getMonthName(currentMonth)} - {getMonthName(nextMonth)} {currentYear}</Text>
            <Button onClick={goToNextMonth} size="sm" variant="ghost">
              &gt;
            </Button>
          </HStack>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap={14}>
            <Box flex="1">
              {renderCalendar(currentMonth, currentYear)}
            </Box>
            
            <Box flex="1">
              {renderCalendar(nextMonth, nextYear)}
            </Box>
          </Flex>
          
          {renderSelectedDateInfo()}
        </VStack>
      )}
    </Box>
  );
};

export default AvailabilityCalendar; 