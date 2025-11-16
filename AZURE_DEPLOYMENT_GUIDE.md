# Deploy DemoApp2 to Azure Web App (Step-by-Step)

**Date:** November 16, 2025  
**App Type:** Node.js + Express + MongoDB  
**Deployment Target:** Azure Web App for Containers (recommended) or Azure App Service (direct Node.js)

---

## Quick Overview: 2 Deployment Paths for Azure

| Path | Setup Time | Difficulty | Best For |
|------|-----------|------------|----------|
| **Path A: Docker Container** | ~20 min | Easy-Medium | If you want reproducible, portable deployments; uses existing Dockerfile |
| **Path B: Direct Node.js** | ~10 min | Easy | Simplest; Azure handles Node.js runtime directly |

**Recommendation:** Use **Path A (Docker)** because:
- Your app already has a Dockerfile and docker-compose.yml
- More portable and consistent across environments
- Easier to scale and manage
- Works with MongoDB Atlas (managed database)

---

## Prerequisites (Before Starting)

1. **Azure Subscription:** Create a free account at https://azure.microsoft.com/free
2. **MongoDB Atlas Account:** Create at https://www.mongodb.com/cloud/atlas (free tier available)
3. **GitHub Account:** Repo already set up (Mawk23/demosite7)
4. **Local Tools (Optional):** Azure CLI (`az` command), Docker CLI (if testing locally)

---

## Part 1: Set Up MongoDB Atlas (Database)

### Step 1.1: Create a MongoDB Atlas Cluster (Free Tier)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign in or create an account
3. Click **"Create a Deployment"** → select **"M0 Free"** tier
4. Wait 2–3 minutes for the cluster to be ready

### Step 1.2: Create Database User & Get Connection String
1. On the cluster page, click **"Database Access"** (left menu)
2. Click **"Add New Database User"**
3. Enter:
   - **Username:** `demoapp_user`
   - **Password:** Generate a strong password (e.g., `P@ssw0rd123!MySecureKey`)
   - **User Privileges:** Select "Atlas Admin"
4. Click **"Add User"**
5. Go to **"Network Access"** → **"Add IP Address"**
   - Click **"Add Current IP Address"** (for development) OR
   - Add `0.0.0.0/0` (allows all IPs; less secure but simpler for demo)
6. Click the **"Connect"** button on your cluster
7. Select **"Drivers"** → copy the connection string
   - Example: `mongodb+srv://demoapp_user:P@ssw0rd123!MySecureKey@cluster0.xxxxx.mongodb.net/demoapp2?retryWrites=true&w=majority`

**Save this connection string — you'll need it soon.**

---

## Part 2: Prepare Your App for Azure (Code Changes)

### Step 2.1: Update Environment Variables in `server.js`

Check your `server.js` to ensure it reads MongoDB URI from environment:

```javascript
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/demoapp2';
```

If it says `MONGO_URI`, keep it as is. If it says `MONGODB_URI`, either works — Azure will let you set any name.

### Step 2.2: Ensure `package.json` Has Correct Start Script

