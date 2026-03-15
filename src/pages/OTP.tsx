import { useState, useEffect } from 'react'
import { DuckService } from '../services/DuckService'
import { useApp } from '../context/AppContext'
import { MdArrowBack } from 'react-icons/md'
import { BackButton } from '../styles/SharedStyles'
import { OTPContainer, OTPUsername, OTPMessage, OTPInput, OTPButton, OTPErrorMessage } from '../styles/pages.styles'

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
  const { setUserData, switchAccount } = useApp()
  const duckService = new DuckService()

  useEffect(() => {
    chrome.storage.local.set({
      loginState: 'otp',
      tempUsername: username
    });

    return () => {
      chrome.storage.local.remove(['otp_verification_in_progress']);
    };
  }, [username]);

  const handleVerify = async () => {
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

    setOtp(formattedText.toLowerCase());
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
      {error && <OTPErrorMessage>{error}</OTPErrorMessage>}
    </OTPContainer>
  )
}
