# 📡 EventSphere Backend Server

This is the backend server for the **EventSphere** web application, built with **Express.js**, **MongoDB**, and **JWT-based authentication**. It provides APIs for user registration, login, logout, event management, and joining events.

---

## 🧪 Tech Stack

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Cookie-based Auth Handling
- CORS Support

---

## 🚀 Getting Started

### 🛠 Prerequisites

- Node.js installed
- MongoDB URI
- `.env` file with the following variables:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## 📦 Install dependencies
 ```bash
 npm install
```
## ▶ Run the server
```bash
nodemon index.js
```

### 📁 API Endpoints

## ✅ Auth & User APIs

**🔐 POST /register**
 - Registers a new user.
```json
{
  "email": "user@example.com",
  "password": "secure123",
  "displayName": "John Doe",
  "accountCreated": {
    "createdAt": "2025-07-01T12:00:00Z"
  },
  "photoURL": "https://example.com/profile.jpg"
}
```
 - Response:
 ```json
 { "message": "User Created!", "result": {...} }
```

**🔐 POST /login**
 - Authenticates the user and sets a secure cookie.
 ```json
 {
  "email": "user@example.com",
  "password": "secure123"
}
```
 - Response:
 ```json
 {
  "message": "Login successful",
  "user": {
    "email": "user@example.com",
    "name": "John Doe",
    "photoURL": "..."
  }
}
```

**🔐 GET /user/profile**
 - Returns user profile information (requires auth cookie).
 - Headers: Automatically reads auth-token from cookies
 - Response:
```json
{
  "_id": "...",
  "email": "user@example.com",
  "displayName": "John Doe",
  ...
}
```
**🔐 POST /logout**
 - Logs the user out by clearing the auth-token cookie.
 - Response:
 ```json
 { "message": "Logged out successfully" }
```

## 🎉 Event APIs

**📥 POST /addEvent**
 - Adds a new event.
 - Body:
 ```json
 {
  "eventTitle": "React Meetup",
  "eventDate": "2025-07-10",
  "eventTime": "17:00",
  "location": "Dhaka",
  "email": "creator@example.com",
  "addedBy": "John Doe"
}
```
 - Response:
```json
{ "message": "New event added successfully!", "result": {...} }
```

**📤 GET /events**
 - Returns a list of all events, optionally filtered by:
   - Query Params:
     - email: Only show events created by the given email
     - filterByDate: One of thisWeek, lastWeek, currentMonth, lastMonth
 - Response:
 ```json
 {
  "message": "found events",
  "events": [ {...}, {...} ]
}
```

**🔍 GET /event/:id**
 - Get a single event by its MongoDB _id.
  - Response
```json
{
  "message": "Event found!",
  "event": {...}
}
```

**⭐ GET /topEvents**
 - Returns top 5 events with the highest attendeeCount.
  - Response:
```json
{
  "message": "found top events data",
  "topEvents": [ {...}, {...} ]
}
```

**🗓 GET /upcomingEvents**
 - Returns the next 3 events whose date/time is in the future.
  - Response:
```json
[
  {
    "_id": "...",
    "eventTitle": "...",
    "eventDate": "...",
    "eventTime": "...",
    ...
  }
]
```

**🤝 PATCH /joinEvent/:id?email=someone@example.com**
 - Adds a user's email to the joinedMembers array and increments attendeeCount.
 - Query Param: email (required)
 - Response:
 ```json
 {
  "lastErrorObject": {...},
  "value": {...},
  "ok": 1
}
```

**✏ PUT /updateEvent/:id**
 - Updates an existing event with given data.
 - Body: Any valid update fields
 - Response:
 ```json
 { "message": "Update successful." }
```

**❌ DELETE /delete-event/:id**
 - Deletes the event with the given ID.
 - Response:
 ```json
 { "message": "Event deleted" }
```


# 🛡 Middleware
 **verifyTokenFromCookie(req, res, next)**
 Middleware to verify JWT from auth-token cookie. Used on protected routes like /user/profile.

 ## 🌐 CORS Configuration
 ```javaScript
 app.use(cors({
    origin: [
        "https://eventsphere-mysterio.netlify.app",
        "http://localhost:5173"
    ],
    credentials: true
}));
```

### 📌 Notes
**Events are sorted using a combined date-time field created from eventDate and eventTime.**
**joinedMembers is an array of emails. Joining is idempotent using $addToSet.**

# 📫 Contact
Made by [Mysterio](https://mysterio-verse.netlify.app)