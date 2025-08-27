# NutriTracker - AI-Powered Nutrition & Calorie Tracking App

A comprehensive, full-stack nutrition tracking application powered by AI that helps users monitor their calorie intake, plan meals, and achieve their fitness goals through intelligent recommendations and automated food recognition.

## 🌟 Features

### Core Features
- **User Profile Management**: Complete profile setup with age, gender, weight, height, fitness goals, and dietary preferences
- **Calorie & Macro Tracking**: Log meals via text, image, or manual search with automatic nutrition calculation
- **AI Nutritional Planning**: Generate personalized meal plans based on user goals and preferences
- **Food Database & Image Recognition**: Comprehensive food database with AI-powered photo analysis
- **Progress Tracking & Analytics**: Track weight, measurements, and nutrition trends over time
- **Smart Recommendations**: AI-driven personalized tips and food suggestions

### AI-Powered Features
- **Food Recognition**: Upload photos of meals for automatic food identification and nutrition calculation
- **Text Analysis**: Describe meals in natural language for automated logging
- **Meal Plan Generation**: AI creates weekly meal plans tailored to individual goals
- **Personalized Recommendations**: Smart tips based on eating patterns and progress

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Interface**: Clean, modern UI with easy navigation
- **Real-time Updates**: Live nutrition summaries and progress tracking
- **Secure Authentication**: JWT-based authentication with encrypted data storage

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Chart.js** - Data visualization for progress tracking
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Sharp** - Image processing

### AI Integration
- **OpenAI GPT-4** - Natural language processing and meal planning
- **AI SDK** - Type-safe AI model integration
- **Custom AI Service** - Food recognition and nutritional analysis

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Git** - Version control

## 📁 Project Structure

```
nutrition-ai-tracker/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (root)/                   # Protected routes
│   │   └── dashboard/
│   │       ├── meals/
│   │       ├── meal-plans/
│   │       ├── progress/
│   │       └── settings/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── foods/
│   │   ├── meals/
│   │   ├── meal-plans/
│   │   ├── progress/
│   │   └── recommendations/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # React components
│   ├── auth/
│   ├── dashboard/
│   ├── meals/
│   └── ui/                      # Reusable UI components
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client
│   ├── auth.ts                  # Authentication utilities
│   ├── auth-context.tsx         # React context for auth
│   ├── ai-service.ts           # AI integration service
│   ├── mongodb.ts              # Database connection
│   └── utils.ts                # General utilities
├── models/                      # Database models
│   ├── User.ts
│   ├── Food.ts
│   ├── MealLog.ts
│   ├── MealPlan.ts
│   ├── Recipe.ts
│   └── Progress.ts
├── scripts/
│   └── seed-database.js        # Database seeding script
├── types/                      # TypeScript type definitions
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud instance)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nutrition-ai-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/nutrition-tracker
   JWT_SECRET=your-super-secret-jwt-key
   OPENAI_API_KEY=your-openai-api-key
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use Docker
   docker run -d -p 27017:27017 mongo:latest
   ```

5. **Seed the database (optional)**
   ```bash
   node scripts/seed-database.js
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### User Model
```typescript
interface User {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    weight: number; // kg
    height: number; // cm
    activityLevel: string;
    fitnessGoal: string;
    dietaryPreferences: string[];
    allergies: string[];
    dailyCalorieGoal: number;
    dailyProteinGoal: number;
    dailyCarbGoal: number;
    dailyFatGoal: number;
  };
  preferences: {
    units: 'metric' | 'imperial';
    notifications: object;
  };
}
```

### Food Model
```typescript
interface Food {
  name: string;
  brand?: string;
  category: string;
  nutrition: {
    calories: number; // per 100g
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    vitamins: object;
    minerals: object;
  };
  servingSizes: Array<{
    name: string;
    grams: number;
  }>;
  barcode?: string;
  isVerified: boolean;
}
```

### MealLog Model
```typescript
interface MealLog {
  userId: ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    foodId: ObjectId;
    quantity: number; // grams
    nutrition: object;
  }>;
  totalNutrition: object;
  notes?: string;
  imageUrl?: string;
  logMethod: 'manual' | 'image' | 'barcode';
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Foods
- `GET /api/foods` - Search foods
- `POST /api/foods` - Create new food
- `GET /api/foods/[id]` - Get food by ID
- `PUT /api/foods/[id]` - Update food
- `DELETE /api/foods/[id]` - Delete food

