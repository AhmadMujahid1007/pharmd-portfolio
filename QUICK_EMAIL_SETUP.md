# Quick Email Setup Guide

## Problem
Verification codes are not being sent via email. Currently, codes are only logged to the console.

## Solution: EmailJS (Easiest & Fastest)

EmailJS is already installed and integrated in the code! You just need to configure it.

### Step 1: Sign up for EmailJS (Free)
1. Go to https://www.emailjs.com/
2. Click "Sign Up" (free tier: 200 emails/month)
3. Verify your email

### Step 2: Add Email Service
1. In EmailJS dashboard, go to **Email Services** → **Add New Service**
2. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook** 
   - Or any other provider
3. Follow the setup instructions:
   - For Gmail: You'll need to enable "Less secure app access" or use an App Password
   - For Outlook: Similar setup required
4. **Copy the Service ID** (looks like `service_xxxxx`)

### Step 3: Create Email Template
1. Go to **Email Templates** → **Create New Template**
2. Use this template:

   **Subject:**
   ```
   Your Verification Code
   ```

   **Content:**
   ```
   Hello,

   Your verification code is: {{verification_code}}

   This code will expire in 10 minutes.

   If you didn't request this code, please ignore this email.
   ```

3. **Copy the Template ID** (looks like `template_xxxxx`)

### Step 4: Get Public Key
1. Go to **Account** → **API Keys**
2. **Copy your Public Key** (looks like `xxxxxxxxxxxxx`)

### Step 5: Create .env File
1. In your project root directory (`my-app`), create a file named `.env`
2. Add these lines (replace with your actual values):

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Example:**
```env
REACT_APP_EMAILJS_SERVICE_ID=service_gmail123
REACT_APP_EMAILJS_TEMPLATE_ID=template_abc456
REACT_APP_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

### Step 6: Restart Development Server
1. Stop your current server (Ctrl+C)
2. Run `npm start` again
3. Environment variables are only loaded when the server starts

### Step 7: Test
1. Try logging in with a user account
2. Check your email inbox (and spam folder)
3. You should receive the verification code via email!

---

## For Production (Azure Deployment)

When deploying to Azure, you need to add these environment variables. Here are multiple ways to do it:

### Method 1: Azure Portal (Recommended)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to your **Static Web App** resource
3. In the left sidebar, look for:
   - **Configuration** → **Application settings** tab, OR
   - **Settings** → **Configuration** → **Application settings**
4. Click **"+ New application setting"** or **"+ Add"**
5. Add these three settings one by one:
   - **Name:** `REACT_APP_EMAILJS_SERVICE_ID` → **Value:** your service ID
   - **Name:** `REACT_APP_EMAILJS_TEMPLATE_ID` → **Value:** your template ID
   - **Name:** `REACT_APP_EMAILJS_PUBLIC_KEY` → **Value:** your public key
6. Click **"Save"** at the top
7. Wait for the app to restart (may take a minute)

**Note:** If you don't see "Application settings", try:
- Look for **"Environment variables"** instead
- Check if you have the correct permissions (Contributor or Owner role)
- The interface may vary depending on your Azure subscription type

### Method 2: Azure CLI

If you have Azure CLI installed:

```bash
# Login to Azure
az login

# Set environment variables
az staticwebapp appsettings set \
  --name your-static-web-app-name \
  --resource-group your-resource-group \
  --setting-names \
    REACT_APP_EMAILJS_SERVICE_ID=your_service_id \
    REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id \
    REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

### Method 3: GitHub Actions Secrets (Recommended for React Apps)

**Important:** For React apps, environment variables are embedded at **build time**, not runtime. Azure Portal settings won't work because the build happens in GitHub Actions, not in Azure.

**Steps:**

1. Go to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these three secrets:
   - **Name:** `REACT_APP_EMAILJS_SERVICE_ID` → **Value:** your service ID
   - **Name:** `REACT_APP_EMAILJS_TEMPLATE_ID` → **Value:** your template ID
   - **Name:** `REACT_APP_EMAILJS_PUBLIC_KEY` → **Value:** your public key
5. The workflow file is already updated to use these secrets during build
6. Push any change to trigger a new build, or manually trigger the workflow

**Note:** The workflow file (`.github/workflows/azure-static-web-apps-*.yml`) has already been updated to use these secrets. Just add them to GitHub Secrets and the next deployment will include them.

---

## Alternative: Firebase Cloud Functions

If you prefer to use Firebase Cloud Functions instead (more secure, but requires more setup), see `EMAIL_SETUP.md` for detailed instructions.

---

## Troubleshooting

**Email not received?**
- Check spam folder
- Verify EmailJS service is connected (green status in dashboard)
- Check EmailJS dashboard → Logs for errors
- Verify environment variables are correct
- Make sure you restarted the server after adding .env file

**Still seeing code in console?**
- This is normal - the code is always logged for debugging
- If email is working, you'll also receive it via email
- If email is not working, check the console for error messages

