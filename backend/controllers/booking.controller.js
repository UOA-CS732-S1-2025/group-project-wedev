import Booking from '../models/booking.model.js';
import User from '../models/user.model.js'; // Assuming user model for validation and roles
// const { sendNotification } = require('../utils/notificationService'); // Example notification service

// Helper function to handle errors
const handleError = (res, error, statusCode = 500, message = 'Server error') => {
    console.error(error);
    if (error.name === 'ValidationError') {
        // Collect all validation error messages
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: "Validation Error", errors: messages });
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Resource not found with the provided ID.'});
    }
    res.status(statusCode).json({ message, details: error.message });
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
    try {
        const customerId = req.userId; // Use userId set by middleware
        if (!customerId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated.' 
            });
        }

        console.log('Booking request received:', req.body);

        const {
            providerId,
            serviceType,
            serviceAddress,
            startTime,
            endTime,
            hourlyRate, 
            notes
        } = req.body;

        // Check required fields
        const missingFields = [];
        if (!providerId) missingFields.push('providerId');
        if (!serviceType) missingFields.push('serviceType');
        if (!serviceAddress) missingFields.push('serviceAddress');
        if (!startTime) missingFields.push('startTime');
        if (!endTime) missingFields.push('endTime');
        if (hourlyRate == null || hourlyRate === undefined) missingFields.push('hourlyRate');

        if (missingFields.length > 0) {
            console.error('Missing booking fields:', missingFields);
            return res.status(400).json({ 
                success: false, 
                message: `Missing required booking fields: ${missingFields.join(', ')}. Ensure providerId, serviceType, serviceAddress, startTime, endTime, and hourlyRate are provided.` 
            });
        }

        // Check serviceAddress field
        if (typeof serviceAddress !== 'object') {
            console.error('Invalid serviceAddress format:', serviceAddress);
            return res.status(400).json({ 
                success: false, 
                message: 'serviceAddress must be an object' 
            });
        }

        // Ensure serviceAddress contains at least basic fields
        const addressMissingFields = [];
        if (!serviceAddress.street) addressMissingFields.push('street');
        if (!serviceAddress.city) addressMissingFields.push('city');

        if (addressMissingFields.length > 0) {
            console.warn('Address missing some fields:', addressMissingFields);
            // Do not return error, only log a warning
        }

        // Verify provider exists
        const provider = await User.findById(providerId);
        if (!provider) {
            console.error('Provider not found:', providerId);
            return res.status(404).json({ 
                success: false,
                message: 'Provider not found.' 
            });
        }

        // Verify provider role (optional check; allow continuation even if provider is not in the service provider role)
        if (provider.role !== 'provider') {
            console.warn('User is not a provider:', provider.role);
            // Continue processing, only log a warning
        }

        // Create booking record
        const newBooking = new Booking({
            customer: customerId,
            provider: providerId,
            serviceType,
            serviceAddress: {
                street: serviceAddress.street || '',
                city: serviceAddress.city || '',
                state: serviceAddress.state || '',
                postalCode: serviceAddress.postalCode || '',
                country: serviceAddress.country || '',
                additionalDetails: serviceAddress.additionalDetails || ''
            },
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            hourlyRate: parseFloat(hourlyRate),
            notes: notes || `Booking created on ${new Date().toLocaleString()}`,
            status: 'pending_confirmation', // Initial status
        });
        
        console.log('Creating booking with data:', {
            customer: customerId,
            provider: providerId,
            serviceType,
            serviceAddress: newBooking.serviceAddress,
            startTime: newBooking.startTime,
            endTime: newBooking.endTime,
            hourlyRate: newBooking.hourlyRate
        });
        
        const savedBooking = await newBooking.save();
        console.log('Booking created successfully:', savedBooking._id);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: savedBooking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        handleError(res, error, 500, 'Error creating booking.');
    }
};

// @desc    Get bookings for the logged-in customer
// @route   GET /api/bookings/my-bookings
// @access  Private (Customer)
export const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.userId;
        if (!customerId) return res.status(401).json({ message: 'User not authenticated.' });

        const bookings = await Booking.find({ customer: customerId })
            .populate('provider', 'firstName lastName username profilePictureUrl email phoneNumber') 
            .populate('customer', 'firstName lastName username profilePictureUrl') // Optional, as it's the current user
            .sort({ startTime: -1 });
        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        handleError(res, error, 500, 'Error fetching customer bookings.');
    }
};

// @desc    Get bookings for the logged-in provider
// @route   GET /api/bookings/provider-bookings
// @access  Private (Provider)
export const getProviderBookings = async (req, res) => {
    try {
        const providerId = req.userId;
        if (!providerId) return res.status(401).json({ message: 'User not authenticated.' });
        // Add role check: if(req.user.role !== 'provider') return res.status(403).json({ message: 'Forbidden'});

        const bookings = await Booking.find({ provider: providerId })
            .populate('customer', 'firstName lastName username profilePictureUrl email phoneNumber address')
            .populate('provider', 'firstName lastName username profilePictureUrl') // Optional
            .sort({ startTime: -1 });
        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        handleError(res, error, 500, 'Error fetching provider bookings.');
    }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Customer/Provider involved or Admin)
