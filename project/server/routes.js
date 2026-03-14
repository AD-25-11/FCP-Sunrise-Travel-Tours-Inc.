const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Inquiry, Booking, Admin } = require('./models');

const router = express.Router();

const statusValues = ['Pending', 'Contacted', 'Confirmed'];

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: admin._id.toString(), email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  return res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
});

router.post('/inquiry', async (req, res) => {
  const { name, email, phone, destination, travelDate, message } = req.body;
  const inquiry = await Inquiry.create({
    name,
    email,
    phone,
    destination,
    travelDate,
    message,
  });

  req.io.emit('inquiry:new', inquiry);
  return res.status(201).json(inquiry);
});

router.post('/booking', async (req, res) => {
  const { name, email, phone, destination, travelDate, travelers, specialRequests, status } = req.body;
  const booking = await Booking.create({
    name,
    email,
    phone,
    destination,
    travelDate,
    travelers,
    specialRequests,
    ...(statusValues.includes(status) ? { status } : {}),
  });

  req.io.emit('booking:new', booking);
  return res.status(201).json(booking);
});

router.get('/inquiries', authMiddleware, async (_req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  return res.json(inquiries);
});

router.get('/bookings', authMiddleware, async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  return res.json(bookings);
});

router.get('/dashboard/summary', authMiddleware, async (_req, res) => {
  const [totalInquiries, totalBookings, latestInquiries, latestBookings] = await Promise.all([
    Inquiry.countDocuments(),
    Booking.countDocuments(),
    Inquiry.find().sort({ createdAt: -1 }).limit(5),
    Booking.find().sort({ createdAt: -1 }).limit(5),
  ]);

  return res.json({ totalInquiries, totalBookings, latestInquiries, latestBookings });
});

router.delete('/inquiry/:id', authMiddleware, async (req, res) => {
  const deleted = await Inquiry.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Inquiry not found' });
  }
  return res.json({ message: 'Inquiry deleted' });
});

router.put('/booking/:id', authMiddleware, async (req, res) => {
  const updates = {};
  if (req.body.status && statusValues.includes(req.body.status)) {
    updates.status = req.body.status;
  }
  if (req.body.specialRequests !== undefined) updates.specialRequests = req.body.specialRequests;
  if (req.body.travelers !== undefined) updates.travelers = req.body.travelers;

  const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  req.io.emit('booking:updated', booking);
  return res.json(booking);
});

router.put('/inquiry/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!statusValues.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!inquiry) {
    return res.status(404).json({ message: 'Inquiry not found' });
  }

  req.io.emit('inquiry:updated', inquiry);
  return res.json(inquiry);
});

module.exports = router;
