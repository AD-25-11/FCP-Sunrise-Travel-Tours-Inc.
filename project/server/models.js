const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Confirmed'],
      default: 'Pending',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    travelDate: { type: Date, required: true },
    travelers: { type: Number, required: true, min: 1 },
    specialRequests: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Confirmed'],
      default: 'Pending',
    },
  },
  { timestamps: { createdAt: true, updatedAt: true }, versionKey: false }
);

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true, versionKey: false }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema, 'inquiries');
const Booking = mongoose.model('Booking', bookingSchema, 'bookings');
const Admin = mongoose.model('Admin', adminSchema, 'admins');

module.exports = {
  Inquiry,
  Booking,
  Admin,
};
