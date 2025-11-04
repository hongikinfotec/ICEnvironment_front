import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ isOpen }) {
  const location = useLocation()
  const [historyExpanded, setHistoryExpanded] = useState(true)

  const isActive = (path) => {
    // 알림 이력관리 통합 처리
    if (path === '/history/alarm') {
      return location.pathname === '/history/alarm' ||
             location.pathname === '/history/alarm-process' ||
             location.pathname === '/history/alarm-prediction' ? 'active' : ''
    }
    return location.pathname === path ? 'active' : ''
  }

  const toggleHistory = () => {
    setHistoryExpanded(!historyExpanded)
  }

  // 이력관리 페이지로 이동하면 하위 메뉴 자동 펼치기
  useEffect(() => {
    if (location.pathname.startsWith('/history')) {
      setHistoryExpanded(true)
    }
  }, [location.pathname])

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">방류수질 예측 모니터링</h1>
      </div>

      <nav className="sidebar-nav">
        <Link to="/monitoring" className={`nav-item ${isActive('/monitoring')}`}>
          <span className="nav-icon">📊</span>
          <span className="nav-text">모니터링</span>
        </Link>

        <div className="nav-group">
          <Link to="/history/data" className={`nav-item nav-group-header ${isActive('/history/data') || isActive('/history/prediction') || isActive('/history/alarm')}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">이력관리</span>
            <span className={`nav-arrow ${historyExpanded ? 'expanded' : ''}`} onClick={(e) => { e.preventDefault(); toggleHistory(); }}>▼</span>
          </Link>

          {historyExpanded && (
            <div className="nav-sub-items">
              <Link to="/history/data" className={`nav-sub-item ${isActive('/history/data')}`}>
                ▸ 데이터 이력관리
              </Link>
              <Link to="/history/prediction" className={`nav-sub-item ${isActive('/history/prediction')}`}>
                ▸ 수질예측 이력관리
              </Link>
              <Link to="/history/alarm" className={`nav-sub-item ${isActive('/history/alarm')}`}>
                ▸ 알림 이력관리
              </Link>
            </div>
          )}
        </div>

        <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-text">환경설정</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <p className="footer-text">인천환경공단</p>
        <p className="footer-subtext">v1.0.0</p>
      </div>
    </aside>
  )
}

export default Sidebar
