# AI-Enhanced SEO Content Recommendation Tool

An intelligent content optimization platform that helps content creators improve their SEO scores using AI-powered analysis and recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 🚀 Features

- **AI-Powered SEO Analysis**: Get comprehensive SEO scores and recommendations using OpenAI GPT
- **Rich Text Editor**: Create and edit content with Draft.js editor
- **Real-time Metrics**: Word count, reading time, and keyword density tracking
- **Keyword Suggestions**: AI-generated keyword recommendations with relevance scores
- **Revision History**: Track changes and compare different versions
- **Improvement Tracking**: Monitor SEO score improvements over time
- **Responsive Dashboard**: Beautiful, mobile-friendly interface

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account (free tier available)
- OpenAI API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/seo-content-tool.git
cd seo-content-tool
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seo-content-tool?retryWrites=true&w=majority

# JWT Secret Key (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

### 3. Set up the Frontend

```bash
cd ../client
npm install
```

### 4. Seed the Database (Optional)

```bash
cd ../server
npm run seed
```

This creates a demo account:
- Email: `demo@example.com`
- Password: `demo123`

## 🚀 Running the Application

### Development Mode

Start the backend server:
```bash
cd server
npm run dev
```

Start the frontend (in a new terminal):
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Production Mode

Build the frontend:
```bash
cd client
npm run build
```

Start the server:
```bash
cd server
npm start
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Content Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/content` | Create new draft |
| GET | `/api/content` | Get all user drafts |
| GET | `/api/content/:id` | Get single draft |
| PUT | `/api/content/:id` | Update draft |
| DELETE | `/api/content/:id` | Delete draft |
| GET | `/api/content/stats` | Get user statistics |

### SEO Analysis Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/seo/analyze/:contentId` | Analyze content with AI |
| GET | `/api/seo/analysis/:contentId` | Get latest analysis |
| GET | `/api/seo/keywords/:contentId` | Get keyword suggestions |
| POST | `/api/seo/apply-suggestion` | Apply AI suggestion |
| GET | `/api/seo/history/:contentId` | Get analysis history |
| POST | `/api/seo/outline` | Generate content outline |

### Revision Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/revisions/:contentId` | Get revision history |
| GET | `/api/revisions/compare/:v1/:v2` | Compare two versions |
| POST | `/api/revisions/:contentId` | Save new revision |
| POST | `/api/revisions/restore/:revisionId` | Restore from revision |

## 🏗️ Project Structure

```
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Auth/           # Login & Register
│       │   ├── Dashboard/      # Main dashboard
│       │   ├── Editor/         # Content editor
│       │   ├── Content/        # Content list
│       │   ├── SEO/            # SEO analysis
│       │   ├── History/        # Revision history
│       │   └── common/         # Shared components
│       ├── context/            # React Context
│       └── services/           # API services
│
├── server/                     # Node.js Backend
│   ├── config/                 # DB & API config
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth & error handling
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   └── seeds/                  # Sample data
│
└── docs/                       # Documentation
```

## 🔧 Environment Variables

### Server (.env)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `OPENAI_API_KEY` | OpenAI API key |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Environment (development/production) |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the GPT API
- [Draft.js](https://draftjs.org/) for the rich text editor
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [Lucide Icons](https://lucide.dev/) for beautiful icons

---

Made with ❤️ by Your Name
