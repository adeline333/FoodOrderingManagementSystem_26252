import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock, KeyRound } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPasswordOTP = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [receivedOtp, setReceivedOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const otpRefs = useRef([]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.forgotPasswordOTP(email);
      if (response.data?.otp) {
        setReceivedOtp(response.data.otp);
        setOtp(String(response.data.otp).split(''));
        toast.success(`OTP: ${response.data.otp}`, { duration: 8000 });
      } else {
        toast.success('OTP sent to your email!');
      }
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyPasswordResetOTP(email, otpCode);
      setStep(3);
      toast.success('OTP verified! Now set your new password');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPasswordOTP(email, formData.newPassword);
      setStep(4);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await authApi.forgotPasswordOTP(email);
      toast.success('OTP resent to your email!');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Email Input
  if (step === 1) {
    return (
      <>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password? 🔐</h2>
          <p className="text-gray-500 mt-1">We'll send you an OTP to reset it</p>
        </div>

        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
            loading={loading}
          >
            📧 Send OTP
          </Button>
        </form>
      </>
    );
  }

  // Step 2: OTP Verification
  if (step === 2) {
    return (
      <>
        <button 
          onClick={() => setStep(1)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Email
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Enter OTP 🔢</h2>
          <p className="text-gray-500 mt-1">
            We sent a code to<br />
            <span className="font-semibold text-gray-700">{email}</span>
          </p>
          {receivedOtp && (
            <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-left shadow-sm max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">💡</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Demo Testing Mode
                    </span>
                    <span className="px-2 py-0.5 bg-amber-200/80 text-amber-900 text-[10px] font-bold rounded-full">
                      Instant Access
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    We've sent a code to your email. If your inbox hasn't received it yet or you're testing this demo, your code has been pre-filled below so you can proceed without waiting!
                  </p>
                  <div className="mt-2.5 flex items-center justify-between bg-white/90 px-3 py-1.5 rounded-xl border border-amber-200">
                    <span className="text-xs font-medium text-gray-500">Your Code:</span>
                    <span className="text-base font-mono font-extrabold text-orange-600 tracking-widest">{receivedOtp}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
            loading={loading}
          >
            Verify OTP
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading}
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold transition-colors disabled:opacity-50"
            >
              Didn't receive code? Resend
            </button>
          </div>
        </form>
      </>
    );
  }

  // Step 3: New Password
  if (step === 3) {
    return (
      <>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create New Password 🔒</h2>
          <p className="text-gray-500 mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="password"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="Enter new password"
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="Confirm new password"
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
            loading={loading}
          >
            Reset Password
          </Button>
        </form>
      </>
    );
  }

  // Step 4: Success
  return (
    <>
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset! ✅</h2>
        <p className="text-gray-500 mb-6">
          Your password has been successfully reset.<br />
          Redirecting to login...
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-colors"
        >
          Go to Login
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>
    </>
  );
};

export default ForgotPasswordOTP;
