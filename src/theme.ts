import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    primary: string
    error: string
    success: string
    background: string
    surface: string
    text: string
    textSecondary: string
    textTertiary: string
    border: string
    hover: string
    inputBackground: string
    primaryLight: string
    primaryDark: string
    surfaceElevated: string
    surfaceOverlay: string
    shadowSm: string
    shadowMd: string
    shadowLg: string
    shadowGlow: string
    borderLight: string
    borderFocus: string
    textOnPrimary: string
    glassBg: string
    glassBorder: string
  }
}

export const theme = {
  light: {
    primary: '#ff9f19',
    error: '#dc3545',
    success: '#198754',
    background: '#FFFFFF',
    surface: '#F7F7F7',
    text: '#222222',
    textSecondary: '#555555',
    textTertiary: '#888888',
    border: '#E6E6E6',
    hover: '#F0F0F0',
    inputBackground: '#FFFFFF',
    primaryLight: '#FFB347',
    primaryDark: '#E8870E',
    surfaceElevated: '#FFFFFF',
    surfaceOverlay: 'rgba(0, 0, 0, 0.4)',
    shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
    shadowLg: '0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
    shadowGlow: '0 0 20px rgba(255,159,25,0.3), 0 4px 12px rgba(255,159,25,0.2)',
    borderLight: '#F0F0F0',
    borderFocus: 'rgba(255,159,25,0.4)',
    textOnPrimary: '#FFFFFF',
    glassBg: 'rgba(255,255,255,0.7)',
    glassBorder: 'rgba(255,255,255,0.3)'
  },
  dark: {
    primary: '#ff9f19',
    error: '#dc3545',
    success: '#198754',
    background: '#1C1C1C',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#BBBBBB',
    textTertiary: '#888888',
    border: '#3D3D3D',
    hover: '#333333',
    inputBackground: '#2D2D2D',
    primaryLight: '#FFB84D',
    primaryDark: '#D4780A',
    surfaceElevated: '#363636',
    surfaceOverlay: 'rgba(0, 0, 0, 0.6)',
    shadowSm: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
    shadowMd: '0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)',
    shadowLg: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
    shadowGlow: '0 0 20px rgba(255,159,25,0.25), 0 4px 12px rgba(255,159,25,0.15)',
    borderLight: '#333333',
    borderFocus: 'rgba(255,159,25,0.5)',
    textOnPrimary: '#FFFFFF',
    glassBg: 'rgba(45,45,45,0.7)',
    glassBorder: 'rgba(255,255,255,0.08)'
  }
}