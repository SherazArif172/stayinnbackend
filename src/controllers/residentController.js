import Booking from '../models/Booking.js';

/**
 * Residents = people whose booking status is "checked_in".
 * GET /api/residents returns all checked-in bookings (user + room populated).
 * DELETE /api/residents/:id marks that booking as checked_out (person "leaves" / removed from residents).
 */
export const getResidents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const aggregate = [
      { $match: { status: 'checked_in' } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        $lookup: {
          from: 'rooms',
          localField: 'room',
          foreignField: '_id',
          as: 'roomDoc',
        },
      },
      { $unwind: '$roomDoc' },
      {
        $project: {
          _id: 1,
          checkInDate: 1,
          checkOutDate: 1,
          fullName: '$userDoc.fullName',
          email: '$userDoc.email',
          assignedRoom: '$roomDoc.roomNumber',
        },
      },
    ];

    if (search && search.trim()) {
      const q = search.trim();
      aggregate.push({
        $match: {
          $or: [
            { fullName: new RegExp(q, 'i') },
            { assignedRoom: new RegExp(q, 'i') },
            { email: new RegExp(q, 'i') },
          ],
        },
      });
    }

    const countPipeline = [...aggregate, { $count: 'total' }];
    const [countResult, residentsRaw] = await Promise.all([
      Booking.aggregate(countPipeline),
      Booking.aggregate([
        ...aggregate,
        { $sort: { checkInDate: -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ]),
    ]);
    const total = countResult[0]?.total ?? 0;
    const pages = Math.ceil(total / limitNum);

    const residents = residentsRaw.map((r) => ({
      _id: r._id.toString(),
      fullName: r.fullName || '—',
      email: r.email || '—',
      phoneNumber: '', // User model has no phone; leave empty or add field later
      assignedRoom: r.assignedRoom || '—',
      status: 'active',
      checkInDate: r.checkInDate,
      checkOutDate: r.checkOutDate,
    }));

    res.json({ success: true, residents, total, page: pageNum, pages, limit: limitNum });
  } catch (err) {
    console.error('Get residents error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch residents' });
  }
};

export const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, status: 'checked_in' })
      .populate('user', 'fullName email')
      .populate('room', 'roomNumber')
      .lean();
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Resident not found' });
    }
    const resident = {
      _id: booking._id.toString(),
      fullName: booking.user?.fullName || '—',
      email: booking.user?.email || '—',
      phoneNumber: '',
      assignedRoom: booking.room?.roomNumber || '—',
      status: 'active',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    };
    res.json({ success: true, resident });
  } catch (err) {
    console.error('Get resident error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch resident' });
  }
};

/**
 * Remove resident = set their booking to checked_out (they leave).
 */
export const removeResident = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOneAndUpdate(
      { _id: id, status: 'checked_in' },
      { $set: { status: 'checked_out' } },
      { new: true }
    )
      .populate('user', 'fullName email')
      .populate('room', 'roomNumber')
      .lean();
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Resident not found' });
    }
    const resident = {
      _id: booking._id.toString(),
      fullName: booking.user?.fullName || '—',
      email: booking.user?.email || '—',
      phoneNumber: '',
      assignedRoom: booking.room?.roomNumber || '—',
      status: 'checked_out',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
    };
    res.json({ success: true, resident });
  } catch (err) {
    console.error('Remove resident error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to remove resident' });
  }
};
