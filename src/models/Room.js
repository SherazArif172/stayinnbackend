import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    roomType: {
      type: String,
      enum: ["single", "double", "triple", "dorm"],
      required: true
    },

    totalBeds: {
      type: Number,
      required: true,
      min: 1
    },

    availableBeds: {
      type: Number,
      required: true,
      min: 0
    },

    pricePerBed: {
      type: Number,
      required: true
    },

    floor: {
      type: Number
    },

    amenities: [
      {
        type: String
      }
    ],

    images: [
      {
        type: String // image URLs
      }
    ],

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    status: {
      type: String,
      enum: ["available", "full", "maintenance"],
      default: "available"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);

