import styled from 'styled-components'

export const Section = styled.div`
  margin-bottom: 24px;
  background: ${props => props.theme.surfaceElevated};
  border-radius: 8px;
  padding: 16px;
  border: 1px solid ${props => props.theme.borderLight};
`

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: ${props => props.theme.text};
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.2px;

    svg {
      padding: 4px;
      background: ${props => props.theme.primary}15;
      border-radius: 6px;
      box-sizing: content-box;
    }
  }
`

export const IconButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.textSecondary};
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.primary}15;
    color: ${props => props.theme.primary};
  }
`

export const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  padding: 6px 10px 6px 4px;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.theme.primary}10;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const PrimaryButton = styled.button`
  width: 100%;
  padding: 14px;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.textOnPrimary};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const BaseInput = styled.input`
  width: 100%;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  background: ${props => props.theme.surface};
  color: ${props => props.theme.text};
  font-size: 14px;
  transition: all 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textTertiary};
  }
`
