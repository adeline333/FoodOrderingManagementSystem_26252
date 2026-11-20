import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const email = location.state?.email;
  const initialOtp = location.state?.otp;
  
  const [receivedOtp, setReceivedOtp] = useState(initialOtp || null);
  const [otp, setOtp] = useState(initialOtp ? String(initialOtp).split('') : ['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }
    // If OTP wasn't passed in navigation state, auto-fetch it
    if (!receivedOtp) {
      authApi.resendOTP(email).then((res) => {
        if (res.data?.otp) {
          setReceivedOtp(res.data.otp);
          setOtp(String(res.data.otp).split(''));
        }
      }).catch(() => {});
    }
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyOTP(email, otpCode);
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipVerification = async () => {
    setLoading(true);
    try {
      const response = await authApi.skipVerification(email);
      if (response.data?.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        loginWithToken(token, user);
        toast.success('Email confirmed! Welcome to your dashboard.', { icon: '🎉' });
        navigate('/dashboard');
      } else {
        toast.success('Email verified! You can now log in.');
        navigate('/login');
      }
    } catch (error) {
      toast.success('Continuing to login...');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await authApi.resendOTP(email);
      if (response.data?.otp) {
        setReceivedOtp(response.data.otp);
        setOtp(String(response.data.otp).split(''));
        toast.success(`OTP: ${response.data.otp}`, { duration: 8000 });
      } else {
        toast.success('OTP resent successfully!');
      }
    } catch (error) {
      toast.error(`Failed to resend OTP ${error}`);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30">
        <ShieldCheck className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email 📧</h2>
      <p className="text-gray-500 mb-6">
        We've sent a 6-digit code to<br />
        <span className="font-semibold text-gray-700">{email}</span>
      </p>

      {receivedOtp && (
        <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-left shadow-sm max-w-sm mx-auto">
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold bg-orange-50 border-2 border-orange-200 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20"
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
          loading={loading}
        >
          ✅ Verify Email
        </Button>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleSkipVerification}
            disabled={loading}
            className="w-full py-3 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-orange-200 shadow-sm active:scale-95 disabled:opacity-50"
          >
            <span>⏭️ Skip Email Verification & Go to Dashboard</span>
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        <p className="text-sm text-gray-500">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-orange-600 hover:text-orange-700 font-semibold disabled:opacity-50 transition-colors"
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </button>
        </p>

        <p className="text-xs text-gray-400">
          Already verified or want to sign in with password?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-orange-600 hover:text-orange-700 font-semibold underline"
          >
            Go to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;