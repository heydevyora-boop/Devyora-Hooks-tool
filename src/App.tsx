import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShellLayout } from './layouts/AppShellLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { CreateScriptPage } from './pages/CreateScriptPage'
import { LibraryPage } from './pages/LibraryPage'
import { ContentHubPage } from './pages/ContentHubPage'
import { PlanPage } from './pages/PlanPage'
import { ScriptGenerationPage } from './pages/ScriptGenerationPage'
import { IntelligencePage } from './pages/IntelligencePage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShellLayout />}>
              <Route index element={<HomePage />} />
              <Route path="create" element={<CreateScriptPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="hub" element={<ContentHubPage />} />
              <Route path="plan" element={<PlanPage />} />
              <Route path="script/:nodeId" element={<ScriptGenerationPage />} />
              <Route path="intelligence" element={<IntelligencePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
