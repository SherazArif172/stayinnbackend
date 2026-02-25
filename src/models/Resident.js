import mongoose from 'mongoose';

const residentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    assignedRoom: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'left'],
      default: 'active',
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

residentSchema.index({ fullName: 1, assignedRoom: 1 });

const Resident = mongoose.model('Resident', residentSchema);
export default Resident;

