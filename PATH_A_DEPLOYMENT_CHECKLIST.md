# Path A Deployment Checklist (Docker on Azure)

**Goal:** Deploy your app to Azure Web App for Containers with MongoDB Atlas  
**Estimated Time:** 45–60 minutes  
**Prerequisites:** Azure Account (free), MongoDB Atlas Account (free)

---

## ✅ Phase 1: MongoDB Atlas Setup (5 min)

### Task 1.1: Create MongoDB Atlas Account
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Click "Start free" and create an account (use Google/GitHub for speed)
- [ ] Confirm email and log in

### Task 1.2: Create Free Cluster
- [ ] On Atlas Dashboard, click **"Create a Deployment"**
- [ ] Select **"M0 Free"** (already highlighted)
- [ ] Click **"Create Deployment"**
- [ ] Wait 2–3 minutes until you see a green checkmark ✓

### Task 1.3: Create Database User
- [ ] Once cluster is ready, a popup appears with "Quick Start"
- [ ] Enter:
  - **Username:** `demoapp_user`
  - **Password:** Choose a strong password (example: `MyMongo123!@#SecureKey`)
  - **Privilege:** "Atlas Admin"
- [ ] Click **"Create User"** → **"Finish and Close"**

### Task 1.4: Whitelist IPs (Allow Azure to Connect)
- [ ] Click **"Network Access"** (left sidebar)
- [ ] Click **"Add IP Address"**
- [ ] Select **"Add 0.0.0.0/0"** (allows all IPs; secure for demo, can restrict later)
- [ ] Click **"Confirm"**

### Task 1.5: Get Connection String
- [ ] On the cluster page, click **"Connect"** (top-right)
- [ ] Click **"Drivers"** (second tab)
- [ ] Copy the connection string:
  ```
  mongodb+srv://demoapp_user:PASSWORD@cluster0.xxxxx.mongodb.net/demoapp2?retryWrites=true&w=majority
  ```
- [ ] **Replace `PASSWORD` with your actual password** (from Task 1.3)

**Save this string — you'll need it in Phase 3.**

---

## ✅ Phase 2: Prepare Your App (5 min)

### Task 2.1: Verify `server.js` Reads MONGO_URI from Environment
- [ ] Open `server.js` in your editor
- [ ] Look for a line like:
  ```javascript
  const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/demoapp2';
  ```
