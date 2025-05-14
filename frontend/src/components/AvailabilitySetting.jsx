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
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [pendingChanges, setPendingChanges] = useState(false);
  // 选择模式: 'add' 或 'remove'
  const [selectionMode, setSelectionMode] = useState('add');
  
  // Initialize current month and next month
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Calculate next month's values
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
  const nextMonth = nextMonthDate.getMonth();
  const nextYear = nextMonthDate.getFullYear();

  // Helper function to initialize selectedDates from backend data sources
  const initializeSelectedDatesFromSource = (sourceSpecialDates, sourceDateRanges) => {
    const initialSelectedDateTimes = new Set();
    (sourceSpecialDates || []).forEach(sd => {
      if (sd.isAvailable) {
        const date = new Date(sd.date);
        date.setHours(0, 0, 0, 0);
        initialSelectedDateTimes.add(date.getTime());
      }
    });
    (sourceDateRanges || []).forEach(dr => {
      if (dr.isAvailable) {
        let currentDateIterator = new Date(dr.startDate);
        const endDate = new Date(dr.endDate);
        currentDateIterator.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        while (currentDateIterator <= endDate) {
          initialSelectedDateTimes.add(currentDateIterator.getTime());
          currentDateIterator.setDate(currentDateIterator.getDate() + 1);
        }
      }
    });
    const initialSelectedDatesArray = Array.from(initialSelectedDateTimes)
      .map(time => new Date(time))
      .sort((a, b) => a.getTime() - b.getTime());
    setSelectedDates(initialSelectedDatesArray);
  };

  useEffect(() => {
    if (providerId) {
      setLoading(true);
      // Clear previous selections when providerId changes or on initial load with providerId
      setSelectedDates([]); 
      setSelectionStart(null);
      setHoveredDate(null);
      setSelectionMode('add');
      setPendingChanges(false);

      if (providerData) {
        const currentAvailability = providerData.availability || [];
        const currentSpecialDates = providerData.specialDates || [];
        const currentDateRanges = providerData.dateRanges || [];

        setAvailability(currentAvailability);
        setSpecialDates(currentSpecialDates);
        setDateRanges(currentDateRanges);
        initializeSelectedDatesFromSource(currentSpecialDates, currentDateRanges);
        setLoading(false);
      } else {
        const token = localStorage.getItem("token");
<<<<<<< HEAD
        fetch(`/api/users/providers/${providerId}/availability`, {
=======
        fetch(`${import.meta.env.VITE_API_URL}/api/users/providers/${providerId}/availability`, {
>>>>>>> origin/main
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              const fetchedAvailability = data.availability || [];
              const fetchedSpecialDates = data.specialDates || [];
              const fetchedDateRanges = data.dateRanges || [];

              setAvailability(fetchedAvailability);
              setSpecialDates(fetchedSpecialDates);
              setDateRanges(fetchedDateRanges);
              initializeSelectedDatesFromSource(fetchedSpecialDates, fetchedDateRanges);
            } else {
              setError(data.message || 'Failed to load availability data');
            }
            setLoading(false);
          })
          .catch(err => {
            console.error('Error fetching availability:', err);
            setError(data.message || 'Failed to load availability data');
            setLoading(false);
          });
      }
    } else {
      setAvailability([]);
      setSpecialDates([]);
      setDateRanges([]);
      setSelectedDates([]);
      setLoading(false);
      setError(null);
      setPendingChanges(false);
      setSelectionMode('add');
      setSelectionStart(null);
      setHoveredDate(null);
    }
  }, [providerId, providerData]);

  // Handle month navigation
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  const goToPrevMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  // Get the first day of month
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 检查两个日期是否是同一天
  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // 检查日期是否在选择范围内
  const isInSelectionRange = (date) => {
    if (!selectionStart || !hoveredDate) return false;
    
    const start = new Date(Math.min(selectionStart.getTime(), hoveredDate.getTime()));
    const end = new Date(Math.max(selectionStart.getTime(), hoveredDate.getTime()));
    
    return date >= start && date <= end;
  };

  // 检查日期是否在已选择的日期中
  const isInSelectedDates = (date) => {
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date));
  };

  // Check if a date is part of the current visual selection process (between selectionStart and hoveredDate)
  const isDateInCurrentSelectionRange = (date) => {
    if (!selectionStart || !hoveredDate) return false;
    const rangeStartTime = Math.min(selectionStart.getTime(), hoveredDate.getTime());
    const rangeEndTime = Math.max(selectionStart.getTime(), hoveredDate.getTime());
    const dateTime = date.getTime();
    // Ensure the date is on or after the start of rangeStartTime and on or before the end of rangeEndTime
    const checkDate = new Date(dateTime);
    checkDate.setHours(0,0,0,0);

    const compareRangeStart = new Date(rangeStartTime);
    compareRangeStart.setHours(0,0,0,0);
    const compareRangeEnd = new Date(rangeEndTime);
    compareRangeEnd.setHours(0,0,0,0);

    return checkDate.getTime() >= compareRangeStart.getTime() && checkDate.getTime() <= compareRangeEnd.getTime();
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

  // 处理日期点击事件
  const handleDateClick = (day, month, year) => {
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0,0,0,0); // Normalize to start of day for comparison

    const todayBoundary = new Date(today);
    todayBoundary.setHours(0, 0, 0, 0);
    if (clickedDate < todayBoundary) return;

    if (!selectionStart) {
      // First click: Start a new selection
      setSelectionStart(clickedDate);
      setHoveredDate(clickedDate); 
      if (isInSelectedDates(clickedDate)) {
        setSelectionMode('remove');
      } else {
        setSelectionMode('add');
      }
      setPendingChanges(true);
    } else {
      // Second click: Finalize the selection range
      const rangeStart = new Date(Math.min(selectionStart.getTime(), clickedDate.getTime()));
      rangeStart.setHours(0,0,0,0);
      const rangeEnd = new Date(Math.max(selectionStart.getTime(), clickedDate.getTime()));
      rangeEnd.setHours(0,0,0,0);

      const datesToProcess = [];
      let currentDateInRange = new Date(rangeStart);
      while (currentDateInRange <= rangeEnd) {
        datesToProcess.push(new Date(currentDateInRange)); // Store new Date objects
        currentDateInRange.setDate(currentDateInRange.getDate() + 1);
      }

      if (selectionMode === 'add') {
        setSelectedDates(prevSelectedDates => {
          const newDatesSet = new Set(prevSelectedDates.map(d => d.getTime()));
          datesToProcess.forEach(d => newDatesSet.add(d.getTime()));
          return Array.from(newDatesSet).map(time => new Date(time)).sort((a,b) => a.getTime() - b.getTime());
        });
      } else { // selectionMode === 'remove'
        setSelectedDates(prevSelectedDates => {
          const datesToProcessTimes = new Set(datesToProcess.map(d => d.getTime()));
          return prevSelectedDates.filter(d => !datesToProcessTimes.has(d.getTime())).sort((a,b) => a.getTime() - b.getTime());
        });
      }
      
      setSelectionStart(null);
      setHoveredDate(null);
      // selectionMode will be reset by the next first click, so no need to reset here
    }
  };

  // 处理鼠标悬停事件
  const handleDateHover = (day, month, year) => {
    if (selectionStart) {
      const hovered = new Date(year, month, day);
      hovered.setHours(0,0,0,0);
      setHoveredDate(hovered);
    }
  };

  // Apply pending changes to availability
  const applyChanges = async () => {
    if (!pendingChanges && selectedDates.length === 0 && !selectionStart) { // check selectionStart too
        toaster.create({ title: "No changes to apply", description: "Please select or modify dates first.", });
        return;
    }
    setIsSaving(true);

    // The `selectedDates` state should now accurately reflect ALL dates that should be available.
    // We will convert this flat list into specialDates and dateRanges to send to the backend.
    // All dates in `selectedDates` are considered `isAvailable: true`.
    // Any date *not* in `selectedDates` that was previously available (based on initial load or previous state)
    // and falls within a modified range implicitly becomes `isAvailable: false`.
    // Backend should be prepared to handle a list of available dates/ranges and infer unavailabilities, or be sent explicit unavailabilities.

    const newAvailableSpecialDates = [];
    const newAvailableDateRanges = [];

    if (selectedDates.length > 0) {
        const sortedSelectedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        let rangeStartIndex = 0;
        for (let i = 1; i <= sortedSelectedDates.length; i++) {
            const isEndOfContiguousRange = (i === sortedSelectedDates.length) || 
                                           (sortedSelectedDates[i].getTime() !== sortedSelectedDates[i-1].getTime() + (24 * 60 * 60 * 1000));

            if (isEndOfContiguousRange) {
                const rangeStartDate = sortedSelectedDates[rangeStartIndex];
                const rangeEndDate = sortedSelectedDates[i-1];
                if (isSameDay(rangeStartDate, rangeEndDate)) {
                    newAvailableSpecialDates.push({
                        date: rangeStartDate.toISOString(),
                        isAvailable: true 
                    });
                } else {
                    newAvailableDateRanges.push({
                        startDate: rangeStartDate.toISOString(),
                        endDate: rangeEndDate.toISOString(),
                        isAvailable: true 
                    });
                }
                rangeStartIndex = i;
            }
        }
    }
    
    // For dates that were previously available but are no longer in selectedDates due to a remove operation,
    // we might need to send them as `isAvailable: false`. This part is complex and depends on backend expectations.
    // A simpler approach for now: send only the list of currently selected (i.e., available) dates/ranges.
    // The backend would then be responsible for updating its state based on this complete list of availabilities.

    const dataToSend = {
        specialDates: newAvailableSpecialDates, 
        dateRanges: newAvailableDateRanges,
        // Consider if weekly `availability` also needs to be sent if it can be modified by this UI.
    };

    const token = localStorage.getItem("token");
    try {
<<<<<<< HEAD
      const response = await fetch(`/api/users/providers/${providerId}/availability`, {
=======
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/providers/${providerId}/availability`, {
>>>>>>> origin/main
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
      });
      const responseData = await response.json();
      if (responseData.success) {
        toaster.create({ title: "Availability updated", description: "Successfully updated." });
        if (responseData.data) { 
            const returnedSpecialDates = responseData.data.specialDates || [];
            const returnedDateRanges = responseData.data.dateRanges || [];
            // Also update local `specialDates` and `dateRanges` states for general UI consistency
            setSpecialDates(returnedSpecialDates);
            setDateRanges(returnedDateRanges);
            // CRITICAL: Re-initialize selectedDates from the authoritative data returned by the backend
            initializeSelectedDatesFromSource(returnedSpecialDates, returnedDateRanges);
        } else {
            // If backend doesn't return the full updated data, we might need to re-fetch or
            // assume the `selectedDates` state as sent was successful and re-initialize from that.
            // For robustness, backend should return the new state.
            // Fallback: if no data, re-init from what we *think* is now selected (current `selectedDates`)
            initializeSelectedDatesFromSource(newAvailableSpecialDates.map(sd => ({...sd, date: new Date(sd.date)})), 
                                                newAvailableDateRanges.map(dr => ({...dr, startDate: new Date(dr.startDate), endDate: new Date(dr.endDate)})));
        }
        setPendingChanges(false);
        setSelectionStart(null);
        setHoveredDate(null);
        setSelectionMode('add'); 
      } else {
        throw new Error(responseData.message || 'Failed to update availability');
      }
    } catch (err) { 
      console.error('Error updating availability:', err);
      toaster.create({ title: "Error updating", description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelUnappliedChangesAndUiGesture = () => {
    // Revert selectedDates to the last persisted state by re-initializing
    // from specialDates and dateRanges which hold the last successfully saved data or initial providerData.
    initializeSelectedDatesFromSource(specialDates, dateRanges);
    
    // Reset UI gesture state
    setSelectionStart(null);
    setHoveredDate(null);
    setSelectionMode('add'); // Reset to default mode
    
    // Reset pendingChanges as we've reverted to the last saved state
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
      const isSelected = isInSelectedDates(date);
      const isSelecting = isInSelectionRange(date);
      const isTodayDay = isToday(day, month, year);
      
      let bgColor = "transparent";
      if (isSelecting) {
        bgColor = selectionMode === 'remove' ? "red.100" : "blue.100";
      } else if (isSelected) {
        bgColor = "blue.100";
      } else if (available) {
        bgColor = "blue.50";
      }
      
      let hoverBorderColor = selectionMode === 'remove' ? "red.200" : "blue.200";
      let textColor = isPastDay ? "gray.400" : "black";
      if (isSelecting && selectionMode === 'remove') {
        textColor = "red.700";
      }

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
          bg={bgColor}
          opacity={isPastDay ? 0.5 : 1}
          _hover={{
            bg: !isPastDay && !isSelecting && !isSelected ? (selectionMode === 'remove' ? "red.50" : "blue.50") : undefined,
            _before: !isPastDay && !isSelecting && !isSelected ? {
              content: '""',
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              borderRadius: "full",
              border: "2px solid",
              borderColor: hoverBorderColor
            } : undefined
          }}
        >
          <Text 
            fontWeight={isTodayDay ? "bold" : "normal"} 
            color={textColor}
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
    if (selectedDates.length === 0 && !selectionStart) return null;
    
    let infoText = "";
    
    if (selectedDates.length > 0) {
      const sorted = [...selectedDates].sort((a,b) => a.getTime() - b.getTime());
      if (sorted.length === 1) {
        infoText = `Selected: ${sorted[0].toLocaleDateString()}`;
      } else {
        infoText = `Selected Range: ${sorted[0].toLocaleDateString()} - ${sorted[sorted.length-1].toLocaleDateString()} (${sorted.length} days)`;
      }
    }
    
    const actionDescription = selectionStart 
        ? (selectionMode === 'remove' ? "Current operation: REMOVE dates in highlighted range." : "Current operation: ADD dates in highlighted range.")
        : (selectedDates.length > 0 ? `Total ${selectedDates.length} day(s) selected.` : "Click a date to start selecting a range.");

    return (
      <Box mt={6} p={4} borderWidth="1px" borderRadius="md" borderColor="gray.200">
        <Heading size="sm" mb={3} display="flex" alignItems="center">
          Selection Status
          {selectionStart && (
            <Text 
              as="span" 
              fontSize="sm" 
              color={selectionMode === 'remove' ? "red.500" : "blue.500"}
              ml={2}
            >
              (Mode: {selectionMode === 'remove' ? "REMOVE" : "ADD"})
            </Text>
          )}
        </Heading>
        
        {infoText && <Text mb={1}>{infoText}</Text>}
        <Text fontSize="sm" color="gray.600">{actionDescription}</Text>
      </Box>
    );
  };

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="md">
      <HStack justifyContent="space-between">
        <Heading size="md" mb={4}>Availability Settings</Heading>
        <Box>
          {(pendingChanges || selectedDates.length > 0) && (
            <HStack spacing={2}>
              <Button 
                size="sm" 
                colorScheme="blue" 
                leftIcon={<Icon as={FaSave} />}
                onClick={applyChanges}
                isLoading={isSaving}
                loadingText="Saving"
              >
                Apply Changes
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                colorScheme="gray" 
                onClick={cancelUnappliedChangesAndUiGesture}
              >
                Cancel Changes
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
              - Click a date to start selecting a range. Click a second date to complete the range.<br/>
              - If your first click is on an already selected date, you will enter <strong>REMOVE MODE</strong> for that range operation.<br/>
              - Otherwise, you are in <strong>ADD MODE</strong>.<br/>
              - Selected dates are shown with a solid blue background.<br/>
              - Dates being actively selected for ADDITION are light blue. Dates for REMOVAL are light red.<br/>
              - Click "Apply Changes" to save. "Cancel Current Selection" clears the dates highlighted for the current operation and resets the mode.
            </Text>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

export default AvailabilitySetting; 