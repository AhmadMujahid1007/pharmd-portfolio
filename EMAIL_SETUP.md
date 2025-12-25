# Email Setup Guide

## Option 1: Firebase Cloud Functions (Recommended for Production)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase Functions
```bash
firebase init functions
# Select JavaScript
# Install dependencies? Yes
```

### Step 3: Install Email Package
```bash
cd functions
npm install nodemailer
# OR use SendGrid
npm install @sendgrid/mail
```

### Step 4: Create Email Function

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use App Password, not regular password
  }
});

// Or use SendGrid:
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('your-sendgrid-api-key');

exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  const { email, code } = data;
  
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Your Verification Code',
    html: `
      <h2>Verification Code</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
});
```

### Step 5: Deploy Function
```bash
firebase deploy --only functions
```

### Step 6: Update App.js to Call Function

See the updated `sendVerificationEmail` function in App.js that calls this Cloud Function.

---

## Option 2: EmailJS (Quick Setup - Recommended for Immediate Use)

EmailJS is already installed and integrated! Just follow these steps:

### Step 1: Sign up at https://www.emailjs.com/
- Free tier: 200 emails/month
- No credit card required

### Step 2: Add Email Service
1. Go to Email Services → Add New Service
2. Choose Gmail, Outlook, or other provider
3. Follow the setup instructions
4. **Copy the Service ID** (e.g., `service_xxxxx`)

### Step 3: Create Email Template
1. Go to Email Templates → Create New Template
2. Use this template:
   ```
   Subject: Your Verification Code
   
   Hello,
   
   Your verification code is: {{verification_code}}
   
   This code will expire in 10 minutes.
   
   If you didn't request this code, please ignore this email.
   ```
3. **Copy the Template ID** (e.g., `template_xxxxx`)

### Step 4: Get Public Key
1. Go to Account → API Keys
2. **Copy your Public Key** (e.g., `xxxxxxxxxxxxx`)

### Step 5: Add Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Important**: 
- Restart your development server after adding `.env` file
- For production (Azure), add these as environment variables in Azure Portal:
  - Go to your Static Web App → Configuration → Application settings
  - Add each variable with the same names

### Step 6: Test
- Try logging in - the verification code should be sent via email!
- Check your email inbox (and spam folder)

---

## Option 3: Azure Communication Services (For Azure Deployment)

Since you're deploying to Azure, you can use Azure Communication Services Email.

### Step 1: Create Azure Communication Services Resource
- Go to Azure Portal
- Create Communication Services resource
- Get connection string

### Step 2: Create Azure Function
- Create Azure Function App
- Add email sending code
- Deploy function

---

## Quick Solution: EmailJS Implementation

For immediate use, I'll implement EmailJS which works from the frontend.

