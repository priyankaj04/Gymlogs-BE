# Workout Plan API Documentation

The Workout Plan API provides comprehensive CRUD operations for managing workout plans and their associated exercises. All endpoints require JWT authentication.

## Base URL
```
/api/workout-plans
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

### Workout Plans Table
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Plan name
- `description` (TEXT) - Plan description
- `muscle_types` (TEXT[]) - Array of muscle types/body parts
- `difficulty_level` (TEXT) - beginner, intermediate, advanced
- `estimated_duration` (INTEGER) - Duration in minutes
- `created_by` (UUID) - User who created the plan
- `is_public` (BOOLEAN) - Whether plan is publicly available
- `created_at`, `updated_at` (TIMESTAMP)

### Workout Plan Exercises Table
- `id` (UUID) - Primary key
- `workout_plan_id` (UUID) - Foreign key to workout_plans
- `exercise_id` (TEXT) - Foreign key to exercises
- `sets` (INTEGER) - Number of sets
- `reps` (INTEGER) - Number of reps
- `weight` (DECIMAL) - Optional weight suggestion
- `rest_time` (INTEGER) - Rest time in seconds
- `notes` (TEXT) - Exercise-specific notes
- `order_index` (INTEGER) - Order in the workout
- `created_at`, `updated_at` (TIMESTAMP)

## Endpoints

### 1. Create Workout Plan
**POST** `/api/workout-plans`

Creates a new workout plan with exercises.

#### Request Body
```json
{
  "name": "string (required, 2-255 chars)",
  "description": "string (optional, max 2000 chars)",
  "muscle_types": ["array of muscle types (required, min 1)"],
  "difficulty_level": "string (optional: beginner, intermediate, advanced)",
  "estimated_duration": "number (optional, 5-300 minutes)",
  "is_public": "boolean (optional, default: false)",
  "exercises": [
    {
      "exercise_id": "string (required)",
      "sets": "number (required, 1-50)",
      "reps": "number (required, 1-1000)",
      "weight": "number (optional, 0-10000)",
      "rest_time": "number (optional, 0-3600 seconds)",
      "notes": "string (optional, max 500 chars)",
      "order_index": "number (optional, auto-assigned)"
    }
  ]
}
```

#### Example Request
```bash
curl -X POST http://localhost:3000/api/workout-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Push Day Workout",
    "description": "A comprehensive push workout targeting chest, shoulders, and triceps",
    "muscle_types": ["chest", "shoulders", "triceps"],
    "difficulty_level": "intermediate",
    "estimated_duration": 60,
    "is_public": true,
    "exercises": [
      {
        "exercise_id": "1",
        "sets": 4,
        "reps": 8,
        "weight": 185.5,
        "rest_time": 120,
        "notes": "Focus on form"
      },
      {
        "exercise_id": "4",
        "sets": 3,
        "reps": 12,
        "weight": 25,
        "rest_time": 90
      }
    ]
  }'
