# NutriTracker API Documentation

This document provides comprehensive documentation for all API endpoints in the NutriTracker application.

## Base URL
```
http://localhost:3000/api  (Development)
https://yourdomain.com/api  (Production)
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are also automatically included via HTTP-only cookies when using the web interface.

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "message": "Success message",
  "data": {...},
  "user": {...},
  "token": "jwt-token"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [...] // Optional validation details
}
```

## Authentication Endpoints

### Register User
Create a new user account with complete profile information.

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 28,
    "gender": "male",
    "weight": 75,
    "height": 180,
    "activityLevel": "moderately_active",
    "fitnessGoal": "weight_loss",
    "dietaryPreferences": ["vegetarian"],
    "allergies": ["nuts"]
  }
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "profile": {...},
    "preferences": {...}
  },
  "token": "jwt_token"
}
```

**Validation Rules:**
- Email must be valid and unique
- Password minimum 6 characters
- Age between 1-120
- Weight and height must be positive numbers

### Login User
Authenticate user and return JWT token.

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {...},
  "token": "jwt_token"
}
```

### Logout User
Invalidate the current session.

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User
Retrieve current user profile information.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "profile": {...},
    "preferences": {...}
  }
}
```

## Food Management Endpoints

### Search Foods
Search the food database with optional filters.

**Endpoint:** `GET /api/foods`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Food category filter
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20)

**Example:**
```
GET /api/foods?q=apple&category=fruits&page=1&limit=10
```

**Response:**
```json
{
  "foods": [
    {
      "_id": "food_id",
      "name": "Apple",
      "brand": "Generic",
      "category": "fruits",
      "nutrition": {
        "calories": 52,
        "protein": 0.3,
        "carbs": 14,
        "fat": 0.2,
        "fiber": 2.4,
        "sugar": 10,
        "sodium": 1
      },
      "servingSizes": [
        {
          "name": "Medium apple",
          "grams": 182
        }
      ],
      "isVerified": true,
      "tags": ["fresh", "raw", "healthy"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Create Food
Add a new food item to the database.

**Endpoint:** `POST /api/foods`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Custom Food",
  "brand": "Brand Name",
  "category": "protein",
  "nutrition": {
    "calories": 150,
    "protein": 25,
    "carbs": 5,
    "fat": 5,
    "fiber": 2,
    "sugar": 1,
    "sodium": 200
  },
  "servingSizes": [
    {
      "name": "1 serving",
      "grams": 100
    }
  ],
  "tags": ["high-protein", "low-carb"]
}
```

**Response:**
```json
{
  "message": "Food created successfully",
  "food": {...}
}
```

### Get Food by ID
Retrieve detailed information about a specific food item.

**Endpoint:** `GET /api/foods/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "food": {
    "_id": "food_id",
    "name": "Food Name",
    // ... full food object
  }
}
```

### Update Food
Update an existing food item (only by creator).

**Endpoint:** `PUT /api/foods/{id}`

**Headers:** `Authorization: Bearer <token>`

**Body:** Same as Create Food

**Response:**
```json
{
  "message": "Food updated successfully",
  "food": {...}
}
```

### Delete Food
Remove a food item from the database (only by creator).

**Endpoint:** `DELETE /api/foods/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Food deleted successfully"
}
```

## Meal Logging Endpoints

### Get Meal Logs
Retrieve user's meal logs with optional date filtering.

**Endpoint:** `GET /api/meals`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date` (string): Specific date (YYYY-MM-DD)
- `startDate` (string): Start of date range
- `endDate` (string): End of date range
- `page` (number): Page number
- `limit` (number): Results per page

**Example:**
```
GET /api/meals?date=2024-01-15
GET /api/meals?startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "meals": [
    {
      "_id": "meal_id",
      "date": "2024-01-15T12:00:00.000Z",
      "mealType": "lunch",
      "foods": [
        {
          "foodId": {
            "_id": "food_id",
            "name": "Chicken Breast",
            "brand": "Generic"
          },
          "quantity": 150,
          "nutrition": {
            "calories": 248,
            "protein": 46.5,
            "carbs": 0,
            "fat": 5.4
          }
        }
      ],
      "totalNutrition": {
        "calories": 248,
        "protein": 46.5,
        "carbs": 0,
        "fat": 5.4,
        "fiber": 0,
        "sugar": 0,
        "sodium": 111
      },
      "notes": "Grilled with herbs",
      "logMethod": "manual"
    }
  ],
  "pagination": {...}
}
```

### Log New Meal
Create a new meal log entry.

**Endpoint:** `POST /api/meals`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "date": "2024-01-15T12:00:00.000Z",
  "mealType": "lunch",
  "foods": [
    {
      "foodId": "food_id_1",
      "quantity": 150
    },
    {
      "foodId": "food_id_2",
      "quantity": 100
    }
  ],
  "notes": "Optional notes",
  "imageUrl": "optional_image_url",
  "logMethod": "manual"
}
```

**Response:**
```json
{
  "message": "Meal logged successfully",
  "meal": {...}
}
```

### Get Nutrition Summary
Get daily nutrition summary with goals comparison.

**Endpoint:** `GET /api/meals/summary`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `date` (string): Date for summary (default: today)

**Response:**
```json
{
  "date": "2024-01-15",
  "totalNutrition": {
    "calories": 1850,
    "protein": 120,
    "carbs": 180,
    "fat": 65,
    "fiber": 25,
    "sugar": 45,
    "sodium": 2100
  },
  "goals": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fat": 70
  },
  "remaining": {
    "calories": 150,
    "protein": 30,
    "carbs": 20,
    "fat": 5
  },
  "percentages": {
    "calories": 93,
    "protein": 80,
    "carbs": 90,
    "fat": 93
  },
  "mealsByType": {
    "breakfast": [...],
    "lunch": [...],
    "dinner": [...],
    "snack": [...]
  },
  "totalMeals": 4
}
```

### Analyze Food Image
Use AI to analyze a food image and extract nutritional information.

**Endpoint:** `POST /api/meals/analyze-image`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "imageBase64": "base64_encoded_image_data",
  "mealType": "lunch"
}
```

