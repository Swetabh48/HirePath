# API Endpoints

All requests require `Authorization: Bearer <token>` header except auth.

## Auth
POST /api/auth/register
Request:
```json
{ "email": "user@example.com", "password": "password123" }
```
Response:
```json
{ "token": "<jwt>" }
```

POST /api/auth/login
Request same as register. Response: `{ token }`.

## Profile
GET /api/profile
Response:
```json
{ "profile": { "age": 30, "gender": "MALE", ... } }
```

POST /api/profile
Request:
```json
{
  "age": 30,
  "gender": "MALE",
  "heightCm": 178,
  "weightKg": 78,
  "activityLevel": 1.4,
  "goal": "MAINTAIN",
  "dietaryPreferences": ["balanced"],
  "allergies": ["peanuts"]
}
```
Response: `{ profile, targets }`.

## Meals
GET /api/meals?start=YYYY-MM-DD&end=YYYY-MM-DD
Response: `{ meals: [...] }`

POST /api/meals
```json
{
  "items": [
    { "name": "Banana", "quantity": 1, "unit": "medium", "calories": 105, "protein": 1, "carbs": 27, "fat": 0 }
  ]
}
```
Response: `{ meal }`

DELETE /api/meals/:id -> `{ ok: true }`

## Analytics
GET /api/analytics/daily-summary
Response: `{ date, totals, targets, remaining }`

GET /api/analytics/progress
Response: `{ logs: [...] }`

## Plans (AI)
GET /api/plans -> `{ plans }`
POST /api/plans -> `{ plan }` (creates 1-day AI plan)

## Food & AI Parsing
GET /api/food/search?q=banana -> `{ items }`
POST /api/food/parse-text
```json
{ "text": "2 eggs and 1 banana" }
```
Response: `{ items: [...] }`

## Image Upload
POST /api/upload/image
`multipart/form-data` with `image` field. Response: `{ items: [...] }`.

## Notifications
GET /api/notifications -> `{ notifications }`
POST /api/notifications
```json
{ "type":"REMINDER", "content":"Drink water", "scheduledAt":"2025-08-27T10:00:00.000Z" }
```
Response: `{ notification }`

## AI Tips
GET /api/ai/tips -> `{ tips: ["...","...","..."] }`

