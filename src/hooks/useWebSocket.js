/**
 * WebSocket Hook for React
 * WebSocket 실시간 데이터 수신을 위한 커스텀 Hook
 */
import { useEffect, useRef, useState } from 'react'

/**
 * WebSocket 연결 및 실시간 데이터 수신 Hook
 * @param {string} url - WebSocket URL
 * @param {Object} options - 옵션
 * @returns {Object} - WebSocket 상태 및 메서드
 */
export function useWebSocket(url = 'ws://localhost:8000/ws/monitoring', options = {}) {
  const {
    reconnectInterval = 5000,
    onOpen,
    onError,
    onClose
  } = options

  const [connected, setConnected] = useState(false)
  const [data, setData] = useState(null)
  const [lastMessage, setLastMessage] = useState(null)
  const ws = useRef(null)
  const reconnectTimer = useRef(null)

  useEffect(() => {
    connectWebSocket()

    return () => {
      disconnect()
    }
  }, [url])

  const connectWebSocket = () => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('✅ WebSocket 연결 성공')
        setConnected(true)
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current)
          reconnectTimer.current = null
        }
        if (onOpen) onOpen()
      }

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setLastMessage(message)
          setData(message.data)

          // 메시지 타입별 처리 (옵션)
          console.log(`📨 [${message.type}]`, message.data)
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error)
        }
      }

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error)
        setConnected(false)
        if (onError) onError(error)
      }

      ws.current.onclose = () => {
        console.log('👋 WebSocket 연결 종료')
        setConnected(false)
        if (onClose) onClose()

        // 자동 재연결
        reconnectTimer.current = setTimeout(() => {
          console.log('🔄 WebSocket 재연결 시도...')
          connectWebSocket()
        }, reconnectInterval)
      }
    } catch (error) {
      console.error('WebSocket 연결 실패:', error)
      setConnected(false)
      if (onError) onError(error)
    }
  }

  const send = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.')
    }
  }

  const disconnect = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current)
      reconnectTimer.current = null
    }
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    setConnected(false)
  }

  return {
    connected,
    data,
    lastMessage,
    send,
    disconnect
  }
}

export default useWebSocket
