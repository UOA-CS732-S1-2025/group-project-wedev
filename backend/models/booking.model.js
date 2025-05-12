import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is the model name for customers
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is also the model name for providers, or a specific 'Provider' model
        required: true
    },
    serviceType: { 
        type: String,
        required: true,
        // Example: enum: ['Plumbing', 'Gardening', 'Cleaning', 'Electrical', 'Handyman', 'Painting', 'Other'] 
        // Consider making this an enum based on your actual service offerings for consistency.
    },
    serviceAddress: {
        street: { type: String }, // Removed required
        city: { type: String }, // Removed required
        state: { type: String }, // Province or state
        postalCode: { type: String }, // Removed required
        country: { type: String }, // Removed required
        additionalDetails: { type: String } // e.g., apartment number, instructions
    },
    startTime: {
        type: Date
        // Removed required
    },
    endTime: {
        type: Date
        // Removed required
    },
    hourlyRate: { // Rate at the time of booking
        type: Number,
        // Removed required
        min: [0, 'Hourly rate cannot be negative.']
    },
    estimatedTotalCost: { 
        type: Number,
        min: [0, 'Estimated total cost cannot be negative.']
        // This will be calculated by a pre-save hook
    },
    status: {
        type: String,
        // Removed required
        enum: [
            'pending_confirmation', // Provider needs to confirm
            'confirmed',            // Provider confirmed
            'cancelled_by_customer',// Customer cancelled
            'cancelled_by_provider',// Provider cancelled
            'completed',            // Service rendered
            'payment_pending',      // Service completed, awaiting payment
            'paid',                 // Payment successful
            'rescheduled_pending',  // Reschedule requested, awaiting confirmation
            'disputed',             // Booking has an issue
            'reviewed'              // Customer has reviewed the service
        ],
        default: 'pending_confirmation'
    },
    notes: { // Customer notes for the provider
        type: String,
        trim: true
    },
    providerNotes: { // Provider notes (internal or for customer if shared)
        type: String,
        trim: true
    },
    paymentDetails: {
        paymentIntentId: { type: String }, // For Stripe or similar
        paymentStatus: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'not_applicable'],
            default: 'pending'
        },
        paymentMethod: { type: String }, // e.g., 'card', 'paypal'
        paidAmount: { type: Number, min: 0 },
        paymentDate: { type: Date },
        refundDetails: [{
            refundId: { type: String },
            amount: { type: Number },
            reason: { type: String },
            refundedAt: { type: Date, default: Date.now }
        }]
    },
    cancellationDetails: {
        cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
        cancelledAt: { type: Date }
    },
    rescheduleHistory: [{
        originalStartTime: { type: Date },
        originalEndTime: { type: Date },
        requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        requestedAt: { type: Date, default: Date.now },
        newStartTime: { type: Date },
        newEndTime: { type: Date },
        rescheduleStatus: { type: String, enum: ['pending', 'confirmed', 'rejected'] },
        // adminNotes: { type: String }
    }],
    // Future considerations:
    // attachments: [{ fileName: String, url: String }]
    // feedback: { customerRating: Number, customerComment: String, providerRating: Number, providerComment: String }

}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Indexing for common queries
bookingSchema.index({ customer: 1, startTime: -1 });
bookingSchema.index({ provider: 1, startTime: -1 });
bookingSchema.index({ status: 1, startTime: 1 });
bookingSchema.index({ "serviceAddress.city": 1 });
bookingSchema.index({ "serviceAddress.postalCode": 1 });


// Virtual for duration in hours
bookingSchema.virtual('durationHours').get(function() {
    if (this.startTime && this.endTime) {
        return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
    }
    return 0;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
    // Ensure endTime is after startTime
    if (this.startTime && this.endTime && this.endTime <= this.startTime) {
        return next(new Error('End time must be after start time.'));
    }

    // Calculate estimatedTotalCost if startTime, endTime, and hourlyRate are present
    if (this.isModified('startTime') || this.isModified('endTime') || this.isModified('hourlyRate')) {
        if (this.startTime && this.endTime && this.hourlyRate != null) {
            const durationMs = this.endTime.getTime() - this.startTime.getTime();
            const durationHoursValue = durationMs / (1000 * 60 * 60);
            if (durationHoursValue > 0) {
                this.estimatedTotalCost = parseFloat((durationHoursValue * this.hourlyRate).toFixed(2));
            } else {
                this.estimatedTotalCost = 0;
            }
        } else {
           // If any component is missing, cost can't be estimated this way.
           // Could be set to null or 0 depending on business logic.
           this.estimatedTotalCost = this.hourlyRate === 0 ? 0 : undefined;
        }
    }
    
    // If status indicates cancellation, populate cancellationDetails
    if (this.isModified('status') && this.status && this.status.startsWith('cancelled_')) {
        if (!this.cancellationDetails || !this.cancellationDetails.cancelledAt) {
             this.cancellationDetails = {
                // 'cancelledBy' should be set in the controller logic based on who initiated
                reason: this.cancellationDetails?.reason || 'Cancellation reason not specified.', // Preserve existing reason if any
                cancelledAt: new Date()
            };
        }
    }


    next();
});

// To ensure virtuals are included in JSON output
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
