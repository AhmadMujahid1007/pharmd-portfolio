import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { savePortfolioData, loadPortfolioData, saveUser, getUserByEmail, getUserByUsername, getAllUsers, deleteUser, updateUser } from './firebaseService';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import emailjs from '@emailjs/browser';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
  const [resetPasswordStep, setResetPasswordStep] = useState(1);
  const [resendTimer, setResendTimer] = useState(0);
  const [resetResendTimer, setResetResendTimer] = useState(0);
  const isProduction = process.env.NODE_ENV === 'production';
  const RESEND_DELAY = isProduction ? 120 : 30;
  const [loginCredentials, setLoginCredentials] = useState({ usernameOrEmail: '', password: '' });
  const [passwordChange, setPasswordChange] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [newUserForm, setNewUserForm] = useState({ username: '', email: '', password: '', isAdmin: false });
  const [validationErrors, setValidationErrors] = useState({ username: '', email: '' });
  const [validating, setValidating] = useState({ username: false, email: false });
  const [showLoginButton, setShowLoginButton] = useState(false);
  const [galleryImages, setGalleryImages] = useState(() => {
    const saved = localStorage.getItem('galleryImages');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop', 
        title: 'Pharmacy Laboratory' 
      },
      { 
        id: 2, 
        url: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&h=600&fit=crop', 
        title: 'Medical Research' 
      },
      { 
        id: 3, 
        url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop', 
        title: 'Pharmaceutical Studies' 
      },
      { 
        id: 4, 
        url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop', 
        title: 'Healthcare Education' 
      },
      { 
        id: 5, 
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop', 
        title: 'University Campus' 
      },
      { 
        id: 6, 
        url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop', 
        title: 'Pharmacy Practice' 
      },
      { 
        id: 7, 
        url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=600&fit=crop', 
        title: 'Medical Books & Study' 
      },
      { 
        id: 8, 
        url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop', 
        title: 'Pharmaceutical Care' 
      }
    ];
  });
  const [galleryFilter, setGalleryFilter] = useState('all');
  const [gallerySort, setGallerySort] = useState('default');
  const [profileName, setProfileName] = useState(() => {
    const saved = localStorage.getItem('profileName');
    return saved || 'OM TANDON';
  });
  const [profileImageUrl, setProfileImageUrl] = useState(() => {
    const saved = localStorage.getItem('profileImageUrl');
    return saved || '';
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [editingImageTitle, setEditingImageTitle] = useState(null);
  const [editingImageTitleValue, setEditingImageTitleValue] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [draggedImage, setDraggedImage] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerField, setIconPickerField] = useState(null);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);
  const [iconSearchTerm, setIconSearchTerm] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [showExportImport, setShowExportImport] = useState(false);
  
  // Default content that should be shown when logged out
  const getDefaultContent = () => ({
      heroGreeting: "Hello, I'm",
      heroSubtitle: "PharmD Student | University of Toronto | Future Pharmacist",
      heroDescription: "Passionate about pharmaceutical care, patient counseling, and advancing healthcare through evidence-based practice. Dedicated to community service, leadership, and mentoring the next generation.",
      aboutTitle: "About Me",
      aboutText1: "I am a dedicated Doctor of Pharmacy (PharmD) candidate at the Leslie Dan Faculty of Pharmacy, University of Toronto, with a strong foundation in Biomedical Science from York University. My journey in pharmacy has been driven by a commitment to excellence in patient care, community service, and leadership.",
      aboutText2: "Beyond academics, I am passionate about mentoring and coaching. As an Assistant Coach at Vellore Woods Public School, I mentor junior athletes in basketball and volleyball, developing their leadership and teamwork skills. I also hold a Karate Black Belt (2018) and am actively involved in community outreach through World Vision and Run for Vaughan initiatives.",
      educationTitle: "Education",
      educationItems: [
        {
          id: 1,
          degree: "Doctor of Pharmacy (PharmD)",
          institution: "Leslie Dan Faculty of Pharmacy, University of Toronto",
          date: "Expected: 20XX",
          status: "Status: Candidate",
          icon: "fas fa-university"
        },
        {
          id: 2,
          degree: "BSc (Honours) - Biomedical Science",
          institution: "York University",
          date: "Graduated: 20XX",
          icon: "fas fa-graduation-cap"
        },
        {
          id: 3,
          degree: "High School Diploma",
          institution: "Tommy Douglas High School",
          date: "Ontario Scholar",
          icon: "fas fa-school"
        }
      ],
      experienceTitle: "Experience",
      experienceItems: [
        {
          id: 1,
          title: "Assistant Coach",
          company: "Vellore Woods Public School - Canada",
          date: "Basketball & Volleyball",
          icon: "fas fa-basketball-ball",
          bullets: [
            "Mentored junior athletes in basketball and volleyball",
            "Developed leadership and teamwork skills in student athletes",
            "Created training programs and strategies to enhance team performance",
            "Fostered a positive and supportive team environment"
          ]
        },
        {
          id: 2,
          title: "Communications Coordinator",
          company: "World Vision (York University Chapter)",
          date: "Volunteer Position",
          icon: "fas fa-bullhorn",
          bullets: [
            "Supported campus outreach and awareness campaigns",
            "Enhanced student engagement through strategic communications",
            "Organized events to raise awareness for global causes",
            "Managed social media and promotional materials"
          ]
        },
        {
          id: 3,
          title: "Youth Outreach Committee Member",
          company: "Run for Vaughan",
          date: "Volunteer Position",
          icon: "fas fa-running",
          bullets: [
            "Contributed to organizing community events promoting health, fitness, and charity",
            "Engaged with youth to promote active lifestyles",
            "Supported fundraising initiatives for charitable causes",
            "Coordinated volunteer activities and event logistics"
          ]
        }
      ],
      certificationsTitle: "Certifications",
      certificationItems: [
        {
          id: 1,
          title: "Ontario Injection Training",
          description: "Certified to administer injections in Ontario",
          icon: "fas fa-syringe"
        },
        {
          id: 2,
          title: "CPR & First Aid",
          description: "Certified in Cardiopulmonary Resuscitation and First Aid",
          icon: "fas fa-heartbeat"
        },
        {
          id: 3,
          title: "Karate Black Belt",
          description: "Achieved Black Belt in Karate (2018)",
          icon: "fas fa-shield-alt"
        }
      ],
      projectsTitle: "Projects & Research",
      projectItems: [
        {
          id: 1,
          title: "High School Community Service Award",
          description: "Recognized for outstanding commitment to community involvement and service. Demonstrated leadership and dedication to making a positive impact in the community.",
          tags: ["Leadership", "Community Service", "Award"]
        },
        {
          id: 2,
          title: "Student Mentorship Program",
          description: "Developed and implemented mentorship programs for junior athletes, focusing on leadership development, teamwork, and personal growth through sports.",
          tags: ["Mentorship", "Leadership", "Youth Development"]
        },
        {
          id: 3,
          title: "Community Health & Wellness Initiatives",
          description: "Organized and participated in community events promoting health, fitness, and wellness through Run for Vaughan and World Vision initiatives.",
          tags: ["Community Health", "Wellness", "Outreach"]
        }
      ],
      skillsTitle: "Skills",
      skillCategories: [
        {
          id: 1,
          title: "Pharmacy Skills",
          icon: "fas fa-pills",
          items: ["PharmD Candidate", "Biomedical Science", "Ontario Injection Training", "CPR & First Aid", "Patient Care", "Medication Management"]
        },
        {
          id: 2,
          title: "Leadership & Coaching",
          icon: "fas fa-users",
          items: ["Athletic Coaching", "Mentorship", "Team Leadership", "Communication", "Youth Development", "Event Organization"]
        },
        {
          id: 3,
          title: "Interests & Activities",
          icon: "fas fa-heart",
          items: ["Health & Wellness", "Basketball", "Volleyball", "Soccer", "Martial Arts", "Karate Black Belt"]
        }
      ],
      galleryTitle: "Gallery",
      contactTitle: "Get In Touch",
      contactLocation: "Toronto, Ontario, Canada",
      contactEducation: "Leslie Dan Faculty of Pharmacy\nUniversity of Toronto",
      contactLinkedIn: "https://linkedin.com/in/omtandon",
      contactLinkedInText: "linkedin.com/in/omtandon",
      footerText: "All rights reserved."
    });

  // Comprehensive editable content state - load from Firebase or localStorage as fallback
  const [editableContent, setEditableContent] = useState(() => {
    // Start with default content, will be updated from Firebase/localStorage
    return getDefaultContent();
  });
  // eslint-disable-next-line no-unused-vars
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Helper function to save all data to Firebase
  // eslint-disable-next-line no-unused-vars
  const saveAllDataToFirebase = useCallback(async () => {
    try {
      await savePortfolioData({ editableContent, profileName, profileImageUrl, galleryImages });
      return true;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      return false;
    }
  }, [editableContent, profileName, profileImageUrl, galleryImages]);

  // Check if URL contains login parameter to show/hide login button
  // Uses query parameters (?login=true) or hash (#login) for Azure compatibility
  useEffect(() => {
    const checkUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      
      // Check for query parameter: ?login=true or ?auth=true or ?page=login
      const hasLoginQuery = searchParams.get('login') === 'true' || 
                           searchParams.get('auth') === 'true' ||
                           searchParams.get('page') === 'login' ||
                           searchParams.get('page') === 'Login';
      
      // Check for hash: #login
      const hasLoginHash = hash === '#login' || hash.includes('#login');
      
      setShowLoginButton(hasLoginQuery || hasLoginHash);
    };
    
    checkUrl();
    // Check URL on hash change (for SPA navigation)
    window.addEventListener('hashchange', checkUrl);
    window.addEventListener('popstate', checkUrl);
    
    return () => {
      window.removeEventListener('hashchange', checkUrl);
      window.removeEventListener('popstate', checkUrl);
    };
  }, []);

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        // Try Firebase first
        const firebaseResult = await loadPortfolioData();
        if (firebaseResult.success && firebaseResult.data) {
          if (firebaseResult.data.editableContent) {
            setEditableContent(firebaseResult.data.editableContent);
          }
          if (firebaseResult.data.profileName) {
            setProfileName(firebaseResult.data.profileName);
          }
          if (firebaseResult.data.profileImageUrl) {
            setProfileImageUrl(firebaseResult.data.profileImageUrl);
          }
          if (firebaseResult.data.galleryImages) {
            setGalleryImages(firebaseResult.data.galleryImages);
          }
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('editableContent');
          if (saved) {
            setEditableContent(JSON.parse(saved));
          }
          const savedName = localStorage.getItem('profileName');
          if (savedName) {
            setProfileName(savedName);
          }
          const savedImage = localStorage.getItem('profileImageUrl');
          if (savedImage) {
            setProfileImageUrl(savedImage);
          }
          const savedGallery = localStorage.getItem('galleryImages');
          if (savedGallery) {
            setGalleryImages(JSON.parse(savedGallery));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage on error
        const saved = localStorage.getItem('editableContent');
        if (saved) {
          setEditableContent(JSON.parse(saved));
        }
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Update active section based on scroll position
      const sections = ['home', 'about', 'education', 'experience', 'certifications', 'projects', 'skills', 'gallery', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleClearAllData = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all user data? This will log you out and clear all accounts.')) {
      localStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUserEmail('');
      setShowLoginModal(false);
      setShowEmailVerificationModal(false);
      setShowChangePasswordModal(false);
      setShowResetPasswordModal(false);
      alert('All user data has been cleared. You can now create a new account.');
    }
  }, []);

  // Expose clear function to window for console access
  useEffect(() => {
    window.clearUserData = handleClearAllData;
    return () => {
      delete window.clearUserData;
    };
  }, [handleClearAllData]);

  // Timer for email verification resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Timer for password reset resend
  useEffect(() => {
    let interval = null;
    if (resetResendTimer > 0) {
      interval = setInterval(() => {
        setResetResendTimer(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resetResendTimer]);


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false); // Close menu on mobile after clicking
    }
  };

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async (email, code) => {
    // Log code to console for development/debugging
    console.log(`[VERIFICATION CODE] Email: ${email}, Code: ${code}`);
    
    // Try Firebase Cloud Function first (if deployed)
    try {
      const sendEmail = httpsCallable(functions, 'sendVerificationEmail');
      const result = await sendEmail({ email, code });
      
      if (result.data && result.data.success) {
        console.log('Email sent successfully via Cloud Function');
        return;
      }
    } catch (error) {
      // Check if it's a CORS error
      if (error.message && error.message.includes('CORS')) {
        console.warn('CORS error with Cloud Function. Falling back to EmailJS...');
        console.warn('To fix CORS, see FIX_CORS.md or use EmailJS instead.');
      } else {
        console.log('Cloud Function not available or error occurred, trying EmailJS...');
      }
    }
    
    // Fallback: Use EmailJS (requires setup - see EMAIL_SETUP.md)
    // To use EmailJS, you need to:
    // 1. Sign up at https://www.emailjs.com/ (free tier available)
    // 2. Create email service (Gmail/Outlook) and template
    // 3. Get Service ID, Template ID, and Public Key
    // 4. Add environment variables or update values below
    
    const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
    const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
    const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
    
    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_email: email,
          verification_code: code,
          message: `Your verification code is: ${code}. This code will expire in 10 minutes.`
        });
        console.log('Email sent successfully via EmailJS');
        return;
      } catch (error) {
        console.error('EmailJS error:', error);
      }
    }
    
    // If both methods fail, log to console
    console.warn('Email service not configured. Verification code:', code);
    console.warn('To enable email sending:');
    console.warn('1. Set up Firebase Cloud Functions (see EMAIL_SETUP.md), OR');
    console.warn('2. Set up EmailJS at https://www.emailjs.com/ and add environment variables');
    console.warn('   REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, REACT_APP_EMAILJS_PUBLIC_KEY');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginCredentials.usernameOrEmail || !loginCredentials.password) {
      alert('Please enter username/email and password');
      return;
    }
    
    try {
      // Try to find user by username first
      let userResult = await getUserByUsername(loginCredentials.usernameOrEmail);
      
      // If not found by username, try as email
      if (!userResult || !userResult.success || !userResult.user) {
        userResult = await getUserByEmail(loginCredentials.usernameOrEmail);
      }
      
      // User doesn't exist
      if (!userResult || !userResult.success || !userResult.user) {
        alert('User not found. Please contact an administrator to create an account.');
        return;
      }
      
      // User exists - verify credentials
      const user = userResult.user;
      
      // Check if user is active
      if (user.active === false) {
        alert('Your account is inactive. Please contact an administrator.');
        return;
      }
      
      // Verify password
      if (loginCredentials.password === user.password) {
        // Login user directly without email verification
        console.log('[LOGIN] User logged in:', user);
        setCurrentUser(user);
        setIsLoggedIn(true);
        setIsAdmin(user.isAdmin || false);
        
        // Save session
        localStorage.setItem('userSession', JSON.stringify({ email: user.email }));
        
        setShowLoginModal(false);
        setLoginCredentials({ usernameOrEmail: '', password: '' });
        alert('Login successful!');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  const handleEmailVerification = async (e) => {
    e.preventDefault();
    
    try {
      const userResult = await getUserByEmail(userEmail);
      if (!userResult.success || !userResult.user) {
        alert('User not found');
        return;
      }
      
      const user = userResult.user;
      
      // Check if user is active
      if (user.active === false) {
        alert('Your account is inactive. Please contact an administrator.');
        return;
      }
      
      if (verificationCode === user.verificationCode || verificationCode === generatedCode) {
        // Update user as verified
        await updateUser(user.id, { emailVerified: true });
        
        // Login user
        const updatedUser = { ...user, emailVerified: true };
        console.log('[EMAIL VERIFICATION] User data:', updatedUser);
        console.log('[EMAIL VERIFICATION] updatedUser.isAdmin:', updatedUser.isAdmin);
        console.log('[EMAIL VERIFICATION] Setting isAdmin to:', updatedUser.isAdmin || false);
        setCurrentUser(updatedUser);
        setIsLoggedIn(true);
        setIsAdmin(updatedUser.isAdmin || false);
        console.log('[EMAIL VERIFICATION] After setIsAdmin, checking state...');
        
        // Save session
        localStorage.setItem('userSession', JSON.stringify({ email: user.email }));
        
        setShowEmailVerificationModal(false);
        setVerificationCode('');
        setResendTimer(0);
        alert('Email verified successfully! You are now logged in.');
      } else {
        alert('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('An error occurred during verification. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) {
      return; // Prevent resend if timer is active
    }
    
    try {
      const code = generateVerificationCode();
      setGeneratedCode(code);
      const userResult = await getUserByEmail(userEmail);
      if (userResult.success && userResult.user) {
        await updateUser(userResult.user.id, { verificationCode: code });
      }
      sendVerificationEmail(userEmail, code);
      setResendTimer(RESEND_DELAY);
      if (!isProduction) {
        alert(`Verification code resent!\n\nCode: ${code}\n\n(Development mode)`);
      } else {
        alert('Verification code has been resent. Please check your email.');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('No user logged in');
      return;
    }
    
    try {
      const userResult = await getUserByEmail(currentUser.email);
      if (!userResult.success || !userResult.user) {
        alert('User not found');
        return;
      }
      
      const user = userResult.user;
      if (passwordChange.currentPassword !== user.password) {
        alert('Current password is incorrect');
        return;
      }
      
      if (passwordChange.newPassword !== passwordChange.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      
      if (passwordChange.newPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      
      await updateUser(user.id, { password: passwordChange.newPassword });
      setShowChangePasswordModal(false);
      setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail('');
    setShowUserManagement(false);
    // Don't reset content - keep saved content visible to all visitors
    setLastSaveTime(null);
    alert('Logged out successfully!');
  };

  const handleForgotPassword = () => {
    setShowLoginModal(false);
    setShowResetPasswordModal(true);
    setResetPasswordStep(1);
    setResetPasswordData({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
  };

  const handleResetPasswordEmail = (e) => {
    e.preventDefault();
    const userData = localStorage.getItem('userData');
    
    if (!userData) {
      alert('No account found with this email.');
      return;
    }
    
    const parsed = JSON.parse(userData);
    if (resetPasswordData.email !== parsed.email) {
      alert('Email not found. Please enter the email associated with your account.');
      return;
    }
    
    const code = generateVerificationCode();
    setGeneratedCode(code);
    parsed.resetCode = code;
    localStorage.setItem('userData', JSON.stringify(parsed));
    sendVerificationEmail(resetPasswordData.email, code);
    setResetPasswordStep(2);
    setResetResendTimer(RESEND_DELAY);
    if (!isProduction) {
      alert(`Verification code sent to ${resetPasswordData.email}\n\nCode: ${code}\n\n(Development mode)`);
    } else {
      alert(`Verification code has been sent to ${resetPasswordData.email}. Please check your email.`);
    }
  };

  const handleResetPasswordVerify = (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (resetPasswordData.verificationCode === userData.resetCode || resetPasswordData.verificationCode === generatedCode) {
      setResetPasswordStep(3);
    } else {
      alert('Invalid verification code. Please try again.');
    }
  };

  const handleResetPasswordComplete = (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (resetPasswordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    userData.password = resetPasswordData.newPassword;
    delete userData.resetCode;
    localStorage.setItem('userData', JSON.stringify(userData));
    setShowResetPasswordModal(false);
    setResetPasswordStep(1);
    setResetPasswordData({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
    alert('Password reset successfully! You can now login with your new password.');
    setShowLoginModal(true);
  };

  const handleResendResetCode = () => {
    if (resetResendTimer > 0) {
      return; // Prevent resend if timer is active
    }
    const code = generateVerificationCode();
    setGeneratedCode(code);
    const userData = JSON.parse(localStorage.getItem('userData'));
    userData.resetCode = code;
    localStorage.setItem('userData', JSON.stringify(userData));
    sendVerificationEmail(resetPasswordData.email, code);
    setResetResendTimer(RESEND_DELAY);
    if (!isProduction) {
      alert(`Verification code resent!\n\nCode: ${code}\n\n(Development mode)`);
    } else {
      alert('Verification code has been resent. Please check your email.');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleImageUpload = (e, imageId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedImages = galleryImages.map(img => 
          img.id === imageId 
            ? { ...img, url: reader.result, title: file.name }
            : img
        );
        setGalleryImages(updatedImages);
        localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
        savePortfolioData({ editableContent, profileName, profileImageUrl, galleryImages: updatedImages }).catch(err => {
          console.error('Failed to save to Firebase:', err);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      const updatedImages = galleryImages.filter(img => img.id !== imageId);
      setGalleryImages(updatedImages);
      localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
      savePortfolioData({ editableContent, profileName, profileImageUrl, galleryImages: updatedImages }).catch(err => {
        console.error('Failed to save to Firebase:', err);
      });
    }
  };

  const handleAddImage = () => {
    const newImage = {
      id: Date.now(),
      url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop',
      title: 'New Pharmacy Image'
    };
    const updatedImages = [...galleryImages, newImage];
    setGalleryImages(updatedImages);
    localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
    savePortfolioData({ editableContent, profileName, profileImageUrl, galleryImages: updatedImages }).catch(err => {
      console.error('Failed to save to Firebase:', err);
    });
  };

  const handleImageClick = (index) => {
    // Open carousel page with the selected image index
    window.location.href = `${process.env.PUBLIC_URL}/gallery-carousel.html?index=${index}`;
  };

  const handleDragStart = (e, index) => {
    setDraggedImage(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedImage === null || draggedImage === dropIndex) {
      setDraggedImage(null);
      setDragOverIndex(null);
      return;
    }

    const updatedImages = [...galleryImages];
    const [draggedItem] = updatedImages.splice(draggedImage, 1);
    updatedImages.splice(dropIndex, 0, draggedItem);
    
    setGalleryImages(updatedImages);
    localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
    setDraggedImage(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
    setDragOverIndex(null);
  };

  // Delete handlers for editable content
  const handleDeleteAboutText = (field) => {
    if (window.confirm('Are you sure you want to delete this paragraph?')) {
      const updated = { ...editableContent };
      delete updated[field];
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteEducationItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this education item?')) {
      const updated = { ...editableContent };
      updated.educationItems = updated.educationItems.filter(item => item.id !== itemId);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteExperienceItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this experience item?')) {
      const updated = { ...editableContent };
      updated.experienceItems = updated.experienceItems.filter(item => item.id !== itemId);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteCertificationItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      const updated = { ...editableContent };
      updated.certificationItems = updated.certificationItems.filter(item => item.id !== itemId);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteProjectItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updated = { ...editableContent };
      updated.projectItems = updated.projectItems.filter(item => item.id !== itemId);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteSkillCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this skill category?')) {
      const updated = { ...editableContent };
      updated.skillCategories = updated.skillCategories.filter(cat => cat.id !== categoryId);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  // Handlers for bullets, tags, and skills
  const handleAddBullet = (itemId) => {
    const updated = { ...editableContent };
    const item = updated.experienceItems.find(exp => exp.id === itemId);
    if (item) {
      item.bullets = [...item.bullets, 'New bullet point'];
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteBullet = (itemId, bulletIndex) => {
    if (window.confirm('Are you sure you want to delete this bullet point?')) {
      const updated = { ...editableContent };
      const item = updated.experienceItems.find(exp => exp.id === itemId);
      if (item && item.bullets.length > 1) {
        item.bullets = item.bullets.filter((_, index) => index !== bulletIndex);
        setEditableContent(updated);
        localStorage.setItem('editableContent', JSON.stringify(updated));
      } else if (item && item.bullets.length === 1) {
        alert('At least one bullet point is required.');
      }
    }
  };

  const handleAddTag = (itemId) => {
    const updated = { ...editableContent };
    const item = updated.projectItems.find(proj => proj.id === itemId);
    if (item) {
      item.tags = [...item.tags, 'New Tag'];
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteTag = (itemId, tagIndex) => {
    const updated = { ...editableContent };
    const item = updated.projectItems.find(proj => proj.id === itemId);
    if (item) {
      item.tags = item.tags.filter((_, index) => index !== tagIndex);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleAddSkill = (categoryId) => {
    const updated = { ...editableContent };
    const category = updated.skillCategories.find(cat => cat.id === categoryId);
    if (category) {
      category.items = [...category.items, 'New Skill'];
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    }
  };

  const handleDeleteSkill = (categoryId, skillIndex) => {
    const updated = { ...editableContent };
    const category = updated.skillCategories.find(cat => cat.id === categoryId);
    if (category && category.items.length > 1) {
      category.items = category.items.filter((_, index) => index !== skillIndex);
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
    } else if (category && category.items.length === 1) {
      alert('At least one skill is required.');
    }
  };

  const handleNameEdit = () => {
    setEditingNameValue(profileName);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    if (editingNameValue.trim()) {
      setProfileName(editingNameValue.trim());
      localStorage.setItem('profileName', editingNameValue.trim());
      setIsEditingName(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditingNameValue('');
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileImageUrl(imageUrl);
        localStorage.setItem('profileImageUrl', imageUrl);
        savePortfolioData({ editableContent, profileName, profileImageUrl: imageUrl, galleryImages }).catch(err => {
          console.error('Failed to save to Firebase:', err);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageRemove = () => {
    if (window.confirm('Are you sure you want to remove the profile image?')) {
      setProfileImageUrl('');
      localStorage.removeItem('profileImageUrl');
      savePortfolioData({ editableContent, profileName, profileImageUrl: '', galleryImages }).catch(err => {
        console.error('Failed to save to Firebase:', err);
      });
    }
  };

  const handleImageTitleEdit = (imageId, currentTitle) => {
    setEditingImageTitle(imageId);
    setEditingImageTitleValue(currentTitle);
  };

  const handleImageTitleSave = (imageId) => {
    if (editingImageTitleValue.trim()) {
      const updatedImages = galleryImages.map(img => 
        img.id === imageId 
          ? { ...img, title: editingImageTitleValue.trim() }
          : img
      );
      setGalleryImages(updatedImages);
      localStorage.setItem('galleryImages', JSON.stringify(updatedImages));
      savePortfolioData({ editableContent, profileName, profileImageUrl, galleryImages: updatedImages }).catch(err => {
        console.error('Failed to save to Firebase:', err);
      });
      setEditingImageTitle(null);
      setEditingImageTitleValue('');
    }
  };

  const handleImageTitleCancel = () => {
    setEditingImageTitle(null);
    setEditingImageTitleValue('');
  };

  // Generic editable content handlers
  const handleStartEdit = (field, currentValue) => {
    setEditingField(field);
    setEditingValue(currentValue || '');
  };

  const handleSaveEdit = (field) => {
    if (editingValue !== null && editingValue !== undefined) {
      const updated = { ...editableContent };
      
      // Handle LinkedIn URL update when text changes
      if (field === 'contactLinkedInText') {
        // Auto-update URL if it's just the text part
        if (!editingValue.startsWith('http')) {
          updated.contactLinkedIn = `https://${editingValue}`;
        } else {
          updated.contactLinkedIn = editingValue;
        }
      }
      
      // Handle nested fields like "education_1_degree", "experience_1_bullet_0", "project_1_tag_0", "skillCategory_1_item_0"
      if (field.includes('_')) {
        const parts = field.split('_');
        if (parts.length >= 3) {
          const [parent, id, ...rest] = parts;
          const itemId = parseInt(id);
          const parentArray = parent + 'Items';
          
          if (updated[parentArray]) {
            updated[parentArray] = updated[parentArray].map(item => {
              if (item.id === itemId) {
                const newItem = { ...item };
                if (rest[0] === 'bullet') {
                  // Handle bullet points: experience_1_bullet_0
                  const bulletIndex = parseInt(rest[1]);
                  newItem.bullets = [...newItem.bullets];
                  newItem.bullets[bulletIndex] = editingValue;
                } else if (rest[0] === 'tag') {
                  // Handle project tags: project_1_tag_0
                  const tagIndex = parseInt(rest[1]);
                  newItem.tags = [...newItem.tags];
                  newItem.tags[tagIndex] = editingValue;
                } else {
                  // Handle regular fields: education_1_degree
                  newItem[rest[0]] = editingValue;
                }
                return newItem;
              }
              return item;
            });
          }
        } else if (parts[0] === 'skillCategory') {
          // Handle skill categories: skillCategory_1_title or skillCategory_1_item_0
          const categoryId = parseInt(parts[1]);
          const fieldType = parts[2];
          const index = parts.length > 3 ? parseInt(parts[3]) : null;
          
          updated.skillCategories = updated.skillCategories.map(cat => {
            if (cat.id === categoryId) {
              const newCat = { ...cat };
              if (fieldType === 'title') {
                newCat.title = editingValue;
              } else if (fieldType === 'item' && index !== null) {
                newCat.items = [...newCat.items];
                newCat.items[index] = editingValue;
              }
              return newCat;
            }
            return cat;
          });
        } else {
          updated[field] = editingValue;
        }
      } else {
        updated[field] = editingValue;
      }
      
      setEditableContent(updated);
      localStorage.setItem('editableContent', JSON.stringify(updated));
      setLastSaveTime(new Date());
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    }
    setEditingField(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  // Reusable EditableText component function
  const EditableText = ({ field, value, tag = 'p', className = '', multiline = false, placeholder = '' }) => {
    const isEditing = editingField === field;
    
    if (isLoggedIn && isEditing) {
      return (
        <div className="editable-text-container" style={{ position: 'relative', marginBottom: '1rem' }}>
          {multiline ? (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className={className}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.5rem',
                border: '2px solid #2c5aa0',
                borderRadius: '5px',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                resize: 'vertical'
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSaveEdit(field);
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className={className}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '2px solid #2c5aa0',
                borderRadius: '5px',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveEdit(field);
                } else if (e.key === 'Escape') {
                  handleCancelEdit();
                }
              }}
              placeholder={placeholder}
            />
          )}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleSaveEdit(field)}
            >
              <i className="fas fa-check"></i> Save
            </button>
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleCancelEdit}
            >
              <i className="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      );
    }
    
    // Handle anchor tags specially for LinkedIn
    if (tag === 'a') {
      return (
        <>
          {isLoggedIn && isEditing ? (
            <div className="editable-text-container" style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className={className}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #2c5aa0',
                  borderRadius: '5px',
                  fontFamily: 'inherit',
                  fontSize: 'inherit'
                }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit(field);
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                placeholder={placeholder}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSaveEdit(field)}
                >
                  <i className="fas fa-check"></i> Save
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={handleCancelEdit}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
              </div>
            </div>
          ) : (
            <a 
              href={editableContent.contactLinkedIn || 'https://linkedin.com/in/omtandon'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={className}
              style={{ position: 'relative', display: 'inline-block', width: '100%', color: '#2c5aa0', textDecoration: 'none' }}
            >
              {value}
              {isLoggedIn && !isEditing && (
                <button 
                  className="edit-text-btn"
                  onClick={() => handleStartEdit(field, value)}
                  title="Edit"
                  style={{
                    marginLeft: '10px',
                    background: 'rgba(44, 90, 160, 0.1)',
                    border: '1px solid #2c5aa0',
                    borderRadius: '5px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    color: '#2c5aa0',
                    verticalAlign: 'middle'
                  }}
                >
                  <i className="fas fa-edit"></i>
                </button>
              )}
            </a>
          )}
        </>
      );
    }
    
    const Tag = tag;
    const isBulletField = field.includes('_bullet_');
    return (
      <Tag className={className} style={{ position: 'relative', display: isBulletField ? 'inline' : 'inline-block', width: isBulletField ? 'auto' : '100%' }}>
        {value}
        {isLoggedIn && !isEditing && (
          <button 
            className="edit-text-btn"
            onClick={() => handleStartEdit(field, value)}
            title="Edit"
            style={{
              marginLeft: '5px',
              background: 'rgba(44, 90, 160, 0.1)',
              border: '1px solid #2c5aa0',
              borderRadius: '5px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              color: '#2c5aa0',
              verticalAlign: 'middle',
              display: 'inline-block',
              flexShrink: 0
            }}
          >
            <i className="fas fa-edit"></i>
          </button>
        )}
      </Tag>
    );
  };

  // Icon picker helper function
  const commonIcons = {
    education: ['fas fa-university', 'fas fa-graduation-cap', 'fas fa-school', 'fas fa-book', 'fas fa-certificate', 'fas fa-user-graduate'],
    experience: ['fas fa-briefcase', 'fas fa-building', 'fas fa-basketball-ball', 'fas fa-bullhorn', 'fas fa-running', 'fas fa-users', 'fas fa-handshake', 'fas fa-chart-line'],
    certification: ['fas fa-certificate', 'fas fa-award', 'fas fa-medal', 'fas fa-trophy', 'fas fa-shield-alt', 'fas fa-syringe', 'fas fa-heartbeat', 'fas fa-check-circle'],
    project: ['fas fa-flask', 'fas fa-project-diagram', 'fas fa-code', 'fas fa-lightbulb', 'fas fa-rocket', 'fas fa-award', 'fas fa-users', 'fas fa-heart'],
    skill: ['fas fa-pills', 'fas fa-users', 'fas fa-heart', 'fas fa-cog', 'fas fa-tools', 'fas fa-laptop', 'fas fa-microscope', 'fas fa-stethoscope']
  };

  // Comprehensive icon list for dropdown
  const allIcons = [
    'fas fa-university', 'fas fa-graduation-cap', 'fas fa-school', 'fas fa-book', 'fas fa-certificate', 'fas fa-user-graduate',
    'fas fa-briefcase', 'fas fa-building', 'fas fa-basketball-ball', 'fas fa-bullhorn', 'fas fa-running', 'fas fa-users', 'fas fa-handshake', 'fas fa-chart-line',
    'fas fa-award', 'fas fa-medal', 'fas fa-trophy', 'fas fa-shield-alt', 'fas fa-syringe', 'fas fa-heartbeat', 'fas fa-check-circle',
    'fas fa-flask', 'fas fa-project-diagram', 'fas fa-code', 'fas fa-lightbulb', 'fas fa-rocket', 'fas fa-heart',
    'fas fa-pills', 'fas fa-cog', 'fas fa-tools', 'fas fa-laptop', 'fas fa-microscope', 'fas fa-stethoscope',
    'fas fa-star', 'fas fa-fire', 'fas fa-gem', 'fas fa-crown', 'fas fa-bolt', 'fas fa-magic', 'fas fa-sparkles',
    'fas fa-home', 'fas fa-user', 'fas fa-users-cog', 'fas fa-user-md', 'fas fa-user-nurse', 'fas fa-user-tie', 'fas fa-user-friends',
    'fas fa-envelope', 'fas fa-phone', 'fas fa-map-marker-alt', 'fas fa-globe', 'fas fa-link', 'fas fa-share-alt',
    'fas fa-calendar', 'fas fa-clock', 'fas fa-calendar-check', 'fas fa-calendar-alt', 'fas fa-history',
    'fas fa-chart-bar', 'fas fa-chart-pie', 'fas fa-chart-area', 'fas fa-trending-up',
    'fas fa-cogs', 'fas fa-wrench', 'fas fa-screwdriver', 'fas fa-hammer',
    'fas fa-desktop', 'fas fa-mobile-alt', 'fas fa-tablet-alt', 'fas fa-server', 'fas fa-database',
    'fas fa-code-branch', 'fas fa-terminal', 'fas fa-file-code', 'fas fa-brackets-curly',
    'fas fa-paint-brush', 'fas fa-palette', 'fas fa-images', 'fas fa-photo-video', 'fas fa-camera',
    'fas fa-music', 'fas fa-video', 'fas fa-film', 'fas fa-play', 'fas fa-stop', 'fas fa-pause',
    'fas fa-gamepad', 'fas fa-dice', 'fas fa-chess', 'fas fa-puzzle-piece',
    'fas fa-futbol', 'fas fa-football-ball', 'fas fa-baseball-ball', 'fas fa-volleyball-ball',
    'fas fa-swimmer', 'fas fa-bicycle', 'fas fa-hiking', 'fas fa-dumbbell',
    'fas fa-car', 'fas fa-plane', 'fas fa-train', 'fas fa-ship', 'fas fa-motorcycle', 'fas fa-bus',
    'fas fa-utensils', 'fas fa-coffee', 'fas fa-birthday-cake', 'fas fa-cookie-bite', 'fas fa-pizza-slice',
    'fas fa-kiss', 'fas fa-smile', 'fas fa-laugh', 'fas fa-grin', 'fas fa-thumbs-up', 'fas fa-thumbs-down',
    'fas fa-flag', 'fas fa-flag-usa', 'fas fa-globe-americas', 'fas fa-globe-europe', 'fas fa-globe-asia',
    'fas fa-leaf', 'fas fa-tree', 'fas fa-seedling', 'fas fa-spa', 'fas fa-recycle',
    'fas fa-sun', 'fas fa-moon', 'fas fa-cloud', 'fas fa-umbrella', 'fas fa-snowflake',
    'fas fa-dog', 'fas fa-cat', 'fas fa-dove', 'fas fa-fish', 'fas fa-horse', 'fas fa-paw',
    'fas fa-book-open', 'fas fa-book-reader', 'fas fa-chalkboard-teacher', 'fas fa-clipboard-list',
    'fas fa-microphone', 'fas fa-headphones', 'fas fa-radio', 'fas fa-tv', 'fas fa-broadcast-tower',
    'fas fa-store', 'fas fa-shopping-cart', 'fas fa-shopping-bag', 'fas fa-credit-card', 'fas fa-money-bill-wave',
    'fas fa-hospital', 'fas fa-ambulance', 'fas fa-prescription-bottle', 'fas fa-capsules',
    'fas fa-first-aid', 'fas fa-band-aid', 'fas fa-thermometer-half', 'fas fa-x-ray', 'fas fa-procedures',
    'fas fa-swimming-pool', 'fas fa-bowling-ball', 'fas fa-table-tennis', 'fas fa-golf-ball',
    'fas fa-chess-pawn', 'fas fa-chess-knight', 'fas fa-chess-bishop', 'fas fa-chess-rook', 'fas fa-chess-queen', 'fas fa-chess-king'
  ];

  const handleIconChange = (field, icon) => {
    const updated = { ...editableContent };
    const fieldParts = field.split('_');
    
    if (fieldParts[0] === 'education') {
      const itemIndex = updated.educationItems.findIndex(item => item.id === parseInt(fieldParts[1]));
      if (itemIndex !== -1) {
        updated.educationItems[itemIndex].icon = icon;
      }
    } else if (fieldParts[0] === 'experience') {
      const itemIndex = updated.experienceItems.findIndex(item => item.id === parseInt(fieldParts[1]));
      if (itemIndex !== -1) {
        updated.experienceItems[itemIndex].icon = icon;
      }
    } else if (fieldParts[0] === 'certification') {
      const itemIndex = updated.certificationItems.findIndex(item => item.id === parseInt(fieldParts[1]));
      if (itemIndex !== -1) {
        updated.certificationItems[itemIndex].icon = icon;
      }
    } else if (fieldParts[0] === 'project') {
      const itemIndex = updated.projectItems.findIndex(item => item.id === parseInt(fieldParts[1]));
      if (itemIndex !== -1) {
        updated.projectItems[itemIndex].icon = icon;
      }
    } else if (fieldParts[0] === 'skillCategory') {
      const itemIndex = updated.skillCategories.findIndex(item => item.id === parseInt(fieldParts[1]));
      if (itemIndex !== -1) {
        updated.skillCategories[itemIndex].icon = icon;
      }
    }
    
    setEditableContent(updated);
    localStorage.setItem('editableContent', JSON.stringify(updated));
    savePortfolioData({ editableContent: updated, profileName, profileImageUrl, galleryImages }).catch(err => {
      console.error('Failed to save to Firebase:', err);
    });
    setLastSaveTime(new Date());
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
    setShowIconPicker(false);
  };

  const openIconPicker = (field, category) => {
    setIconPickerField({ field, category });
    setShowIconPicker(true);
    setIconDropdownOpen(false);
    setIconSearchTerm('');
  };

  // Export all data to JSON file
  const handleExportData = () => {
    const dataToExport = {
      editableContent,
      profileName,
      profileImageUrl,
      galleryImages
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert('Data exported successfully! You can import this file in another browser.');
  };

  // Import data from JSON file
  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (importedData.editableContent) {
          setEditableContent(importedData.editableContent);
          localStorage.setItem('editableContent', JSON.stringify(importedData.editableContent));
        }
        if (importedData.profileName) {
          setProfileName(importedData.profileName);
          localStorage.setItem('profileName', importedData.profileName);
        }
        if (importedData.profileImageUrl) {
          setProfileImageUrl(importedData.profileImageUrl);
          localStorage.setItem('profileImageUrl', importedData.profileImageUrl);
        }
        if (importedData.galleryImages) {
          setGalleryImages(importedData.galleryImages);
          localStorage.setItem('galleryImages', JSON.stringify(importedData.galleryImages));
        }
        
        // Save imported data to Firebase
        const dataToSave = {
          editableContent: importedData.editableContent || editableContent,
          profileName: importedData.profileName || profileName,
          profileImageUrl: importedData.profileImageUrl || profileImageUrl,
          galleryImages: importedData.galleryImages || galleryImages
        };
        savePortfolioData(dataToSave).catch(err => {
          console.error('Failed to save imported data to Firebase:', err);
        });
        
        setShowExportImport(false);
        setLastSaveTime(new Date());
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 2000);
        alert('Data imported successfully! Your changes are now visible.');
      } catch (error) {
        alert('Error importing data. Please make sure the file is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Admin User Management Functions
  const loadAllUsers = async () => {
    if (!isAdmin) return;
    try {
      const result = await getAllUsers();
      if (result.success) {
        setAllUsers(result.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Debug: Track isAdmin changes
  useEffect(() => {
    console.log('[isAdmin STATE CHANGE] New value:', isAdmin);
    console.log('[isAdmin STATE CHANGE] Type:', typeof isAdmin);
    console.log('[isAdmin STATE CHANGE] isLoggedIn:', isLoggedIn);
    console.log('[isAdmin STATE CHANGE] currentUser:', currentUser);
  }, [isAdmin, isLoggedIn, currentUser]);

  // Debug: Track showUserManagement changes
  useEffect(() => {
    console.log('[showUserManagement STATE CHANGE] New value:', showUserManagement);
  }, [showUserManagement]);

  useEffect(() => {
    if (isAdmin && showUserManagement) {
      console.log('[loadAllUsers] Loading users - isAdmin:', isAdmin, 'showUserManagement:', showUserManagement);
      loadAllUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, showUserManagement]);

  // Validate username on blur
  const handleUsernameBlur = async () => {
    if (!newUserForm.username.trim()) {
      setValidationErrors(prev => ({ ...prev, username: '' }));
      return;
    }
    
    setValidating(prev => ({ ...prev, username: true }));
    try {
      const existingUser = await getUserByUsername(newUserForm.username.trim());
      if (existingUser.success && existingUser.user) {
        setValidationErrors(prev => ({ ...prev, username: 'Username already exists' }));
      } else {
        setValidationErrors(prev => ({ ...prev, username: '' }));
      }
    } catch (error) {
      console.error('Error validating username:', error);
      setValidationErrors(prev => ({ ...prev, username: 'Error checking username' }));
    } finally {
      setValidating(prev => ({ ...prev, username: false }));
    }
  };

  // Validate email on blur
  const handleEmailBlur = async () => {
    if (!newUserForm.email.trim()) {
      setValidationErrors(prev => ({ ...prev, email: '' }));
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserForm.email.trim())) {
      setValidationErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return;
    }
    
    setValidating(prev => ({ ...prev, email: true }));
    try {
      const existingUser = await getUserByEmail(newUserForm.email.trim());
      if (existingUser.success && existingUser.user) {
        setValidationErrors(prev => ({ ...prev, email: 'Email already exists' }));
      } else {
        setValidationErrors(prev => ({ ...prev, email: '' }));
      }
    } catch (error) {
      console.error('Error validating email:', error);
      setValidationErrors(prev => ({ ...prev, email: 'Error checking email' }));
    } finally {
      setValidating(prev => ({ ...prev, email: false }));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    // Check for validation errors
    if (validationErrors.username || validationErrors.email) {
      alert('Please fix validation errors before submitting');
      return;
    }
    
    try {
      // Double-check if user already exists (in case validation was bypassed)
      const existingUserByEmail = await getUserByEmail(newUserForm.email);
      if (existingUserByEmail.success && existingUserByEmail.user) {
        setValidationErrors(prev => ({ ...prev, email: 'Email already exists' }));
        alert('User with this email already exists');
        return;
      }
      
      const existingUserByUsername = await getUserByUsername(newUserForm.username);
      if (existingUserByUsername.success && existingUserByUsername.user) {
        setValidationErrors(prev => ({ ...prev, username: 'Username already exists' }));
        alert('User with this username already exists');
        return;
      }
      
      const code = generateVerificationCode();
      const result = await saveUser({
        ...newUserForm,
        emailVerified: false,
        active: false, // New users are inactive until admin activates them
        verificationCode: code
      });
      
      if (result.success) {
        alert('User created successfully!');
        setNewUserForm({ username: '', email: '', password: '', isAdmin: false });
        setValidationErrors({ username: '', email: '' });
        loadAllUsers();
      } else {
        alert('Error creating user: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleDeleteUserAdmin = async (userId, userEmail) => {
    if (!isAdmin) return;
    if (userEmail === currentUser?.email) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete user: ${userEmail}?`)) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          alert('User deleted successfully');
          loadAllUsers();
        } else {
          alert('Error deleting user: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const handleToggleAdminStatus = async (userId, currentStatus, userEmail) => {
    if (!isAdmin) return;
    if (userEmail === currentUser?.email) {
      alert('You cannot change your own admin status');
      return;
    }
    
    try {
      const result = await updateUser(userId, { isAdmin: !currentStatus });
      if (result.success) {
        alert(`User admin status ${!currentStatus ? 'enabled' : 'disabled'}`);
        loadAllUsers();
      } else {
        alert('Error updating user: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleToggleActiveStatus = async (userId, currentStatus, userEmail) => {
    if (!isAdmin) return;
    if (userEmail === currentUser?.email) {
      alert('You cannot change your own active status');
      return;
    }
    
    try {
      const result = await updateUser(userId, { active: !currentStatus });
      if (result.success) {
        alert(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
        loadAllUsers();
      } else {
        alert('Error updating user: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Filter and sort gallery images
  const getFilteredAndSortedImages = () => {
    let filtered = [...galleryImages];
    
    // Apply filter (for now, just return all - can be extended)
    if (galleryFilter === 'recent') {
      filtered = filtered.slice().reverse();
    }
    
    // Apply sort
    if (gallerySort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (gallerySort === 'date') {
      filtered.sort((a, b) => b.id - a.id);
    }
    
    return filtered;
  };

  return (
    <div className="App">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <i className="fas fa-user-md"></i> OT
          </div>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
          {isMenuOpen && <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>}
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} className={activeSection === 'home' ? 'active' : ''}>Home</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className={activeSection === 'about' ? 'active' : ''}>About</a></li>
            <li><a href="#education" onClick={(e) => { e.preventDefault(); scrollToSection('education'); }} className={activeSection === 'education' ? 'active' : ''}>Education</a></li>
            <li><a href="#experience" onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }} className={activeSection === 'experience' ? 'active' : ''}>Experience</a></li>
            <li><a href="#certifications" onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }} className={activeSection === 'certifications' ? 'active' : ''}>Certifications</a></li>
            <li><a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }} className={activeSection === 'projects' ? 'active' : ''}>Projects</a></li>
            <li><a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }} className={activeSection === 'skills' ? 'active' : ''}>Skills</a></li>
            <li><a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }} className={activeSection === 'gallery' ? 'active' : ''}>Gallery</a></li>
            <li><a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('contact'); }} className={activeSection === 'contact' ? 'active' : ''}>Contact</a></li>
            <li>
              {isLoggedIn ? (
                <div className="nav-user-menu">
                  {(() => {
                    console.log('[NAV RENDER] isLoggedIn:', isLoggedIn);
                    console.log('[NAV RENDER] isAdmin:', isAdmin);
                    console.log('[NAV RENDER] Will show Manage Users button?', isAdmin);
                    return null;
                  })()}
                  {isAdmin && (
                    <button 
                      className="nav-login-btn" 
                      onClick={() => {
                        console.log('[MANAGE USERS BUTTON] Clicked!');
                        console.log('[MANAGE USERS BUTTON] Current isAdmin:', isAdmin);
                        console.log('[MANAGE USERS BUTTON] Setting showUserManagement to true');
                        setShowUserManagement(true);
                      }} 
                      style={{background: '#17a2b8'}}
                    >
                      <i className="fas fa-users"></i> Manage Users
                    </button>
                  )}
                  <button className="nav-login-btn" onClick={() => setShowChangePasswordModal(true)}>
                    <i className="fas fa-key"></i> Change Password
                  </button>
                  <button className="nav-login-btn nav-logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              ) : (
                showLoginButton && (
                  <button className="nav-login-btn" onClick={() => setShowLoginModal(true)}>
                    <i className="fas fa-sign-in-alt"></i> Login
                  </button>
                )
              )}
            </li>
          </ul>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowLoginModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-lock"></i> Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username or Email</label>
                <input
                  type="text"
                  value={loginCredentials.usernameOrEmail}
                  onChange={(e) => setLoginCredentials({...loginCredentials, usernameOrEmail: e.target.value})}
                  placeholder="Enter username or email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                  placeholder="Enter password"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-sign-in-alt"></i> Login
              </button>
            </form>
            <p className="login-hint">
              Enter your username or email address to login. Contact an administrator to create an account.
            </p>
            <div className="login-footer">
              <button 
                type="button" 
                className="forgot-password-link" 
                onClick={handleForgotPassword}
              >
                <i className="fas fa-key"></i> Forgot Password?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="modal-overlay" onClick={() => {
          if (window.confirm('Are you sure you want to cancel password reset?')) {
            setShowResetPasswordModal(false);
            setResetPasswordStep(1);
            setResetPasswordData({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              if (window.confirm('Are you sure you want to cancel password reset?')) {
                setShowResetPasswordModal(false);
                setResetPasswordStep(1);
                setResetPasswordData({ email: '', verificationCode: '', newPassword: '', confirmPassword: '' });
              }
            }}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-key"></i> Reset Password</h2>
            
            {resetPasswordStep === 1 && (
              <form onSubmit={handleResetPasswordEmail}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={resetPasswordData.email}
                    onChange={(e) => setResetPasswordData({...resetPasswordData, email: e.target.value})}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-paper-plane"></i> Send Verification Code
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setShowLoginModal(true);
                    setResetPasswordStep(1);
                  }}
                  style={{marginTop: '0.5rem', width: '100%'}}
                >
                  Back to Login
                </button>
              </form>
            )}

            {resetPasswordStep === 2 && (
              <form onSubmit={handleResetPasswordVerify}>
                <p className="verification-info">
                  Verification code sent to <strong>{resetPasswordData.email}</strong>
                </p>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={resetPasswordData.verificationCode}
                    onChange={(e) => setResetPasswordData({...resetPasswordData, verificationCode: e.target.value})}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-check"></i> Verify Code
                </button>
                <button 
                  type="button" 
                  className={`btn btn-secondary ${resetResendTimer > 0 ? 'btn-disabled' : ''}`}
                  onClick={handleResendResetCode}
                  disabled={resetResendTimer > 0}
                  style={{marginTop: '0.5rem', width: '100%'}}
                >
                  <i className="fas fa-redo"></i> {resetResendTimer > 0 ? `Resend Code (${resetResendTimer}s)` : 'Resend Code'}
                </button>
                <p className="verification-hint">
                  Check your email for the verification code. (Demo: Code shown in alert)
                </p>
              </form>
            )}

            {resetPasswordStep === 3 && (
              <form onSubmit={handleResetPasswordComplete}>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={resetPasswordData.newPassword}
                    onChange={(e) => setResetPasswordData({...resetPasswordData, newPassword: e.target.value})}
                    placeholder="Enter new password (min 6 characters)"
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={resetPasswordData.confirmPassword}
                    onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                    placeholder="Confirm new password"
                    minLength="6"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <div className="modal-overlay" onClick={() => {}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              if (window.confirm('Are you sure you want to cancel? You will need to verify your email to login.')) {
                setShowEmailVerificationModal(false);
              }
            }}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-envelope"></i> Email Verification</h2>
            <p className="verification-info">
              A verification code has been sent to <strong>{userEmail}</strong>
            </p>
            <form onSubmit={handleEmailVerification}>
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-check"></i> Verify Email
              </button>
            </form>
            <button 
              type="button" 
              className={`btn btn-secondary ${resendTimer > 0 ? 'btn-disabled' : ''}`}
              onClick={handleResendCode}
              disabled={resendTimer > 0}
              style={{marginTop: '1rem', width: '100%'}}
            >
              <i className="fas fa-redo"></i> {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
            </button>
            <p className="verification-hint">
              Check your email for the verification code. (Demo: Code shown in alert)
            </p>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="modal-overlay" onClick={() => setShowChangePasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowChangePasswordModal(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-key"></i> Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordChange.currentPassword}
                  onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordChange.newPassword}
                  onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
                  placeholder="Enter new password (min 6 characters)"
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordChange.confirmPassword}
                  onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-save"></i> Change Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="greeting">Hello, I'm</span>
              {isLoggedIn && !isEditingName ? (
                <span className="name" style={{position: 'relative', display: 'inline-block'}}>
                  {profileName}
                  <button 
                    className="edit-name-btn"
                    onClick={handleNameEdit}
                    title="Edit Name"
                    style={{
                      marginLeft: '10px',
                      background: 'rgba(44, 90, 160, 0.1)',
                      border: '1px solid #2c5aa0',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '0.6rem',
                      color: '#2c5aa0'
                    }}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                </span>
              ) : isEditingName ? (
                <span className="name" style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                  <input
                    type="text"
                    value={editingNameValue}
                    onChange={(e) => setEditingNameValue(e.target.value)}
                    style={{
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                      fontWeight: 'inherit',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid #2c5aa0',
                      borderRadius: '5px',
                      padding: '5px 10px',
                      color: '#333',
                      minWidth: '200px'
                    }}
                    autoFocus
                  />
                  <button 
                    onClick={handleNameSave}
                    style={{
                      background: '#2c5aa0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 15px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    <i className="fas fa-check"></i> Save
                  </button>
                  <button 
                    onClick={handleNameCancel}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px 15px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </span>
              ) : (
                <span className="name">{profileName}</span>
              )}
            </h1>
            <EditableText 
              field="heroSubtitle" 
              value={editableContent.heroSubtitle} 
              tag="p" 
              className="hero-subtitle" 
            />
            <EditableText 
              field="heroDescription" 
              value={editableContent.heroDescription} 
              tag="p" 
              className="hero-description" 
              multiline={true}
            />
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => scrollToSection('contact')}>
                <i className="fas fa-envelope"></i> Get In Touch
              </button>
              <button className="btn btn-secondary" onClick={() => scrollToSection('projects')}>
                <i className="fas fa-briefcase"></i> View Work
              </button>
            </div>
            <div className="social-links">
              <a href={editableContent.contactLinkedIn || "https://linkedin.com/in/omtandon"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
              <a href="mailto:email@example.com" aria-label="Email"><i className="fas fa-envelope"></i></a>
            </div>
          </div>
          <div className="hero-image">
            <div className="profile-image-container" style={{position: 'relative'}}>
              {profileImageUrl ? (
                <img 
                  src={profileImageUrl} 
                  alt={`${profileName} - PharmD Student`}
                  className="profile-photo"
                />
              ) : (
                <>
                  <img 
                    src={process.env.PUBLIC_URL + '/profile-photo.jpg'} 
                    alt={`${profileName} - PharmD Student`}
                    className="profile-photo"
                    onError={(e) => {
                      // Try alternative image formats
                      const img = e.target;
                      const formats = ['/profile-photo.png', '/profile-photo.jpeg', '/profile-photo.webp'];
                      const currentSrc = img.src;
                      const basePath = process.env.PUBLIC_URL || '';
                      
                      // Check if we've tried all formats
                      const triedFormat = formats.find(f => currentSrc.includes(f));
                      if (triedFormat) {
                        const nextIndex = formats.indexOf(triedFormat) + 1;
                        if (nextIndex < formats.length) {
                          img.src = basePath + formats[nextIndex];
                          return;
                        }
                      } else if (!currentSrc.includes('/profile-photo')) {
                        // First error, try png
                        img.src = basePath + '/profile-photo.png';
                        return;
                      }
                      
                      // All formats failed, show placeholder
                      img.style.display = 'none';
                      const placeholder = img.nextElementSibling;
                      if (placeholder) {
                        placeholder.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="image-placeholder" style={{display: 'none'}}>
                    <i className="fas fa-user-md"></i>
                  </div>
                </>
              )}
              {isLoggedIn && (
                <div className="profile-image-edit-overlay">
                  <label className="profile-edit-btn profile-upload-btn">
                    <i className="fas fa-upload"></i> Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      style={{display: 'none'}}
                    />
                  </label>
                  {profileImageUrl && (
                    <button 
                      className="profile-edit-btn profile-remove-btn"
                      onClick={handleProfileImageRemove}
                    >
                      <i className="fas fa-times"></i> Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-user"></i> <EditableText field="aboutTitle" value={editableContent.aboutTitle} tag="span" />
            {isLoggedIn && (
              <button 
                className="section-add-btn"
                onClick={() => {
                  const newText = prompt('Enter new paragraph text:');
                  if (newText) {
                    const updated = { ...editableContent };
                    if (!updated.aboutText3) {
                      updated.aboutText3 = newText;
                      setEditableContent(updated);
                      localStorage.setItem('editableContent', JSON.stringify(updated));
                    }
                  }
                }}
                title="Add Paragraph"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
          </h2>
          <div className="about-content">
            <div className="about-text">
              <EditableText field="aboutText1" value={editableContent.aboutText1} tag="p" multiline={true} />
              <EditableText field="aboutText2" value={editableContent.aboutText2} tag="p" multiline={true} />
              {editableContent.aboutText3 && (
                <div style={{position: 'relative'}}>
                  <EditableText field="aboutText3" value={editableContent.aboutText3} tag="p" multiline={true} />
                  {isLoggedIn && (
                    <button 
                      className="delete-item-btn"
                      onClick={() => handleDeleteAboutText('aboutText3')}
                      title="Delete Paragraph"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>
              )}
              <div className="about-stats">
                <div className="stat-item">
                  <i className="fas fa-graduation-cap"></i>
                  <h3>PharmD</h3>
                  <p>Candidate</p>
                </div>
                <div className="stat-item">
                  <i className="fas fa-certificate"></i>
                  <h3>BSc (Honours)</h3>
                  <p>Biomedical Science</p>
                </div>
                <div className="stat-item">
                  <i className="fas fa-trophy"></i>
                  <h3>Black Belt</h3>
                  <p>Karate (2018)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-graduation-cap"></i> <EditableText field="educationTitle" value={editableContent.educationTitle} tag="span" />
            {isLoggedIn && (
              <button 
                className="section-add-btn"
                onClick={() => {
                  const newItem = {
                    id: Date.now(),
                    degree: "New Degree",
                    institution: "Institution Name",
                    date: "Date",
                    icon: "fas fa-university"
                  };
                  const updated = { ...editableContent };
                  updated.educationItems = [...updated.educationItems, newItem];
                  setEditableContent(updated);
                  localStorage.setItem('editableContent', JSON.stringify(updated));
                }}
                title="Add Education"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
          </h2>
          <div className="timeline">
            {editableContent.educationItems.map((item, index) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-icon" style={{cursor: isLoggedIn ? 'pointer' : 'default'}} onClick={isLoggedIn ? () => openIconPicker(`education_${item.id}`, 'education') : undefined} title={isLoggedIn ? "Click to change icon" : ""}>
                  <i className={item.icon || "fas fa-university"}></i>
                </div>
                <div className="timeline-content" style={{position: 'relative'}}>
                  {isLoggedIn && (
                    <button 
                      className="delete-item-btn"
                      onClick={() => handleDeleteEducationItem(item.id)}
                      title="Delete Education"
                      style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10}}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                  <EditableText field={`education_${item.id}_degree`} value={item.degree} tag="h3" />
                  <EditableText field={`education_${item.id}_institution`} value={item.institution} tag="h4" />
                  <span className="timeline-date">
                    <i className="far fa-calendar"></i> <EditableText field={`education_${item.id}_date`} value={item.date} tag="span" />
                  </span>
                  <p>
                    <strong>Status:</strong> <EditableText field={`education_${item.id}_status`} value={item.status || ''} tag="span" placeholder="Enter status" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-briefcase"></i> <EditableText field="experienceTitle" value={editableContent.experienceTitle} tag="span" />
            {isLoggedIn && (
              <button 
                className="section-add-btn"
                onClick={() => {
                  const newItem = {
                    id: Date.now(),
                    title: "New Position",
                    company: "Company Name",
                    date: "Date",
                    icon: "fas fa-briefcase",
                    bullets: ["Bullet point 1", "Bullet point 2"]
                  };
                  const updated = { ...editableContent };
                  updated.experienceItems = [...updated.experienceItems, newItem];
                  setEditableContent(updated);
                  localStorage.setItem('editableContent', JSON.stringify(updated));
                }}
                title="Add Experience"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
          </h2>
          <div className="experience-grid">
            {editableContent.experienceItems.map((item, index) => (
              <div key={item.id} className="experience-card" style={{position: 'relative'}}>
                {isLoggedIn && (
                  <button 
                    className="delete-item-btn"
                    onClick={() => handleDeleteExperienceItem(item.id)}
                    title="Delete Experience"
                    style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <div className="card-icon" style={{cursor: isLoggedIn ? 'pointer' : 'default', position: 'relative'}} onClick={isLoggedIn ? () => openIconPicker(`experience_${item.id}`, 'experience') : undefined} title={isLoggedIn ? "Click to change icon" : ""}>
                  <i className={item.icon || "fas fa-briefcase"}></i>
                </div>
                <h3>
                  <EditableText field={`experience_${item.id}_title`} value={item.title} tag="span" />
                </h3>
                <EditableText field={`experience_${item.id}_company`} value={item.company} tag="h4" />
                <span className="card-date">
                  <i className="far fa-calendar"></i> <EditableText field={`experience_${item.id}_date`} value={item.date} tag="span" />
                </span>
                <ul style={{position: 'relative'}}>
                  {item.bullets.map((bullet, bulletIndex) => (
                    <li key={`${item.id}_bullet_${bulletIndex}`} style={{position: 'relative', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '5px'}}>
                      <span style={{flex: '1', minWidth: 0}}>
                        <EditableText field={`experience_${item.id}_bullet_${bulletIndex}`} value={bullet} tag="span" />
                      </span>
                      {isLoggedIn && (
                        <>
                          <button 
                            className="delete-small-btn"
                            onClick={() => handleDeleteBullet(item.id, bulletIndex)}
                            title="Delete Bullet"
                            style={{
                              background: 'transparent',
                              color: '#ff6b6b',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                              padding: 0,
                              flexShrink: 0
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                  {isLoggedIn && (
                    <li>
                      <button 
                        className="add-small-btn"
                        onClick={() => handleAddBullet(item.id)}
                        title="Add Bullet Point"
                        style={{
                          background: '#2c5aa0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          marginTop: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <i className="fas fa-plus"></i> Add Bullet
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-certificate"></i> <EditableText field="certificationsTitle" value={editableContent.certificationsTitle} tag="span" />
            {isLoggedIn && (
              <button 
                className="section-add-btn"
                onClick={() => {
                  const newItem = {
                    id: Date.now(),
                    title: "New Certification",
                    description: "Certification description",
                    icon: "fas fa-certificate"
                  };
                  const updated = { ...editableContent };
                  updated.certificationItems = [...updated.certificationItems, newItem];
                  setEditableContent(updated);
                  localStorage.setItem('editableContent', JSON.stringify(updated));
                }}
                title="Add Certification"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
          </h2>
          <div className="certifications-grid">
            {editableContent.certificationItems.map((item, index) => (
              <div key={item.id} className="certification-card" style={{position: 'relative'}}>
                {isLoggedIn && (
                  <button 
                    className="delete-item-btn"
                    onClick={() => handleDeleteCertificationItem(item.id)}
                    title="Delete Certification"
                    style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <div className="cert-icon" style={{cursor: isLoggedIn ? 'pointer' : 'default', position: 'relative'}} onClick={isLoggedIn ? () => openIconPicker(`certification_${item.id}`, 'certification') : undefined} title={isLoggedIn ? "Click to change icon" : ""}>
                  <i className={item.icon || "fas fa-certificate"}></i>
                </div>
                <EditableText field={`certification_${item.id}_title`} value={item.title} tag="h3" />
                <EditableText field={`certification_${item.id}_description`} value={item.description} tag="p" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-flask"></i> <EditableText field="projectsTitle" value={editableContent.projectsTitle} tag="span" />
            {isLoggedIn && (
              <button 
                className="section-add-btn"
                onClick={() => {
                  const newItem = {
                    id: Date.now(),
                    title: "New Project",
                    description: "Project description",
                    tags: ["Tag1", "Tag2"],
                    icon: "fas fa-project-diagram"
                  };
                  const updated = { ...editableContent };
                  updated.projectItems = [...updated.projectItems, newItem];
                  setEditableContent(updated);
                  localStorage.setItem('editableContent', JSON.stringify(updated));
                }}
                title="Add Project"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
          </h2>
          <div className="projects-grid">
            {editableContent.projectItems.map((item, index) => (
              <div key={item.id} className="project-card" style={{position: 'relative'}}>
                {isLoggedIn && (
                  <button 
                    className="delete-item-btn"
                    onClick={() => handleDeleteProjectItem(item.id)}
                    title="Delete Project"
                    style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <div className="project-icon">
                  <i className={index === 0 ? "fas fa-trophy" : index === 1 ? "fas fa-users" : "fas fa-heart"}></i>
                </div>
                <EditableText field={`project_${item.id}_title`} value={item.title} tag="h3" />
                <EditableText field={`project_${item.id}_description`} value={item.description} tag="p" multiline={true} />
                <div className="project-tags" style={{position: 'relative'}}>
                  {item.tags.map((tag, tagIndex) => (
                    <span key={`${item.id}_tag_${tagIndex}`} style={{position: 'relative', display: 'inline-block', marginRight: '5px', marginBottom: '5px'}}>
                      <EditableText field={`project_${item.id}_tag_${tagIndex}`} value={tag} tag="span" />
                      {isLoggedIn && (
                        <button 
                          className="delete-small-btn"
                          onClick={() => handleDeleteTag(item.id, tagIndex)}
                          title="Delete Tag"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.6rem',
                            padding: 0,
                            zIndex: 10
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </span>
                  ))}
                  {isLoggedIn && (
                    <button 
                      className="add-small-btn"
                      onClick={() => handleAddTag(item.id)}
                      title="Add Tag"
                      style={{
                        background: '#2c5aa0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginTop: '5px'
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Tag
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-tools"></i> <EditableText field="skillsTitle" value={editableContent.skillsTitle} tag="span" />
            {isLoggedIn && (
              <button 
                className="section-add-btn"
                onClick={() => {
                  const newCategory = {
                    id: Date.now(),
                    title: "New Category",
                    icon: "fas fa-cog",
                    items: ["Skill 1", "Skill 2"]
                  };
                  const updated = { ...editableContent };
                  updated.skillCategories = [...updated.skillCategories, newCategory];
                  setEditableContent(updated);
                  localStorage.setItem('editableContent', JSON.stringify(updated));
                }}
                title="Add Skill Category"
              >
                <i className="fas fa-plus"></i>
              </button>
            )}
          </h2>
          <div className="skills-container">
            {editableContent.skillCategories.map((category, catIndex) => (
              <div key={category.id} className="skill-category" style={{position: 'relative'}}>
                {isLoggedIn && (
                  <button 
                    className="delete-item-btn"
                    onClick={() => handleDeleteSkillCategory(category.id)}
                    title="Delete Skill Category"
                    style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10}}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
                <h3>
                  <i 
                    className={category.icon || "fas fa-cog"} 
                    style={{cursor: isLoggedIn ? 'pointer' : 'default'}} 
                    onClick={isLoggedIn ? () => openIconPicker(`skillCategory_${category.id}`, 'skill') : undefined} 
                    title={isLoggedIn ? "Click to change icon" : ""}
                  ></i>{' '}
                  <EditableText field={`skillCategory_${category.id}_title`} value={category.title} tag="span" />
                </h3>
                <div className="skills-grid" style={{position: 'relative'}}>
                  {category.items.map((skill, skillIndex) => (
                    <div key={`${category.id}_skill_${skillIndex}`} className="skill-item" style={{position: 'relative', paddingRight: isLoggedIn ? '25px' : '0'}}>
                      <EditableText field={`skillCategory_${category.id}_item_${skillIndex}`} value={skill} tag="span" />
                      {isLoggedIn && (
                        <button 
                          className="delete-small-btn"
                          onClick={() => handleDeleteSkill(category.id, skillIndex)}
                          title="Delete Skill"
                          style={{
                            position: 'absolute',
                            right: '5px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            padding: 0
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  {isLoggedIn && (
                    <button 
                      className="add-small-btn"
                      onClick={() => handleAddSkill(category.id)}
                      title="Add Skill"
                      style={{
                        background: '#2c5aa0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        gridColumn: '1 / -1',
                        justifySelf: 'center',
                        marginTop: '10px'
                      }}
                    >
                      <i className="fas fa-plus"></i> Add Skill
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="section section-alt">
          <div className="container">
            <h2 className="section-title">
              <i className="fas fa-images"></i> <EditableText field="galleryTitle" value={editableContent.galleryTitle} tag="span" />
            </h2>
            
            {/* Gallery Options */}
            <div className="gallery-options">
              <div className="gallery-options-left">
                <a 
                  href={`${process.env.PUBLIC_URL}/gallery-carousel.html`}
                  className="gallery-option-btn"
                  title="Carousel View"
                >
                  <i className="fas fa-images"></i> View Carousel
                </a>
              </div>
              
              <div className="gallery-options-right">
                <select 
                  className="gallery-filter-select"
                  value={galleryFilter}
                  onChange={(e) => setGalleryFilter(e.target.value)}
                >
                  <option value="all">All Images</option>
                  <option value="recent">Recent</option>
                </select>
                
                <select 
                  className="gallery-sort-select"
                  value={gallerySort}
                  onChange={(e) => setGallerySort(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="title">Sort by Title</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            </div>

            {isLoggedIn && (
              <div className="gallery-admin-controls">
                <button className="btn btn-primary" onClick={handleAddImage}>
                  <i className="fas fa-plus"></i> Add Image
                </button>
              </div>
            )}
            
            <div className="gallery-grid">
              {getFilteredAndSortedImages().map((image, index) => {
                const originalIndex = galleryImages.findIndex(img => img.id === image.id);
                return (
                  <div 
                    key={image.id} 
                    className={`gallery-item ${dragOverIndex === originalIndex ? 'drag-over' : ''} ${draggedImage === originalIndex ? 'dragging' : ''}`}
                    draggable={isLoggedIn}
                    onDragStart={(e) => isLoggedIn && handleDragStart(e, originalIndex)}
                    onDragOver={(e) => isLoggedIn && handleDragOver(e, originalIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => isLoggedIn && handleDrop(e, originalIndex)}
                    onDragEnd={handleDragEnd}
                    style={{ cursor: isLoggedIn ? 'move' : 'pointer' }}
                  >
                    <div className="gallery-image-wrapper" onClick={() => handleImageClick(originalIndex)}>
                      <img src={image.url} alt={image.title} className="gallery-image" />
                      <div className="gallery-hover-overlay">
                        <i className="fas fa-expand"></i>
                        <span>Click to view</span>
                      </div>
                      {isLoggedIn && (
                        <div className="gallery-overlay">
                          <button 
                            className="gallery-btn gallery-edit-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageTitleEdit(image.id);
                            }}
                            title="Edit Title"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="gallery-btn gallery-delete-btn" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(image.id);
                            }}
                            title="Delete Image"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )}
                    </div>
                    {isLoggedIn && editingImageTitle === image.id ? (
                      <div className="gallery-image-title-edit">
                        <input
                          type="text"
                          value={editingImageTitleValue}
                          onChange={(e) => setEditingImageTitleValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleImageTitleSave(image.id);
                            } else if (e.key === 'Escape') {
                              handleImageTitleCancel();
                            }
                          }}
                        />
                        <div className="gallery-title-edit-buttons">
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleImageTitleSave(image.id)}
                          >
                            <i className="fas fa-check"></i> Save
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={handleImageTitleCancel}
                          >
                            <i className="fas fa-times"></i> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="gallery-image-title">
                        {image.title}
                        {isLoggedIn && (
                          <button 
                            className="edit-image-title-btn"
                            onClick={() => handleImageTitleEdit(image.id, image.title)}
                            title="Edit Title"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      {/* Contact Section */}
      <section id="contact" className="section">
        <div className="container">
          <h2 className="section-title">
            <i className="fas fa-envelope"></i> <EditableText field="contactTitle" value={editableContent.contactTitle} tag="span" />
          </h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <i className="fab fa-linkedin"></i>
                <div style={{position: 'relative', width: '100%'}}>
                  <h3>LinkedIn</h3>
                  <p>
                    <EditableText 
                      field="contactLinkedInText" 
                      value={editableContent.contactLinkedInText} 
                      tag="a" 
                      className="contact-link"
                    />
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Location</h3>
                  <p><EditableText field="contactLocation" value={editableContent.contactLocation} tag="span" /></p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-university"></i>
                <div>
                  <h3>Education</h3>
                  <p style={{whiteSpace: 'pre-line'}}>
                    <EditableText field="contactEducation" value={editableContent.contactEducation} tag="span" multiline={true} />
                  </p>
                </div>
              </div>
            </div>
            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Subject" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Your Message" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Icon Picker Modal */}
      {showIconPicker && iconPickerField && (
        <div className="modal-overlay" onClick={() => setShowIconPicker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <button className="modal-close" onClick={() => setShowIconPicker(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-icons"></i> Select Icon</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '400px', overflowY: 'auto', padding: '10px'}}>
              {commonIcons[iconPickerField.category]?.map((icon, idx) => (
                <button
                  key={idx}
                  onClick={() => handleIconChange(iconPickerField.field, icon)}
                  style={{
                    padding: '15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#2c5aa0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2c5aa0';
                    e.currentTarget.style.background = '#f0f4ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = 'white';
                  }}
                  title={icon}
                >
                  <i className={icon}></i>
                </button>
              ))}
            </div>
            <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0', position: 'relative'}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>More icons:</label>
              <div style={{position: 'relative'}}>
                <button
                  onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '5px',
                    background: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>Browse all icons</span>
                  <i className={`fas fa-chevron-${iconDropdownOpen ? 'up' : 'down'}`}></i>
                </button>
                {iconDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '5px',
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '5px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    <div style={{padding: '10px', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, background: 'white', zIndex: 1001}}>
                      <input
                        type="text"
                        placeholder="Search icons..."
                        value={iconSearchTerm}
                        onChange={(e) => setIconSearchTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '5px',
                          fontSize: '0.9rem'
                        }}
                        autoFocus
                      />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '10px'}}>
                      {allIcons.filter(icon => 
                        icon.toLowerCase().includes(iconSearchTerm.toLowerCase())
                      ).map((icon, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleIconChange(iconPickerField.field, icon);
                            setIconDropdownOpen(false);
                            setIconSearchTerm('');
                          }}
                          style={{
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: '#2c5aa0'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2c5aa0';
                            e.currentTarget.style.background = '#f0f4ff';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={icon}
                        >
                          <i className={icon}></i>
                        </button>
                      ))}
                    </div>
                    {allIcons.filter(icon => 
                      icon.toLowerCase().includes(iconSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                        No icons found matching "{iconSearchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Button - only shown when logged in */}
      {isLoggedIn && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          {lastSaveTime && (
            <div style={{
              background: '#28a745',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-check-circle"></i>
              <span>All changes saved</span>
            </div>
          )}
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end'}}>
            <button
              onClick={() => setShowExportImport(true)}
              style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 20px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#138496';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#17a2b8';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-exchange-alt"></i>
              <span>Export/Import</span>
            </button>
            <button
              onClick={() => {
                localStorage.setItem('editableContent', JSON.stringify(editableContent));
                setLastSaveTime(new Date());
                setShowSaveToast(true);
                setTimeout(() => setShowSaveToast(false), 2000);
              }}
              style={{
                background: '#2c5aa0',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '15px 25px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e3f73';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2c5aa0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
            >
              <i className="fas fa-save"></i>
              <span>Save All</span>
            </button>
          </div>
        </div>
      )}

      {/* User Management Modal (Admin Only) */}
      {(() => {
        console.log('[USER MANAGEMENT MODAL] showUserManagement:', showUserManagement);
        console.log('[USER MANAGEMENT MODAL] isAdmin:', isAdmin);
        console.log('[USER MANAGEMENT MODAL] Condition result:', showUserManagement && isAdmin);
        return null;
      })()}
      {showUserManagement && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowUserManagement(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto'}}>
            <button className="modal-close" onClick={() => setShowUserManagement(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-users"></i> User Management</h2>
            
            {/* Create New User Form */}
            <div style={{marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '10px'}}>
              <h3 style={{marginBottom: '1rem', color: '#2c5aa0'}}>Create New User</h3>
              <form onSubmit={handleCreateUser}>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      value={newUserForm.username}
                      onChange={(e) => {
                        setNewUserForm({...newUserForm, username: e.target.value});
                        // Clear error when user starts typing
                        if (validationErrors.username) {
                          setValidationErrors(prev => ({ ...prev, username: '' }));
                        }
                      }}
                      onBlur={handleUsernameBlur}
                      placeholder="Enter username"
                      required
                      style={{
                        borderColor: validationErrors.username ? '#dc3545' : undefined
                      }}
                    />
                    {validating.username && (
                      <small style={{color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem'}}>
                        <i className="fas fa-spinner fa-spin"></i> Checking...
                      </small>
                    )}
                    {validationErrors.username && !validating.username && (
                      <small style={{color: '#dc3545', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem'}}>
                        <i className="fas fa-exclamation-circle"></i> {validationErrors.username}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newUserForm.email}
                      onChange={(e) => {
                        setNewUserForm({...newUserForm, email: e.target.value});
                        // Clear error when user starts typing
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      onBlur={handleEmailBlur}
                      placeholder="Enter email"
                      required
                      style={{
                        borderColor: validationErrors.email ? '#dc3545' : undefined
                      }}
                    />
                    {validating.email && (
                      <small style={{color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem'}}>
                        <i className="fas fa-spinner fa-spin"></i> Checking...
                      </small>
                    )}
                    {validationErrors.email && !validating.email && (
                      <small style={{color: '#dc3545', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem'}}>
                        <i className="fas fa-exclamation-circle"></i> {validationErrors.email}
                      </small>
                    )}
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group" style={{display: 'flex', alignItems: 'flex-end'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        checked={newUserForm.isAdmin}
                        onChange={(e) => setNewUserForm({...newUserForm, isAdmin: e.target.checked})}
                      />
                      Admin User
                    </label>
                  </div>
                </div>
                <div style={{marginTop: '1.5rem', width: '100%'}}>
                  <button 
                    type="submit" 
                    style={{
                      background: '#2c5aa0',
                      color: 'white',
                      padding: '14px 28px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(44, 90, 160, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1e3f73';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(44, 90, 160, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#2c5aa0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 90, 160, 0.3)';
                    }}
                  >
                    <i className="fas fa-user-plus"></i> Create User
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div>
              <h3 style={{marginBottom: '1rem', color: '#2c5aa0'}}>All Users ({allUsers.length})</h3>
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden'}}>
                  <thead>
                    <tr style={{background: '#2c5aa0', color: 'white'}}>
                      <th style={{padding: '1rem', textAlign: 'left'}}>Username</th>
                      <th style={{padding: '1rem', textAlign: 'left'}}>Email</th>
                      <th style={{padding: '1rem', textAlign: 'center'}}>Verified</th>
                      <th style={{padding: '1rem', textAlign: 'center'}}>Admin</th>
                      <th style={{padding: '1rem', textAlign: 'center'}}>Active</th>
                      <th style={{padding: '1rem', textAlign: 'center'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user.id} style={{borderBottom: '1px solid #e0e0e0'}}>
                        <td style={{padding: '1rem'}}>{user.username}</td>
                        <td style={{padding: '1rem'}}>{user.email}</td>
                        <td style={{padding: '1rem', textAlign: 'center'}}>
                          {user.emailVerified ? (
                            <i className="fas fa-check-circle" style={{color: '#28a745', fontSize: '1.2rem'}}></i>
                          ) : (
                            <i className="fas fa-times-circle" style={{color: '#dc3545', fontSize: '1.2rem'}}></i>
                          )}
                        </td>
                        <td style={{padding: '1rem', textAlign: 'center'}}>
                          {user.isAdmin ? (
                            <i className="fas fa-shield-alt" style={{color: '#ffc107', fontSize: '1.2rem'}}></i>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td style={{padding: '1rem', textAlign: 'center'}}>
                          {user.active !== false ? (
                            <i className="fas fa-check-circle" style={{color: '#28a745', fontSize: '1.2rem'}}></i>
                          ) : (
                            <i className="fas fa-times-circle" style={{color: '#dc3545', fontSize: '1.2rem'}}></i>
                          )}
                        </td>
                        <td style={{padding: '1rem', textAlign: 'center'}}>
                          <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                            <button
                              onClick={() => handleToggleActiveStatus(user.id, user.active !== false, user.email)}
                              className="btn btn-sm"
                              style={{background: user.active !== false ? '#28a745' : '#6c757d', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem'}}
                              title={user.active !== false ? 'Deactivate User' : 'Activate User'}
                            >
                              <i className={`fas fa-${user.active !== false ? 'ban' : 'check'}`}></i>
                            </button>
                            <button
                              onClick={() => handleToggleAdminStatus(user.id, user.isAdmin, user.email)}
                              className="btn btn-sm"
                              style={{background: user.isAdmin ? '#ffc107' : '#17a2b8', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem'}}
                              title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                            >
                              <i className={`fas fa-${user.isAdmin ? 'user-shield' : 'shield-alt'}`}></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUserAdmin(user.id, user.email)}
                              className="btn btn-sm"
                              style={{background: '#dc3545', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem'}}
                              title="Delete User"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {allUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{padding: '2rem', textAlign: 'center', color: '#666'}}>
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export/Import Modal */}
      {showExportImport && (
        <div className="modal-overlay" onClick={() => setShowExportImport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <button className="modal-close" onClick={() => setShowExportImport(false)}>
              <i className="fas fa-times"></i>
            </button>
            <h2><i className="fas fa-exchange-alt"></i> Export/Import Data</h2>
            <p style={{marginBottom: '1.5rem', color: '#666'}}>
              Export your data to use it in another browser, or import previously exported data.
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <button
                onClick={handleExportData}
                className="btn btn-primary"
                style={{width: '100%', justifyContent: 'center'}}
              >
                <i className="fas fa-download"></i> Export Data to File
              </button>
              <div style={{textAlign: 'center', color: '#666', margin: '0.5rem 0'}}>OR</div>
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>
                  Import Data from File:
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e0e0e0',
                    borderRadius: '5px',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showSaveToast && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '30px',
          background: '#28a745',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <i className="fas fa-check-circle" style={{fontSize: '1.2rem'}}></i>
          <span style={{fontWeight: 500}}>Changes saved successfully!</span>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 {profileName}. <EditableText field="footerText" value={editableContent.footerText} tag="span" /></p>
          <div className="footer-social">
            <a href={editableContent.contactLinkedIn || "https://linkedin.com/in/omtandon"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
            <a href="mailto:email@example.com" aria-label="Email"><i className="fas fa-envelope"></i></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
