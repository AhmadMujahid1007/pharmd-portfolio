
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBV22M4QbNTzw80IPiLRXMetT-OVJ5PN0E",
    authDomain: "pharmd-62541.firebaseapp.com",
    projectId: "pharmd-62541",
    storageBucket: "pharmd-62541.firebasestorage.app",
    messagingSenderId: "14778324268",
    appId: "1:14778324268:web:fe7e5095970acb95a50889",
    measurementId: "G-P97BQMCXMF"
  };
```

## Step 5: Set Firestore Security Rules (Important!)

1. Go to Firestore Database → Rules
2. Update the rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to portfolio data for everyone
    // In production, you should add authentication
    match /portfolio/{document=**} {
      allow read, write: if true;
    }
  }
}
```


