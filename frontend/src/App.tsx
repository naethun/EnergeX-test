import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { authStore } from './stores/authStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PostsPage } from './pages/PostsPage'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.isLoggedIn())

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      const authState = authStore.isLoggedIn()
      setIsAuthenticated(authState)
    })

    return unsubscribe
  }, [])

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/posts" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/posts" replace /> : <RegisterPage />
        } />
        <Route path="/posts" element={
          isAuthenticated ? <PostsPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/posts" : "/login"} replace />} />
      </Routes>
    </div>
  )
}

export default App
