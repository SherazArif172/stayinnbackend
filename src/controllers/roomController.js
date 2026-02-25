import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import { createRoomSchema } from '../validations/roomValidation.js';

const BOOKING_STATUSES_BLOCKING_AVAILABILITY = ['pending', 'approved', 'checked_in'];

// Create a new room
const createRoom = async (req, res) => {
  try {
    // Validate request body using Zod
    const validationResult = createRoomSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: validatedData.roomNumber });
    if (existingRoom) {
      return res.status(409).json({
        error: 'Room number already exists'
      });
    }

    // Create new room
    const room = new Room(validatedData);
    const savedRoom = await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room: savedRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Room number already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create room',
      message: error.message
    });
  }
};

// Get all rooms (optional: filter by availability for checkIn/checkOut)
const getAllRooms = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { roomType, status, isActive, floor, page, limit, search, checkIn, checkOut } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (roomType) {
      filter.roomType = roomType;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (floor) {
      filter.floor = parseInt(floor);
    }
    
    // Search functionality - search across roomNumber, title, and description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search
      filter.$or = [
        { roomNumber: searchRegex },
        { title: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // If checkIn and checkOut provided, exclude rooms that have overlapping bookings (pending, approved, checked_in)
    const checkInDate = checkIn ? new Date(checkIn) : null;
    const checkOutDate = checkOut ? new Date(checkOut) : null;
    if (checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkOutDate > checkInDate) {
      const bookedRoomIds = await Booking.distinct('room', {
        status: { $in: BOOKING_STATUSES_BLOCKING_AVAILABILITY },
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
      });
      if (bookedRoomIds.length > 0) {
        filter._id = { $nin: bookedRoomIds };
      }
    }
    
    // Pagination parameters
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;
    
    // Get total count for pagination
    const totalCount = await Room.countDocuments(filter);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Fetch rooms from database with pagination
    const rooms = await Room.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);
    
    res.json({
      success: true,
      count: rooms.length,
      total: totalCount,
      page: pageNumber,
      pages: totalPages,
      limit: pageSize,
      rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      error: 'Failed to fetch rooms',
      message: error.message
    });
  }
};

// Get single room by ID
const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid room ID format'
      });
    }
    
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      error: 'Failed to fetch room',
      message: error.message
    });
  }
};

// Update a room by ID
const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid room ID format'
      });
    }

    // Validate request body using Zod
    const validationResult = createRoomSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const validatedData = validationResult.data;

    // Check if room exists
    const existingRoom = await Room.findById(id);
    
    if (!existingRoom) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }

    // Check if room number is being changed and if it conflicts with another room
    if (validatedData.roomNumber && validatedData.roomNumber !== existingRoom.roomNumber) {
      const roomWithSameNumber = await Room.findOne({ 
        roomNumber: validatedData.roomNumber,
        _id: { $ne: id } // Exclude current room
      });
      
      if (roomWithSameNumber) {
        return res.status(409).json({
          error: 'Room number already exists'
        });
      }
    }

    // Update room
    const updatedRoom = await Room.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom
    });
  } catch (error) {
    console.error('Error updating room:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Room number already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to update room',
      message: error.message
    });
  }
};

// Delete a room by ID
const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid room ID format'
      });
    }

    // Check if room exists
    const room = await Room.findById(id);
    
    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }

    // Delete room
    await Room.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      error: 'Failed to delete room',
      message: error.message
    });
  }
};

// Get single room by slug (kept for backward compatibility)
const getRoomBySlug = (req, res) => {
  const { slug } = req.params;
  const rooms = [
    {
      slug: "single-room",
      title: "Single Room",
      capacity: "1 Person",
      price: 450,
      priceUnit: "/month",
      description: "Perfect for solo travelers seeking privacy and comfort. A cozy space designed for focused work and rest.",
      fullDescription: "Our Single Room offers the perfect sanctuary for solo travelers who value privacy and tranquility.",
      amenities: ["WiFi", "Attached Washroom", "AC", "Study Table", "Cupboard", "Daily Housekeeping"],
      featured: false,
      size: "12 sqm",
      bedType: "Single Bed",
    },
    {
      slug: "double-room",
      title: "Double Room",
      capacity: "2 Persons",
      price: 350,
      priceUnit: "/person/month",
      description: "Ideal for couples or friends. Spacious accommodation with modern amenities and a private balcony.",
      fullDescription: "Our Double Room is perfect for couples or friends traveling together.",
      amenities: ["WiFi", "Attached Washroom", "AC", "Study Table", "Cupboard", "Balcony", "Mini Fridge"],
      featured: true,
      size: "18 sqm",
      bedType: "Double Bed",
    },
    {
      slug: "shared-dormitory",
      title: "Shared Dormitory",
      capacity: "4–6 Persons",
      price: 180,
      priceUnit: "/person/month",
      description: "Budget-friendly option for social travelers. Comfortable shared space with privacy curtains and personal lockers.",
      fullDescription: "Our Shared Dormitory is the perfect choice for budget-conscious travelers.",
      amenities: ["WiFi", "Shared Washroom", "Fan", "Personal Locker", "Charging Point", "Privacy Curtains"],
      featured: false,
      size: "25 sqm",
      bedType: "Bunk Beds",
    },
  ];
  
  const room = rooms.find(r => r.slug === slug);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
};

export {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomBySlug,
};

