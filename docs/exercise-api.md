# Exercise API Documentation

The Exercise API provides comprehensive CRUD operations for managing exercise data in the gym logging application. All endpoints require JWT authentication.

## Base URL
```
/api/exercises
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### 1. Create Exercise
**POST** `/api/exercises`

Creates a new exercise in the database.

#### Request Body
```json
{
  "id": "string (required)",
  "name": "string (required, unique)",
  "description": "string (required, 5-1000 chars)",
  "body_part": "string (required)",
  "exercise_type": "string (required)",
  "difficulty": "string (optional)",
  "equipment": ["array of strings (optional)"]
}
```

#### Valid Values
- **body_part**: `chest`, `back`, `shoulders`, `biceps`, `triceps`, `legs`, `glutes`, `core`, `calves`, `forearms`, `full-body`
- **exercise_type**: `cardio`, `compound`, `isolated`, `mobility`
- **difficulty**: `beginner`, `intermediate`, `advanced`

#### Example Request
```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id": "4",
    "name": "Bicep Curls",
    "description": "Isolated exercise targeting the bicep muscles using dumbbells or barbells.",
    "body_part": "biceps",
    "exercise_type": "isolated",
    "difficulty": "beginner",
    "equipment": ["dumbbells", "barbell"]
  }'
```

#### Response
```json
{
  "success": true,
  "message": "Exercise created successfully",
  "data": {
    "id": "4",
    "name": "Bicep Curls",
    "description": "Isolated exercise targeting the bicep muscles using dumbbells or barbells.",
    "body_part": "biceps",
    "exercise_type": "isolated",
    "difficulty": "beginner",
    "equipment": ["dumbbells", "barbell"],
    "created_at": "2025-09-30T12:00:00.000Z",
    "updated_at": "2025-09-30T12:00:00.000Z"
  }
}
```

### 2. Get All Exercises
**GET** `/api/exercises`

Retrieves all exercises with optional filtering and pagination.

#### Query Parameters
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 20) - Number of exercises per page
- `body_part` (string) - Filter by body part
- `exercise_type` (string) - Filter by exercise type
- `difficulty` (string) - Filter by difficulty level
- `search` (string) - Search in name and description

#### Example Request
```bash
curl -X GET "http://localhost:3000/api/exercises?page=1&limit=10&body_part=chest&difficulty=intermediate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Bench Press",
      "description": "A compound exercise that primarily targets the chest, shoulders, and triceps.",
      "body_part": "chest",
      "exercise_type": "compound",
      "difficulty": "intermediate",
      "equipment": ["barbell", "bench"],
      "created_at": "2025-09-30T12:00:00.000Z",
      "updated_at": "2025-09-30T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### 3. Get Exercise by ID
**GET** `/api/exercises/:id`

Retrieves a specific exercise by its ID.

#### Example Request
```bash
curl -X GET http://localhost:3000/api/exercises/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Bench Press",
    "description": "A compound exercise that primarily targets the chest, shoulders, and triceps.",
    "body_part": "chest",
    "exercise_type": "compound",
    "difficulty": "intermediate",
    "equipment": ["barbell", "bench"],
    "created_at": "2025-09-30T12:00:00.000Z",
    "updated_at": "2025-09-30T12:00:00.000Z"
  }
}
```

### 4. Update Exercise
**PUT** `/api/exercises/:id`

Updates an existing exercise. Only provided fields will be updated.

#### Request Body (all fields optional)
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "body_part": "string (optional)",
  "exercise_type": "string (optional)",
  "difficulty": "string (optional)",
  "equipment": ["array of strings (optional)"]
}
```

#### Example Request
```bash
curl -X PUT http://localhost:3000/api/exercises/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "difficulty": "advanced",
    "equipment": ["barbell", "bench", "safety bars"]
  }'
```

#### Response
```json
{
  "success": true,
  "message": "Exercise updated successfully",
  "data": {
    "id": "1",
    "name": "Bench Press",
    "description": "A compound exercise that primarily targets the chest, shoulders, and triceps.",
    "body_part": "chest",
    "exercise_type": "compound",
    "difficulty": "advanced",
    "equipment": ["barbell", "bench", "safety bars"],
    "created_at": "2025-09-30T12:00:00.000Z",
    "updated_at": "2025-09-30T12:05:00.000Z"
  }
}
```

### 5. Get Exercises by Body Part
**GET** `/api/exercises/by-body-part`

Returns exercises grouped by body parts.

#### Example Request
```bash
curl -X GET http://localhost:3000/api/exercises/by-body-part \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": {
    "chest": [
      {
        "id": "1",
        "name": "Bench Press",
        "description": "A compound exercise that primarily targets the chest, shoulders, and triceps.",
        "body_part": "chest",
        "exercise_type": "compound",
        "difficulty": "intermediate",
        "equipment": ["barbell", "bench"],
        "created_at": "2025-09-30T12:00:00.000Z",
        "updated_at": "2025-09-30T12:00:00.000Z"
      }
    ],
    "back": [
      {
        "id": "2",
        "name": "Pull-ups",
        "description": "A bodyweight exercise that targets the back muscles and biceps.",
        "body_part": "back",
        "exercise_type": "compound",
        "difficulty": "intermediate",
        "equipment": ["pull-up bar"],
        "created_at": "2025-09-30T12:00:00.000Z",
        "updated_at": "2025-09-30T12:00:00.000Z"
      }
    ]
  }
}
```

### 6. Get Exercise Filters
**GET** `/api/exercises/filters`

Returns available filter options for body parts, exercise types, and difficulties.

#### Example Request
```bash
curl -X GET http://localhost:3000/api/exercises/filters \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": {
    "body_parts": ["back", "chest", "full-body"],
    "exercise_types": ["cardio", "compound"],
    "difficulties": ["beginner", "intermediate"]
  }
}
```

### 7. Get Exercise Statistics
**GET** `/api/exercises/stats`

Returns statistical information about exercises in the database.

#### Example Request
```bash
curl -X GET http://localhost:3000/api/exercises/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Response
```json
{
  "success": true,
  "data": {
    "total_exercises": 3,
    "by_body_part": {
      "chest": 1,
      "back": 1,
      "full-body": 1
    },
    "by_exercise_type": {
      "compound": 2,
      "cardio": 1
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
- `404` - Not Found
- `500` - Internal Server Error

## Validation Rules

### Exercise Creation
- `id`: Required string
- `name`: Required, unique, 2-255 characters
- `description`: Required, 5-1000 characters
- `body_part`: Required, must be one of the valid body parts
- `exercise_type`: Required, must be one of the valid exercise types
- `difficulty`: Optional, must be one of the valid difficulty levels
- `equipment`: Optional array of strings

### Exercise Update
- All fields are optional
- At least one field must be provided
- Same validation rules apply as creation for provided fields
- Name uniqueness is checked if name is being updated

## Database Schema

The exercises table has the following structure:
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT UNIQUE NOT NULL)
- `description` (TEXT NOT NULL)
- `body_part` (TEXT NOT NULL)
- `exercise_type` (TEXT NOT NULL)
- `difficulty` (TEXT)
- `equipment` (TEXT) - JSON array stored as string
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Notes

1. All timestamps are in ISO 8601 format
2. Equipment is stored as a JSON array in the database
3. All routes require authentication via JWT token
4. Search functionality searches both name and description fields
5. Pagination starts from page 1
6. Default limit is 20 exercises per page