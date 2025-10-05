# GymLog Backend API

A complete Node.js and Express application for gym logging with Supabase database integration, featuring CRUD operations, JWT authentication, and comprehensive API endpoints.

## Features

- ✅ **Express.js Server** with comprehensive middleware setup
- ✅ **Supabase Integration** for database operations
- ✅ **JWT Authentication** with secure token handling
- ✅ **CRUD Operations** for users and gym logs
- ✅ **Input Validation** using Joi schemas
- ✅ **Error Handling** with custom middleware
- ✅ **Rate Limiting** to prevent abuse
- ✅ **Security Headers** with Helmet.js
- ✅ **CORS Support** for cross-origin requests
- ✅ **Request Logging** with Morgan
- ✅ **Environment Configuration** with validation
- ✅ **Password Hashing** with bcryptjs

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   JWT_SECRET=your_secure_jwt_secret_key
   ```

3. **Set up Supabase tables:**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Gym logs table
   CREATE TABLE gym_logs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     exercise VARCHAR(255) NOT NULL,
     sets INTEGER NOT NULL,
     reps INTEGER NOT NULL,
     weight DECIMAL(10,2) NOT NULL,
     notes TEXT,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Create indexes for better performance
   CREATE INDEX idx_gym_logs_user_id ON gym_logs(user_id);
   CREATE INDEX idx_gym_logs_created_at ON gym_logs(created_at);
   CREATE INDEX idx_users_email ON users(email);
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   Visit `http://localhost:3000/health` to verify the server is running.

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user

### Users (Protected)
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Gym Logs (Protected)
- `POST /api/gym-logs` - Create new gym log
- `GET /api/gym-logs` - Get all gym logs (with pagination and filters)
- `GET /api/gym-logs/:id` - Get gym log by ID
- `PUT /api/gym-logs/:id` - Update gym log
- `DELETE /api/gym-logs/:id` - Delete gym log
- `GET /api/gym-logs/stats/:user_id` - Get user statistics

### Health Check
- `GET /health` - Server health check

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Request/Response Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Create Gym Log
```bash
curl -X POST http://localhost:3000/api/gym-logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exercise": "Bench Press",
    "sets": 3,
    "reps": 10,
    "weight": 185.5,
    "notes": "Felt strong today",
    "user_id": "user-uuid-here"
  }'
```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `3000` |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | No | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | `24h` |
| `CORS_ORIGIN` | CORS allowed origin | No | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |

## Project Structure

```
src/
├── config/          # Database and configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware functions
├── routes/          # API route definitions
├── utils/           # Utility functions and helpers
└── index.js         # Main application entry point
```

## Development Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run setup` - Display setup instructions

## Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent API abuse
- **CORS** - Cross-origin resource sharing
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Joi schema validation
- **Environment Validation** - Ensure required env vars are set

## Error Handling

The API provides consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "details": ["Detailed error information"]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.