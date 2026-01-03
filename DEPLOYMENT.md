# Free Deployment Guide

This guide covers free deployment options for the Intelligent Irrigation Controller system.

## Deployment Architecture

```
┌─────────────┐
│   ESP32     │───HTTP───► Backend (Render/Railway)
│  (Hardware) │              │
└─────────────┘              │ WebSocket
                             │
                    ┌────────▼────────┐
                    │  Frontend       │
                    │  (Netlify/Vercel)│
                    └─────────────────┘
```

## Option 1: Render (Recommended - Easiest)

### Backend Deployment on Render

1. **Create a Render Account**
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Prepare for Deployment**
   - Push your code to GitHub
   - Create `render.yaml` in project root (see below)

3. **Deploy Backend**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repository
   - Settings:
     - **Name**: irrigation-backend
     - **Environment**: Python 3
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && python app.py`
     - **Environment Variables**:
       - `PORT`: 5000 (Render sets this automatically)
   - Click "Create Web Service"

4. **Update Backend Code for Render**
   - Render uses dynamic PORT, update `backend/app.py` (see below)

### Frontend Deployment on Netlify

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub (free)

2. **Deploy Frontend**
   - Go to Netlify Dashboard → Add new site → Import from Git
   - Connect GitHub repository
   - Settings:
     - **Base directory**: `frontend`
     - **Build command**: (leave empty - static site)
     - **Publish directory**: `frontend`
   - Click "Deploy"

3. **Update Frontend Config**
   - Update `frontend/js/config.js` with your Render backend URL

---

## Option 2: Railway (Alternative)

### Backend on Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub (free $5/month credit)

2. **Deploy**
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository
   - Railway auto-detects Python
   - Add environment variable: `PORT=5000`
   - Update `backend/app.py` to use `PORT` env variable

### Frontend on Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub (free)

2. **Deploy**
   - Import GitHub repository
   - Root directory: `frontend`
   - Framework: Other (static)
   - Deploy

---

## Required Code Changes

### 1. Update backend/app.py for Production

Add this at the end of `backend/app.py`:

```python
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    host = '0.0.0.0'
    
    print(f"Starting Intelligent Irrigation Controller API Server...")
    print(f"Server running on http://{host}:{port}")
    socketio.run(app, host=host, port=port, debug=False)
```

### 2. Update frontend/js/config.js

Replace `localhost:5000` with your deployed backend URL:

```javascript
const CONFIG = {
    API_URL: 'https://irrigation-backend.onrender.com',  // Your Render URL
    WS_URL: 'https://irrigation-backend.onrender.com',   // Same URL
    // ... rest of config
};
```

### 3. Update ESP32 Firmware

In `firmware/main/main.cpp`, update:

```cpp
const char* server_url = "https://irrigation-backend.onrender.com/api/sensor-data";
```

---

## Option 3: All-in-One on PythonAnywhere (Simplest)

PythonAnywhere offers free hosting with some limitations.

### Setup

1. **Create Account**
   - Go to https://www.pythonanywhere.com
   - Sign up (free tier available)

2. **Upload Code**
   - Go to Files tab
   - Upload your project files
   - Or use Git: `git clone https://github.com/yourusername/agriculture.git`

3. **Configure Web App**
   - Go to Web tab → Add a new web app
   - Choose Flask
   - Set source code directory: `/home/yourusername/agriculture/backend`
   - Set WSGI file: `/var/www/yourusername_pythonanywhere_com_wsgi.py`

4. **Install Dependencies**
   - Go to Bash console
   - Run: `pip3.10 install --user -r backend/requirements.txt`

5. **Configure WSGI File**
   - Edit WSGI file:
   ```python
   import sys
   path = '/home/yourusername/agriculture/backend'
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```

6. **Serve Frontend**
   - Upload frontend files to `/home/yourusername/mysite/static/`
   - Or use Static Files mapping in Web tab

**Note**: Free tier has limitations (limited CPU time, no custom domains on free tier)

---

## Option 4: GitHub Pages (Frontend Only) + Free Backend

### Frontend on GitHub Pages

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch
   - Branch: `main` / `master`
   - Folder: `/frontend`

2. **Update Config**
   - Update `frontend/js/config.js` with your backend URL

### Backend Options
- Use Render, Railway, or PythonAnywhere (see above)

---

## Database Options (If Needed)

If you want persistent data storage:

### Free PostgreSQL Databases

1. **Supabase** (https://supabase.com)
   - Free tier: 500 MB database
   - Includes REST API

2. **Neon** (https://neon.tech)
   - Free tier: 3 GB storage
   - Serverless PostgreSQL

3. **ElephantSQL** (https://www.elephantsql.com)
   - Free tier: 20 MB database

### Update Backend for Database

Replace in-memory storage with SQLAlchemy + PostgreSQL (see `backend/models.py` for structure)

---

## Free Tier Limitations

### Render
- Free tier: Services spin down after 15 minutes of inactivity
- Cold start: ~30 seconds when waking up
- 750 hours/month free

### Railway
- $5/month credit (usually enough for small projects)
- Auto-scales, no cold starts

### Netlify/Vercel
- 100 GB bandwidth/month (free)
- Perfect for static frontends

### PythonAnywhere
- Limited CPU time on free tier
- No custom domain (free tier)
- Good for testing/dev

---

## Recommended Setup (Best Free Option)

**Backend**: Render (easiest, good free tier)
**Frontend**: Netlify (fast, reliable)
**Database**: Supabase (if needed)

### Steps:

1. **Backend on Render**:
   ```
   - Push code to GitHub
   - Connect GitHub to Render
   - Deploy as Web Service
   - Get URL: https://your-app.onrender.com
   ```

2. **Frontend on Netlify**:
   ```
   - Connect GitHub to Netlify
   - Set base directory: frontend
   - Update config.js with Render URL
   - Deploy
   - Get URL: https://your-app.netlify.app
   ```

3. **Update ESP32**:
   ```
   - Update server_url in firmware
   - Flash to ESP32
   ```

---

## Troubleshooting

### Backend Not Responding (Render)
- Check logs in Render dashboard
- Free tier services sleep after inactivity
- First request may take 30 seconds (cold start)

### WebSocket Connection Fails
- Ensure your hosting supports WebSockets (Render does)
- Check CORS settings
- Verify Socket.IO version compatibility

### ESP32 Can't Connect
- Verify backend URL is correct
- Check if backend is running (visit URL in browser)
- Ensure HTTPS (not HTTP) for production
- Check firewall/network settings

### CORS Errors
- Already configured in `backend/app.py` with `CORS(app)`
- If issues persist, add specific origins

---

## Security Notes

For production:
1. Change `SECRET_KEY` in `backend/app.py`
2. Use environment variables for sensitive data
3. Add rate limiting (Flask-Limiter)
4. Consider authentication for API endpoints
5. Use HTTPS (all free hosts provide this)

---

## Cost Summary

✅ **Completely Free**:
- Render backend (with limitations)
- Netlify frontend
- GitHub Pages (alternative)
- Supabase database (if needed)

💡 **Recommended**: Render + Netlify (best balance of free features)

