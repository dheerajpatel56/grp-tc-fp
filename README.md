# Group Live Location Tracking System

A complete modular system for real-time group location tracking with history playback, geofencing, and admin management.

## Tech Stack
- **Frontend**: HTML5, CSS3 (Custom Dark Theme), JavaScript
- **Maps**: OpenStreetMap (OSM) via Leaflet.js [NO API KEY REQUIRED]
- **Backend**: Node.js, Express
- **Database**: MySQL (8.0)
- **Auth**: JWT with bcrypt hashing

## Folder Structure
```text
group-location-tracker/
├── client/              # Frontend Web Application
│   ├── assets/          # CSS, JS, Images
│   ├── index.html       # Dashboard
│   ├── login.html       # Auth
│   ├── register.html    # Auth
│   ├── map.html         # Live Tracking (OSM)
│   └── history.html     # Route Playback (OSM)
├── server/              # Node.js Express Backend
│   ├── config/          # DB Configuration
│   ├── controllers/     # Business Logic
│   ├── middleware/      # Auth Middleware
│   ├── routes/          # API Routers
│   └── index.js         # Entry Point
├── database/            # SQL Schema and Scripts
├── docs/                # API Documentation
├── .env                 # Environment Variables
├── docker-compose.yml   # Container Configuration
└── package.json         # Node Dependencies
```

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- Docker installed (for MySQL)

### 2. Database Setup
Spin up the MySQL container:
```bash
docker-compose up -d
```
The database will be initialized automatically with the schema in `database/schema.sql`.

### 3. Backend Setup
Install dependencies and start the server:
```bash
npm install
npm start
```

### 4. Frontend Setup
Simply open `client/login.html` in your browser.

## Features
- **Real-time Tracking**: Updates every 5 seconds on OSM.
- **Group Management**: Secure joining with custom codes.
- **History Playback**: Filter by date to view routes on OSM.
- **Geofencing**: Automatic alerts when moving out of bounds.
- **Admin Panel**: Complete control over users and groups.
