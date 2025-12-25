# Azure Deployment Guide

## Option 1: Azure Static Web Apps (Recommended)

### Prerequisites
- Azure account (free tier available)
- GitHub account with your repository

### Steps:

1. **Create Azure Static Web App via Portal:**
   - Go to https://portal.azure.com
   - Click "Create a resource"
   - Search for "Static Web App"
   - Click "Create"
   - Fill in:
     - **Subscription**: Your Azure subscription
     - **Resource Group**: Create new or use existing
     - **Name**: pharmd-portfolio (or your preferred name)
     - **Plan type**: Free
     - **Region**: Choose closest to you
     - **Source**: GitHub
     - **GitHub account**: Sign in and authorize
     - **Organization**: AhmadMujahid1007
     - **Repository**: pharmd-portfolio
     - **Branch**: master
     - **Build Presets**: Custom
     - **App location**: `/`
     - **Api location**: (leave empty)
     - **Output location**: `build`
   - Click "Review + create" then "Create"

2. **Get Deployment Token:**
   - After creation, go to your Static Web App in Azure Portal
   - Click "Manage deployment token"
   - Copy the token

3. **Add GitHub Secret:**
   - Go to: https://github.com/AhmadMujahid1007/pharmd-portfolio/settings/secrets/actions
   - Click "New repository secret"
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_FOREST_0CA38041E`
   - Value: (paste the token from step 2)
   - Click "Add secret"

4. **Deploy:**
   - Push any commit to master branch
   - GitHub Actions will automatically build and deploy
   - Check deployment status in GitHub → Actions tab
   - Your app will be available at: `https://your-app-name.azurestaticapps.net`

---

## Option 2: Azure App Service

### Using Azure CLI:

```bash
# Install Azure CLI: https://aka.ms/installazurecliwindows

# Login to Azure
az login

# Create resource group
az group create --name pharmd-portfolio-rg --location eastus

# Create App Service plan (Free tier)
az appservice plan create \
  --name pharmd-portfolio-plan \
  --resource-group pharmd-portfolio-rg \
  --sku FREE \
  --is-linux

# Create Web App
az webapp create \
  --resource-group pharmd-portfolio-rg \
  --plan pharmd-portfolio-plan \
  --name pharmd-portfolio-app \
  --runtime "NODE:18-lts"

# Configure Node.js version
az webapp config appsettings set \
  --resource-group pharmd-portfolio-rg \
  --name pharmd-portfolio-app \
  --settings WEBSITE_NODE_DEFAULT_VERSION="18-lts"

# Deploy from local build
npm run build
az webapp deploy \
  --resource-group pharmd-portfolio-rg \
  --name pharmd-portfolio-app \
  --src-path build \
  --type static
```

### Using Azure Portal:

1. Go to https://portal.azure.com
2. Create a resource → Web App
3. Fill in details:
   - **Name**: pharmd-portfolio-app
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux
   - **Plan**: Free tier
4. After creation, go to Deployment Center
5. Choose GitHub as source
6. Authorize and select your repository
7. Configure:
   - **Branch**: master
   - **Build provider**: GitHub Actions
8. Save and deploy

---

## Option 3: Manual Deployment (Quick Test)

### Using Azure CLI:

```bash
# Build your app
npm run build

# Install Azure CLI extension for static web apps
az extension add --name staticwebapp

# Deploy (if you have static web app already created)
az staticwebapp deploy \
  --name pharmd-portfolio \
  --resource-group myResourceGroup \
  --source-location build
```

### Using VS Code:

1. Install "Azure Static Web Apps" extension
2. Right-click on `build` folder
3. Select "Deploy to Static Web App"
4. Follow the prompts

---

## Important Notes:

1. **Environment Variables:**
   - If you need to set environment variables, add them in Azure Portal:
   - Static Web Apps: Configuration → Application settings
   - App Service: Configuration → Application settings

2. **Custom Domain:**
   - Static Web Apps: Custom domains → Add
   - App Service: Custom domains → Add custom domain

3. **HTTPS:**
   - Automatically enabled for both services

4. **Build Configuration:**
   - Your workflow file is already configured correctly
   - Build output: `build` folder
   - App location: root (`/`)

5. **Firebase Configuration:**
   - Make sure your Firebase config in `src/firebase.js` is correct
   - No changes needed for deployment

---

## Troubleshooting:

- **Build fails**: Check GitHub Actions logs
- **App not loading**: Verify `output_location: "build"` in workflow
- **404 errors**: Add `staticwebapp.config.json` for routing (if needed)
- **Firebase errors**: Check Firebase config and security rules

---

## Quick Deploy Command (If already set up):

```bash
git add .
git commit -m "Deploy to Azure"
git push origin master
```

The GitHub Actions workflow will automatically build and deploy!

