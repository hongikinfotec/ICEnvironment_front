/**
 * 숫자 포맷팅 유틸리티 함수들
 */

/**
 * 천 단위 콤마 추가
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} - 포맷팅된 문자열
 * 예: 1234567 → "1,234,567"
 */
export function formatNumber(num) {
  if (num === null || num === undefined || num === '-') return '-'
  return Number(num).toLocaleString('ko-KR')
}

/**
 * 소수점 자릿수 제한
 * @param {number} num - 포맷팅할 숫자
 * @param {number} decimals - 소수점 자릿수 (기본값: 2)
 * @returns {string} - 포맷팅된 문자열
 * 예: 12.3456789 → "12.35"
 */
export function formatDecimal(num, decimals = 2) {
  if (num === null || num === undefined || num === '-') return '-'
  return Number(num).toFixed(decimals)
}

/**
 * 큰 숫자를 K, M 단위로 표시
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} - 포맷팅된 문자열
 * 예: 1500 → "1.5K", 1500000 → "1.5M"
 */
export function formatLargeNumber(num) {
  if (num === null || num === undefined || num === '-') return '-'

  const absNum = Math.abs(num)

  if (absNum >= 1000000) {
    // 백만 이상: M 단위
    return (num / 1000000).toFixed(1) + 'M'
  } else if (absNum >= 100000) {
    // 10만 이상: 천 단위 콤마
    return formatNumber(Math.round(num))
  } else if (absNum >= 1000) {
    // 천 이상: K 단위 또는 천 단위 콤마
    return formatNumber(num)
  } else {
    // 천 미만: 소수점 1자리
    return formatDecimal(num, 1)
  }
}

/**
 * 센서 값 포맷팅 (소수점 2자리)
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} - 포맷팅된 문자열
 */
export function formatSensorValue(num) {
  if (num === null || num === undefined || num === '-') return '-'

  // 정수면 그대로, 소수면 소수점 2자리까지
  if (Number.isInteger(num)) {
    return formatNumber(num)
  } else {
    return formatDecimal(num, 2)
  }
}

/**
 * 누적량 포맷팅 (큰 숫자용)
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} - 포맷팅된 문자열
 * 예: 9463680 → "9.46M"
 */
export function formatAccumulated(num) {
  if (num === null || num === undefined || num === '-') return '-'

  const absNum = Math.abs(num)

  if (absNum >= 1000000) {
    // 백만 이상: M 단위 (소수점 2자리)
    return (num / 1000000).toFixed(2) + 'M'
  } else if (absNum >= 1000) {
    // 천 이상: K 단위 (소수점 1자리)
    return (num / 1000).toFixed(1) + 'K'
  } else {
    return formatNumber(num)
  }
}
