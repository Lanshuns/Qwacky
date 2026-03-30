import React from 'react'
import styled from 'styled-components'

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  min-height: 200px;
`

const ErrorTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.text};
`

const ErrorMessage = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 16px;
`

const ReloadButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 13px;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`

interface State {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Something went wrong</ErrorTitle>
          <ErrorMessage>The extension encountered an unexpected error.</ErrorMessage>
          <ReloadButton onClick={() => window.location.reload()}>
            Reload Extension
          </ReloadButton>
        </ErrorContainer>
      )
    }
    return this.props.children
  }
}
