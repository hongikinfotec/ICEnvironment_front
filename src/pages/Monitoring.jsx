import React, { useState, useEffect } from 'react'
import { useThreshold } from '../context/ThresholdContext'
import { monitoringAPI, predictionAPI } from '../utils/api'
import { formatNumber, formatDecimal, formatAccumulated, formatSensorValue } from '../utils/formatNumber'
import './Monitoring.css'

function Monitoring() {
  const { effluentThresholds, processThresholds, getEffluentStatus, getProcessStatus } = useThreshold()

  // 실시간 데이터 (WebSocket으로 받아올 데이터 - 현재는 시뮬레이션)
  const [processData, setProcessData] = useState({
    inflow: { total: 13693, volume: 9463680 },
    biologicalInflow: { total: 9771, volume: 17191109 },
    effluent: { total: 13693, volume: 6286598 }
  })

  // 방류 TMS 원본 데이터 (센서값)
  const [rawTmsData, setRawTmsData] = useState({
    TOC: 15.8,
    SS: 5.1,
    TN: 18.5,
    TP: 0.8
  })

  // 계산된 TMS 데이터 (임계값 기준 상태 포함)
  const [tmsData, setTmsData] = useState({
    TOC: { value: 15.8, status: 'normal', lowerLimit: 0, upperLimit: 25 },
    SS: { value: 5.1, status: 'normal', lowerLimit: 0, upperLimit: 10 },
    TN: { value: 18.5, status: 'normal', lowerLimit: 0, upperLimit: 20 },
    TP: { value: 0.8, status: 'normal', lowerLimit: 0, upperLimit: 2 }
  })

  // 임계값이 변경될 때마다 TMS 상태 재계산
  useEffect(() => {
    setTmsData({
      TOC: {
        value: rawTmsData.TOC,
        status: getEffluentStatus('toc', rawTmsData.TOC),
        lowerLimit: effluentThresholds.toc.lower || 0,
        upperLimit: effluentThresholds.toc.upper || 25
      },
      SS: {
        value: rawTmsData.SS,
        status: getEffluentStatus('ss', rawTmsData.SS),
        lowerLimit: effluentThresholds.ss.lower || 0,
        upperLimit: effluentThresholds.ss.upper || 10
      },
      TN: {
        value: rawTmsData.TN,
        status: getEffluentStatus('tn', rawTmsData.TN),
        lowerLimit: effluentThresholds.tn.lower || 0,
        upperLimit: effluentThresholds.tn.upper || 20
      },
      TP: {
        value: rawTmsData.TP,
        status: getEffluentStatus('tp', rawTmsData.TP),
        lowerLimit: effluentThresholds.tp.lower || 0,
        upperLimit: effluentThresholds.tp.upper || 2
      }
    })
  }, [rawTmsData, effluentThresholds, getEffluentStatus])

  // 5개 지 원본 데이터 (센서값만)
  const [rawZoneData, setRawZoneData] = useState([
    {
      zone: '1지',
      anaerobic: { orp: -303.4, ph: '-' },
      anoxic: { orp: -313.6, ph: 6.70 },
      aerobic: { do: 5.12, ph: 6.58, mlss: 6687.3 }
    },
    {
      zone: '2지',
      anaerobic: { orp: '-', ph: '-' },
      anoxic: { orp: -313.6, ph: 6.70 },
      aerobic: { do: 5.12, ph: 6.58, mlss: 6687.3 }
    },
    {
      zone: '3지',
      anaerobic: { orp: '-', ph: '-' },
      anoxic: { orp: -313.6, ph: 6.70 },
      aerobic: { do: 5.12, ph: 6.58, mlss: 6687.3 }
    },
    {
      zone: '4지',
      anaerobic: { orp: -303.4, ph: 7.07 },
      anoxic: { orp: -313.6, ph: 6.70 },
      aerobic: { do: 5.12, ph: 6.58, mlss: 6687.3 }
    },
    {
      zone: '5지',
      anaerobic: { orp: '-', ph: '-' },
      anoxic: { orp: -313.6, ph: 6.70 },
      aerobic: { do: 5.12, ph: 6.58, mlss: 6687.3 }
    }
  ])

  // 계산된 지별 데이터 (상태 정보 포함)
  const [zoneData, setZoneData] = useState([])

  // 임계값이 변경될 때마다 지별 데이터 상태 재계산
  useEffect(() => {
    const calculatedZoneData = rawZoneData.map(zone => ({
      ...zone,
      anaerobic: {
        orp: zone.anaerobic.orp,
        ph: zone.anaerobic.ph,
        orpStatus: getProcessStatus('anaerobic', 'orp', zone.anaerobic.orp),
        phStatus: getProcessStatus('anaerobic', 'ph', zone.anaerobic.ph)
      },
      anoxic: {
        orp: zone.anoxic.orp,
        ph: zone.anoxic.ph,
        orpStatus: getProcessStatus('anoxic', 'orp', zone.anoxic.orp),
        phStatus: getProcessStatus('anoxic', 'ph', zone.anoxic.ph)
      },
      aerobic: {
        do: zone.aerobic.do,
        ph: zone.aerobic.ph,
        mlss: zone.aerobic.mlss,
        doStatus: getProcessStatus('aerobic', 'do', zone.aerobic.do),
        phStatus: getProcessStatus('aerobic', 'ph', zone.aerobic.ph),
        mlssStatus: getProcessStatus('aerobic', 'mlss', zone.aerobic.mlss)
      }
    }))
    setZoneData(calculatedZoneData)
  }, [rawZoneData, processThresholds, getProcessStatus])

  // AI 예측 방류수질 원본 데이터
  const [rawPredictionData, setRawPredictionData] = useState({
    TOC: { current: 15.8, predicted: 16.2 },
    SS: { current: 5.1, predicted: 5.8 },
    TN: { current: 18.5, predicted: 19.2 },
    TP: { current: 0.8, predicted: 1.0 }
  })

  // 계산된 예측 데이터 (임계값 기준 상태 포함)
  const [predictionData, setPredictionData] = useState([
    { name: 'TOC', value: 15.8, nextValue: 16.2, unit: 'mg/L', lowerLimit: 0, upperLimit: 25, status: 'normal' },
    { name: 'SS', value: 5.1, nextValue: 5.8, unit: 'mg/L', lowerLimit: 0, upperLimit: 10, status: 'normal' },
    { name: 'T-N', value: 18.5, nextValue: 19.2, unit: 'mg/L', lowerLimit: 0, upperLimit: 20, status: 'normal' },
    { name: 'T-P', value: 0.8, nextValue: 1.0, unit: 'mg/L', lowerLimit: 0, upperLimit: 2, status: 'normal' }
  ])

  // 임계값이 변경될 때마다 예측 데이터 상태 재계산
  useEffect(() => {
    setPredictionData([
      {
        name: 'TOC',
        value: rawPredictionData.TOC.current,
        nextValue: rawPredictionData.TOC.predicted,
        unit: 'mg/L',
        lowerLimit: effluentThresholds.toc.lower || 0,
        upperLimit: effluentThresholds.toc.upper || 25,
        status: getEffluentStatus('toc', rawPredictionData.TOC.predicted) // 예측값 기준으로 상태 판단
      },
      {
        name: 'SS',
        value: rawPredictionData.SS.current,
        nextValue: rawPredictionData.SS.predicted,
        unit: 'mg/L',
        lowerLimit: effluentThresholds.ss.lower || 0,
        upperLimit: effluentThresholds.ss.upper || 10,
        status: getEffluentStatus('ss', rawPredictionData.SS.predicted)
      },
      {
        name: 'T-N',
        value: rawPredictionData.TN.current,
        nextValue: rawPredictionData.TN.predicted,
        unit: 'mg/L',
        lowerLimit: effluentThresholds.tn.lower || 0,
        upperLimit: effluentThresholds.tn.upper || 20,
        status: getEffluentStatus('tn', rawPredictionData.TN.predicted)
      },
      {
        name: 'T-P',
        value: rawPredictionData.TP.current,
        nextValue: rawPredictionData.TP.predicted,
        unit: 'mg/L',
        lowerLimit: effluentThresholds.tp.lower || 0,
        upperLimit: effluentThresholds.tp.upper || 2,
        status: getEffluentStatus('tp', rawPredictionData.TP.predicted)
      }
    ])
  }, [rawPredictionData, effluentThresholds, getEffluentStatus])

  // 백엔드 API로부터 실시간 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 처리장 공종 현황 가져오기
        const processStatus = await monitoringAPI.getProcessStatus()
        console.log('🔍 API 응답 - 처리장 공종:', processStatus)
        setProcessData({
          inflow: {
            total: processStatus.inflow.total,
            volume: processStatus.inflow.accumulated
          },
          biologicalInflow: {
            total: processStatus.biologicalInflow.total,
            volume: processStatus.biologicalInflow.accumulated
          },
          effluent: {
            total: processStatus.effluent.total,
            volume: processStatus.effluent.accumulated
          }
        })
        console.log('✅ 데이터 업데이트 완료')

        // 2. 5개 지별 센서 데이터 가져오기
        const zoneDataFromAPI = await monitoringAPI.getZoneData()
        console.log('🔍 API 응답 - 지별 센서:', zoneDataFromAPI)
        setRawZoneData(zoneDataFromAPI.zones.map(zone => ({
          zone: zone.zone,
          anaerobic: {
            orp: zone.anaerobic.orp || '-',
            ph: zone.anaerobic.ph || '-'
          },
          anoxic: {
            orp: zone.anoxic.orp || '-',
            ph: zone.anoxic.ph || '-'
          },
          aerobic: {
            do: zone.aerobic.do || '-',
            ph: zone.aerobic.ph || '-',
            mlss: zone.aerobic.mlss || '-'
          }
        })))

        // 3. 방류 TMS 데이터 가져오기
        const tmsDataFromAPI = await monitoringAPI.getTMS()
        console.log('🔍 API 응답 - TMS:', tmsDataFromAPI)
        setRawTmsData({
          TOC: tmsDataFromAPI.parameters.TOC.value,
          SS: tmsDataFromAPI.parameters.SS.value,
          TN: tmsDataFromAPI.parameters.TN.value,
          TP: tmsDataFromAPI.parameters.TP.value
        })

        // 4. AI 예측 데이터 가져오기
        const predictionFromAPI = await predictionAPI.getForecast()
        console.log('🔍 API 응답 - 예측:', predictionFromAPI)

        // predictions 배열을 객체로 변환
        const predMap = {}
        predictionFromAPI.predictions.forEach(p => {
          predMap[p.parameter] = { current: p.current, predicted: p.predicted }
        })

        setRawPredictionData({
          TOC: predMap['TOC'] || { current: tmsDataFromAPI.parameters.TOC.value, predicted: tmsDataFromAPI.parameters.TOC.value },
          SS: predMap['SS'] || { current: tmsDataFromAPI.parameters.SS.value, predicted: tmsDataFromAPI.parameters.SS.value },
          TN: predMap['T-N'] || { current: tmsDataFromAPI.parameters.TN.value, predicted: tmsDataFromAPI.parameters.TN.value },
          TP: predMap['T-P'] || { current: tmsDataFromAPI.parameters.TP.value, predicted: tmsDataFromAPI.parameters.TP.value }
        })

      } catch (error) {
        console.error('❌ API 호출 오류:', error)
        console.error('에러 상세:', error.response?.data || error.message)
      }
    }

    // 최초 데이터 로드
    fetchData()

    // 5초마다 데이터 갱신
    const interval = setInterval(fetchData, 5000)

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(interval)
  }, []) // 빈 배열 = 마운트 시 한 번만 실행

  // 실시간 알림 (누적 방식 - 영역 기준)
  const [alerts, setAlerts] = useState([])
  const alertListRef = React.useRef(null) // 알림 리스트 DOM 참조

  // 이전 상태 추적 (중복 알림 방지용)
  const prevAbnormalStatesRef = React.useRef(new Set())

  // 알림 자동 생성 (임계값, TMS, 예측값, 공종 센서 변경 시)
  useEffect(() => {
    const currentAbnormalStates = new Set()
    const newAbnormalAlerts = []
    const currentTime = new Date()

    const formatTime = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    // 1. 공종 센서 알림 (혐기조, 무산소조, 호기조)
    zoneData.forEach(zone => {
      const processMap = {
        anaerobic: { name: '혐기조', sensors: ['orp', 'ph'] },
        anoxic: { name: '무산소조', sensors: ['orp', 'ph'] },
        aerobic: { name: '호기조', sensors: ['do', 'ph', 'mlss'] }
      }

      Object.keys(processMap).forEach(processKey => {
        const process = processMap[processKey]
        const processData = zone[processKey]

        process.sensors.forEach(sensor => {
          const value = processData[sensor]
          const status = processData[`${sensor}Status`]

          if (value !== '-' && status !== 'normal') {
            const sensorName = sensor.toUpperCase()
            const threshold = processThresholds[processKey]?.[sensor]

            if (threshold && threshold.upper && threshold.lower) {
              if (status === 'abnormal') {
                // 고유 키 생성 (중복 방지용)
                const stateKey = `${zone.zone}-${processKey}-${sensor}`
                currentAbnormalStates.add(stateKey)

                // 이전에 없던 비정상 상태면 새 알림 추가
                if (!prevAbnormalStatesRef.current.has(stateKey)) {
                  newAbnormalAlerts.push({
                    time: formatTime(currentTime),
                    level: 'abnormal',
                    message: `[비정상] ${zone.zone} ${process.name} ${sensorName} ${formatSensorValue(value)} (범위: ${formatSensorValue(threshold.lower)}~${formatSensorValue(threshold.upper)})`
                  })
                }
              }
            }
          }
        })
      })
    })

    // 2. 방류 TMS 알림
    Object.keys(tmsData).forEach(key => {
      const item = tmsData[key]
      const paramName = key === 'TN' ? 'T-N' : key === 'TP' ? 'T-P' : key

      if (item.status === 'abnormal') {
        const stateKey = `tms-${key}`
        currentAbnormalStates.add(stateKey)

        if (!prevAbnormalStatesRef.current.has(stateKey)) {
          newAbnormalAlerts.push({
            time: formatTime(currentTime),
            level: 'abnormal',
            message: `[비정상] 방류 ${paramName} ${formatDecimal(item.value, 1)} mg/L (상한 ${formatDecimal(item.upperLimit, 1)} 초과)`
          })
        }
      }
    })

    // 3. 예측 방류수질 알림
    predictionData.forEach(item => {
      if (item.status === 'abnormal') {
        const stateKey = `prediction-${item.name}`
        currentAbnormalStates.add(stateKey)

        if (!prevAbnormalStatesRef.current.has(stateKey)) {
          newAbnormalAlerts.push({
            time: formatTime(currentTime),
            level: 'abnormal',
            message: `[비정상] ${item.name} 예측값 ${formatDecimal(item.nextValue, 1)} ${item.unit} (상한 ${formatDecimal(item.upperLimit, 1)} 초과 예상, 3시간 후)`
          })
        }
      }
    })

    // 4. 새로운 비정상 알림이 있으면 기존 알림 위에 추가
    if (newAbnormalAlerts.length > 0) {
      setAlerts(prevAlerts => {
        // 새 알림을 위에 추가
        return [...newAbnormalAlerts, ...prevAlerts]
      })
    }

    // 현재 비정상 상태를 다음 체크를 위해 저장
    prevAbnormalStatesRef.current = currentAbnormalStates
  }, [zoneData, tmsData, predictionData, processThresholds])

  // 알림 영역 높이 체크 및 넘치는 알림 제거
  React.useLayoutEffect(() => {
    if (!alertListRef.current || alerts.length === 0) return

    const containerHeight = alertListRef.current.clientHeight
    const alertItems = alertListRef.current.children

    let totalHeight = 0
    let visibleCount = 0

    // 위에서부터 알림의 높이를 누적하며 체크
    for (let i = 0; i < alertItems.length; i++) {
      const itemHeight = alertItems[i].offsetHeight
      const gap = i > 0 ? 8 : 0 // gap 값 (CSS의 var(--spacing-sm) = 8px)

      totalHeight += itemHeight + gap

      if (totalHeight <= containerHeight) {
        visibleCount++
      } else {
        break // 영역을 넘어섰으므로 중단
      }
    }

    // 보이는 개수보다 많으면 잘라내기
    if (visibleCount < alerts.length) {
      setAlerts(prevAlerts => prevAlerts.slice(0, visibleCount))
    }
  }, [alerts])

  const getStatusColor = (status) => {
    const colors = {
      normal: 'var(--status-normal)',
      abnormal: 'var(--status-danger)'
    }
    return colors[status] || colors.normal
  }

  // 표 표시용 색상
  const getTableStatusColor = (status) => {
    if (status === 'abnormal') return '#ff0000ff' // 비정상: 빨강
    return 'rgba(21, 182, 0, 1)' // 정상: 초록
  }

  // 예측 카드 배경색
  const getPredictionBackground = (status) => {
    if (status === 'abnormal') return '#ffebeb' // 비정상: 연한 빨강
    return '#f2fff2' // 정상: 연한 초록
  }

  const getStatusText = (status) => {
    if (status === 'abnormal') return '비정상'
    return '정상'
  }

  return (
    <div className="monitoring-page">
      {/* 메인 레이아웃: 좌측 메인 + 우측 사이드바 */}
      <div className="main-layout">
        {/* 좌측 메인 영역 */}
        <div className="main-content">
          {/* 상단: 처리장 공종 현황 + 지별 데이터 테이블 */}
          <section className="zone-data-section">
            {/* 처리장 공종 현황 */}
            <h3 className="section-title">처리장 공종 현황</h3>
            <div className="process-flow-mini">
              <div className="flow-item-mini">
                <div className="flow-label-mini">유입<br/>하수량</div>
                <div className="flow-divider-mini"></div>
                <div className="flow-data-mini">
                  <div className="flow-value-mini">{formatNumber(processData.inflow.total)} <span className="flow-unit">㎥/일</span></div>
                  <div className="flow-subvalue-mini">{formatAccumulated(processData.inflow.volume)} ㎥ (금일적산)</div>
                </div>
              </div>

              <div className="flow-arrow-mini">▶</div>

              <div className="flow-item-mini">
                <div className="flow-label-mini">생물반응조<br/>유입량</div>
                <div className="flow-divider-mini"></div>
                <div className="flow-data-mini">
                  <div className="flow-value-mini">{formatNumber(processData.biologicalInflow.total)} <span className="flow-unit">㎥/일</span></div>
                  <div className="flow-subvalue-mini">{formatAccumulated(processData.biologicalInflow.volume)} ㎥ (금일적산)</div>
                </div>
              </div>

              <div className="flow-arrow-mini">▶</div>

              <div className="flow-item-mini">
                <div className="flow-label-mini">방류<br/>유량</div>
                <div className="flow-divider-mini"></div>
                <div className="flow-data-mini">
                  <div className="flow-value-mini">{formatNumber(processData.effluent.total)} <span className="flow-unit">㎥/일</span></div>
                  <div className="flow-subvalue-mini">{formatAccumulated(processData.effluent.volume)} ㎥ (금일적산)</div>
                </div>
              </div>
            </div>

            {/* 지별 데이터 테이블 */}
            <div className="zone-table-wrapper">
              <table className="zone-table">
                <thead>
                  <tr>
                    <th rowSpan="2">구분<br/>1계</th>
                    <th colSpan="2">혐기조</th>
                    <th colSpan="2">무산소조</th>
                    <th colSpan="3">호기조</th>
                  </tr>
                  <tr>
                    <th>ORP <span className="unit-small">(mV)</span></th>
                    <th>pH</th>
                    <th>ORP <span className="unit-small">(mV)</span></th>
                    <th>pH</th>
                    <th>DO <span className="unit-small">(ppm)</span></th>
                    <th>pH</th>
                    <th>MLSS <span className="unit-small">(㎎/ℓ)</span></th>
                  </tr>
                </thead>
                <tbody>
                  {zoneData.map((zone, index) => (
                    <tr key={index}>
                      <td className="zone-name">{zone.zone}</td>
                      <td className={`sensor-cell ${zone.anaerobic.orpStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.anaerobic.orp)}
                      </td>
                      <td className={`sensor-cell ${zone.anaerobic.phStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.anaerobic.ph)}
                      </td>
                      <td className={`sensor-cell ${zone.anoxic.orpStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.anoxic.orp)}
                      </td>
                      <td className={`sensor-cell ${zone.anoxic.phStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.anoxic.ph)}
                      </td>
                      <td className={`sensor-cell ${zone.aerobic.doStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.aerobic.do)}
                      </td>
                      <td className={`sensor-cell ${zone.aerobic.phStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.aerobic.ph)}
                      </td>
                      <td className={`sensor-cell ${zone.aerobic.mlssStatus === 'abnormal' ? 'cell-abnormal' : ''}`}>
                        {formatSensorValue(zone.aerobic.mlss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 하단: 예측 방류수질 + 그래프 */}
          <div className="bottom-section">
            {/* 예측 방류수질 */}
            <section className="prediction-section">
              <h3 className="section-title">
                예측 방류수질
                <span className="prediction-badge">AI 예측</span>
                <span style={{ fontSize: '11px', color: '#ef4444', marginLeft: '10px', fontWeight: '600' }}>
                  ※ 3시간 후 예측값
                </span>
              </h3>
              <div className="prediction-grid">
                {predictionData.map((item, index) => {
                  const isAbnormal = item.status === 'abnormal';
                  const statusColor = getTableStatusColor(item.status);

                  return (
                    <div key={index} className={`prediction-card ${isAbnormal ? 'prediction-card-abnormal' : ''}`} style={{
                      borderColor: getTableStatusColor(item.status),
                      background: getPredictionBackground(item.status)
                    }}>
                      <div className="prediction-name" style={isAbnormal ? { color: statusColor } : undefined}>{item.name}</div>
                      <div className="prediction-center">
                        <div className="prediction-value" style={isAbnormal ? { color: statusColor } : undefined}>{formatDecimal(item.nextValue, 1)} {item.unit}</div>
                        <div className="prediction-limit" style={isAbnormal ? { color: statusColor } : undefined}>{formatDecimal(item.lowerLimit, 1)}~{formatDecimal(item.upperLimit, 1)} {item.unit}</div>
                      </div>
                      <div className="prediction-status" style={{ color: getTableStatusColor(item.status) }}>
                        {getStatusText(item.status)} <span className="status-dot">●</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 그래프 영역 */}
            <section className="chart-section">
              <h3 className="section-title">수질 추세 그래프</h3>
              <div className="chart-placeholder">
                <svg className="chart-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <p className="chart-text">그래프 영역</p>
              </div>
            </section>
          </div>
        </div>

        {/* 우측: 방류 TMS + 실시간 알림 */}
        <aside className="sidebar-panel">
          {/* 방류 TMS */}
          <section className="tms-section">
            <h3 className="section-title">방류 TMS</h3>
            <div className="tms-grid">
              <div className={`tms-item ${tmsData.TOC.status === 'abnormal' ? 'abnormal' : ''}`}>
                <div className="tms-label">TOC</div>
                <div className="tms-value">{formatDecimal(tmsData.TOC.value, 1)}</div>
                <div className="tms-limit">{formatDecimal(tmsData.TOC.lowerLimit, 1)}~{formatDecimal(tmsData.TOC.upperLimit, 1)} mg/L</div>
              </div>
              <div className={`tms-item ${tmsData.SS.status === 'abnormal' ? 'abnormal' : ''}`}>
                <div className="tms-label">SS</div>
                <div className="tms-value">{formatDecimal(tmsData.SS.value, 1)}</div>
                <div className="tms-limit">{formatDecimal(tmsData.SS.lowerLimit, 1)}~{formatDecimal(tmsData.SS.upperLimit, 1)} mg/L</div>
              </div>
              <div className={`tms-item ${tmsData.TN.status === 'abnormal' ? 'abnormal' : ''}`}>
                <div className="tms-label">T-N</div>
                <div className="tms-value">{formatDecimal(tmsData.TN.value, 1)}</div>
                <div className="tms-limit">{formatDecimal(tmsData.TN.lowerLimit, 1)}~{formatDecimal(tmsData.TN.upperLimit, 1)} mg/L</div>
              </div>
              <div className={`tms-item ${tmsData.TP.status === 'abnormal' ? 'abnormal' : ''}`}>
                <div className="tms-label">T-P</div>
                <div className="tms-value">{formatDecimal(tmsData.TP.value, 1)}</div>
                <div className="tms-limit">{formatDecimal(tmsData.TP.lowerLimit, 1)}~{formatDecimal(tmsData.TP.upperLimit, 1)} mg/L</div>
              </div>
            </div>
          </section>

          {/* 실시간 알림 */}
          <section className="alert-section">
            <h3 className="section-title">실시간 알림</h3>
            <div className="alert-list" ref={alertListRef}>
              {alerts.map((alert, index) => (
                <div key={index} className={`alert-item alert-${alert.level}`}>
                  <div className="alert-time">{alert.time}</div>
                  <div className="alert-message">{alert.message}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Monitoring