```

#### Response
```json
{
  "success": true,
  "message": "Workout plan created successfully",
  "data": {
    "id": "uuid",
    "name": "Push Day Workout",
    "description": "A comprehensive push workout targeting chest, shoulders, and triceps",
    "muscle_types": ["chest", "shoulders", "triceps"],
    "difficulty_level": "intermediate",
    "estimated_duration": 60,
    "created_by": "user-uuid",
    "is_public": true,
    "created_at": "2025-10-06T12:00:00.000Z",
    "updated_at": "2025-10-06T12:00:00.000Z",
    "users": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "exercises": [
      {
        "id": "exercise-plan-uuid",
        "exercise_id": "1",
        "exercise_name": "Bench Press",
        "exercise_description": "A compound exercise that primarily targets the chest, shoulders, and triceps.",
        "body_part": "chest",
        "exercise_type": "compound",
        "difficulty": "intermediate",
        "equipment": ["barbell", "bench"],
        "sets": 4,
        "reps": 8,
        "weight": 185.5,
        "rest_time": 120,
        "notes": "Focus on form",
        "order_index": 1
      }
    ]
  }
}
```

### 2. Get All Workout Plans
**GET** `/api/workout-plans`

Retrieves workout plans with optional filtering and pagination. Returns user's own plans and public plans.

#### Query Parameters
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Plans per page
- `muscle_type` (string) - Filter by muscle type
- `difficulty_level` (string) - Filter by difficulty
- `created_by` (string) - Filter by creator user ID
- `is_public` (boolean) - Filter by public status
- `search` (string) - Search in name and description

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/workout-plans?page=1&limit=5&muscle_type=chest&difficulty_level=intermediate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Push Day Workout",
      "description": "A comprehensive push workout targeting chest, shoulders, and triceps",
      "muscle_types": ["chest", "shoulders", "triceps"],
      "difficulty_level": "intermediate",
      "estimated_duration": 60,
      "created_by": "user-uuid",
      "is_public": true,
      "created_at": "2025-10-06T12:00:00.000Z",
      "updated_at": "2025-10-06T12:00:00.000Z",
      "users": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

### 3. Get Workout Plan by ID
**GET** `/api/workout-plans/:id`

Retrieves a specific workout plan with all exercises.

#### Example Request
```bash
curl -X GET http://localhost:3000/api/workout-plans/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Push Day Workout",
    "description": "A comprehensive push workout targeting chest, shoulders, and triceps",
    "muscle_types": ["chest", "shoulders", "triceps"],
    "difficulty_level": "intermediate",
    "estimated_duration": 60,
    "created_by": "user-uuid",
    "is_public": true,
    "created_at": "2025-10-06T12:00:00.000Z",
    "updated_at": "2025-10-06T12:00:00.000Z",
    "users": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "exercises": [
      {
        "id": "exercise-plan-uuid",
        "exercise_id": "1",
        "exercise_name": "Bench Press",
        "exercise_description": "A compound exercise that primarily targets the chest, shoulders, and triceps.",
        "body_part": "chest",
        "exercise_type": "compound",
        "difficulty": "intermediate",
        "equipment": ["barbell", "bench"],
        "sets": 4,
        "reps": 8,
        "weight": 185.5,
        "rest_time": 120,
        "notes": "Focus on form",
        "order_index": 1
      }
    ]
  }
}
```

### 4. Update Workout Plan
**PUT** `/api/workout-plans/:id`

Updates an existing workout plan. Only the creator can update their plans.

#### Request Body (all fields optional)
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "muscle_types": ["array (optional)"],
  "difficulty_level": "string (optional)",
  "estimated_duration": "number (optional)",
  "is_public": "boolean (optional)",
  "exercises": [
    {
      "exercise_id": "string",
      "sets": "number",
      "reps": "number",
      "weight": "number (optional)",
      "rest_time": "number (optional)",
      "notes": "string (optional)"
    }
  ]
}
```

#### Example Request
```bash
curl -X PUT http://localhost:3000/api/workout-plans/uuid-here \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Push Day Workout",
    "difficulty_level": "advanced",
    "estimated_duration": 75
  }'
```

### 5. Delete Workout Plan
**DELETE** `/api/workout-plans/:id`

Deletes a workout plan. Only the creator can delete their plans.

#### Example Request
```bash
curl -X DELETE http://localhost:3000/api/workout-plans/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "message": "Workout plan deleted successfully"
}
```

### 6. Add Exercise to Workout Plan
**POST** `/api/workout-plans/:planId/exercises`

Adds a new exercise to an existing workout plan.

#### Request Body
```json
{
  "exercise_id": "string (required)",
  "sets": "number (required, 1-50)",
  "reps": "number (required, 1-1000)",
  "weight": "number (optional, 0-10000)",
  "rest_time": "number (optional, 0-3600)",
  "notes": "string (optional, max 500 chars)",
  "order_index": "number (optional)"
}
```

#### Example Request
```bash
curl -X POST http://localhost:3000/api/workout-plans/uuid-here/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exercise_id": "2",
    "sets": 3,
    "reps": 10,
    "rest_time": 90,
    "notes": "Focus on controlled movement"
  }'
```

