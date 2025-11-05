import React, { createContext, useContext, useState, useEffect } from 'react'

const ThresholdContext = createContext()

export const useThreshold = () => {
  const context = useContext(ThresholdContext)
  if (!context) {
    throw new Error('useThreshold must be used within a ThresholdProvider')
  }
  return context
}

export const ThresholdProvider = ({ children }) => {
  // 기본 임계값 설정 (환경부 기준)
  const defaultProcessSettings = {
    anaerobic: {
      orp: { upper: -350, lower: -250 },
      ph: { upper: 7.0, lower: 6.5 }
    },
    anoxic: {
      orp: { upper: -200, lower: -100 },
      ph: { upper: 7.0, lower: 6.5 }
    },
    aerobic: {
      do: { upper: 5.0, lower: 3.0 },
      ph: { upper: 7.0, lower: 6.5 },
      mlss: { upper: 9000, lower: 6000 }
    }
  }

  const defaultEffluentSettings = {
    toc: { upper: 25, lower: 0 },
    ss: { upper: 10, lower: 0 },
    tn: { upper: 20, lower: 0 },
    tp: { upper: 2, lower: 0 }
  }

  // localStorage에서 임계값 불러오기 또는 기본값 사용
  const [processThresholds, setProcessThresholds] = useState(() => {
    const saved = localStorage.getItem('processThresholds')
    return saved ? JSON.parse(saved) : defaultProcessSettings
  })

  const [effluentThresholds, setEffluentThresholds] = useState(() => {
    const saved = localStorage.getItem('effluentThresholds')
    return saved ? JSON.parse(saved) : defaultEffluentSettings
  })

  // 임계값이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('processThresholds', JSON.stringify(processThresholds))
  }, [processThresholds])

  useEffect(() => {
    localStorage.setItem('effluentThresholds', JSON.stringify(effluentThresholds))
  }, [effluentThresholds])

  // 공종 임계값 업데이트
  const updateProcessThreshold = (process, parameter, type, value) => {
    setProcessThresholds(prev => ({
      ...prev,
      [process]: {
        ...prev[process],
        [parameter]: {
          ...prev[process][parameter],
          [type]: value
        }
      }
    }))
  }

  // 방류 임계값 업데이트
  const updateEffluentThreshold = (parameter, type, value) => {
    setEffluentThresholds(prev => ({
      ...prev,
      [parameter]: {
        ...prev[parameter],
        [type]: value
      }
    }))
  }

  // 상태 판단 함수 (공종)
  const getProcessStatus = (process, parameter, value) => {
    if (value === '-' || value === null || value === undefined) return 'normal'

    const numValue = parseFloat(value)
    const threshold = processThresholds[process]?.[parameter]

    if (!threshold || !threshold.upper || !threshold.lower) return 'normal'

    const upper = parseFloat(threshold.upper)
    const lower = parseFloat(threshold.lower)

    // 비정상: 상한/하한 초과
    if (numValue > upper || numValue < lower) return 'abnormal'

    return 'normal'
  }

  // 상태 판단 함수 (방류)
  const getEffluentStatus = (parameter, value) => {
    if (value === '-' || value === null || value === undefined) return 'normal'

    const numValue = parseFloat(value)
    const threshold = effluentThresholds[parameter]

    if (!threshold || !threshold.upper) return 'normal'

    const upper = parseFloat(threshold.upper)

    // 비정상: 상한 초과
    if (numValue > upper) return 'abnormal'

    return 'normal'
  }

  const value = {
    processThresholds,
    effluentThresholds,
    updateProcessThreshold,
    updateEffluentThreshold,
    getProcessStatus,
    getEffluentStatus
  }

  return (
    <ThresholdContext.Provider value={value}>
      {children}
    </ThresholdContext.Provider>
  )
}
