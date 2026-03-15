import { useState } from 'react'
import { DuckService } from '../services/DuckService'
import { MdArrowBack } from 'react-icons/md'
import { useApp } from '../context/AppContext'
import { BackButton, PrimaryButton } from '../styles/SharedStyles'
import { LoginContainer, LoginMessage, DuckText, InputWrapper, LoginInput, Suffix, LoginErrorMessage, SignupSection, SignupLink } from '../styles/pages.styles'

interface LoginProps {
  onSubmit: (username: string) => void;
  isAddingAccount?: boolean;
  onBack?: () => void;
}

export const Login = ({ onSubmit, isAddingAccount, onBack }: LoginProps) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSignupWindow, setShowSignupWindow] = useState(false)
  const duckService = new DuckService()
  const { accounts } = useApp()

  const sanitizeUsername = (input: string) => {
    return input.replace(/[^a-zA-Z0-9-_]/g, '');
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeUsername(e.target.value);
    setUsername(sanitized);
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const sanitized = sanitizeUsername(pastedText);
    setUsername(sanitized);
  }

  const handleCreateAccount = () => {
    const width = 480;
    const height = 720;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    const signupWindow = window.open(
      'https://duckduckgo.com/email/start',
      'duckSignup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (signupWindow) {
      setShowSignupWindow(true);

      const checkClosed = setInterval(() => {
        if (signupWindow.closed) {
          setShowSignupWindow(false);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    const cleanUsername = username.replace(/@duck\.com$/, '')

    if (accounts.some(acc => acc.username === cleanUsername)) {
      setLoading(false)
      setError('This account is already logged in')
      return
    }

    const response = await duckService.login(cleanUsername)

    setLoading(false)
    if (response.status === 'success') {
      onSubmit(cleanUsername)
    } else {
      setError(response.message)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username && !loading) {
      handleSubmit()
    }
  }

  return (
    <LoginContainer>
      {isAddingAccount && onBack && (
        <BackButton onClick={onBack}>
          <MdArrowBack size={20} />
          Back to Dashboard
        </BackButton>
      )}
      <LoginMessage>Login to manage your <DuckText>@duck.com</DuckText> addresses</LoginMessage>
      <InputWrapper>
        <LoginInput
          type="text"
          placeholder="Enter duck username"
          value={username}
          onChange={handleUsernameChange}
          onKeyUp={handleKeyPress}
          onPaste={handlePaste}
          disabled={loading}
          autoComplete="off"
          spellCheck={false}
        />
        <Suffix>@duck.com</Suffix>
      </InputWrapper>
      <PrimaryButton onClick={handleSubmit} disabled={!username || loading}>
        {loading ? 'Sending...' : 'Continue'}
      </PrimaryButton>
      {error && <LoginErrorMessage>{error}</LoginErrorMessage>}

      <SignupSection>
        Don't have one? <SignupLink onClick={handleCreateAccount}>Create now</SignupLink>
        {showSignupWindow && (
          <div style={{ marginTop: '8px', fontSize: '12px', fontStyle: 'italic' }}>
            Signup window opened. Complete registration and return here to login.
          </div>
        )}
      </SignupSection>

    </LoginContainer>
  )
}
