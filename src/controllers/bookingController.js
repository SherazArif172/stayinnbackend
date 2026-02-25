import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { createBookingSchema, updateBookingSchema } from '../validations/bookingValidation.js';

// Statuses that block the room for new bookings (create: also block on pending so same room/dates can't be double-requested)
const ACTIVE_STATUSES = ['approved', 'checked_in'];
const STATUSES_BLOCKING_CREATE = ['pending', 'approved', 'checked_in'];

async function hasOverlap(roomId, checkInDate, checkOutDate, excludeBookingId = null, includePending = false) {
  const statuses = includePending ? STATUSES_BLOCKING_CREATE : ACTIVE_STATUSES;
  const q = {
    room: new mongoose.Types.ObjectId(roomId),
    status: { $in: statuses },
    checkInDate: { $lt: new Date(checkOutDate) },
    checkOutDate: { $gt: new Date(checkInDate) },
  };
  if (excludeBookingId) q._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
  const existing = await Booking.findOne(q);
  return !!existing;
}

export const createBooking = async (req, res) => {
  try {
    const validationResult = createBookingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const { room: roomId, checkInDate, checkOutDate, notes, userId } = validationResult.data;
    const isAdmin = req.user.role === 'admin';
    const bookingUserId = (isAdmin && userId) ? userId : req.user._id.toString();

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });

    const overlap = await hasOverlap(roomId, checkInDate, checkOutDate, null, true);
    if (overlap) return res.status(409).json({ success: false, error: 'Room is not available for the selected dates' });

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalAmount = (room.pricePerBed || 0) * nights;

    const booking = await Booking.create({
      user: bookingUserId,
      room: roomId,
      checkInDate,
      checkOutDate,
      notes,
      totalAmount,
      status: 'pending',
    });
    const populated = await Booking.findById(booking._id).populate('user', 'fullName email').populate('room', 'roomNumber title pricePerBed');
    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create booking' });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, roomId, userId, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const isAdmin = req.user.role === 'admin';

    const filter = {};
    if (!isAdmin) filter.user = req.user._id;
    if (status && ['pending', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled'].includes(status)) filter.status = status;
    if (roomId) filter.room = roomId;
    if (isAdmin && userId) filter.user = userId;
    if (search && search.trim()) {
      const userMatch = await User.find({
        $or: [{ fullName: new RegExp(search.trim(), 'i') }, { email: new RegExp(search.trim(), 'i') }],
      }).select('_id').lean();
      const ids = userMatch.map((u) => u._id);
      filter.user = ids.length ? { $in: ids } : { $in: [] };
    }

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('user', 'fullName email')
        .populate('room', 'roomNumber title pricePerBed status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Booking.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limitNum);
    res.json({ success: true, bookings, total, page: pageNum, pages: totalPages, limit: limitNum });
  } catch (err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch bookings' });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('user', 'fullName email').populate('room', 'roomNumber title pricePerBed status roomType').lean();
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && booking.user._id.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Forbidden' });
    res.json({ success: true, booking });
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch booking' });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateBookingSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    const updates = validationResult.data;
    const existing = await Booking.findById(id).populate('room', 'roomNumber');
    if (!existing) return res.status(404).json({ success: false, error: 'Booking not found' });
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && existing.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Forbidden' });
    const isOnlyPaymentPaid = Object.keys(updates).length === 1 && updates.paymentStatus === 'paid' && existing.user.toString() === req.user._id.toString();
    if (!isAdmin && !isOnlyPaymentPaid) {
      if (updates.status && updates.status !== 'cancelled') return res.status(403).json({ success: false, error: 'Only admins can change status to something other than cancelled' });
      if (existing.status !== 'pending') return res.status(400).json({ success: false, error: 'Only pending bookings can be cancelled' });
    }

    if (updates.status && ['approved', 'checked_in'].includes(updates.status)) {
      const overlap = await hasOverlap(existing.room._id, existing.checkInDate, existing.checkOutDate, id);
      if (overlap) return res.status(409).json({ success: false, error: 'Room is not available for these dates' });
    }

    const updated = await Booking.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate('user', 'fullName email')
      .populate('room', 'roomNumber title pricePerBed status')
      .lean();
    res.json({ success: true, booking: updated });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to update booking' });
  }
};
