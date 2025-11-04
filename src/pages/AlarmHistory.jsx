import React, { useState, useEffect } from 'react'
import SearchFilter from '../components/SearchFilter'
import DataTable from '../components/DataTable'
import { exportAPI, historyAPI } from '../utils/api'
import './History.css'

function AlarmHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterValues, setFilterValues] = useState({ type: 'process', queryUnit: 'hour' })
  const [searchParams, setSearchParams] = useState(null) // 검색 조건 저장
  const [tableData, setTableData] = useState([]) // 조회된 데이터

  // 구분 타입 (공종/예측)
  const alarmType = filterValues.type || 'process'
  // 조회 단위 (hour: 시간 단위, minute: 1분 단위)
  const queryUnit = filterValues.queryUnit || 'hour'

  // 선택된 공종에 따른 센서 옵션 반환
  const getSensorOptions = () => {
    const processType = filterValues.processType || 'all'

    if (processType === 'all') {
      return [
        { value: 'all', label: '전체' },
        { value: 'orp', label: 'ORP' },
        { value: 'ph', label: 'pH' },
        { value: 'do', label: 'DO' },
        { value: 'mlss', label: 'MLSS' }
      ]
    } else if (processType === 'anaerobic' || processType === 'anoxic') {
      // 혐기조, 무산소조: ORP, pH만
      return [
        { value: 'all', label: '전체' },
        { value: 'orp', label: 'ORP' },
        { value: 'ph', label: 'pH' }
      ]
    } else if (processType === 'aerobic') {
      // 호기조: DO, pH, MLSS
      return [
        { value: 'all', label: '전체' },
        { value: 'do', label: 'DO' },
        { value: 'ph', label: 'pH' },
        { value: 'mlss', label: 'MLSS' }
      ]
    }

    return [{ value: 'all', label: '전체' }]
  }

  // 공종 필터 (조회 단위에 따라 동적으로 변경)
  const processFilters = [
    {
      label: '조회 단위',
      name: 'queryUnit',
      type: 'radio',
      options: [
        { value: 'hour', label: '시간 단위', description: '최대 1개월(31일) 조회 가능' },
        { value: 'minute', label: '1분 단위', description: '최대 24시간 조회 가능' }
      ],
      value: queryUnit
    },
    {
      label: '구분',
      name: 'type',
      type: 'select',
      options: [
        { value: 'process', label: '공종' },
        { value: 'prediction', label: '예측' }
      ],
      value: filterValues.type || 'process'
    },
    {
      label: '지',
      name: 'zone',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: '1', label: '1지' },
        { value: '2', label: '2지' },
        { value: '3', label: '3지' },
        { value: '4', label: '4지' },
        { value: '5', label: '5지' }
      ],
      value: filterValues.zone || 'all'
    },
    {
      label: '공종',
      name: 'processType',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'anaerobic', label: '혐기조' },
        { value: 'anoxic', label: '무산소조' },
        { value: 'aerobic', label: '호기조' }
      ],
      value: filterValues.processType || 'all'
    },
    {
      label: '센서',
      name: 'sensor',
      type: 'select',
      options: getSensorOptions(),
      value: filterValues.sensor || 'all'
    },
    {
      label: '시작일',
      name: 'startDate',
      type: 'date',
      value: filterValues.startDate || ''
    },
    {
      label: '시작 시간',
      name: 'startTime',
      type: queryUnit === 'hour' ? 'hour' : 'time',
      value: filterValues.startTime || ''
    },
    {
      label: '종료일 (선택)',
      name: 'endDate',
      type: 'date',
      value: filterValues.endDate || ''
    },
    {
      label: '종료 시간 (선택)',
      name: 'endTime',
      type: queryUnit === 'hour' ? 'hour' : 'time',
      value: filterValues.endTime || ''
    }
  ]

  // 예측 필터 (조회 단위에 따라 동적으로 변경)
  const predictionFilters = [
    {
      label: '조회 단위',
      name: 'queryUnit',
      type: 'radio',
      options: [
        { value: 'hour', label: '시간 단위', description: '최대 1개월(31일) 조회 가능' },
        { value: 'minute', label: '1분 단위', description: '최대 24시간 조회 가능' }
      ],
      value: queryUnit
    },
    {
      label: '구분',
      name: 'type',
      type: 'select',
      options: [
        { value: 'process', label: '공종' },
        { value: 'prediction', label: '예측' }
      ],
      value: filterValues.type || 'process'
    },
    {
      label: '항목',
      name: 'item',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'toc', label: 'TOC' },
        { value: 'ss', label: 'SS' },
        { value: 'tn', label: 'T-N' },
        { value: 'tp', label: 'T-P' }
      ],
      value: filterValues.item || 'all'
    },
    {
      label: '시작일',
      name: 'startDate',
      type: 'date',
      value: filterValues.startDate || ''
    },
    {
      label: '시작 시간',
      name: 'startTime',
      type: queryUnit === 'hour' ? 'hour' : 'time',
      value: filterValues.startTime || ''
    },
    {
      label: '종료일 (선택)',
      name: 'endDate',
      type: 'date',
      value: filterValues.endDate || ''
    },
    {
      label: '종료 시간 (선택)',
      name: 'endTime',
      type: queryUnit === 'hour' ? 'hour' : 'time',
      value: filterValues.endTime || ''
    }
  ]

  // 공종 테이블 컬럼 (그룹 헤더 구조)
  const processColumns = [
    { header: 'No.', field: 'no', width: '60px', align: 'center' },
    { header: '구분', field: 'type', width: '80px', align: 'center',
      render: () => '공종'
    },
    { header: '지', field: 'zone', width: '80px', align: 'center' },
    { header: '알림 일시', field: 'alarmDate', width: '180px', align: 'center' },
    { header: '알림 결과', field: 'alarmResult', width: '100px', align: 'center',
      className: (value) => `cell-${value}`,
      render: (value) => {
        const texts = { normal: '정상', abnormal: '비정상' }
        return texts[value] || value
      }
    },
    { header: '공종', field: 'processType', width: '100px', align: 'center' },
    { header: '센서', field: 'sensor', width: '100px', align: 'center' },
    {
      header: '혐기조',
      children: [
        {
          header: 'ORP',
          field: 'anaerobicOrp',
          width: '100px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'anaerobicOrp' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        },
        {
          header: 'pH',
          field: 'anaerobicPh',
          width: '100px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'anaerobicPh' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        }
      ]
    },
    {
      header: '무산소조',
      children: [
        {
          header: 'ORP',
          field: 'anoxicOrp',
          width: '100px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'anoxicOrp' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        },
        {
          header: 'pH',
          field: 'anoxicPh',
          width: '100px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'anoxicPh' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        }
      ]
    },
    {
      header: '호기조',
      children: [
        {
          header: 'DO',
          field: 'aerobicDo',
          width: '100px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'aerobicDo' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        },
        {
          header: 'pH',
          field: 'aerobicPh',
          width: '100px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'aerobicPh' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        },
        {
          header: 'MLSS',
          field: 'aerobicMlss',
          width: '120px',
          align: 'center',
          className: (value, row) => row.abnormalSensor === 'aerobicMlss' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
        }
      ]
    },
    { header: '알림 내용', field: 'message', width: '300px', align: 'left' }
  ]

  // 예측 테이블 컬럼
  const predictionColumns = [
    { header: 'No.', field: 'no', width: '60px', align: 'center' },
    { header: '구분', field: 'type', width: '80px', align: 'center',
      render: () => '예측'
    },
    { header: '알림 일시', field: 'alarmDate', width: '180px', align: 'center' },
    { header: '알림 결과', field: 'alarmResult', width: '100px', align: 'center',
      className: (value) => `cell-${value}`,
      render: (value) => {
        const texts = { normal: '정상', abnormal: '비정상' }
        return texts[value] || value
      }
    },
    { header: '항목', field: 'item', width: '100px', align: 'center' },
    { header: 'TOC', field: 'toc', width: '100px', align: 'center',
      className: (value, row) => row.item === 'TOC' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
    },
    { header: 'SS', field: 'ss', width: '100px', align: 'center',
      className: (value, row) => row.item === 'SS' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
    },
    { header: 'T-N', field: 'tn', width: '100px', align: 'center',
      className: (value, row) => row.item === 'T-N' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
    },
    { header: 'T-P', field: 'tp', width: '100px', align: 'center',
      className: (value, row) => row.item === 'T-P' && row.alarmResult !== 'normal' ? 'cell-abnormal' : ''
    },
    { header: '알림 내용', field: 'message', width: '300px', align: 'left' }
  ]

  const handleFilterChange = (name, value) => {
    // 구분이 변경되면 다른 필터값들 초기화
    if (name === 'type') {
      setFilterValues({
        type: value,
        queryUnit: filterValues.queryUnit || 'hour',
        startDate: filterValues.startDate || '',
        endDate: filterValues.endDate || '',
        startTime: filterValues.startTime || '',
        endTime: filterValues.endTime || ''
      })
      setCurrentPage(1) // 페이지도 초기화
    } else if (name === 'processType') {
      // 공종이 변경되면 센서를 'all'로 초기화
      setFilterValues({ ...filterValues, [name]: value, sensor: 'all' })
    } else {
      setFilterValues({ ...filterValues, [name]: value })
    }
  }

  const handleSearch = async () => {
    // 시작일 필수 검증
    if (!filterValues.startDate) {
      alert('시작일을 선택해주세요.')
      return
    }

    // 시작일시 계산 (시간 입력 없으면 00:00:00)
    let startTimeString
    if (filterValues.startTime) {
      startTimeString = queryUnit === 'hour'
        ? `${filterValues.startTime}:00:00`
        : `${filterValues.startTime}:00`
    } else {
      startTimeString = '00:00:00'
    }
    const startDateTime = new Date(`${filterValues.startDate}T${startTimeString}`)

    // 종료일시 계산 (지정 안 하면 시작일의 23:59:59)
    let endDateTime
    if (filterValues.endDate && filterValues.endTime) {
      // 종료일시가 모두 지정된 경우
      const endTimeString = queryUnit === 'hour'
        ? `${filterValues.endTime}:59:59`
        : `${filterValues.endTime}:59`
      endDateTime = new Date(`${filterValues.endDate}T${endTimeString}`)
    } else if (filterValues.endDate && !filterValues.endTime) {
      // 종료일만 지정된 경우 (종료시간은 23:59:59)
      endDateTime = new Date(`${filterValues.endDate}T23:59:59`)
    } else {
      // 종료일/시간이 없으면 시작일의 23:59:59
      endDateTime = new Date(`${filterValues.startDate}T23:59:59`)
    }

    if (startDateTime >= endDateTime) {
      alert('종료 일시는 시작 일시보다 이후여야 합니다.')
      return
    }

    // 조회 범위 검증
    const diffMs = endDateTime - startDateTime
    const diffHours = diffMs / (1000 * 60 * 60)
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    if (queryUnit === 'minute') {
      // 1분 단위: 최대 24시간
      if (diffHours > 24) {
        alert('1분 단위 조회는 최대 24시간까지만 가능합니다.')
        return
      }
    } else {
      // 시간 단위: 최대 한 달 (31일)
      if (diffDays > 31) {
        alert('시간 단위 조회는 최대 31일(1개월)까지만 가능합니다.')
        return
      }
    }

    // API 요청 파라미터 생성
    const apiParams = alarmType === 'process' ? {
      type: 'process',  // 엑셀 다운로드를 위한 타입 구분
      zone: filterValues.zone || 'all',
      processType: filterValues.processType || 'all',
      sensor: filterValues.sensor || 'all',
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      interval: queryUnit === 'minute' ? 'minute' : 'hour',
      page: 1,
      pageSize: 10000  // 모든 데이터를 받기 위해 큰 값 설정
    } : {
      type: 'prediction',  // 엑셀 다운로드를 위한 타입 구분
      item: filterValues.item || 'all',
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      interval: queryUnit === 'minute' ? 'minute' : 'hour',
      page: 1,
      pageSize: 10000  // 모든 데이터를 받기 위해 큰 값 설정
    }

    // 검색 조건 저장
    setSearchParams(apiParams)
    setCurrentPage(1) // 페이지를 1페이지로 초기화

    console.log('검색 조건:', apiParams)
    console.log('조회 기간:', `${startDateTime.toISOString()} ~ ${endDateTime.toISOString()}`)
    console.log('조회 시간:', `${diffHours.toFixed(2)}시간 (${diffDays.toFixed(2)}일)`)

    // API 호출하여 알림 이력 조회
    try {
      const response = alarmType === 'process'
        ? await historyAPI.getAlarmProcess(apiParams)
        : await historyAPI.getAlarmPrediction(apiParams)

      console.log('✅ 알림 이력 조회 성공:', response)

      if (response && response.data) {
        // 한글 공종명을 영문으로 변환
        const processTypeMap = {
          '혐기조': 'anaerobic',
          '무산소조': 'anoxic',
          '호기조': 'aerobic'
        }

        // 카멜케이스 변환 함수
        const toCamelCase = (processType, sensor) => {
          // 한글 → 영문 변환
          const processEn = processTypeMap[processType] || processType
          const sensorLower = sensor.toLowerCase()

          // 카멜케이스 생성: anaerobic + Orp = anaerobicOrp
          const sensorCap = sensorLower.charAt(0).toUpperCase() + sensorLower.slice(1)
          return processEn + sensorCap
        }

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedData = alarmType === 'process'
          ? response.data.map((item, index) => ({
              no: index + 1,
              type: '공종',
              zone: item.zone,
              alarmDate: new Date(item.timestamp).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\. /g, '-').replace('.', ''),
              alarmResult: item.result,
              processType: item.processType,
              sensor: item.sensor,
              abnormalSensor: toCamelCase(item.processType, item.sensor),
              anaerobicOrp: item.sensorData?.anaerobicOrp?.toFixed(1) || '-',
              anaerobicPh: item.sensorData?.anaerobicPh?.toFixed(2) || '-',
              anoxicOrp: item.sensorData?.anoxicOrp?.toFixed(1) || '-',
              anoxicPh: item.sensorData?.anoxicPh?.toFixed(2) || '-',
              aerobicDo: item.sensorData?.aerobicDo?.toFixed(2) || '-',
              aerobicPh: item.sensorData?.aerobicPh?.toFixed(2) || '-',
              aerobicMlss: item.sensorData?.aerobicMlss?.toFixed(1) || '-',
              message: item.message
            }))
          : response.data.map((item, index) => ({
              no: index + 1,
              type: '예측',
              alarmDate: new Date(item.timestamp).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\. /g, '-').replace('.', ''),
              alarmResult: item.result,
              item: item.item,
              toc: item.predictions?.TOC?.toFixed(1) || '-',
              ss: item.predictions?.SS?.toFixed(1) || '-',
              tn: item.predictions?.['T-N']?.toFixed(1) || '-',
              tp: item.predictions?.['T-P']?.toFixed(1) || '-',
              message: item.message
            }))
        setTableData(transformedData)
        alert(`${transformedData.length}건의 데이터를 조회했습니다.`)
      } else {
        setTableData([])
        alert('조회된 데이터가 없습니다.')
      }
    } catch (error) {
      console.error('❌ 알림 이력 조회 실패:', error)
      alert('데이터 조회에 실패했습니다. 다시 시도해주세요.')
      setTableData([])
    }
  }

  const handleExport = async () => {
    if (!searchParams) {
      alert('먼저 조회 버튼을 눌러 데이터를 조회한 후 다운로드해주세요.')
      return
    }

    try {
      console.log('Excel 다운로드 시작:', searchParams)
      await exportAPI.exportAlarms(searchParams)
      console.log('Excel 다운로드 완료')
    } catch (error) {
      console.error('Excel 다운로드 실패:', error)
      alert('Excel 다운로드에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // 현재 구분에 따른 필터, 컬럼 결정
  const currentFilters = alarmType === 'process' ? processFilters : predictionFilters
  const currentColumns = alarmType === 'process' ? processColumns : predictionColumns

  return (
    <div className="history-page">
      <SearchFilter
        filters={currentFilters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />

      <div className="table-actions">
        <button className="btn btn-success" onClick={handleExport}>
          📊 Excel 다운로드
        </button>
      </div>

      <DataTable
        columns={currentColumns}
        data={tableData}
        pagination={true}
        currentPage={currentPage}
        totalPages={Math.ceil(tableData.length / 15)}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default AlarmHistory