Open `package.json` and verify the `start` script:

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "jest --runInBand --detectOpenHandles"
  }
}
```

If `start` is missing or incorrect, update it to `"start": "node server.js"`.

### Step 2.3: Commit & Push to GitHub

```powershell
cd c:\Users\marcb\Downloads\demoapp2
git add .
git commit -m "Prepare for Azure deployment"
git push origin master
```

---

## Part 3: Deploy to Azure (Path A — Docker Container)

### Step 3.1: Create a Resource Group

Go to **Azure Portal** (https://portal.azure.com):

1. Click **"Resource groups"** (left sidebar)
2. Click **"+ Create"**
3. Fill in:
   - **Resource Group Name:** `demoapp2-rg`
   - **Region:** Choose closest to you (e.g., `East US`)
4. Click **"Review + Create"** → **"Create"**

Wait for it to finish (~30 sec).

### Step 3.2: Create a Container Registry (to store your Docker image)

1. In Azure Portal, search for **"Container Registries"**
2. Click **"+ Create"**
3. Fill in:
   - **Resource Group:** Select `demoapp2-rg` (from Step 3.1)
   - **Registry Name:** `demoapp2registry` (must be globally unique; Azure will tell you if taken)
   - **Region:** Same as your resource group
   - **SKU:** Select **"Basic"** (cheapest)
4. Click **"Review + Create"** → **"Create"**

Wait for it to complete (~1 min).

### Step 3.3: Enable Admin Access & Get Login Credentials

1. Go to your new Container Registry (search "demoapp2registry" in portal)
2. Click **"Access Keys"** (left sidebar)
3. Toggle **"Admin user"** to **"Enabled"**
4. Copy the following:
   - **Login server:** e.g., `demoapp2registry.azurecr.io`
   - **Username:** (shown below)
   - **Password:** (click eye icon to reveal)

**Save these credentials.**

### Step 3.4: Build & Push Docker Image to Azure Container Registry

#### Option A: Using Azure CLI (Recommended)

1. Install Azure CLI: https://docs.microsoft.com/cli/azure/install-azure-cli
2. Open PowerShell and log in:
   ```powershell
   az login
   ```
   (Browser will open; sign in with your Azure account)

3. Build and push the image to your registry:
   ```powershell
   cd c:\Users\marcb\Downloads\demoapp2
   
   az acr build --registry demoapp2registry --image demoapp2:latest .
   ```
   
   Wait 3–5 minutes. You'll see output like:
   ```
   Sending build context to ACR...
   Successfully queued the build job...
   Run ID: abc123...
   ```

4. Verify the image is uploaded:
   ```powershell
   az acr repository list --name demoapp2registry
   ```
   Should show `demoapp2` in the list.

#### Option B: Using Docker CLI (if you have Docker installed locally)

1. Log in to your registry:
   ```powershell
   docker login demoapp2registry.azurecr.io
   ```
   (Use username and password from Step 3.3)

2. Build the image:
   ```powershell
   cd c:\Users\marcb\Downloads\demoapp2
   docker build -t demoapp2:latest .
   ```

3. Tag and push:
   ```powershell
   docker tag demoapp2:latest demoapp2registry.azurecr.io/demoapp2:latest
   docker push demoapp2registry.azurecr.io/demoapp2:latest
   ```

**Either option is fine; Option A is simpler if you don't have Docker locally.**

### Step 3.5: Create an Azure Web App for Containers

1. In Azure Portal, search for **"App Services"**
2. Click **"+ Create"**
3. Fill in:
   - **Resource Group:** `demoapp2-rg`
   - **Name:** `demoapp2-app` (must be unique; Azure suggests alternatives)
   - **Publish:** Select **"Docker Container"**
   - **Operating System:** **"Linux"**
   - **Region:** Same as your resource group
   - **App Service Plan:** Click **"Create new"**
     - Name: `demoapp2-plan`
     - SKU: **"B1"** (Basic, ~$13/month; free tier limited to 60 min/day)

4. Click **"Next: Docker"**

5. Configure Docker:
   - **Image Source:** **"Azure Container Registry"**
   - **Registry:** Select `demoapp2registry`
   - **Image:** Select `demoapp2`
   - **Tag:** Select `latest`
   - **Startup Command:** Leave blank (uses Dockerfile's CMD)

6. Click **"Review + Create"** → **"Create"**

Wait 2–3 minutes for deployment.

### Step 3.6: Add Environment Variables to the Web App

1. Once the Web App is created, go to it in Azure Portal
2. Click **"Configuration"** (left sidebar, under "Settings")
3. Click **"+ New application setting"** and add:
   - **Name:** `MONGO_URI`
   - **Value:** (Paste your MongoDB Atlas connection string from Part 1)
   - **Deployment slot setting:** Leave unchecked

4. Repeat for:
   - **Name:** `JWT_SECRET`
   - **Value:** Generate a strong secret (e.g., `MyJWTSecret_abc123!@#XYZ`)

5. (Optional) Add:
   - **Name:** `NODE_ENV`
   - **Value:** `production`

6. Click **"Save"** at the top

The app will restart automatically with these settings.

### Step 3.7: Test Your Deployment

1. Go to your Web App in Azure Portal
2. Click **"Overview"** (left sidebar)
3. Copy the **"Default domain"** (e.g., `https://demoapp2-app.azurewebsites.net`)
4. Open it in your browser
5. You should see your frontend (registration/login page)

Test the following:
```powershell
# Test registration
$uri = "https://demoapp2-app.azurewebsites.net/api/auth/register"
$body = @{
    username = "testuser"
    password = "Secur3P@ss!"
    email = "test@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri $uri -Method Post -Body $body -ContentType "application/json"
```

If you get a 201 or 200 response with a token, it worked! 🎉

---

## Part 4: Set Up Custom Domain (Optional but Recommended for Production)

### Step 4.1: Buy a Domain (Optional)
- Use GoDaddy, Namecheap, or Azure's domain registration service
- Example: `mydemoapp.com`

