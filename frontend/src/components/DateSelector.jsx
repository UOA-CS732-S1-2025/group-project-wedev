import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  ButtonGroup, 
  Flex, 
  Grid, 
  GridItem, 
  HStack,
  Text, 
  VStack 
} from "@chakra-ui/react";

const DateSelector = ({ onSelect }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isRangeSelection, setIsRangeSelection] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Get the initial month and year (to prevent going back before current month)
  const initialMonth = today.getMonth();
  const initialYear = today.getFullYear();

  // Function to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get day of week for the first day of month
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

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
    // Only allow going back if it's not before the initial month
    if (currentYear > initialYear || (currentYear === initialYear && currentMonth > initialMonth)) {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  // Handle date selection
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);

    if (isRangeSelection && selectedStartDate) {
      // If we're selecting a range and already have a start date
      if (clickedDate < selectedStartDate) {
        // If clicked before start date, make it the new start
        setSelectedStartDate(clickedDate);
        setSelectedEndDate(null);
      } else {
        // Otherwise set it as end date
        setSelectedEndDate(clickedDate);
        setIsRangeSelection(false);
      }
    } else {
      // Single date selection or start of range
      setSelectedStartDate(clickedDate);
      setSelectedEndDate(null);
      setIsRangeSelection(true);
    }
  };

  // Handle clear and apply
  const handleClear = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setIsRangeSelection(false);
  };

  const handleApply = () => {
    if (selectedEndDate) {
      // Range selection
      onSelect && onSelect({ startDate: selectedStartDate, endDate: selectedEndDate });
    } else if (selectedStartDate) {
      // Single date selection
      onSelect && onSelect({ date: selectedStartDate });
    }
  };

  // Check if a date is within the selected range
  const isInRange = (day) => {
    if (!selectedStartDate || !hoveredDate && !selectedEndDate) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    
    if (selectedEndDate) {
      return date > selectedStartDate && date < selectedEndDate;
    } else if (isRangeSelection) {
      const hoverDate = new Date(currentYear, currentMonth, hoveredDate);
      return (date > selectedStartDate && date < hoverDate) || 
             (date < selectedStartDate && date > hoverDate);
    }
    
    return false;
  };

  // Check if a date is selected
  const isSelected = (day) => {
    if (!selectedStartDate) return false;
    
    const date = new Date(currentYear, currentMonth, day);
    const startDateMatch = date.getDate() === selectedStartDate.getDate() && 
                           date.getMonth() === selectedStartDate.getMonth() && 
                           date.getFullYear() === selectedStartDate.getFullYear();
    
    const endDateMatch = selectedEndDate && 
                        date.getDate() === selectedEndDate.getDate() && 
                        date.getMonth() === selectedEndDate.getMonth() && 
                        date.getFullYear() === selectedEndDate.getFullYear();
    
    return startDateMatch || endDateMatch;
  };

  // Check if a day is today
  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear();
  };

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Render weekday headers
    const weekdayHeaders = weekdays.map((day) => (
      <GridItem key={`header-${day}`} textAlign="center" py={2}>
        <Text fontSize="sm" color="gray.600">
          {day}
        </Text>
      </GridItem>
    ));

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <GridItem key={`empty-${i}`} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelectedDay = isSelected(day);
      const isTodayDay = isToday(day);
      const isInRangeDay = isInRange(day);
      
      days.push(
        <GridItem 
          key={day}
          onClick={() => handleDateClick(day)}
          onMouseEnter={() => isRangeSelection && setHoveredDate(day)}
          onMouseLeave={() => isRangeSelection && setHoveredDate(null)}
          position="relative"
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="36px"
          cursor="pointer"
          borderRadius="full"
          bg={isSelectedDay ? "blue.500" : isInRangeDay ? "blue.100" : "transparent"}
          _hover={{
            _before: {
              content: '""',
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              borderRadius: "full",
              border: !isSelectedDay ? "2px solid" : "none",
              borderColor: "blue.700"
            }
          }}
        >
          <Text 
            fontWeight={isTodayDay ? "bold" : "normal"} 
            color={isSelectedDay ? "white" : "inherit"}
          >
            {day}
          </Text>
        </GridItem>
      );
    }

    return (
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {weekdayHeaders}
        {days}
      </Grid>
    );
  };

  // Get month name
  const getMonthName = (month) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month];
  };

  return (
    //<Box width="300px" boxShadow="md" borderRadius="md" p={4} bg="white">
      <VStack spacing={4} align="stretch">
        <HStack justifyContent="space-between" alignItems="center">
          <Button 
            onClick={goToPrevMonth} 
            size="sm" 
            variant="ghost"
            isDisabled={currentYear === initialYear && currentMonth === initialMonth}
          >
            &lt;
          </Button>
          <Text fontWeight="bold">
            {getMonthName(currentMonth)} {currentYear}
          </Text>
          <Button onClick={goToNextMonth} size="sm" variant="ghost">
            &gt;
          </Button>
        </HStack>

        {renderCalendar()}

        <ButtonGroup width="full" justifyContent="flex-end" spacing={2}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button 
            colorScheme="blue" 
            size="sm" 
            onClick={handleApply}
            isDisabled={!selectedStartDate}
          >
            Apply
          </Button>
        </ButtonGroup>
      </VStack>
    //</Box>
  );
};

export default DateSelector;