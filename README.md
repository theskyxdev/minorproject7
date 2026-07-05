# SocialSphere - Full Stack Social Media App

SocialSphere is a premium, responsive full-stack social media application. Built using React.js for the frontend, Node.js and Express.js for the backend REST APIs, and MongoDB for database storage, it features a glassmorphic design system with complete Dark/Light mode toggle support, multipart file uploads, and robust JWT session security.

---

## Features Implemented

### 1. User Authentication & Security
- **Registration & Login**: Secure sign-up and sign-in views with client and server-side validation.
- **Password Strength Checks**: Form validates password lengths (minimum 6 characters).
- **JWT Session Persistence**: Signed JSON Web Tokens are saved in client `localStorage` and sent inside authorization headers (`Bearer <token>`).
- **Route Guarding**: Private pages (Feed, Profiles) redirect unauthenticated users back to the Login page.

### 2. User Profiles
- **Profile Page**: Displays username, contact email, bio, followers count, following count, and post metrics.
- **Edit Bio**: User can modify their username (ensures uniqueness checks) and bio text.
- **Profile Picture Upload**: Users can upload/change avatar images which are stored on the server via `multer` and served statically.

### 3. Post Feed & Creation
- **Feed Page**: View all posts from all users in reverse-chronological order.
- **Rich Post Creation**: Write text-based posts and upload images concurrently.
- **Inline Post Box**: Fast text + image uploading box situated at the top of the feed page.
- **Edit & Delete Posts**: Author constraints allow users to modify or delete their own posts. Deleting posts cleans up attached images from the server storage.

### 4. Interactive Engagement
- **Likes System**: Users can like/unlike posts dynamically. Heart icon highlights are updated in real-time.
- **Comments System**: Collaspible comments drawers let users add comments to any post, view comment list with avatars, and authorize comment authors and post authors to delete comments.
- **Follow System**: Users can follow or unfollow other accounts, updating feed suggestions and profile statistics.

### 5. Responsive UI/UX (Premium Aesthetics)
- **Glassmorphism Design**: Translucent elements with frosted glass filters, glowing outlines, and micro-animations.
- **Shimmer Skeletons**: Displays clean animated shimmer blocks during loading stages.
- **Toast Notifications**: Built-in self-dismissing toast alerts for successes, errors, or warnings.
- **Universal Responsiveness**: Fully responsive Grid & Flexbox system scaling across Mobile, Tablet, and Desktop layouts.
- **Dark/Light Mode**: User-driven theme toggle saved locally to persist across visits.

---

## Technologies Used

### Frontend
- **React.js**: Single Page App routing and hooks management.
- **Vite**: Rapid hot-reloading development server and bundler.
- **React Router Dom**: Dynamic page routing.
- **Lucide React**: Modern svg iconography.

### Backend
- **Node.js & Express.js**: REST API server and multipart request parser.
- **MongoDB & Mongoose**: Object-document database and schemas mapping.
- **jsonwebtoken (JWT)**: Security token signing and verification.
- **bcryptjs**: Password hashing.
- **multer**: File upload storage.

---

## Installation & Setup Guide

### Prerequisites
- Node.js installed (v18.0.0 or higher recommended).
- MongoDB installed locally and running on port `27017` (or access to a MongoDB Atlas URL).

### Step 1: Clone or Open the Repository
Unpack the files and verify the structure:
```
social-media-app/
├── backend/
└── frontend/
```

### Step 2: Configure Environment Variables
Create a file named `.env` in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/social_media_db
JWT_SECRET=super_secret_key_12345
```

### Step 3: Run the Backend
Open a terminal in the `backend/` folder:
```bash
# Install backend packages
npm install

# Start backend server
node server.js
```
The console will display:
* `Server running in development mode on port 5000`
* `MongoDB Connected: localhost`

### Step 4: Run the Frontend
Open a separate terminal in the `frontend/` folder:
```bash
# Install frontend packages
npm install

# Run Vite dev server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## API Documentation

### 1. Authentication
* `POST /api/auth/register` - Register a new account.
  - Body: `{ "username": "...", "email": "...", "password": "..." }`
* `POST /api/auth/login` - Sign in.
  - Body: `{ "email": "...", "password": "..." }`
* `GET /api/auth/me` - Retrieve current user details (Header token required).

### 2. User Profiles
* `GET /api/users` - Get suggestions list of other users.
* `GET /api/users/:id` - Get user details, bio, follow metrics, and user posts.
* `PUT /api/users/profile` - Update bio / username text.
  - Body: `{ "username": "...", "bio": "..." }`
* `POST /api/users/profile/picture` - Upload multipart avatar (`image` field).
* `POST /api/users/:id/follow` - Toggle follow/unfollow status.

### 3. Posts
* `POST /api/posts` - Create post. Supports multipart forms with content and optional `image` file.
* `GET /api/posts` - Get all posts feed.
* `GET /api/posts/:id` - Get single post by ID.
* `PUT /api/posts/:id` - Edit post content (Author only).
  - Body: `{ "content": "..." }`
* `DELETE /api/posts/:id` - Delete post and remove static asset (Author only).
* `POST /api/posts/:id/like` - Toggle like/unlike status.
* `POST /api/posts/:id/comment` - Append a comment.
  - Body: `{ "content": "..." }`
* `DELETE /api/posts/:id/comment/:commentId` - Delete a comment (Author / Post Owner only).
