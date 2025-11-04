/**
 * API Client for Wastewater Monitoring System
 * 백엔드 API와 통신하기 위한 클라이언트
 */
import axios from 'axios'

// API 기본 URL (환경 변수에서 가져오거나 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor (요청 전 처리)
api.interceptors.request.use(
  config => {
    // 인증 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response Interceptor (응답 후 처리)
api.interceptors.response.use(
  response => response.data,
  error => {
    // 인증 오류 처리
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // 로그인 페이지로 리다이렉트 (필요시)
      // window.location.href = '/login'
    }

    // 에러 메시지 표시 (필요시)
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================================================
// 1. 실시간 모니터링 API
// ============================================================================

export const monitoringAPI = {
  /**
   * 처리장 공종 현황 조회
   */
  getProcessStatus: () => api.get('/api/monitoring/process-status'),

  /**
   * 5개 지별 센서 데이터 조회
   */
  getZoneData: () => api.get('/api/monitoring/zone-data'),

  /**
   * 방류 TMS 데이터 조회
   */
  getTMS: () => api.get('/api/monitoring/tms'),

  /**
   * 실시간 알림 조회
   * @param {number} limit - 조회할 알림 개수 (기본값: 10)
   */
  getAlerts: (limit = 10) => api.get(`/api/monitoring/alerts?limit=${limit}`)
}

// ============================================================================
// 2. AI 예측 API
// ============================================================================

export const predictionAPI = {
  /**
   * 3시간 후 예측값 조회
   */
  getForecast: () => api.get('/api/prediction/forecast'),

  /**
   * 1시간 후 예측값 조회
   */
  getForecast1Hour: () => api.get('/api/prediction/forecast/1hour')
}

// ============================================================================
// 3. 이력 조회 API
// ============================================================================

export const historyAPI = {
  /**
   * 센서 데이터 이력 조회
   * @param {Object} params - 조회 파라미터
   */
  getSensorData: (params) => api.post('/api/history/sensor-data', params),

  /**
   * 예측 이력 조회
   * @param {Object} params - 조회 파라미터
   */
  getPredictions: (params) => api.post('/api/history/predictions', params),

  /**
   * 알림 이력 조회 (공종)
   * @param {Object} params - 조회 파라미터
   */
  getAlarmProcess: (params) => api.post('/api/history/alarms/process', params),

  /**
   * 알림 이력 조회 (예측)
   * @param {Object} params - 조회 파라미터
   */
  getAlarmPrediction: (params) => api.post('/api/history/alarms/prediction', params)
}

// ============================================================================
// 4. Excel 다운로드 API
// ============================================================================

export const exportAPI = {
  /**
   * 센서 데이터 Excel 다운로드
   * @param {Object} params - 다운로드 파라미터
   */
  exportSensorData: async (params) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/export/sensor-data`, params, {
        responseType: 'blob',
        timeout: 30000
      })
      downloadFile(response.data, `sensor_data_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
      console.error('센서 데이터 다운로드 실패:', error)
      throw error
    }
  },

  /**
   * 예측 이력 Excel 다운로드
   * @param {Object} params - 다운로드 파라미터
   */
  exportPredictions: async (params) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/export/predictions`, params, {
        responseType: 'blob',
        timeout: 30000
      })
      downloadFile(response.data, `predictions_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
      console.error('예측 이력 다운로드 실패:', error)
      throw error
    }
  },

  /**
   * 알림 이력 Excel 다운로드
   * @param {Object} params - 다운로드 파라미터
   */
  exportAlarms: async (params) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/export/alarms`, params, {
        responseType: 'blob',
        timeout: 30000
      })
      downloadFile(response.data, `alarms_${params.type}_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
      console.error('알림 이력 다운로드 실패:', error)
      throw error
    }
  }
}

/**
 * 파일 다운로드 헬퍼 함수
 */
function downloadFile(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// ============================================================================
// 5. 환경설정 API
// ============================================================================

export const settingsAPI = {
  /**
   * 임계값 조회
   */
  getThresholds: () => api.get('/api/settings/thresholds'),

  /**
   * 임계값 저장
   * @param {Object} data - 저장할 임계값 데이터
   */
  updateThresholds: (data) => api.put('/api/settings/thresholds', data)
}

// ============================================================================
// 6. WebSocket Client
// ============================================================================

/**
 * WebSocket 클라이언트
 */
export class WebSocketClient {
  constructor(url = `ws://localhost:8000/ws/monitoring`) {
    this.url = url
    this.ws = null
    this.reconnectInterval = 5000
    this.reconnectTimer = null
  }

  /**
   * WebSocket 연결
   * @param {Function} onMessage - 메시지 수신 콜백
   * @param {Function} onOpen - 연결 성공 콜백
   * @param {Function} onError - 에러 콜백
   */
  connect(onMessage, onOpen, onError) {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('✅ WebSocket 연결 성공')
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer)
          this.reconnectTimer = null
        }
        if (onOpen) onOpen()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (onMessage) onMessage(data)
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error)
        if (onError) onError(error)
      }

      this.ws.onclose = () => {
        console.log('👋 WebSocket 연결 종료')
        // 자동 재연결
        this.reconnectTimer = setTimeout(() => {
          console.log('🔄 WebSocket 재연결 시도...')
          this.connect(onMessage, onOpen, onError)
        }, this.reconnectInterval)
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      if (onError) onError(error)
    }
  }

  /**
   * 메시지 전송
   * @param {Object} message - 전송할 메시지
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.')
    }
  }

  /**
   * 연결 종료
   */
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// ============================================================================
// 7. Health Check
// ============================================================================

export const healthCheck = {
  /**
   * API 서버 상태 확인
   */
  check: () => api.get('/health')
}

export default {
  monitoringAPI,
  predictionAPI,
  historyAPI,
  exportAPI,
  settingsAPI,
  WebSocketClient,
  healthCheck
}
