import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShellLayout } from './layouts/AppShellLayout'
import { HomePage } from './pages/HomePage'
import { CreateScriptPage } from './pages/CreateScriptPage'
import { LibraryPage } from './pages/LibraryPage'
import { ContentHubPage } from './pages/ContentHubPage'
import { PlanPage } from './pages/PlanPage'
import { IntelligencePage } from './pages/IntelligencePage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShellLayout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreateScriptPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="hub" element={<ContentHubPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="intelligence" element={<IntelligencePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
