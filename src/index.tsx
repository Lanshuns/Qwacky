import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppProvider } from './context/AppContext'
import { PermissionProvider } from './context/PermissionContext'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

createRoot(container).render(
  <React.StrictMode>
    <AppProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </AppProvider>
  </React.StrictMode>
)