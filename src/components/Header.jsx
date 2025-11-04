import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Header.css'

function Header({ onToggleSidebar }) {
  const location = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getPageTitle = () => {
    const pathMap = {
      '/monitoring': '모니터링',
      '/history/data': '이력관리 > 데이터 이력관리',
      '/history/prediction': '이력관리 > 수질예측 이력관리',
      '/history/alarm': '이력관리 > 알림 이력관리',
      '/history/alarm-process': '이력관리 > 알림 이력관리(공종)',
      '/history/alarm-prediction': '이력관리 > 알림 이력관리(예측)',
      '/settings': '환경설정'
    }
    return pathMap[location.pathname] || '모니터링'
  }

  const formatDateTime = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar} aria-label="메뉴 토글">
          ☰
        </button>
        <h2 className="page-title">{getPageTitle()}</h2>
      </div>

      <div className="header-right">
        <div className="header-time">
          <span className="time-label">현재시각:</span>
          <span className="time-value">{formatDateTime(currentTime)}</span>
        </div>
        <div className="header-logo">
          <img
            src="/logo.png"
            alt="인천환경공단 로고"
            className="logo-image"
          />
        </div>
      </div>
    </header>
  )
}

export default Header
