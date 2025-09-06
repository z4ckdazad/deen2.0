# DeenVerse Backend API

A comprehensive backend system for the DeenVerse Islamic Learning Platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user profiles with Islamic profiles and specializations
- **Imaam Directory**: Search and connect with verified Islamic teachers
- **Community Feed**: Posts, comments, likes, and social interactions
- **Real-time Notifications**: System for user notifications and alerts
- **File Upload**: Profile pictures and media uploads via Cloudinary
- **Email Services**: Welcome emails, password reset, and verification
- **Security**: Rate limiting, input validation, and security headers
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB 4.4 or higher
- Cloudinary account (for file uploads)
- Email service (Gmail, SendGrid, etc.)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/deenverse
   MONGODB_TEST_URI=mongodb://localhost:27017/deenverse_test
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-refresh-secret-key-here
   JWT_REFRESH_EXPIRE=30d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/health`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/          # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   └── server.js            # Main server file
├── tests/                   # Test files
├── package.json
├── jest.config.js
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/picture` - Upload profile picture
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users (with pagination)
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/unfollow` - Unfollow a user

### Imaam
- `GET /api/imaam` - Get list of verified Imaam
- `GET /api/imaam/featured` - Get featured Imaam
- `GET /api/imaam/search` - Search Imaam
- `GET /api/imaam/:id` - Get Imaam by ID
- `POST /api/imaam/:id/connect` - Request connection with Imaam
- `GET /api/imaam/connections/requests` - Get connection requests
- `POST /api/imaam/connections/:id/accept` - Accept connection request
- `POST /api/imaam/connections/:id/reject` - Reject connection request

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get all posts
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/search` - Search posts
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/unlike` - Unlike a post

### Comments
- `POST /api/comments` - Create new comment
- `GET /api/comments/post/:postId` - Get comments for post
- `GET /api/comments/:id` - Get comment by ID
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like a comment
- `DELETE /api/comments/:id/unlike` - Unlike a comment

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Joi schema validation
- **Security Headers**: Helmet.js for security headers
- **CORS**: Cross-origin resource sharing configuration
- **Request Sanitization**: XSS and injection protection
- **File Upload Security**: File type and size validation

## 📊 Database Models

### User
- Personal information (name, email, bio)
- Islamic profile and specializations
- Role-based access (student, imaam, admin)
- Profile picture and social links
- Rating and experience (for Imaam)

### Post
- Content and media
- Post types (general, question, lesson, etc.)
- Engagement metrics (likes, comments, shares)
- Visibility settings
- Tags and categories

### Comment
- Nested comments (replies)
- Like system
- Mention support
- Status management

### Connection
- User connections and relationships
- Connection types (student-teacher, peer)
- Request/accept workflow
- Status tracking

### Notification
- Real-time notifications
- Different notification types
- Read/unread status
- Action data for frontend

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
EMAIL_HOST=your-email-host
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Authentication and user management
- Imaam directory and connections
- Community feed and posts
- Comments and notifications
- File upload and email services
