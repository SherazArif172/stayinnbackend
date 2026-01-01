import mongoose from 'mongoose';
import Room from '../models/Room.js';
import { createRoomSchema } from '../validations/roomValidation.js';

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

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { roomType, status, isActive, floor } = req.query;
    
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
    
    // Fetch rooms from database
    const rooms = await Room.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: rooms.length,
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
  getRoomBySlug,
};

