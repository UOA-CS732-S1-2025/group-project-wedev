import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Toaster, toaster } from "@/components/ui/toaster"
import { FaCalendarAlt, FaSave, FaTrash } from 'react-icons/fa';

// Day of week mapping
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilitySetting = ({ providerId, providerData }) => {
  const [availability, setAvailability] = useState([]);
  const [specialDates, setSpecialDates] = useState([]);
  const [dateRanges, setDateRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Selection state for range picking
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(false);
  
  // Initialize current month and next month
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Calculate next month's values
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
  const nextMonth = nextMonthDate.getMonth();
  const nextYear = nextMonthDate.getFullYear();

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
      const token = localStorage.getItem("token");
      
      fetch(`/api/users/providers/${providerId}/availability`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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

  // Check if a date is included in pending selection range
  const isInSelectionRange = (date) => {
    if (!selectionStart) return false;
    
    const start = selectionStart;
    const end = selectionEnd || hoveredDate;
    
    if (!end) return isSameDay(date, start);
    
    return date >= new Date(Math.min(start.getTime(), end.getTime())) && 
           date <= new Date(Math.max(start.getTime(), end.getTime()));
  };

  // Check if a date is in the selected pending dates
  const isInSelectedDates = (date) => {
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date));
  };

  // Check if a date is available based on current settings
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

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() && 
           date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };

  // Handle date click for selection
  const handleDateClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);
    
    // Ensure we're not selecting dates in the past
    if (clickedDate < new Date(today.setHours(0, 0, 0, 0))) return;
    
    if (!selectionStart) {
      // Start a new selection
      setSelectionStart(clickedDate);
      setSelectionEnd(null);
      setSelectedDates([clickedDate]);
    } else if (isSameDay(clickedDate, selectionStart)) {
      // Clicked on the same date again, just select this one day
      setSelectionEnd(clickedDate);
      setSelectedDates([clickedDate]);
    } else {
      // Finish the selection
      setSelectionEnd(clickedDate);
      
      // Calculate all dates in the range
      const start = new Date(Math.min(selectionStart.getTime(), clickedDate.getTime()));
      const end = new Date(Math.max(selectionStart.getTime(), clickedDate.getTime()));
      
      const datesInRange = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        datesInRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setSelectedDates(datesInRange);
    }
    
    setPendingChanges(true);
  };

  // Handle mouse hover for range preview
  const handleDateHover = (day, month, year) => {
    if (selectionStart) {
      setHoveredDate(new Date(year, month, day));
    }
  };

  // Apply pending changes to availability
  const applyChanges = async () => {
    if (!selectedDates.length) return;
    
    setIsSaving(true);
    
    // Determine if we're making these dates available or unavailable
    // If all selected dates are already available, we'll make them unavailable (toggling)
    const makeAvailable = !selectedDates.every(date => isDateAvailable(date));
    
    // Create a new date range for the current selection
    let newDateRange = null;
    
    // For multiple dates, create a date range
    if (selectedDates.length > 1) {
      // Sort dates to find min/max
      const sortedDates = [...selectedDates].sort((a, b) => a - b);
      
      newDateRange = {
        startDate: sortedDates[0].toISOString(),
        endDate: sortedDates[sortedDates.length - 1].toISOString(),
        isAvailable: makeAvailable
      };
    } 
    // For single date, create a special date
    else if (selectedDates.length === 1) {
      const specialDate = {
        date: selectedDates[0].toISOString(),
        isAvailable: makeAvailable
      };
      
      // Check if we already have this special date
      const existingIndex = specialDates.findIndex(sd => 
        new Date(sd.date).toISOString().split('T')[0] === 
        new Date(specialDate.date).toISOString().split('T')[0]
      );
      
      if (existingIndex >= 0) {
        // Update existing special date
        const updatedSpecialDates = [...specialDates];
        updatedSpecialDates[existingIndex] = specialDate;
        setSpecialDates(updatedSpecialDates);
      } else {
        // Add new special date
        setSpecialDates([...specialDates, specialDate]);
      }
    }
    
    // For date ranges, we need to handle overlaps
    if (newDateRange) {
      // Remove any existing date ranges that overlap with this one
      const nonOverlappingRanges = dateRanges.filter(range => {
        const rangeStart = new Date(range.startDate);
        const rangeEnd = new Date(range.endDate);
        const newStart = new Date(newDateRange.startDate);
        const newEnd = new Date(newDateRange.endDate);
        
        // Check if there's no overlap
        return rangeEnd < newStart || rangeStart > newEnd;
      });
      
      setDateRanges([...nonOverlappingRanges, newDateRange]);
    }
    
    // Update the server
    try {
      let dataToSend = {};
      
      if (newDateRange) {
        dataToSend = { 
          dateRanges: [...dateRanges.filter(range => {
            const rangeStart = new Date(range.startDate);
            const rangeEnd = new Date(range.endDate);
            const newStart = new Date(newDateRange.startDate);
            const newEnd = new Date(newDateRange.endDate);
            
            // Filter out overlapping ranges
            return rangeEnd < newStart || rangeStart > newEnd;
          }), newDateRange] 
        };
      } else {
        dataToSend = { specialDates };
      }
      
      // 获取存储在本地的token
      const token = localStorage.getItem("token");
      
      const response = await fetch(`/api/users/providers/${providerId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        toaster.create({
          title: "Availability updated",
          description: "Availability updated successfully",
        })
        ;
        
        // Reset selection
        setSelectionStart(null);
        setSelectionEnd(null);
        setHoveredDate(null);
        setSelectedDates([]);
        setPendingChanges(false);
      } else {
        throw new Error(responseData.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toaster.create({
        title: "Error updating availability",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setHoveredDate(null);
    setSelectedDates([]);
    setPendingChanges(false);
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

  // Check if a date is in the past
  const isInPast = (day, month, year) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
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
      const isPastDay = isInPast(day, month, year);
      const available = isDateAvailable(date);
      const isSelected = isInSelectionRange(date) || isInSelectedDates(date);
      const isTodayDay = isToday(day, month, year);
      
      days.push(
        <GridItem 
          key={`day-${day}-${month}`}
          onClick={() => !isPastDay && handleDateClick(day, month, year)}
          onMouseEnter={() => !isPastDay && handleDateHover(day, month, year)}
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="36px"
          cursor={isPastDay ? "not-allowed" : "pointer"}
          borderRadius="full"
          bg={isSelected ? "blue.100" : available ? "blue.50" : "transparent"}
          opacity={isPastDay ? 0.5 : 1}
          _hover={{
            bg: !isPastDay && !isSelected ? "blue.50" : undefined,
            _before: !isPastDay && !isSelected ? {
              content: '""',
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              borderRadius: "full",
              border: "2px solid",
              borderColor: "blue.200"
            } : undefined
          }}
        >
          <Text 
            fontWeight={isTodayDay ? "bold" : "normal"} 
            color={isPastDay ? "gray.400" : "black"}
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

  // Render selection info
  const renderSelectionInfo = () => {
    if (selectedDates.length === 0) return null;
    
    const sorted = [...selectedDates].sort((a, b) => a - b);
    const startDate = sorted[0];
    const endDate = sorted[sorted.length - 1];
    const makeAvailable = !selectedDates.every(date => isDateAvailable(date));
    
    return (
      <Box mt={6} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
        <Heading size="sm" mb={3}>
          Selection
        </Heading>
        <Text mb={2}>
          {selectedDates.length === 1 
            ? `Selected: ${startDate.toLocaleDateString()}`
            : `Selected Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} (${selectedDates.length} days)`
          }
        </Text>
        <Text>
          Action: {makeAvailable ? "Make Available" : "Make Unavailable"}
        </Text>
      </Box>
    );
  };

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="md">
      <HStack justifyContent="space-between">
        <Heading size="md" mb={4}>Availability Settings</Heading>
        <Box>
          {pendingChanges && (
            <HStack spacing={2}>
              <Button 
                size="sm" 
                colorScheme="blue" 
                leftIcon={<Icon as={FaSave} />}
                onClick={applyChanges}
                isLoading={isSaving}
                loadingText="Saving"
              >
                Apply
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                colorScheme="gray" 
                onClick={clearSelection}
              >
                Cancel
              </Button>
            </HStack>
          )}
        </Box>
      </HStack>
      
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
          
          {renderSelectionInfo()}
          
          <Box mt={4} p={4} bg="gray.50" borderRadius="md">
            <Heading size="sm" mb={2}>Instructions</Heading>
            <Text fontSize="sm">
              Click on a day to select it. Click and drag or click on two different days to select a range.
              <br />
              <br />
              • Blue background: Days you are available
              <br />
              • White background: Days you are not available
              <br />
              • Light blue selection: Your current selection
              <br />
              <br />
              Click "Apply" to save your changes.
            </Text>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

export default AvailabilitySetting; 