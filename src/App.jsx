import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initAnalytics } from './lib/analytics'
import HomePage   from './pages/HomePage'
import BoothPage  from './pages/BoothPage'
import PreviewPage from './pages/PreviewPage'
import AdminPage  from './pages/AdminPage'

export default function App() {
  useEffect(() => {
    initAnalytics()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />}   />
        <Route path="/booth"   element={<BoothPage />}  />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/admin"   element={<AdminPage />}  />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
