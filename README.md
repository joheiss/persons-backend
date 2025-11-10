# Persons Backend API

NestJS REST API for Person management with MySQL database.

## Features

- POST `/persons` - Create a person request
- GET `/persons/{id}` - Get person by ID
- PUT `/persons/{id}` - Update person
- DELETE `/persons/{id}` - Delete person
- GET `/persons` - Get all persons (sorted by name)
- GET `/requests/{id}` - Get request status by ID
- GET `/requests` - Get all requests (sorted by changedAt DESC)
- **CRON Job** - Automatically processes OPEN requests every 2 seconds

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=persons_db
PORT=3000
```

3. Create the MySQL database:
```sql
CREATE DATABASE persons_db;
```

## Running the application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`

## API Endpoints

### POST /persons
Create a person request.

**Request Body:**
```json
{
  "name": "John Doe",
  "dateOfBirth": "1990-01-01",
  "score": 85,
  "salary": 50000.50,
  "active": true,
  "comment": "Optional comment"
}
```

**Response:** `202 ACCEPTED`
```json
{
  "requestId": "uuid"
}
```

### GET /persons/{id}
Get person by ID.

**Response:** `200 OK`
```json
{
  "uuid": "uuid",
  "name": "John Doe",
  "dateOfBirth": "1990-01-01",
  "score": 85,
  "salary": 50000.50,
  "active": true,
  "comment": "Optional comment"
}
```

**Response:** `404 NOT FOUND` if person not found

### PUT /persons/{id}
Update person (at least one field required).

**Request Body:**
```json
{
  "name": "Jane Doe",
  "salary": 60000.75,
  "comment": "Updated comment"
}
```

**Response:** `202 ACCEPTED`
```json
{
  "requestId": "uuid"
}
```

**Response:** `400 BAD REQUEST` if validation fails or person not found

### DELETE /persons/{id}
Delete person (only if active === false).

**Response:** `202 ACCEPTED`
```json
{
  "requestId": "uuid"
}
```

**Response:** `400 BAD REQUEST` if person is active
**Response:** `404 NOT FOUND` if person not found

### GET /persons
Get all persons (sorted by name).

**Response:** `200 OK`
```json
[
  {
    "uuid": "uuid",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "score": 85,
    "salary": 50000.50,
    "active": true,
    "comment": "Optional comment"
  }
]
```

**Response:** `404 NOT FOUND` if no persons found

### GET /requests/{id}
Get request status by ID.

**Response:** `200 OK`
```json
{
  "status": "OPEN"
}
```

**Response:** `404 NOT FOUND` if request not found

### GET /requests
Get all requests (sorted by changedAt DESC).

**Response:** `200 OK`
```json
[
  {
    "requestId": "uuid",
    "changedAt": "2024-01-01T12:00:00.000Z",
    "status": "OPEN",
    "command": "ADD_PERSON",
    "payload": { ... }
  }
]
```

**Response:** `404 NOT FOUND` if no requests found

## Request Processing (CRON Job)

The application includes a CRON job that automatically processes OPEN requests every 2 seconds. The job:

1. Queries all entries from the `requests` table with `status = OPEN`
2. For each OPEN request:
   - Updates status to `IN_PROGRESS` and `changedAt` to current time
   - Processes the command:
     - **ADD_PERSON**: Creates a new person in the `persons` table with data from payload
     - **CHANGE_PERSON**: Updates an existing person in the `persons` table using payload data
     - **DELETE_PERSON**: Deletes a person from the `persons` table using UUID from payload
   - On success: Updates status to `COMPLETED` and `changedAt` to current time
   - On error: Updates status to `FAILED` and `changedAt` to current time

The CRON job runs automatically when the application starts and uses the same database connection configured in the `.env` file.

## Database Schema

### persons table
- `uuid` (UUID, Primary Key)
- `name` (VARCHAR)
- `dateOfBirth` (DATE)
- `score` (INT)
- `salary` (DECIMAL(10,2))
- `active` (BOOLEAN, default: true)
- `comment` (TEXT, nullable)

### requests table
- `requestId` (UUID, Primary Key)
- `changedAt` (TIMESTAMP)
- `status` (ENUM: 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'FAILED')
- `command` (ENUM: 'ADD_PERSON', 'CHANGE_PERSON', 'DELETE_PERSON')
- `payload` (JSON)
