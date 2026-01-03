# How to Push Code to GitHub - Step by Step

Complete guide to push your irrigation controller code to GitHub.

---

## Option 1: Using Command Line (Recommended)

### Step 1: Install Git (if not already installed)

1. **Check if Git is installed**:
   ```bash
   git --version
   ```
   If you see a version number, Git is installed. Skip to Step 2.

2. **If Git is not installed**:
   - Download from: https://git-scm.com/download/win
   - Run the installer
   - Use default settings
   - Restart VS Code/terminal after installation

### Step 2: Open Terminal in Your Project Folder

**In VS Code:**
- Press `Ctrl + ~` (backtick) to open terminal
- OR: Terminal → New Terminal

**In Windows PowerShell/Command Prompt:**
- Navigate to your project:
  ```bash
  cd C:\Users\xanas\OneDrive\Desktop\agriculture
  ```

### Step 3: Initialize Git Repository (if not already done)

```bash
git init
```

### Step 4: Create .gitignore (if not exists)

Check if `.gitignore` exists. If not, one is already created in your project.

### Step 5: Add All Files

```bash
git add .
```

This adds all files to staging area.

### Step 6: Make Your First Commit

```bash
git commit -m "Initial commit - Intelligent Irrigation Controller"
```

**Note**: First time users may need to configure Git:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 7: Create GitHub Repository

1. **Go to GitHub**:
   - Visit https://github.com
   - Sign in (or create account if needed)

2. **Create New Repository**:
   - Click the "+" icon (top right)
   - Click "New repository"
   - Repository name: `irrigation-controller` (or any name you like)
   - Description: "Intelligent Edge AI Irrigation Controller"
   - Choose: **Public** (free) or **Private**
   - **DO NOT** check "Initialize with README" (you already have files)
   - Click "Create repository"

3. **Copy Repository URL**:
   - After creating, GitHub shows you the URL
   - Copy the HTTPS URL: `https://github.com/YOUR_USERNAME/irrigation-controller.git`

### Step 8: Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/irrigation-controller.git
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 9: Rename Branch to 'main' (if needed)

```bash
git branch -M main
```

### Step 10: Push to GitHub

```bash
git push -u origin main
```

**First time pushing:**
- GitHub may ask for authentication
- Use GitHub username and **Personal Access Token** (not password)
- See "Authentication" section below if needed

**Success message:**
```
Enumerating objects: XX, done.
Counting objects: 100% (XX/XX), done.
Writing objects: 100% (XX/XX), done.
To https://github.com/YOUR_USERNAME/irrigation-controller.git
 * [new branch]      main -> main
```

✅ **Done!** Your code is now on GitHub.

---

## Option 2: Using VS Code Git Integration (Easier)

### Step 1: Install Git (if not installed)
- Same as Option 1, Step 1

### Step 2: Open Project in VS Code
- File → Open Folder
- Select your `agriculture` folder

### Step 3: Initialize Repository
- Click Source Control icon in sidebar (or press `Ctrl+Shift+G`)
- Click "Initialize Repository" button
- Select your project folder

### Step 4: Stage All Files
- In Source Control panel, click "+" next to "Changes"
- OR: Click "Stage All Changes"

### Step 5: Commit
- Enter commit message: "Initial commit"
- Press `Ctrl+Enter` or click checkmark icon

### Step 6: Create GitHub Repository
- Same as Option 1, Step 7

### Step 7: Publish to GitHub
- Click "..." (three dots) in Source Control panel
- Select "Publish to GitHub"
- Choose repository name
- Choose Public or Private
- Click "Publish to GitHub"

✅ **Done!** VS Code will push automatically.

---

## Authentication: Personal Access Token

GitHub no longer accepts passwords. You need a Personal Access Token.

### Create Personal Access Token:

1. **Go to GitHub Settings**:
   - Click your profile picture (top right)
   - Click "Settings"

2. **Developer Settings**:
   - Scroll down → "Developer settings"
   - Click "Personal access tokens" → "Tokens (classic)"

3. **Generate New Token**:
   - Click "Generate new token" → "Generate new token (classic)"
   - Note: Enter your password if prompted
   - Name: `irrigation-controller` (any name)
   - Expiration: 90 days (or longer)
   - Scopes: Check **`repo`** (full control of private repositories)
   - Click "Generate token"

4. **Copy Token**:
   - **⚠️ IMPORTANT**: Copy the token immediately (you won't see it again!)
   - Looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Use Token**:
   - When Git asks for password, paste the token instead
   - Username: Your GitHub username
   - Password: Paste the token

### Save Token (Optional):

To avoid entering token every time, use Git Credential Manager:

```bash
git config --global credential.helper manager-core
```

Windows will remember your credentials.

---

## Common Commands Reference

### Check Status
```bash
git status
```

### Add Specific Files
```bash
git add filename.txt
git add backend/
git add frontend/
```

### Commit Changes
```bash
git commit -m "Your commit message"
```

### Push Changes
```bash
git push
```

### Pull Changes (from GitHub)
```bash
git pull
```

### View Remote URL
```bash
git remote -v
```

### Change Remote URL (if wrong)
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/irrigation-controller.git
```

---

## Troubleshooting

### Problem: "fatal: not a git repository"

**Solution:**
```bash
git init
```

### Problem: "remote origin already exists"

**Solution:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/irrigation-controller.git
```

### Problem: "Authentication failed"

**Solutions:**
- Use Personal Access Token (not password)
- Check token has `repo` scope
- Verify token hasn't expired
- Clear cached credentials:
  ```bash
  git credential-manager-core erase
  ```

### Problem: "failed to push some refs"

**Solution:**
GitHub repository might have files. Pull first:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Problem: "refusing to merge unrelated histories"

**Solution:**
```bash
git pull origin main --allow-unrelated-histories
```

### Problem: Large files won't upload

**Solution:**
- Check `.gitignore` includes large files
- Remove from Git cache:
  ```bash
  git rm --cached largefile.bin
  git commit -m "Remove large file"
  git push
  ```

---

## Quick Copy-Paste Commands

**First Time Setup:**
```bash
cd C:\Users\xanas\OneDrive\Desktop\agriculture
git init
git add .
git commit -m "Initial commit - Intelligent Irrigation Controller"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/irrigation-controller.git
git push -u origin main
```

**After Making Changes:**
```bash
git add .
git commit -m "Description of your changes"
git push
```

---

## Next Steps

After pushing to GitHub:

1. ✅ Verify files are on GitHub (visit your repository URL)
2. ✅ Continue with deployment (see `COMPLETE_SETUP_GUIDE.md`)
3. ✅ Deploy backend on Render
4. ✅ Deploy frontend on Netlify

---

## Security Notes

⚠️ **Important:**

1. **Never commit sensitive data**:
   - API keys
   - Passwords
   - Personal Access Tokens
   - Private credentials

2. **Check `.gitignore`**:
   - Should include: `*.env`, `*.key`, `*.pem`, etc.

3. **Use Private Repository** for sensitive projects

4. **Review files before committing**:
   - Check what you're committing: `git status`

---

## Need Help?

- Git Documentation: https://git-scm.com/doc
- GitHub Guides: https://guides.github.com
- GitHub Help: https://help.github.com

**You're ready to push! Follow the steps above and your code will be on GitHub in minutes! 🚀**

