# Quick Deployment Guide (5 Minutes)

## Fastest Free Deployment: Render + Netlify

### Step 1: Backend on Render (2 minutes)

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/agriculture.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to https://render.com → Sign up (free)
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - **Name**: irrigation-backend
     - **Environment**: Python 3
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && python app.py`
   - Click "Create Web Service"
   - Wait for deployment (~2 minutes)
   - Copy your URL: `https://your-app.onrender.com`

### Step 2: Frontend on Netlify (2 minutes)

1. **Update Frontend Config**
   - Edit `frontend/js/config.js`
   - Replace `localhost:5000` with your Render URL:
     ```javascript
     API_URL: 'https://your-app.onrender.com',
     WS_URL: 'https://your-app.onrender.com',
     ```

2. **Commit and Push**
   ```bash
   git add frontend/js/config.js
   git commit -m "Update backend URL"
   git push
   ```

3. **Deploy on Netlify**
   - Go to https://netlify.com → Sign up (free)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository
   - Settings:
     - **Base directory**: `frontend`
     - **Build command**: (leave empty)
     - **Publish directory**: `frontend`
   - Click "Deploy site"
   - Copy your URL: `https://your-app.netlify.app`

### Step 3: Update ESP32 (1 minute)

Edit `firmware/main/main.cpp`:

```cpp
const char* server_url = "https://your-app.onrender.com/api/sensor-data";
```

Flash to ESP32 and you're done!

---

## Alternative: All-in-One (PythonAnywhere)

### Single Deployment (3 minutes)

1. **Sign up**: https://www.pythonanywhere.com (free)

2. **Upload code**:
   - Files tab → Upload your project
   - Or use Git in Bash: `git clone https://github.com/YOUR_USERNAME/agriculture.git`

3. **Install dependencies** (Bash console):
   ```bash
   pip3.10 install --user -r agriculture/backend/requirements.txt
   ```

4. **Create Web App**:
   - Web tab → Add new web app → Flask
   - Source code: `/home/yourusername/agriculture/backend`

5. **Edit WSGI file**:
   ```python
   import sys
   path = '/home/yourusername/agriculture/backend'
   if path not in sys.path:
       sys.path.append(path)
   from app import app as application
   ```

6. **Serve frontend**:
   - Upload `frontend` folder to `/home/yourusername/mysite/static/`
   - Or map static files in Web tab

**Done!** Access at: `https://yourusername.pythonanywhere.com`

---

## Troubleshooting

### Backend URL not working?
- Check Render logs for errors
- Free tier services sleep after 15 min (first request takes ~30 sec)
- Ensure `PORT` environment variable is set

### Frontend can't connect?
- Verify backend URL in `config.js`
- Check browser console (F12) for errors
- Ensure CORS is enabled (already in code)

### ESP32 connection fails?
- Use HTTPS URL (not HTTP)
- Verify backend is accessible (visit URL in browser)
- Check WiFi credentials in firmware

---

## Cost: $0/month ✅

All options are completely free (with reasonable usage limits).