### 7. Update Exercise in Workout Plan
**PUT** `/api/workout-plans/:planId/exercises/:exerciseId`

Updates an exercise within a workout plan.

#### Request Body (all fields optional)
```json
{
  "sets": "number (optional)",
  "reps": "number (optional)",
  "weight": "number (optional)",
  "rest_time": "number (optional)",
  "notes": "string (optional)",
  "order_index": "number (optional)"
}
```

#### Example Request
```bash
curl -X PUT http://localhost:3000/api/workout-plans/plan-uuid/exercises/exercise-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sets": 5,
    "reps": 6,
    "weight": 200
  }'
```

### 8. Remove Exercise from Workout Plan
**DELETE** `/api/workout-plans/:planId/exercises/:exerciseId`

Removes an exercise from a workout plan.

#### Example Request
```bash
curl -X DELETE http://localhost:3000/api/workout-plans/plan-uuid/exercises/exercise-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Get Workout Plan Statistics
**GET** `/api/workout-plans/stats`

Returns statistics about the user's workout plans.

#### Example Request
```bash
curl -X GET http://localhost:3000/api/workout-plans/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": {
    "total_plans": 5,
    "public_plans": 2,
    "private_plans": 3,
    "by_difficulty": {
      "beginner": 1,
      "intermediate": 3,
      "advanced": 1
    },
    "muscle_type_usage": {
      "chest": 3,
      "back": 2,
      "legs": 2,
      "shoulders": 3
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "details": ["Detailed validation errors if applicable"]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (not owner of resource)
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Workout Plan Creation
- `name`: Required, 2-255 characters
- `description`: Optional, max 2000 characters
- `muscle_types`: Required array, min 1 item, valid body parts
- `difficulty_level`: Optional, must be beginner/intermediate/advanced
- `estimated_duration`: Optional, 5-300 minutes
- `is_public`: Optional boolean, default false
- `exercises`: Required array, min 1 exercise

### Exercise in Workout Plan
- `exercise_id`: Required, must exist in exercises table
- `sets`: Required, 1-50
- `reps`: Required, 1-1000
- `weight`: Optional, 0-10000
- `rest_time`: Optional, 0-3600 seconds
- `notes`: Optional, max 500 characters
- `order_index`: Optional, auto-assigned if not provided

## Row Level Security (RLS)

The API implements PostgreSQL Row Level Security:

- **Workout Plans**: Users can view their own plans and public plans
- **Workout Plan Exercises**: Access controlled through workout plan ownership
- **Modifications**: Only plan creators can update/delete their plans
- **Public Plans**: Can be viewed by all authenticated users but only modified by creators

## Features

- ✅ Full CRUD operations for workout plans
- ✅ Nested exercise management within plans
- ✅ Public/private plan visibility
- ✅ Muscle type filtering and statistics
- ✅ Exercise ordering within plans
- ✅ Comprehensive validation
- ✅ Row Level Security for data protection
- ✅ Pagination for large datasets
- ✅ Search functionality
- ✅ User statistics and analytics

## Usage Examples

### Create a Complete Workout Plan
```javascript
const workoutPlan = {
  name: "Full Body Strength",
  description: "A complete full-body strength training workout",
  muscle_types: ["chest", "back", "legs", "shoulders"],
  difficulty_level: "intermediate", 
  estimated_duration: 90,
  is_public: true,
  exercises: [
    {
      exercise_id: "1", // Bench Press
      sets: 4,
      reps: 8,
      weight: 185,
      rest_time: 120,
      notes: "Control the descent"
    },
    {
      exercise_id: "2", // Pull-ups
      sets: 3,
      reps: 10,
      rest_time: 90
    },
    {
      exercise_id: "squat-id",
      sets: 4,
      reps: 12,
      weight: 225,
      rest_time: 150,
      notes: "Full depth"
    }
  ]
};
```

### Search Public Workout Plans
```bash
GET /api/workout-plans?is_public=true&search=strength&muscle_type=chest
```

This comprehensive API provides everything needed to manage workout plans with full exercise details and proper access control!