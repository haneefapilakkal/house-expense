# House Expense Tracking App

A premium, mobile-friendly web application for personal house expense tracking.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS 4, Lucide Icons
- **Backend**: Node.js, Express, Sequelize
- **Database**: PostgreSQL (Neon Tech)

## Setup & Run

### 1. Prerequisites
- Node.js (v18+)
- MySQL or PostgreSQL (Neon used for cloud)

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. The `.env` is already configured with your Neon cloud database.
4. `node server.js`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Cloud Deployment Guide

Follow these steps to deploy this application live:

### 1. Deploy the Backend to Render
1. Sign in to [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Link your GitHub repository `haneefapilakkal/house-expense`.
4. Use these settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_0uhMg8TenAPU@ep-super-morning-aomycxho.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: A secret key string.
6. Click **Deploy Web Service** and copy the resulting URL (e.g., `https://house-expense-backend.onrender.com`).

### 2. Deploy the Frontend to Vercel
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New** > **Project** and import `haneefapilakkal/house-expense`.
3. Set the following options:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://house-expense-backend.onrender.com/api`).
5. Click **Deploy**.

## Features
- Mobile-responsive dashboard
- Real-time expense stats
- Category-based filtering
- Premium dark-mode UI