### Meals
- `GET /api/meals` - Get meal logs
- `POST /api/meals` - Log new meal
- `GET /api/meals/summary` - Get nutrition summary
- `POST /api/meals/analyze-image` - Analyze food image
- `POST /api/meals/analyze-text` - Analyze text description

### Meal Plans
- `GET /api/meal-plans` - Get meal plans
- `POST /api/meal-plans` - Generate meal plan
- `GET /api/meal-plans/[id]` - Get meal plan by ID

### Progress
- `GET /api/progress` - Get progress entries
- `POST /api/progress` - Log progress entry

### Recommendations
- `GET /api/recommendations` - Get AI recommendations

## 🤖 AI Integration

### Food Recognition
The app uses OpenAI's GPT-4 Vision (or similar models) to analyze food images:

```typescript
// Example API call
const result = await aiService.recognizeFood(imageBase64);
// Returns: { foods: [{ name, confidence, nutrition, estimatedWeight }] }
```

### Meal Plan Generation
AI generates personalized meal plans based on user preferences:

```typescript
const mealPlan = await aiService.generateMealPlan({
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 80,
  dietaryPreferences: ['vegetarian'],
  allergies: ['nuts'],
  daysCount: 7
});
```

### Nutritional Recommendations
Smart recommendations based on eating patterns:

```typescript
const tips = await aiService.getNutritionalTips(userProfile, recentLogs);
// Returns: ["Increase fiber intake", "Add more protein", ...]
```

## 🎨 UI/UX Features

### Color-Coded Nutrition
- **Green**: Calories
- **Red**: Protein
- **Blue**: Carbohydrates
- **Purple**: Fat

### Responsive Design
- Mobile-first approach
- Sidebar navigation on desktop
- Touch-friendly mobile interface
- Optimized for both portrait and landscape

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 🔒 Security Features

### Authentication
- JWT tokens with secure HTTP-only cookies
- Password hashing with bcrypt
- Protected API routes
- Session management

### Data Protection
- Input validation with Zod schemas
- XSS protection
- CSRF protection
- Rate limiting (can be added)

### Privacy
- Encrypted sensitive data
- No third-party data sharing
- Local data processing where possible
- GDPR compliance ready

## 📱 Mobile Optimization

### Features
- PWA capabilities (can be extended)
- Touch gestures
- Camera integration for food photos
- Offline functionality (planned)
- Push notifications (planned)

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### API Testing
Use the provided Postman collection or test manually:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","profile":{...}}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🚀 Deployment

### Environment Setup
1. Set production environment variables
2. Configure MongoDB connection
3. Set up OpenAI API access
4. Configure domain and SSL

### Deployment Options

#### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Traditional Hosting
```bash
npm run build
npm start
```

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Secret for JWT token signing
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `NEXT_PUBLIC_API_URL` - Public API URL
- `NODE_ENV` - Environment (development/production)

### Database Configuration
- MongoDB 4.4+ recommended
- Indexes automatically created
- Sample data available via seeding script

### AI Configuration
- OpenAI GPT-4 recommended for best results
- Rate limiting considerations
- Cost monitoring important for production

## 📈 Performance Optimization

### Frontend
- Next.js Image optimization
- Code splitting
- Lazy loading
- Caching strategies

### Backend
- Database indexing
- Query optimization
- Response compression
- CDN integration (planned)

### AI
- Response caching
- Batch processing
- Rate limiting
- Cost optimization

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use ESLint and Prettier
3. Write tests for new features
4. Document API changes
5. Follow semantic commit messages

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Maintain consistent naming conventions
- Add proper error handling

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check MongoDB is running
mongo --eval "db.adminCommand('ismaster')"

# Check connection string
echo $MONGODB_URI
```

#### API Key Issues
```bash
# Verify OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

#### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Performance Issues
- Monitor API response times
- Check database query performance
- Optimize image sizes
- Monitor AI API costs

## 📞 Support

### Documentation
- API documentation available at `/api/docs` (when implemented)
- Component documentation in Storybook (planned)
- Database schema documentation above

### Contact
- GitHub Issues for bugs and feature requests
- Email support (configure as needed)
- Community Discord (optional)

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Radix UI for accessible components
- Next.js team for the amazing framework
- MongoDB for the database solution
- All contributors and users

---

**Made with ❤️ for healthy living and smart nutrition tracking**