- [ ] If it says `MONGO_URI`, you're good ✓
- [ ] If it says something else (e.g., `MONGODB_URI`), note it (you'll use this name in Phase 3)

### Task 2.2: Verify `package.json` Start Script
- [ ] Open `package.json`
- [ ] Check that `"start"` script exists:
  ```json
  "start": "node server.js"
  ```
- [ ] If not present or different, update it

### Task 2.3: Commit Changes to GitHub
- [ ] Open PowerShell and run:
  ```powershell
  cd c:\Users\marcb\Downloads\demoapp2
  git add .
  git commit -m "Prepare for Azure deployment"
  git push origin master
  ```
- [ ] Wait for push to complete

---

## ✅ Phase 3: Azure Setup (30 min)

### Task 3.1: Create Azure Resource Group
- [ ] Go to **Azure Portal:** https://portal.azure.com
- [ ] Log in with your Azure account
- [ ] Search for **"Resource groups"** (top search bar)
- [ ] Click **"+ Create"**
- [ ] Fill in:
  - **Subscription:** (default)
  - **Resource Group Name:** `demoapp2-rg`
  - **Region:** Pick your region (e.g., "East US")
- [ ] Click **"Review + Create"** → **"Create"**
- [ ] Wait ~30 sec for completion

### Task 3.2: Create Container Registry
- [ ] Search for **"Container Registries"** in Azure Portal
- [ ] Click **"+ Create"**
- [ ] Fill in:
  - **Resource Group:** Select `demoapp2-rg` (from Task 3.1)
  - **Registry Name:** `demoapp2registry` (must be unique; if taken, try `demoapp2reg<yourname>`)
  - **Region:** Same as resource group
  - **SKU:** **"Basic"** (cheapest, ~$5/month)
- [ ] Click **"Review + Create"** → **"Create"**
- [ ] Wait ~1 minute for completion

### Task 3.3: Get Container Registry Credentials
- [ ] Go to your new Container Registry in the portal
- [ ] Click **"Access Keys"** (left sidebar)
- [ ] **Toggle "Admin user" to ON** (if not already)
- [ ] Copy and save:
  - **Login server:** (e.g., `demoapp2registry.azurecr.io`)
  - **Username:** (shown below)
  - **Password:** (click eye icon to reveal and copy)

**You'll need these in Phase 4.**

### Task 3.4: Build and Push Docker Image to Container Registry

**Option A: Using Azure CLI (Recommended)**
1. [ ] Install Azure CLI (if not already): https://docs.microsoft.com/cli/azure/install-azure-cli
2. [ ] Open PowerShell and log in:
   ```powershell
   az login
   ```
   Browser will open; sign in with your Azure account.

3. [ ] Navigate to your app folder:
   ```powershell
   cd c:\Users\marcb\Downloads\demoapp2
   ```

4. [ ] Build and push the image (this takes 3–5 minutes):
   ```powershell
   az acr build --registry demoapp2registry --image demoapp2:latest .
   ```

5. [ ] Wait for completion. You should see output like:
   ```
   Sending build context to ACR...
   Successfully queued the build job...
   ```

6. [ ] Verify the image uploaded:
   ```powershell
   az acr repository list --name demoapp2registry
   ```
   Should show `demoapp2` in the output.

**Option B: Using Docker CLI (if you have Docker installed locally)**
1. [ ] Open PowerShell and log in to Docker:
   ```powershell
   docker login demoapp2registry.azurecr.io
   ```
   (Use username and password from Task 3.3)

2. [ ] Build the image:
   ```powershell
   cd c:\Users\marcb\Downloads\demoapp2
   docker build -t demoapp2:latest .
   ```

3. [ ] Tag and push:
   ```powershell
   docker tag demoapp2:latest demoapp2registry.azurecr.io/demoapp2:latest
   docker push demoapp2registry.azurecr.io/demoapp2:latest
   ```

**Either option works. Option A is simpler if Docker isn't installed.**

---

## ✅ Phase 4: Create Azure Web App for Containers (15 min)

### Task 4.1: Create Web App
- [ ] In Azure Portal, search for **"App Services"**
- [ ] Click **"+ Create"**
- [ ] Fill in:
  - **Resource Group:** `demoapp2-rg`
  - **Name:** `demoapp2-app` (must be unique; Azure suggests alternatives if taken)
  - **Publish:** **"Docker Container"** (select this)
  - **Operating System:** **"Linux"**
  - **Region:** Same as your resource group
  - **App Service Plan:** Click **"Create new"**
    - **Name:** `demoapp2-plan`
    - **SKU:** Select **"B1"** (Basic, ~$13/month)

- [ ] Click **"Next: Docker"** button at bottom

### Task 4.2: Configure Docker Settings
- [ ] On the "Docker" tab, fill in:
  - **Image Source:** **"Azure Container Registry"** (select this)
  - **Registry:** Select `demoapp2registry`
  - **Image:** Select `demoapp2` (should appear in dropdown)
  - **Tag:** Select `latest`
  - **Startup Command:** Leave blank

- [ ] Click **"Review + Create"** → **"Create"**
- [ ] Wait 2–3 minutes for the Web App to deploy

---

## ✅ Phase 5: Configure Environment Variables (5 min)

### Task 5.1: Add MongoDB Connection String
- [ ] Go to your Web App in Azure Portal (search `demoapp2-app`)
- [ ] Click **"Configuration"** (left sidebar under "Settings")
- [ ] Click **"+ New application setting"**
- [ ] Fill in:
  - **Name:** `MONGO_URI` (or `MONGODB_URI` if your app uses that)
  - **Value:** (Paste your MongoDB Atlas connection string from Phase 1, Task 1.5)
  - **Deployment slot setting:** Leave unchecked
- [ ] Click **"OK"**

### Task 5.2: Add JWT Secret
- [ ] Click **"+ New application setting"** again
- [ ] Fill in:
  - **Name:** `JWT_SECRET`
  - **Value:** Generate a strong secret (example: `MyJWT_Secret_123!@#KeyABC`)
  - **Deployment slot setting:** Leave unchecked
- [ ] Click **"OK"**

### Task 5.3: (Optional) Add NODE_ENV
- [ ] Click **"+ New application setting"** again
- [ ] Fill in:
  - **Name:** `NODE_ENV`
  - **Value:** `production`
- [ ] Click **"OK"**

### Task 5.4: Save All Settings
- [ ] Click **"Save"** at the top of the Configuration page
- [ ] Azure will prompt to confirm; click **"Continue"**
- [ ] The Web App will restart automatically (takes 1–2 minutes)

---

## ✅ Phase 6: Test Your Live App (5 min)

### Task 6.1: Get Your App's URL
- [ ] Go to your Web App in Azure Portal
- [ ] Click **"Overview"** (left sidebar)
- [ ] Copy the **"Default domain"** (e.g., `https://demoapp2-app.azurewebsites.net`)

### Task 6.2: Test in Browser
- [ ] Paste the URL into your browser
- [ ] You should see your app's homepage (registration/login page)
- [ ] Try clicking "Register" or "Login" to verify the frontend loads

### Task 6.3: Test API Endpoint (Registration)
- [ ] Open PowerShell and run:
  ```powershell
  $uri = "https://demoapp2-app.azurewebsites.net/api/auth/register"
  $body = @{
      username = "testuser_$(Get-Random)"
      password = "Secur3P@ss!"
      email = "test$(Get-Random)@example.com"
  } | ConvertTo-Json

  $response = Invoke-WebRequest -Uri $uri -Method Post -Body $body -ContentType "application/json"
  $response.StatusCode
  $response.Content | ConvertFrom-Json
  ```

- [ ] Expected: Status code **201** or **200**, response includes a **token**
- [ ] If you see an error, check logs (see "Troubleshooting" section below)

### Task 6.4: Check Logs for Errors
- [ ] Go to your Web App → **"Log stream"** (left sidebar)
- [ ] Watch for "Connected to MongoDB" message
- [ ] If you see errors, note them and check troubleshooting section below

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and user credentials saved
- [ ] Connection string copied and verified
- [ ] App code committed to GitHub
- [ ] Azure Resource Group created
- [ ] Container Registry created with admin access enabled
- [ ] Docker image built and pushed to Container Registry
- [ ] Web App created and configured with Docker image
- [ ] Environment variables set (MONGO_URI, JWT_SECRET)
- [ ] Web App restarted successfully
- [ ] Frontend loads at `https://demoapp2-app.azurewebsites.net`
- [ ] API endpoint test returns token (registration works)
- [ ] Logs show "Connected to MongoDB"

---

## 🔧 Troubleshooting

### Issue: "502 Bad Gateway" or app won't start
**Solution:**
1. Check **Log stream** for errors (see Phase 6, Task 6.4)
2. Verify MONGO_URI is set correctly (no typos, password escaped)
3. Make sure MongoDB Atlas cluster is running (check Atlas dashboard)
4. Ensure IP whitelist in MongoDB Atlas includes `0.0.0.0/0` or Azure's IP range

### Issue: "Cannot connect to MongoDB"
**Solution:**
1. Copy the MongoDB connection string again and verify:
   - Username and password are correct
   - Cluster name is correct
   - Password is **not** URL-encoded (Azure handles that automatically)
2. Test the connection string locally:
   ```powershell
   $env:MONGO_URI = "your-connection-string"
   npm start
   ```

### Issue: Docker image not found in Container Registry
**Solution:**
1. Verify image was pushed:
   ```powershell
   az acr repository list --name demoapp2registry
   ```
2. If empty, rebuild and push (see Phase 4, Task 4.2)

### Issue: "Dockerfile not found" during build
**Solution:**
Make sure you're in the correct directory:
```powershell
cd c:\Users\marcb\Downloads\demoapp2
ls Dockerfile  # Should show the file
```

---

## 📊 Next Steps

Once your app is live:

1. **Test Full Workflow:**
   - Register a new user via the frontend
   - Log in
   - Update profile
   - Verify data persists

2. **Monitor Logs:**
   - Keep "Log stream" open while testing
   - Watch for any errors

3. **Set Up Custom Domain (Optional):**
   - Buy a domain (GoDaddy, Namecheap, etc.)
   - Add to Web App under "Custom domains"
   - Azure adds HTTPS automatically

4. **Enable CI/CD (Optional):**
   - Go to Web App → "Deployment Center"
   - Select GitHub, authorize, choose your repo
   - Automatic redeployment on push to master

5. **Scale Up (Later):**
   - If your app grows, upgrade from B1 to S1 or higher

---

## 💰 Cost Summary

| Service | Monthly Cost |
|---------|--------------|
| App Service (B1) | ~$13 |
| Container Registry (Basic) | ~$5 |
| MongoDB Atlas (Free Tier) | $0 |
| Application Insights (first 1GB) | $0 |
| **Total** | **~$18/month** |

---

## 📞 Help & Resources

- **Azure Docs:** https://docs.microsoft.com/azure/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Node.js on Azure:** https://docs.microsoft.com/azure/developer/nodejs/
- **Docker & Azure:** https://docs.microsoft.com/azure/app-service/quickstart-docker

---

**Good luck! Your app will be live in ~60 minutes. 🚀**

Mark each task as complete as you go through them.
