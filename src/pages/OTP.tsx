import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { DuckService } from '../services/DuckService'
import { useApp } from '../context/AppContext'
import { MdArrowBack } from 'react-icons/md'
import { BackButton } from '../styles/SharedStyles'
import {
  OTPContainer, OTPUsername, OTPMessage, OTPInput, OTPButton,
  OTPErrorMessage, OTPResendRow, OTPResendButton, OTPCooldownText,
  OTPHint, OTPSuccessMessage
} from '../styles/pages.styles'

interface OTPProps {
  username: string;
  onBack: () => void;
  isAddingAccount?: boolean;
  onSuccess?: () => void;
}

export const OTP = ({ username, onBack, isAddingAccount, onSuccess }: OTPProps) => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState('')
  const { setUserData, switchAccount } = useApp()
  const duckService = useMemo(() => new DuckService(), [])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resendTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const verifyingRef = useRef(false)

  const startCooldown = useCallback(() => {
    setCooldown(60)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    chrome.storage.local.set({
      loginState: 'otp',
      tempUsername: username
    });
    startCooldown()

    return () => {
      chrome.storage.local.remove(['otp_verification_in_progress']);
      if (cooldownRef.current) clearInterval(cooldownRef.current)
      if (resendTimeoutRef.current) clearTimeout(resendTimeoutRef.current)
    };
  }, [username, startCooldown]);

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setResendSuccess('')

    const response = await duckService.login(username)

    setResendLoading(false)
    if (response.status === 'success') {
      setResendSuccess('A new passphrase has been sent to your email.')
      startCooldown()
      if (resendTimeoutRef.current) clearTimeout(resendTimeoutRef.current)
      resendTimeoutRef.current = setTimeout(() => setResendSuccess(''), 5000)
    } else {
      setError(response.message || 'Failed to resend passphrase.')
    }
  }

  const handleVerify = async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setLoading(true);
    setError('');

    await chrome.storage.local.set({ otp_verification_in_progress: true });
    try {
      const response = await duckService.verifyOTP(username, otp);

      if (response.status === 'success') {
        if (isAddingAccount) {
          if (response.dashboard) {
            try {
              if (onSuccess) {
                onSuccess();
              }
              await switchAccount(username);
              await chrome.storage.local.remove(['otp_verification_in_progress']);
            } catch (error) {
              console.error('Error switching account:', error);
              setError('Failed to switch to new account');
              await chrome.storage.local.remove(['otp_verification_in_progress']);
            }
          } else {
            setError('Failed to get user data');
            await chrome.storage.local.remove(['otp_verification_in_progress']);
          }
        } else if (response.dashboard) {
          setUserData(response.dashboard);
          await chrome.storage.local.remove(['otp_verification_in_progress']);
          if (onSuccess) {
            onSuccess();
          }
        }
      } else {
        setError(response.message || 'Failed to verify OTP');
        await chrome.storage.local.remove(['otp_verification_in_progress']);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      await chrome.storage.local.remove(['otp_verification_in_progress']);
    } finally {
      setLoading(false);
      verifyingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && otp.split(' ').filter(Boolean).length === 4 && !loading) {
      handleVerify()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');

    const words = pastedText.split(/\s+/).filter(Boolean);
    const formattedText = words.length >= 4
      ? words.slice(0, 4).join(' ')
      : words.join(' ');

    const cleaned = formattedText.toLowerCase();
    const validWords = cleaned.split(' ').filter(Boolean).every(word => /^[a-z]+$/.test(word));
    if (validWords) {
      setOtp(cleaned);
    } else {
      setOtp(formattedText);
    }
  }

  return (
    <OTPContainer>
      <BackButton onClick={onBack}>
        <MdArrowBack size={20} />
        {isAddingAccount ? 'Back to login' : 'Back'}
      </BackButton>

      <OTPUsername>Logged in as {username}@duck.com</OTPUsername>
      <OTPMessage>One-time passphrase sent to your email</OTPMessage>
      <OTPInput
        type="text"
        placeholder="e.g. morality landless proved paprika"
        value={otp}
        onChange={(e) => setOtp(e.target.value.toLowerCase())}
        onKeyUp={handleKeyPress}
        onPaste={handlePaste}
        disabled={loading}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
      <OTPButton
        onClick={handleVerify}
        disabled={otp.split(' ').filter(Boolean).length !== 4 || loading}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </OTPButton>

      <OTPResendRow>
        <OTPResendButton onClick={handleResend} disabled={cooldown > 0 || resendLoading}>
          {resendLoading ? 'Sending...' : 'Resend passphrase'}
        </OTPResendButton>
        {cooldown > 0 && <OTPCooldownText>({cooldown}s)</OTPCooldownText>}
      </OTPResendRow>

      {error && <OTPErrorMessage>{error}</OTPErrorMessage>}
      {resendSuccess && <OTPSuccessMessage>{resendSuccess}</OTPSuccessMessage>}

      <OTPHint>
        Didn't receive it? Check your spam or junk folder. Some email providers
        (like ProtonMail) may delay or filter messages from DuckDuckGo.
      </OTPHint>
    </OTPContainer>
  )
}