### Step 4.2: Add Custom Domain to Web App

1. Go to your Web App → **"Custom domains"** (left sidebar)
2. Click **"+ Add custom domain"**
3. Enter your domain (e.g., `mydemoapp.com`)
4. Azure will ask you to verify DNS ownership:
   - Add the provided TXT or CNAME record to your domain registrar's DNS settings
5. Once verified, Azure will add an SSL certificate automatically (HTTPS)

---

## Part 5: Enable CI/CD (Optional but Recommended)

Automatically redeploy when you push to GitHub.

### Step 5.1: Create Deployment Center

1. Go to your Web App → **"Deployment Center"** (left sidebar)
2. Click **"GitHub"** (or your source control)
3. Authorize Azure to access your GitHub repo
4. Select:
   - **Repository:** `Mawk23/demosite7`
   - **Branch:** `master`
   - **Build provider:** **"GitHub Actions"**
5. Click **"Save"**

Azure will create a GitHub Actions workflow and add it to your repo.

### Step 5.2: Verify Workflow

1. Go to your GitHub repo
2. Click **"Actions"** tab
3. You should see a workflow running (or already completed)
4. Each time you push to `master`, it will:
   - Build the Docker image
   - Push to your Container Registry
   - Deploy to your Web App

---

## Part 6: Monitor & Manage (Ongoing)

### Check Logs
1. Go to your Web App → **"Log stream"** (left sidebar)
2. See real-time logs of your app (errors, requests, etc.)

### Enable Application Insights (Monitoring)
1. Go to your Web App → **"Application Insights"** (left sidebar)
2. Click **"Turn on Application Insights"**
3. Select **"Create new resource"** or use an existing one
4. This gives you:
   - Request/response times
   - Error rates
   - Performance metrics
   - User behavior

### Set Up Alerts (Optional)
1. Go to your Web App → **"Alerts"** (under Monitoring)
2. Add alerts for high error rates, CPU usage, etc.

---

## Cost Estimate (Azure)

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| App Service Plan | B1 (Basic) | ~$13 |
| Container Registry | Basic | ~$5 |
| Application Insights | Included* | $0 (first 1GB free) |
| **Total** | | ~$18/month |

*If you use more than 1GB of telemetry, charges apply.

---

## Troubleshooting

### "App won't start" or 502 Bad Gateway
1. Check **Log stream** for errors
2. Verify `MONGO_URI` is set correctly in Configuration
3. Ensure MongoDB Atlas cluster is running and IP whitelisting allows Azure IPs (use `0.0.0.0/0` if unsure)

### "Docker image not found"
1. Verify image was pushed to Container Registry:
   ```powershell
   az acr repository list --name demoapp2registry
   ```
2. Check if the tag is correct in Web App Configuration

### "Cannot connect to MongoDB"
1. Verify connection string (check username, password, cluster name)
2. Add Azure's IP address to MongoDB Atlas **Network Access**
   - In MongoDB Atlas: go to Network Access → Add IP → use `0.0.0.0/0` (temporary) or find Azure's IP range

---

## Path B Alternative: Deploy Directly (No Docker)

If you prefer **not to use containers**, you can deploy Node.js directly:

1. Create a Web App (skip Docker steps)
2. In Deployment Center, select GitHub → GitHub Actions
3. Azure creates a workflow that runs `npm install` and `npm start`
4. Same environment variables setup as above

**Simpler but less portable than Docker.**

---

## Summary

You now have your DemoApp2 running on Azure:

✅ **MongoDB** — Managed by MongoDB Atlas  
✅ **Backend & Frontend** — Running in Azure Web App  
✅ **HTTPS** — Free SSL certificate (Azure provides)  
✅ **Logs & Monitoring** — Application Insights  
✅ **Auto Deployment** — GitHub Actions (optional)  

**Your app is live at:** `https://demoapp2-app.azurewebsites.net`

---

## Next Steps

1. **Test in Production:** Register, login, update profile
2. **Monitor Logs:** Check for errors in Log stream
3. **Set Up Domain:** Add a custom domain (Step 4)
4. **Enable CI/CD:** Auto-redeploy on push (Step 5)
5. **Scale Up:** If needed, upgrade to S1 or P1 plans later

---

## Questions?

Refer to:
- **Azure Docs:** https://docs.microsoft.com/azure/app-service/
- **MongoDB Atlas:** https://docs.atlas.mongodb.com/
- **Node.js on Azure:** https://docs.microsoft.com/azure/developer/nodejs/

**Good luck! 🚀**
