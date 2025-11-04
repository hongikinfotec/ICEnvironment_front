import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import './Layout.css'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} />
      <div className={`main-container ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Header onToggleSidebar={toggleSidebar} />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