**Response:**
```json
{
  "message": "Image analyzed successfully",
  "result": {
    "foods": [
      {
        "name": "Grilled Chicken Breast",
        "confidence": 0.95,
        "estimatedWeight": 150,
        "nutrition": {
          "calories": 248,
          "protein": 46.5,
          "carbs": 0,
          "fat": 5.4
        }
      }
    ],
    "description": "A grilled chicken breast with herbs"
  },
  "suggestedMealType": "lunch"
}
```

### Analyze Text Description
Use AI to parse a text description of food and extract nutritional information.

**Endpoint:** `POST /api/meals/analyze-text`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "description": "grilled chicken breast with rice and broccoli",
  "mealType": "dinner"
}
```

**Response:**
```json
{
  "message": "Text analyzed successfully",
  "result": {
    "foods": [
      {
        "name": "Grilled Chicken Breast",
        "confidence": 0.9,
        "estimatedWeight": 150,
        "nutrition": {...}
      },
      {
        "name": "White Rice",
        "confidence": 0.85,
        "estimatedWeight": 100,
        "nutrition": {...}
      }
    ],
    "description": "Parsed meal containing chicken, rice, and vegetables"
  }
}
```

## Meal Plans Endpoints

### Get Meal Plans
Retrieve user's meal plans.

**Endpoint:** `GET /api/meal-plans`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `active` (boolean): Filter active meal plans only
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "mealPlans": [
    {
      "_id": "plan_id",
      "name": "Weekly Weight Loss Plan",
      "description": "7-day plan for healthy weight loss",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-21T23:59:59.999Z",
      "isActive": true,
      "meals": [...],
      "weeklyNutritionGoals": {
        "calories": 14000,
        "protein": 1050,
        "carbs": 1400,
        "fat": 490
      },
      "generatedBy": "ai"
    }
  ],
  "pagination": {...}
}
```

### Generate Meal Plan
Create a new AI-generated meal plan.

**Endpoint:** `POST /api/meal-plans`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "My Custom Meal Plan",
  "description": "Personalized meal plan for muscle gain",
  "daysCount": 7,
  "startDate": "2024-01-15T00:00:00.000Z",
  "preferences": {
    "dietaryRestrictions": ["vegetarian"],
    "excludedFoods": ["nuts", "dairy"],
    "maxPrepTime": 45,
    "budgetRange": {
      "min": 0,
      "max": 100
    },
    "cuisinePreferences": ["mediterranean", "asian"]
  }
}
```

**Response:**
```json
{
  "message": "Meal plan generated successfully",
  "mealPlan": {...},
  "generatedData": {
    "meals": [...],
    "totalNutrition": {...},
    "shoppingList": [...]
  }
}
```

## Progress Tracking Endpoints

### Get Progress Entries
Retrieve user's progress tracking data.

**Endpoint:** `GET /api/progress`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `startDate` (string): Start date for data range
- `endDate` (string): End date for data range
- `days` (number): Number of recent days (default: 30)
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "progress": [
    {
      "_id": "progress_id",
      "date": "2024-01-15T00:00:00.000Z",
      "weight": 75.5,
      "bodyMeasurements": {
        "waist": 85,
        "chest": 100,
        "arms": 35
      },
      "bodyFat": 15.2,
      "mood": "good",
      "energyLevel": 4,
      "workoutCompleted": true,
      "waterIntake": 2500,
      "sleepHours": 7.5,
      "notes": "Feeling great today!"
    }
  ],
  "trends": {
    "weight": {
      "change": -2.3,
      "direction": "decreasing"
    },
    "averageMood": 4.2,
    "averageEnergyLevel": 3.8,
    "workoutFrequency": 85
  },
  "pagination": {...}
}
```

