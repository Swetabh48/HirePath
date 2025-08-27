# NutriTracker Setup Guide

This guide will walk you through setting up the NutriTracker application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or cloud service like MongoDB Atlas)
- **Git** (for version control)

### Recommended Tools
- **Visual Studio Code** (with TypeScript and React extensions)
- **MongoDB Compass** (for database visualization)
- **Postman** (for API testing)

## Step 1: Clone and Setup Project

### 1.1 Clone the Repository
```bash
git clone <your-repo-url>
cd nutrition-ai-tracker
```

### 1.2 Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- MongoDB/Mongoose
- Authentication libraries
- AI SDK and OpenAI integration

## Step 2: Database Setup

### Option A: Local MongoDB

#### 2.1 Install MongoDB
**On macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**On Ubuntu:**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

**On Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

#### 2.2 Start MongoDB
```bash
# macOS/Linux
sudo systemctl start mongod

# Or using Homebrew on macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

#### 2.3 Verify Installation
```bash
mongosh
# Should connect to MongoDB shell
```

### Option B: MongoDB Atlas (Cloud)

#### 2.1 Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster

#### 2.2 Configure Network Access
1. Go to "Network Access" in Atlas dashboard
2. Add your IP address (or 0.0.0.0/0 for development)

#### 2.3 Create Database User
1. Go to "Database Access"
2. Create a new user with read/write permissions
3. Note the username and password

#### 2.4 Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

## Step 3: Environment Configuration

### 3.1 Create Environment File
```bash
cp .env.example .env.local
```

### 3.2 Configure Environment Variables

Edit `.env.local` with your settings:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nutrition-tracker
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/nutrition-tracker

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your-openai-api-key-here

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NODE_ENV=development

# Optional: Additional Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=another-secret-key
```

### 3.3 Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your environment file

**Note:** OpenAI charges for API usage. Monitor your usage to avoid unexpected costs.

## Step 4: Database Seeding (Optional)

### 4.1 Seed Sample Data
```bash
node scripts/seed-database.js
```

This will populate your database with:
- Sample foods (fruits, vegetables, proteins, grains)
- Restaurant items
- Fast food examples
- Nutritional information

### 4.2 Verify Data
Connect to your database and check:
```javascript
// In MongoDB shell
use nutrition-tracker
db.foods.countDocuments()
// Should show the number of seeded foods
```

## Step 5: Running the Application

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Access the Application
Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **API Health Check:** http://localhost:3000/api/auth/me (should return 401 Unauthorized)

### 5.3 Verify Everything Works
1. Visit the home page
2. Click "Get Started" to register
3. Fill out the registration form
4. Log in with your credentials
5. Try logging a meal

## Step 6: Testing the Setup

### 6.1 Test User Registration
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

### 6.2 Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 6.3 Test Food Search
```bash
# Replace TOKEN with the token from login response
curl -X GET "http://localhost:3000/api/foods?q=apple" \
  -H "Authorization: Bearer TOKEN"
```

## Step 7: Development Tools Setup

### 7.1 VS Code Extensions
Install these recommended extensions:
- TypeScript Hero
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- Thunder Client (API testing)

### 7.2 Database Visualization
Install MongoDB Compass:
1. Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your MongoDB URI
3. Browse the `nutrition-tracker` database

## Step 8: Production Deployment

### 8.1 Build for Production
```bash
npm run build
```

### 8.2 Environment for Production
Create `.env.production` with production values:
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=a-very-secure-production-secret
OPENAI_API_KEY=your-production-openai-key
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

### 8.3 Deployment Options

#### Vercel (Recommended)
1. Push code to GitHub
2. Connect Vercel to your repository
3. Set environment variables in Vercel dashboard
4. Deploy

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

#### Traditional VPS
```bash
# On your server
git clone <your-repo>
cd nutrition-ai-tracker
npm ci --only=production
npm run build
npm start
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check connection string
echo $MONGODB_URI

# Test connection manually
mongosh $MONGODB_URI
```

#### 2. OpenAI API Errors
```bash
# Verify API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check quota/billing
# Visit OpenAI dashboard
```

#### 3. Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 4. Permission Errors
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

### Development Issues

#### Hot Reload Not Working
```bash
# Restart development server
npm run dev

# Check for file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

#### Database Schema Changes
```bash
# If you modify models, restart the server
# MongoDB is schemaless, but Mongoose validation applies
```

### Performance Issues

#### Slow AI Responses
- Check OpenAI API status
- Implement response caching
- Consider using smaller models for development

#### Database Performance
```javascript
// Add indexes in MongoDB shell
db.foods.createIndex({ name: "text", brand: "text" })
db.meallogs.createIndex({ userId: 1, date: 1 })
```

## Additional Configuration

### 8.1 Email Setup (Optional)
For notifications and password reset:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 8.2 File Upload (Optional)
For image storage in production:
```env
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

### 8.3 Analytics (Optional)
```env
GOOGLE_ANALYTICS_ID=your-ga-id
MIXPANEL_TOKEN=your-mixpanel-token
```

## Security Checklist

- [ ] Change default JWT secrets
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Monitor API key usage
- [ ] Backup database regularly

## Next Steps

After successful setup:

1. **Customize the App**
   - Update branding and colors
   - Modify user registration fields
   - Add custom food categories

2. **Extend Features**
   - Add social sharing
   - Implement workout tracking
   - Create mobile app
   - Add barcode scanning

3. **Production Optimization**
   - Set up monitoring
   - Implement caching
   - Add error tracking
   - Performance optimization

4. **Business Features**
   - Payment integration
   - Premium features
   - Admin dashboard
   - User analytics

## Support

If you encounter issues:

1. Check this guide first
2. Review error logs in console
3. Check database connections
4. Verify environment variables
5. Test API endpoints manually
6. Create GitHub issue with details

Happy coding! 🚀