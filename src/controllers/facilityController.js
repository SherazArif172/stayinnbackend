import Facility from '../models/Facility.js';

/**
 * GET /api/facilities - Get all facilities (sorted by order)
 * Query: availableOnly=true - return only facilities where isAvailable is true (for public frontend)
 */
export const getAllFacilities = async (req, res) => {
  try {
    const { availableOnly } = req.query;
    const filter = availableOnly === 'true' ? { isAvailable: true } : {};
    const facilities = await Facility.find(filter).sort({ order: 1 });
    res.json({ success: true, facilities });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch facilities.' });
  }
};

/**
 * PATCH /api/facilities/:id - Update a facility (e.g. toggle isAvailable)
 */
export const updateFacility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const facility = await Facility.findOneAndUpdate(
      { id },
      { ...(typeof isAvailable === 'boolean' && { isAvailable }) },
      { new: true, runValidators: true }
    );
    if (!facility) {
      return res.status(404).json({ success: false, error: 'Facility not found.' });
    }
    res.json({ success: true, facility });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ success: false, error: 'Failed to update facility.' });
  }
};
