import React, { useState, useRef, useEffect } from 'react';
import { useSmartRelief } from '../../context/SmartReliefContext';
import { Shield, Mail, Lock, LogIn, UserPlus, User, Eye, EyeOff, Activity, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LoginPage() {
  const { login, register, loginAsGuest, addUser, checkEmail, forgotPassword, verifyOtp, resetPassword } = useSmartRelief();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRegSuccessModal, setShowRegSuccessModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState<'email' | 'otp' | 'new_password'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const roleOptions = [
    { value: 'CITIZEN', label: 'Citizen' },
    { value: 'RESPONDER', label: 'Responder' },
    { value: 'ADMIN', label: 'Admin' }
  ];
  const selectedRoleLabel = roleOptions.find(opt => opt.value === role)?.label || 'Select Role';

  const isRegistering = authMode === 'register';
  const isForgotPassword = authMode === 'forgot_password';

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-[#E2E8F0]' };
    if (pass.length >= 8) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
      case 2:
        return { score, label: 'Weak', color: 'bg-red-500' };
      case 3:
      case 4:
        return { score, label: 'Medium', color: 'bg-yellow-500' };
      case 5:
        return { score, label: 'Strong', color: 'bg-green-500' };
      default:
        return { score: 0, label: '', color: 'bg-[#E2E8F0]' };
    }
  };
  const pwdStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    let isValid = true;

    // DEVELOPER SEED CHECK
    if (isRegistering) {
      const lowerName = name.trim().toLowerCase();
      if (['admintest', 'respondertest', 'citizentest'].includes(lowerName)) {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
        setIsLoading(false);
        if (lowerName === 'citizentest') {
          setShowRegSuccessModal(true);
        } else {
          setShowApprovalModal(true);
        }
        return;
      }
    }
    
    if (authMode === 'login') {
      const lowerEmail = email.trim().toLowerCase();
      if (['admintest', 'respondertest', 'citizentest'].includes(lowerEmail)) {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
        setIsLoading(false);
        
        if (lowerEmail === 'admintest' || lowerEmail === 'respondertest') {
          setShowApprovalModal(true);
        } else if (lowerEmail === 'citizentest') {
          const loginResult = await login('carlos.dalisay@gmail.com', 'password123');
          if (!loginResult.success) {
            setError(loginResult.message || 'Invalid credentials.');
          }
        }
        return;
      }
    }

    const newFieldErrors: Record<string, string> = {};

    if (authMode !== 'forgot_password' || (authMode === 'forgot_password' && otpStep === 'email')) {
      if (!email) {
        newFieldErrors.email = 'Email address is required';
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newFieldErrors.email = 'Please enter a valid email';
        isValid = false;
      }
    }

    if (isRegistering && !newFieldErrors.email) {
      setIsLoading(true);
      const exists = await checkEmail(email);
      setIsLoading(false);
      if (exists) {
        setFieldErrors({ email: 'Email is already used, please log in instead.' });
        setShakeKey(prev => prev + 1);
        return; // Prioritize email collision over other empty fields
      }
    }

    if (isRegistering) {
      if (!name) { newFieldErrors.name = 'Full name is required'; isValid = false; }
      if (!role) { newFieldErrors.role = 'Account type is required'; isValid = false; }
      if (!password) { newFieldErrors.password = 'Password is required'; isValid = false; } 
      else if (pwdStrength.score < 5) { newFieldErrors.password = 'Must be 8+ chars with uppercase, lowercase, number & special char'; isValid = false; }
      if (!confirmPassword) { newFieldErrors.confirmPassword = 'Confirm password is required'; isValid = false; }
      else if (password !== confirmPassword) { newFieldErrors.confirmPassword = 'Passwords do not match'; isValid = false; }
    } else if (authMode === 'login') {
      if (!password) { newFieldErrors.password = 'Password is required'; isValid = false; }
    } else if (isForgotPassword && otpStep === 'otp') {
      if (otp.join('').length < 6) {
        newFieldErrors.otp = 'Please enter the complete 6-digit OTP';
        isValid = false;
      }
    } else if (isForgotPassword && otpStep === 'new_password') {
      if (!password) { newFieldErrors.password = 'Password is required'; isValid = false; } 
      else if (pwdStrength.score < 5) { newFieldErrors.password = 'Must be 8+ chars with uppercase, lowercase, number & special char'; isValid = false; }
      if (!confirmPassword) { newFieldErrors.confirmPassword = 'Confirm password is required'; isValid = false; }
      else if (password !== confirmPassword) { newFieldErrors.confirmPassword = 'Passwords do not match'; isValid = false; }
    }

    setFieldErrors(newFieldErrors);
    if (!isValid) { setShakeKey(prev => prev + 1); return; }

    if (isForgotPassword) {
      if (otpStep === 'email') {
        setIsLoading(true); 
        await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
        const result = await forgotPassword(email);
        setIsLoading(false);
        if (result.success) {
          setOtpStep('otp'); 
          setResendTimer(60);
        } else {
          setFieldErrors({ email: result.message || 'Email address not found' });
          setShakeKey(prev => prev + 1);
        }
        return;
      } else if (otpStep === 'otp') {
        setIsLoading(true); 
        await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
        const success = await verifyOtp(email, otp.join(''));
        setIsLoading(false);
        if (success) {
          setOtpStep('new_password'); 
        } else {
          setFieldErrors({ otp: 'Invalid or expired code' });
          setShakeKey(prev => prev + 1);
        }
        return;
      } else if (otpStep === 'new_password') {
        setIsLoading(true); 
        await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
        const success = await resetPassword(email, otp.join(''), password);
        setIsLoading(false);
        if (success) {
          setShowResetSuccessModal(true);
        } else {
          setError('Failed to reset password. Please try again.');
        }
        return;
      }
    }

    if (isRegistering) {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
      const regResult = await register(name, email, password, role);
      if (regResult.success) {
        if (regResult.status === 'PENDING') {
          setIsLoading(false);
          setShowApprovalModal(true);
        } else {
          setIsLoading(false);
          setShowRegSuccessModal(true);
        }
      } else {
        setIsLoading(false);
        if (regResult.message && regResult.message.toLowerCase().includes('already exists')) {
          setFieldErrors({ email: 'Email is already used, please log in instead.' });
          setShakeKey(prev => prev + 1);
        } else {
          setError(regResult.message || 'Registration failed. Please try again.');
        }
      }
    } else {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 800)); // Artificial delay for animation
      const loginResult = await login(email, password);
      setIsLoading(false);
      
      if (!loginResult.success) {
        if (loginResult.message?.includes('pending')) {
          setShowApprovalModal(true);
        } else {
          setError(loginResult.message || 'Invalid credentials or user not found.');
        }
      }
    }
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setError('');
    setFieldErrors({});
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setOtpStep('email');
    setOtp(['', '', '', '', '', '']);
    setResendTimer(0);
  };

  return (
    <div className="min-h-screen flex-1 w-full bg-gradient-to-br from-[#EBF1F6] to-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Dynamic Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#93C5FD]/30 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#CBD5E1]/30 blur-[100px]"
        />
      </div>

      <motion.div
        layout
        className="bg-white/80 backdrop-blur-2xl border border-white/70 w-full max-w-[440px] rounded-2xl sm:rounded-[32px] shadow-[0_8px_40px_rgb(0,0,0,0.08)] p-5 sm:p-10 relative overflow-hidden z-10"
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4 cursor-default">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#111827] rounded-2xl flex items-center justify-center shadow-md text-white shrink-0">
              <Activity className="w-8 h-8" strokeWidth={2.5} />
            </div>
          </div>

          <div className="h-[34px] overflow-hidden mb-1.5 flex justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.h2
                key={authMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="text-[28px] font-extrabold text-[#111827] tracking-tight"
              >
                {authMode === 'register' ? "Create Account" : authMode === 'forgot_password' ? "Reset Password" : "Welcome Back"}
              </motion.h2>
            </AnimatePresence>
          </div>
          
          <div className="h-[20px] overflow-hidden mb-6 flex justify-center items-start">
            <AnimatePresence mode="wait">
              <motion.p
                key={authMode + otpStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="text-sm text-[#64748B] text-center font-medium"
              >
                {authMode === 'register' ? "Sign up to access disaster alerts and services." : authMode === 'forgot_password' ? (otpStep === 'email' ? "Enter your email to receive a 6-digit OTP." : otpStep === 'otp' ? "Enter the 6-digit OTP sent to your email." : "Create your new secure password.") : "Enter your credentials to access your account."}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <form className="w-full" onSubmit={handleSubmit} noValidate>
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div
                layout
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs font-bold p-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm mb-4"
              >
                <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

            <AnimatePresence initial={false}>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                  animate={{ opacity: 1, height: 'auto', filter: "blur(0px)", transitionEnd: { overflow: "visible" } }}
                  exit={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="relative z-50"
                >
                  <div className="mb-4">
                    <label htmlFor="name" className={`block text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors ${fieldErrors.name ? 'text-red-500' : 'text-[#64748B]'}`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <motion.div 
                      animate={fieldErrors.name ? { x: [-5, 5, -5, 5, 0 + shakeKey * 0.0001] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className="relative group"
                    >
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User 
                          className={`h-4 w-4 transition-all duration-200 ${fieldErrors.name ? 'text-red-500' : focusedField === 'name' ? 'text-[#3b82f6] scale-110' : 'text-[#94A3B8]'}`} 
                          strokeWidth={2.5} 
                        />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                        }}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${fieldErrors.name ? 'border-red-500 text-red-900 focus:ring-red-500/20 placeholder-red-300' : 'border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]'}`}
                        placeholder="Juan Dela Cruz"
                      />
                    </motion.div>
                    <AnimatePresence>
                      {fieldErrors.name && (
                        <motion.p initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">
                          {fieldErrors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="mb-4 relative z-50">
                    <label htmlFor="role" className={`block text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors ${fieldErrors.role ? 'text-red-500' : 'text-[#64748B]'}`}>
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <motion.div
                      animate={fieldErrors.role ? { x: [-5, 5, -5, 5, 0 + shakeKey * 0.0001] } : { x: 0 }}
                      transition={{ duration: 0.4 }} 
                      className="relative group" 
                      ref={dropdownRef}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                        <Shield 
                          className={`h-4 w-4 transition-all duration-200 ${fieldErrors.role ? 'text-red-500' : focusedField === 'role' || isRoleDropdownOpen ? 'text-[#3b82f6] scale-110' : 'text-[#94A3B8]'}`} 
                          strokeWidth={2.5} 
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        onFocus={() => setFocusedField('role')}
                        onBlur={() => setFocusedField(null)}
                        className={`block w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all text-left ${fieldErrors.role ? 'border-red-500 focus:ring-red-500/20' : 'border-[#E2E8F0] focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]'} ${!role ? (fieldErrors.role ? 'text-red-300' : 'text-[#94A3B8]') : 'text-[#0F172A]'}`}
                      >
                        {selectedRoleLabel}
                      </button>

                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none z-10">
                        <motion.svg 
                          animate={{ rotate: isRoleDropdownOpen ? 180 : 0 }}
                          className={`h-4 w-4 ${fieldErrors.role ? 'text-red-400' : 'text-[#94A3B8]'}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>

                      <AnimatePresence>
                        {isRoleDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-[#E2E8F0]/80 rounded-xl shadow-xl z-50 overflow-hidden"
                          >
                            {roleOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setRole(option.value);
                                  if (fieldErrors.role) setFieldErrors(prev => ({ ...prev, role: '' }));
                                  setIsRoleDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-[#F8FAFC]/50 transition-colors ${role === option.value ? 'bg-[#EFF6FF] text-[#3b82f6]' : 'text-[#0F172A]'}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    <AnimatePresence>
                      {fieldErrors.role && (
                        <motion.p initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">
                          {fieldErrors.role}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          <AnimatePresence initial={false}>
            {(authMode !== 'forgot_password' || otpStep === 'email') && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                animate={{ opacity: 1, height: 'auto', filter: "blur(0px)", transitionEnd: { overflow: "visible" } }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mb-4"
              >
                <label htmlFor="email" className={`block text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors ${fieldErrors.email ? 'text-red-500' : 'text-[#64748B]'}`}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <motion.div
                  animate={fieldErrors.email ? { x: [-5, 5, -5, 5, 0 + shakeKey * 0.0001] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail 
                      className={`h-4 w-4 transition-all duration-200 ${fieldErrors.email ? 'text-red-500' : focusedField === 'email' ? 'text-[#3b82f6] scale-110' : 'text-[#94A3B8]'}`} 
                      strokeWidth={2.5} 
                    />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={async () => {
                      setFocusedField(null);
                      if (isRegistering && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        const exists = await checkEmail(email);
                        if (exists) {
                          setFieldErrors(prev => ({ ...prev, email: 'Email is already used, please log in instead.' }));
                          setShakeKey(prev => prev + 1);
                        }
                      }
                    }}
                    className={`block w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${fieldErrors.email ? 'border-red-500 text-red-900 focus:ring-red-500/20 placeholder-red-300' : 'border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]'}`}
                    placeholder="name@smartrelief.com"
                  />
                </motion.div>
                <AnimatePresence>
                  {fieldErrors.email && (
                    <motion.p initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">
                      {fieldErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {isForgotPassword && otpStep === 'otp' && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                animate={{ opacity: 1, height: 'auto', filter: "blur(0px)", transitionEnd: { overflow: "visible" } }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="mb-6"
              >
                <label className={`block text-[10px] uppercase font-bold tracking-widest text-center mb-3 transition-colors ${fieldErrors.otp ? 'text-red-500' : 'text-[#64748B]'}`}>
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <motion.div 
                  animate={fieldErrors.otp ? { x: [-5, 5, -5, 5, 0 + shakeKey * 0.0001] } : { x: 0 }}
                  transition={{ duration: 0.4 }} 
                  className="flex justify-center gap-1.5 sm:gap-2"
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!/^\d*$/.test(val)) return;
                        if (fieldErrors.otp) setFieldErrors(prev => ({ ...prev, otp: '' }));
                        const newOtp = [...otp];
                        if (val.length > 1) {
                          const pasted = val.slice(0, 6).split('');
                          pasted.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
                          setOtp(newOtp);
                          const nextIdx = Math.min(index + pasted.length, 5);
                          document.getElementById(`otp-${nextIdx === 6 ? 5 : nextIdx}`)?.focus();
                          return;
                        }
                        newOtp[index] = val;
                        setOtp(newOtp);
                        if (val && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className={`w-9 sm:w-10 h-11 sm:h-12 text-center text-base sm:text-lg font-bold bg-[#F8FAFC] border rounded-xl focus:outline-none focus:ring-2 transition-all ${fieldErrors.otp ? 'border-red-500 text-red-900 focus:ring-red-500/20' : 'border-[#E2E8F0] focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]'}`}
                    />
                  ))}
                </motion.div>
                <AnimatePresence>
                  {fieldErrors.otp && (
                    <motion.p initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="text-red-500 text-[10px] text-center font-bold mt-2">
                      {fieldErrors.otp}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-5 mb-1 flex justify-center">
                  <button
                    type="button"
                    disabled={resendTimer > 0 || isLoading}
                    onClick={async () => {
                      if (resendTimer > 0 || isLoading) return;
                      
                      // Transition back to email state for animation
                      setOtpStep('email');
                      setOtp(['', '', '', '', '', '']);
                      setFieldErrors({});
                      setIsLoading(true);
                      
                      await new Promise(r => setTimeout(r, 800)); // Let the UI transition and show "Sending OTP..."
                      await forgotPassword(email);
                      
                      setIsLoading(false);
                      setOtpStep('otp');
                      setResendTimer(60);
                    }}
                    className={`text-[11px] uppercase tracking-wider font-bold transition-colors ${resendTimer > 0 ? 'text-[#94A3B8] cursor-not-allowed' : 'text-[#3b82f6] hover:text-[#2563eb]'}`}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {(!isForgotPassword || otpStep === 'new_password') && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, height: 'auto', filter: "blur(0px)" }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="password" className={`block text-[10px] uppercase font-bold tracking-widest transition-colors ${fieldErrors.password ? 'text-red-500' : 'text-[#64748B]'}`}>
                      {isForgotPassword ? 'New Password' : 'Password'} <span className="text-red-500">*</span>
                    </label>
                    <AnimatePresence>
                      {authMode === 'login' && (
                        <motion.button
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, filter: "blur(4px)" }}
                          transition={{ duration: 0.2 }}
                          type="button"
                          onClick={(e) => { e.preventDefault(); setAuthMode('forgot_password'); setError(''); setFieldErrors({}); setOtpStep('email'); setOtp(['', '', '', '', '', '']); }}
                          className="text-[10px] font-bold text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                        >
                          Forgot password?
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.div
                    animate={fieldErrors.password ? { x: [-5, 5, -5, 5, 0 + shakeKey * 0.0001] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative group"
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock 
                        className={`h-4 w-4 transition-all duration-200 ${fieldErrors.password ? 'text-red-500' : focusedField === 'password' ? 'text-[#3b82f6] scale-110' : 'text-[#94A3B8]'}`} 
                        strokeWidth={2.5} 
                      />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isRegistering ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                      }}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className={`block w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${fieldErrors.password ? 'border-red-500 text-red-900 focus:ring-red-500/20 placeholder-red-300' : 'border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]'}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors ${fieldErrors.password ? 'text-red-400 hover:text-red-500' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 transition-transform hover:scale-110" strokeWidth={2.5} /> : <Eye className="h-4 w-4 transition-transform hover:scale-110" strokeWidth={2.5} />}
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {fieldErrors.password && (
                      <motion.p initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">
                        {fieldErrors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {(isRegistering || (isForgotPassword && otpStep === 'new_password')) && password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2.5 flex flex-col gap-1.5 px-1"
                      >
                        <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-[#F1F5F9]">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div 
                              key={level} 
                              className={`flex-1 transition-all duration-300 ${level <= pwdStrength.score ? pwdStrength.color : 'bg-transparent'}`} 
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest">
                          <span className={`${pwdStrength.score < 5 ? 'text-[#94A3B8]' : 'text-green-600'}`}>
                            {pwdStrength.score < 5 ? 'Needs upper, lower, number & symbol' : 'Perfect!'}
                          </span>
                          <span className={`transition-colors ${pwdStrength.score <= 2 ? 'text-red-500' : pwdStrength.score <= 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {pwdStrength.label}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {(isRegistering || (isForgotPassword && otpStep === 'new_password')) && (
              <motion.div
                initial={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                animate={{ opacity: 1, height: 'auto', filter: "blur(0px)", transitionEnd: { overflow: "visible" } }}
                exit={{ opacity: 0, height: 0, filter: "blur(4px)", overflow: "hidden" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className={`block text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors ${fieldErrors.confirmPassword ? 'text-red-500' : 'text-[#64748B]'}`}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <motion.div
                    animate={fieldErrors.confirmPassword ? { x: [-5, 5, -5, 5, 0 + shakeKey * 0.0001] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative group"
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock 
                        className={`h-4 w-4 transition-all duration-200 ${fieldErrors.confirmPassword ? 'text-red-500' : focusedField === 'confirmPassword' ? 'text-[#3b82f6] scale-110' : 'text-[#94A3B8]'}`} 
                        strokeWidth={2.5} 
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className={`block w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all ${fieldErrors.confirmPassword ? 'border-red-500 text-red-900 focus:ring-red-500/20 placeholder-red-300' : 'border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]'}`}
                      placeholder="••••••••"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {fieldErrors.confirmPassword && (
                      <motion.p initial={{ opacity: 0, height: 0, y: -5 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -5 }} className="text-red-500 text-[10px] font-bold mt-1.5 ml-1">
                        {fieldErrors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div layout className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#111827] hover:bg-[#1f2937] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827] transition-colors active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <div className="relative overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={authMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="block"
                  >
                    {isForgotPassword ? (otpStep === 'email' ? (isLoading ? 'Sending OTP...' : 'Send OTP') : otpStep === 'otp' ? (isLoading ? 'Verifying...' : 'Verify OTP') : (isLoading ? 'Resetting...' : 'Reset Password')) : isRegistering ? (isLoading ? 'Registering...' : 'Register') : (isLoading ? 'Authenticating...' : 'Log In')}
                  </motion.span>
                </AnimatePresence>
              </div>
            </button>
          </motion.div>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              if (isForgotPassword) {
                setAuthMode('login');
                setError('');
                setFieldErrors({});
                setPassword('');
              } else {
                toggleMode();
              }
            }}
            className="text-sm font-bold text-[#3b82f6] hover:text-[#2563eb] transition-colors inline-flex items-center overflow-hidden h-[20px]"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={authMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {isForgotPassword ? "Back to Log In" : isRegistering ? "Already have an account? Log In" : "Don't have an account? Register"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <div className="mt-6 text-center border-t border-[#F1F5F9] pt-5 flex flex-col items-center">
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              loginAsGuest(); 
            }}
            className="group flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#111827] transition-colors mb-8"
          >
            <span>Continue as Guest</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:translate-x-0.5">
              <path d="M2.5 6H9.5M9.5 6L6 2.5M9.5 6L6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#94A3B8] mb-1">
            © {new Date().getFullYear()} SmartRelief
          </p>
          <p className="text-[9px] uppercase tracking-wider text-[#CBD5E1]">
            Secure access for authorized users
          </p>
        </div>
      </motion.div>

      {/* Password Reset Success Modal */}
      <AnimatePresence>
        {showResetSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center text-center relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#10B981]/10 to-transparent pointer-events-none" />
              
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.5, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-tr from-[#10B981] to-[#34D399] rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(16,185,129,0.3)] rotate-3 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold text-[#111827] mb-2 tracking-tight z-10"
              >
                Password Reset!
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-sm text-[#64748B] mb-8 font-medium px-2 z-10"
              >
                Your password has been successfully reset. You can now log in using your new credentials.
              </motion.p>
              
              <button
                type="button"
                onClick={() => {
                  setShowResetSuccessModal(false);
                  setAuthMode('login');
                  setError('');
                  setFieldErrors({});
                  setOtpStep('email');
                  setOtp(['','','','','','']);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full py-3.5 px-4 bg-[#111827] hover:bg-[#1f2937] active:scale-[0.98] text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827] z-10"
              >
                Continue to Log In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approval Pending Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center text-center relative overflow-hidden z-10"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#F59E0B]/10 to-transparent pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.5, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-tr from-[#F59E0B] to-[#FCD34D] rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(245,158,11,0.3)] rotate-3 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <AlertCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold text-[#111827] mb-2 tracking-tight z-10"
              >
                Approval Pending
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-sm text-[#64748B] mb-8 font-medium px-2 z-10"
              >
                Your account is currently pending verification by an Administrator. You will be able to log in once approved.
              </motion.p>
              
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  setAuthMode('login');
                  setError('');
                  setFieldErrors({});
                  setOtpStep('email');
                  setOtp(['','','','','','']);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full py-3.5 px-4 bg-[#111827] hover:bg-[#1f2937] active:scale-[0.98] text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827] z-10"
              >
                Return to Log In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Success Modal */}
      <AnimatePresence>
        {showRegSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col items-center text-center relative overflow-hidden z-10"
            >
              {/* Decorative background glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#10B981]/10 to-transparent pointer-events-none" />

              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.5, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-tr from-[#10B981] to-[#34D399] rounded-2xl flex items-center justify-center mb-6 shadow-[0_10px_25px_rgba(16,185,129,0.3)] rotate-3 z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
                >
                  <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
              
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-2xl font-extrabold text-[#111827] mb-2 tracking-tight z-10"
              >
                Registration Successful!
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-sm text-[#64748B] mb-8 font-medium px-2 z-10"
              >
                Your account has been created successfully. You can now log in using your credentials.
              </motion.p>
              
              <button
                type="button"
                onClick={() => {
                  setShowRegSuccessModal(false);
                  setAuthMode('login');
                  setError('');
                  setFieldErrors({});
                  setOtpStep('email');
                  setOtp(['','','','','','']);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="w-full py-3.5 px-4 bg-[#111827] hover:bg-[#1f2937] active:scale-[0.98] text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111827] z-10"
              >
                Continue to Log In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
