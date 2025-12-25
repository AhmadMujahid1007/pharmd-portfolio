import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const PORTFOLIO_DATA_ID = 'portfolio-data'; // Single document ID for all portfolio data
const USERS_COLLECTION = 'users'; // Collection for user accounts

// Save all portfolio data to Firebase
export const savePortfolioData = async (data) => {
  try {
    const dataToSave = {
      editableContent: data.editableContent,
      profileName: data.profileName,
      profileImageUrl: data.profileImageUrl,
      galleryImages: data.galleryImages,
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'portfolio', PORTFOLIO_DATA_ID), dataToSave, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    return { success: false, error: error.message };
  }
};

// Load all portfolio data from Firebase
export const loadPortfolioData = async () => {
  try {
    const docRef = doc(db, 'portfolio', PORTFOLIO_DATA_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        data: {
          editableContent: data.editableContent || null,
          profileName: data.profileName || null,
          profileImageUrl: data.profileImageUrl || null,
          galleryImages: data.galleryImages || null
        }
      };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    return { success: false, error: error.message, data: null };
  }
};

// Update specific field in portfolio data
export const updatePortfolioField = async (field, value) => {
  try {
    const docRef = doc(db, 'portfolio', PORTFOLIO_DATA_ID);
    await updateDoc(docRef, {
      [field]: value,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating portfolio field:', error);
    return { success: false, error: error.message };
  }
};

// User Management Functions
// Save/update user data
export const saveUser = async (userData) => {
  try {
    const { email, username, password, emailVerified = false, isAdmin = false, active, createdAt, verificationCode } = userData;
    
    // Check if user already exists
    const userQuery = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    
    const updateData = {
      username,
      password, // In production, this should be hashed
      emailVerified,
      isAdmin,
      updatedAt: new Date().toISOString()
    };
    
    // Include active if provided, otherwise keep existing value for updates
    if (active !== undefined) {
      updateData.active = active;
    }
    
    // Include verificationCode if provided
    if (verificationCode !== undefined) {
      updateData.verificationCode = verificationCode;
    }
    
    if (!querySnapshot.empty) {
      // Update existing user
      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, updateData);
      return { success: true, userId: userDoc.id };
    } else {
      // Create new user - default active to false
      const newUser = {
        email,
        username,
        password, // In production, this should be hashed
        emailVerified,
        isAdmin,
        active: active !== undefined ? active : false, // New users are inactive by default
        createdAt: createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Include verificationCode if provided
      if (verificationCode !== undefined) {
        newUser.verificationCode = verificationCode;
      }
      
      const docRef = await addDoc(collection(db, USERS_COLLECTION), newUser);
      return { success: true, userId: docRef.id };
    }
  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, error: error.message };
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const userQuery = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: true, user: null };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message, user: null };
  }
};

// Get user by username
export const getUserByUsername = async (username) => {
  try {
    const userQuery = query(collection(db, USERS_COLLECTION), where('username', '==', username));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
    } else {
      return { success: true, user: null };
    }
  } catch (error) {
    console.error('Error getting user by username:', error);
    return { success: false, error: error.message, user: null };
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, users };
  } catch (error) {
    console.error('Error getting all users:', error);
    return { success: false, error: error.message, users: [] };
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Update user (admin or self)
export const updateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

