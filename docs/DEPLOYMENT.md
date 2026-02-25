# Deployment Guide - Group Live Location Tracking System

This guide explains how to deploy the application to a cloud provider like Render or Railway.

## 1. Database Setup
You need a hosted MySQL database. You can use services like:
- **Render** (Includes a managed MySQL option)
- **Aiven**
- **Clever Cloud**

Once created, note down your connection details:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Initialize the database by running the `database/schema.sql` script on your new hosted instance.

## 2. Prepare Code
1. Push your code to a GitHub repository.
2. Ensure you have the updated `server/index.js` which serves static files from the `client` folder.

## 3. Deploy to Render (Recommended)
1. Log in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:
   - `PORT`: `5000` (or leave default)
   - `DB_HOST`: (your cloud DB host)
   - `DB_USER`: (your cloud DB user)
   - `DB_PASSWORD`: (your cloud DB password)
   - `DB_NAME`: (your cloud DB name)
   - `JWT_SECRET`: (a random strong string)
6. Click **Create Web Service**.

## 4. Accessing the App
Once deployed, Render will provide a URL (e.g., `https://group-tracker.onrender.com`).
You can simply navigate to this URL to use the application! The backend will automatically serve the login page.

---
*Note: Make sure to update your production URL in any external integrations if necessary.*
