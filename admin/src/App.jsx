"use client"

import React, { useState, useEffect } from "react"
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import { Home, Users, Book, LogOut, Menu, X, AlertCircle, ChevronRight, Bell, Settings, User,Layers2 } from "lucide-react"

import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import UserLogins from "./components/UserLogins"
import UserEnrolled from "./components/UserEnrolled"
import AdminCourses from "./pages/AdminCourses"

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800 mb-3 text-center">Something went wrong</h1>
            <p className="text-gray-600 text-center mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Toast Notification Component
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500"

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-out flex items-center`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }) => {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobileView(mobile)
      if (mobile) {
        setCollapsed(true)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Validate token on mount and route changes
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setIsAuthenticated(false)
        if (location.pathname !== "/login") {
          navigate("/login")
        }
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.success) {
          setIsAuthenticated(true)
        } else {
          throw new Error("Invalid token response")
        }
      } catch (error) {
        console.error("Token validation failed:", error)
        localStorage.removeItem("adminToken")
        setIsAuthenticated(false)
        if (location.pathname !== "/login") {
          navigate("/login")
          showToast("Session expired. Please log in again.", "error")
        }
      } finally {
        setLoading(false)
      }
    }

    validateToken()
  }, [navigate, location.pathname])

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
  }

  const handleLogin = (token) => {
    if (!token) {
      showToast("No token received during login", "error")
      return
    }
    localStorage.setItem("adminToken", token)
    setIsAuthenticated(true)
    navigate("/")
    showToast("Logged in successfully")
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setIsAuthenticated(false)
    navigate("/login")
    showToast("Logged out successfully")
  }

  const toggleSidebar = () => {
    if (isMobileView) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  const menuItems = [
    {
      path: "/",
      icon: <Home className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      path: "/user-logins",
      icon: <Layers2 className="w-5 h-5" />,
      label: "User Logins",
    },
    {
      path: "/user-enrolled",
      icon: <Users className="w-5 h-5" />,
      label: "User Enrolled",
    },
    {
      path: "/admin-courses",
      icon: <Book className="w-5 h-5" />,
      label: "Courses",
    }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <div className="h-12 w-12 bg-gray-50 rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  const AdminLayout = ({ children }) => (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay for mobile menu */}
      {isMobileView && isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          bg-gray-900 text-white transition-all duration-300 ease-in-out
          fixed z-40 shadow-xl h-full
          ${isMobileView ? `${isMobileMenuOpen ? "left-0" : "-left-64"} w-64` : `${collapsed ? "w-20" : "w-64"} left-0`}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {(!collapsed || isMobileView) && <h1 className="text-xl font-bold">TechBit Admin</h1>}
          <button onClick={toggleSidebar} className="p-2 hover:bg-gray-800 rounded-full">
            {(isMobileView && isMobileMenuOpen) || (!isMobileView && !collapsed) ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center px-4 py-3 hover:bg-gray-800 
                ${location.pathname === item.path ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                ${collapsed && !isMobileView ? "justify-center" : "justify-start"}
                transition-colors duration-200 rounded-lg mx-2 mb-1
              `}
            >
              <div className={`${collapsed && !isMobileView ? "" : "mr-4"}`}>{item.icon}</div>
              {(!collapsed || isMobileView) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 w-full px-2">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500 hover:text-white
              transition-colors duration-200 rounded-lg
              ${collapsed && !isMobileView ? "justify-center" : "justify-start"}
            `}
          >
            <div className={`${collapsed && !isMobileView ? "" : "mr-4"}`}>
              <LogOut className="w-5 h-5" />
            </div>
            {(!collapsed || isMobileView) && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={`
        flex-1 transition-all duration-300 ease-in-out
        ${isMobileView ? "ml-0" : collapsed ? "ml-20" : "ml-64"}
      `}
      >
        {/* Header */}
        <header className="bg-white shadow-sm py-3 px-4 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {isMobileView && (
                <button onClick={toggleSidebar} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
              )}
              <div className="flex items-center text-gray-700 font-medium">
                <div className="flex items-center text-sm text-gray-500">
                  <Home className="w-4 h-4 mr-1" />
                  <span>Admin</span>
                  <ChevronRight className="w-4 h-4 mx-1" />
                  <span className="text-gray-700">
                    {menuItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-1 rounded-full bg-indigo-600 text-white">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}
    </div>
  )

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        
        .animate-fade-in-out {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout>
                <Dashboard onLogout={handleLogout} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-logins"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout>
                <UserLogins onLogout={handleLogout} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-enrolled"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout>
                <UserEnrolled onLogout={handleLogout} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-courses"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AdminLayout>
                <AdminCourses />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </>
  )
}

export default App
