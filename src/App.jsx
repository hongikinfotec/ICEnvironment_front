import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThresholdProvider } from './context/ThresholdContext'
import Layout from './components/Layout'
import Monitoring from './pages/Monitoring'
import DataHistory from './pages/DataHistory'
import PredictionHistory from './pages/PredictionHistory'
import AlarmHistory from './pages/AlarmHistory'
import Settings from './pages/Settings'

function App() {
  return (
    <ThresholdProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/monitoring" replace />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/history/data" element={<DataHistory />} />
            <Route path="/history/prediction" element={<PredictionHistory />} />
            <Route path="/history/alarm" element={<AlarmHistory />} />
            {/* 하위 호환성을 위한 리다이렉트 */}
            <Route path="/history/alarm-process" element={<Navigate to="/history/alarm" replace />} />
            <Route path="/history/alarm-prediction" element={<Navigate to="/history/alarm" replace />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </ThresholdProvider>
  )
}

export default App
