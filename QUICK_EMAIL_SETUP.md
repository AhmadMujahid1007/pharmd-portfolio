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

When deploying to Azure, you need to add these environment variables in Azure Portal:

1. Go to Azure Portal → Your Static Web App
2. Go to **Configuration** → **Application settings**
3. Add these three settings:
   - `REACT_APP_EMAILJS_SERVICE_ID` = your service ID
   - `REACT_APP_EMAILJS_TEMPLATE_ID` = your template ID
   - `REACT_APP_EMAILJS_PUBLIC_KEY` = your public key
4. Save and redeploy

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