### Log Progress Entry
Create or update a progress entry for a specific date.

**Endpoint:** `POST /api/progress`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "weight": 75.5,
  "bodyMeasurements": {
    "waist": 85,
    "chest": 100,
    "hips": 95,
    "arms": 35,
    "thighs": 60
  },
  "bodyFat": 15.2,
  "muscleMass": 65.3,
  "photos": ["photo_url_1", "photo_url_2"],
  "notes": "Great workout today",
  "mood": "excellent",
  "energyLevel": 5,
  "workoutCompleted": true,
  "waterIntake": 2500,
  "sleepHours": 8
}
```

**Response:**
```json
{
  "message": "Progress logged successfully",
  "progress": {...}
}
```

## Recommendations Endpoint

### Get AI Recommendations
Retrieve personalized AI-generated recommendations based on recent activity.

**Endpoint:** `GET /api/recommendations`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "recommendations": {
    "aiTips": [
      "Consider increasing your protein intake to support muscle recovery",
      "Add more colorful vegetables to increase micronutrient density",
      "Your fiber intake is excellent - keep it up!"
    ],
    "personalizedTips": [
      "You're eating fewer calories than your goal. Consider adding healthy snacks.",
      "Include more fiber-rich foods to support digestion and satiety.",
      "Focus on high-volume, low-calorie foods like vegetables and lean proteins."
    ],
    "foodSuggestions": [
      "chicken breast",
      "quinoa",
      "broccoli",
      "almonds",
      "salmon",
      "sweet potato"
    ],
    "goalProgress": {
      "onTrack": false,
      "areas": ["calories", "protein"]
    }
  },
  "nutritionalAnalysis": {
    "weeklyAverage": {
      "calories": 1850,
      "protein": 120,
      "carbs": 180,
      "fat": 65
    },
    "dailyGoals": {
      "calories": 2000,
      "protein": 150,
      "carbs": 200,
      "fat": 70
    },
    "adherenceRate": 87
  }
}
```

## Error Codes

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

### Common Error Responses

#### Validation Error (400)
```json
{
  "error": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "age",
      "message": "Age must be between 1 and 120"
    }
  ]
}
```

#### Authentication Error (401)
```json
{
  "error": "Unauthorized"
}
```

#### Not Found Error (404)
```json
{
  "error": "Food not found"
}
```

#### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Search endpoints**: 60 requests per minute per user
- **AI endpoints**: 10 requests per minute per user
- **Other endpoints**: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642684800
```

## Testing Examples

### Using cURL

#### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "profile": {
      "firstName": "Test",
      "lastName": "User",
      "age": 25,
      "gender": "male",
      "weight": 70,
      "height": 175,
      "activityLevel": "moderately_active",
      "fitnessGoal": "maintenance"
    }
  }'
```

#### Search for foods:
```bash
curl -X GET "http://localhost:3000/api/foods?q=apple" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Log a meal:
```bash
curl -X POST http://localhost:3000/api/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "date": "2024-01-15T12:00:00.000Z",
    "mealType": "lunch",
    "foods": [
      {
        "foodId": "FOOD_ID",
        "quantity": 150
      }
    ],
    "logMethod": "manual"
  }'
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Search foods
const foodsResponse = await fetch('/api/foods?q=chicken', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { foods } = await foodsResponse.json();
```

## Webhooks (Future Enhancement)

Future versions may include webhook support for:

- User registration events
- Meal logging notifications
- Goal achievement alerts
- Progress milestones

Webhook format:
```json
{
  "event": "meal.logged",
  "userId": "user_id",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "data": {...}
}
```

## SDK and Libraries

Official SDKs and client libraries are planned for:

- JavaScript/TypeScript
- Python
- Swift (iOS)
- Kotlin (Android)
- React Native

## Support

For API support:
- GitHub Issues: Bug reports and feature requests
- Email: api-support@nutritracker.com
- Documentation: Always refer to latest version
- Status Page: api-status.nutritracker.com

---

**Last Updated:** January 2024  
**API Version:** v1.0  
**Documentation Version:** 1.0