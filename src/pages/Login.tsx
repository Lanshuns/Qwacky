import styled from 'styled-components'
import { useState } from 'react'
import { DuckService } from '../services/DuckService'
import { MdArrowBack } from 'react-icons/md'

const Container = styled.div`
  padding: 24px;
  text-align: center;
`

const Message = styled.p`
  color: ${props => props.theme.text};
  margin-bottom: 32px;
  font-size: 16px;
  font-weight: 500;
`

const DuckText = styled.span`
  color: ${props => props.theme.primary};
`

const InputWrapper = styled.div`
  position: relative;
  margin-bottom: 16px;
`

const Input = styled.input`
  width: 100%;
  padding: 12px;
  padding-right: 90px;  // Make room for the suffix
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
`

const Suffix = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.primary};
  pointer-events: none;
  user-select: none;
  font-size: 16px;
  font-weight: 500;
`

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.p`
  color: ${props => props.theme.primary};
  margin-top: 8px;
  font-size: 14px;
`

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  margin-bottom: 16px;
  align-self: flex-start;
`;

const VersionInfo = styled.div`
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: ${(props) => props.theme.textSecondary};
`;

interface LoginProps {
  onSubmit: (username: string) => void;
  isAddingAccount?: boolean;
  onBack?: () => void;
}

export const Login = ({ onSubmit, isAddingAccount, onBack }: LoginProps) => {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const duckService = new DuckService()

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    
    const cleanUsername = username.replace(/@duck\.com$/, '')
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
    <Container>
      {isAddingAccount && onBack && (
        <BackButton onClick={onBack}>
          <MdArrowBack size={20} />
          Back to Dashboard
        </BackButton>
      )}
      
      <Message>Login to manage your <DuckText>@duck.com</DuckText> addresses</Message>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Enter duck username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyUp={handleKeyPress}
          disabled={loading}
        />
        <Suffix>@duck.com</Suffix>
      </InputWrapper>
      <Button onClick={handleSubmit} disabled={!username || loading}>
        {loading ? 'Sending...' : 'Continue'}
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <VersionInfo>
        Qwacky v1.1.0
      </VersionInfo>
    </Container>
  )
}