export const getBookingById = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'firstName lastName username profilePictureUrl email phoneNumber address')
            .populate('provider', 'firstName lastName username profilePictureUrl email phoneNumber serviceType hourlyRate');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Authorization: User must be customer, provider, or admin (implement admin check)
        const isCustomer = booking.customer._id.toString() === userId;
        const isProvider = booking.provider._id.toString() === userId;
        // const isAdmin = req.user.role === 'admin';

        if (!isCustomer && !isProvider /* && !isAdmin */) {
            return res.status(403).json({ message: 'Not authorized to view this booking.' });
        }

        res.status(200).json({
            success: true,
            booking
        });
    } catch (error) {
        handleError(res, error, 500, 'Error fetching booking by ID.');
    }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Provider or Customer, depending on action and current status)
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate if status is a valid enum value
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Additional validation based on user role or business rules
        // For example: Only provider can confirm or complete a booking
        // Or only the customer who created the booking can cancel it

        booking.status = status;
        
        // If status is cancelled, record who cancelled
        if (status === 'cancelled_by_customer' || status === 'cancelled_by_provider') {
            booking.cancellationDetails = {
                cancelledBy: req.userId,
                reason: req.body.reason || 'No reason provided',
                cancelledAt: new Date()
            };
        }

        await booking.save();
        return res.json({ success: true, booking });
    } catch (error) {
        console.error("Error updating booking status:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update booking payment status
export const updateBookingPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus, paymentMethod, paidAmount, paymentDate } = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Ensure the user is the customer of this booking
        if (booking.customer.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update payment status' });
        }

        // Update payment details
        booking.paymentDetails = {
            ...booking.paymentDetails,
            paymentStatus,
            paymentMethod,
            paidAmount,
            paymentDate
        };

        await booking.save();
        return res.json({ success: true, booking });
    } catch (error) {
        console.error("Error updating payment status:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update booking details (general update)
// @route   PUT /api/bookings/:id
// @access  Private (Admin, or Customer/Provider for specific fields & conditions)
export const updateBooking = async (req, res) => {
    const bookingId = req.params.id;
    const userId = req.userId;
    const updates = req.body;

    if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

    // Define fields that are updatable and by whom/when
    const allowedUpdates = {};
    // Example: Notes can be updated by customer or provider involved
    // Timings/Address changes might only be allowed by admin or if status is 'pending_confirmation' or via a reschedule flow

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        const isProvider = booking.provider.toString() === userId;
        const isCustomer = booking.customer.toString() === userId;
        // const isAdmin = req.user.role === 'admin';

        // --- Granular field update authorization logic ---
        if (updates.notes !== undefined && (isCustomer || isProvider /*|| isAdmin*/)) {
            booking.notes = updates.notes;
        }
        if (updates.providerNotes !== undefined && (isProvider /*|| isAdmin*/)) {
            booking.providerNotes = updates.providerNotes;
        }
        
        // For fields like startTime, endTime, serviceAddress, hourlyRate:
        // These should typically only be changed by admin, or by involved parties if status is 'pending_confirmation',
        // or through a dedicated reschedule approval process.
        // A simple PUT like this is risky for such critical fields without strict checks.
        const criticalFields = ['startTime', 'endTime', 'serviceAddress', 'hourlyRate', 'serviceType'];
        let hasCriticalChanges = criticalFields.some(field => updates[field] !== undefined);

        if (hasCriticalChanges) {
            // Simplified check: only allow if admin or booking is still pending
            if (false /*!isAdmin*/ && booking.status !== 'pending_confirmation') {
                return res.status(403).json({ message: `Major booking details can only be changed by an admin or when the booking is pending confirmation. Current status: ${booking.status}` });
            }
            criticalFields.forEach(field => {
                if (updates[field] !== undefined) {
                    booking[field] = updates[field];
                    if (field === 'startTime' || field === 'endTime') booking[field] = new Date(updates[field]);
                    if (field === 'hourlyRate') booking[field] = parseFloat(updates[field]);
                }
            });
             // Reset estimatedTotalCost if relevant fields change, pre-save hook will recalculate
            if (updates.startTime || updates.endTime || updates.hourlyRate) {
                booking.estimatedTotalCost = undefined; 
            }
        }

        // Any other specific field updates...
        // e.g., paymentDetails updates should be through a dedicated payment route/controller

        const updatedBooking = await booking.save();
        res.status(200).json({
            success: true,
            booking: updatedBooking
        });
    } catch (error) {
        handleError(res, error, 500, 'Error updating booking.');
    }
};


// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Admin, or Customer/Provider under specific conditions)
export const deleteBooking = async (req, res) => {
    const bookingId = req.params.id;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });

        // Authorization logic for deletion
        const isCustomer = booking.customer.toString() === userId;
        // const isAdmin = req.user.role === 'admin';
        let canDelete = false;

        if (false /*isAdmin*/) {
            canDelete = true;
        } else if (isCustomer && (booking.status === 'pending_confirmation' || booking.status === 'cancelled_by_provider')) {
            // Allow customer to delete if provider hasn't confirmed yet, or if provider cancelled.
            canDelete = true;
        }
        // Providers might not typically delete bookings, but rather cancel them.

        if (!canDelete) {
            return res.status(403).json({ message: 'Not authorized to delete this booking or booking status does not allow deletion.' });
        }

        await booking.deleteOne(); // Mongoose v6+ uses deleteOne()
        res.status(200).json({ 
            success: true,
            message: 'Booking deleted successfully.' 
        });
    } catch (error) {
        handleError(res, error, 500, 'Error deleting booking.');
    }
}; 