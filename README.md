# SocialSphere - Full Stack Social Media App

SocialSphere is a premium, responsive full-stack social media application. Built using React.js for the frontend, Node.js and Express.js for the backend REST APIs, and MongoDB for database storage, it features a glassmorphic design system with complete Dark/Light mode toggle support, multipart file uploads, and robust JWT session security.

---


<img width="1826" height="1043" alt="Screenshot 2026-07-06 004016" src="https://github.com/user-attachments/assets/c0b87f5c-dc3c-412f-8ac2-54a9d2924a18" />

<img width="1852" height="977" alt="image" src="https://github.com/user-attachments/assets/bea19fa1-1536-4542-b1a7-90cbf9a8636a" />


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


