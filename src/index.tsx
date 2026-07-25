import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './context/AppContext'
import { PermissionProvider } from './context/PermissionContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { I18nProvider } from './i18n'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

createRoot(container).render(
  <React.StrictMode>
    <I18nProvider>
      <ErrorBoundary>
        <AppProvider>
          <PermissionProvider>
            <App />
          </PermissionProvider>
        </AppProvider>
      </ErrorBoundary>
    </I18nProvider>
  </React.StrictMode>
)