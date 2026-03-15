import styled from 'styled-components'

export const TabsContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.borderLight};
`

export const Tab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};
  color: ${props => props.active ? props.theme.primary : props.theme.textSecondary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: ${props => props.active ? props.theme.primary : props.theme.text};
    background: ${props => props.active ? 'transparent' : props.theme.hover};
  }

  svg {
    font-size: 18px;
  }
`
