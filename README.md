# StayInn Hostels Backend API

Simple Express.js server for StayInn Hostels booking application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```bash
# Create .env file with the following content:
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stayinn-hostels
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Or copy from `.env.example` if it exists:
```bash
cp .env.example .env
```

3. Start the server:

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Server health check

### Rooms
- **GET** `/api/rooms` - Get all rooms
- **GET** `/api/rooms/:slug` - Get room by slug
- **POST** `/api/rooms` - Create a new room
  - Body: See `POSTMAN_SAMPLES.md` for examples

### Contact
- **POST** `/api/contact` - Submit contact form
  - Body: `{ name, email, message }`

## Example Usage

```bash
# Get all rooms
curl http://localhost:5000/api/rooms

# Get single room
curl http://localhost:5000/api/rooms/single-room

# Create a new room
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "roomType": "single",
    "totalBeds": 1,
    "availableBeds": 1,
    "pricePerBed": 450,
    "floor": 1,
    "amenities": ["WiFi", "AC", "Attached Washroom"],
    "description": "A cozy single room"
  }'

# Submit contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","message":"Hello"}'
```

## Postman Test Samples

See `POSTMAN_SAMPLES.md` for detailed sample request bodies and test cases.

## Default Port

The server runs on port **5000** by default. You can change this in the `.env` file.

