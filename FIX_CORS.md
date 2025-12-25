# Fix CORS Error for Firebase Cloud Functions

## Problem
You're getting this error:
```
Access to fetch at 'https://us-central1-pharmd-62541.cloudfunctions.net/sendVerificationEmail' from origin 'https://black-rock-0b1957e1e.2.azurestaticapps.net' has been blocked by CORS policy
```

## Solution

The Firebase Cloud Function needs to be updated to allow CORS requests from your Azure domain.

### Option 1: Update Existing Function (Recommended)

If you already have a Firebase Cloud Function deployed, update it with CORS support:

1. **Navigate to your Firebase Functions directory:**
   ```bash
   cd functions
   ```

2. **Update `functions/index.js` with this code:**

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({ origin: true });

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

// Method 1: Using onCall (Recommended - CORS handled automatically)
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

// Method 2: Using onRequest with CORS (Alternative if onCall doesn't work)
exports.sendVerificationEmailHTTP = functions.https.onRequest((req, res) => {
  // Enable CORS
  cors(req, res, async () => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

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
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
});
```

3. **Install CORS package (if using Method 2):**
   ```bash
   npm install cors
   ```

4. **Deploy the updated function:**
   ```bash
   firebase deploy --only functions:sendVerificationEmail
   ```

### Option 2: Configure CORS in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pharmd-62541`
3. Go to **Functions** → **sendVerificationEmail**
4. Check if the function is using `onCall` (which handles CORS automatically)
5. If it's using `onRequest`, you need to update it with CORS headers (see Option 1)

### Option 3: Use EmailJS Instead (Quick Fix)

Since EmailJS is already integrated, you can skip Firebase Cloud Functions entirely:

1. Set up EmailJS (see `QUICK_EMAIL_SETUP.md`)
2. Add your EmailJS credentials to `.env` file
3. The app will automatically use EmailJS instead of Firebase Functions

This avoids CORS issues since EmailJS works directly from the frontend.

### Verify Your Function Type

Check your current function implementation:
- If using `functions.https.onCall()` → CORS is handled automatically ✅
- If using `functions.https.onRequest()` → Need to add CORS manually ❌

### Quick Test

After updating, test the function:
```bash
# Test onCall function
curl -X POST https://us-central1-pharmd-62541.cloudfunctions.net/sendVerificationEmail \
  -H "Content-Type: application/json" \
  -d '{"data":{"email":"test@example.com","code":"123456"}}'
```

---

## Recommended Solution

**Use EmailJS** - It's simpler, doesn't require CORS configuration, and works directly from your frontend. See `QUICK_EMAIL_SETUP.md` for setup instructions.

