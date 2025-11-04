import React, { useState } from 'react'
import SearchFilter from '../components/SearchFilter'
import DataTable from '../components/DataTable'
import { exportAPI, historyAPI } from '../utils/api'
import './History.css'

function AlarmHistoryPrediction() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterValues, setFilterValues] = useState({ queryUnit: 'hour' })
  const [searchParams, setSearchParams] = useState(null) // 검색 조건 저장
  const [tableData, setTableData] = useState([]) // 조회된 데이터

  // 조회 단위 (hour: 시간 단위, minute: 1분 단위)
  const queryUnit = filterValues.queryUnit || 'hour'

  // 검색 필터 설정 (조회 단위에 따라 동적으로 변경)
  const filters = [
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
      name: 'category',
      type: 'select',
      options: [
        { value: 'all', label: '전체' },
        { value: 'prediction', label: '예측' }
      ],
      value: filterValues.category || 'all'
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

  // 테이블 컬럼 정의
  const columns = [
    { header: 'No.', field: 'no', width: '60px', align: 'center' },
    { header: '구분', field: 'category', width: '80px', align: 'center' },
    { header: '지', field: 'zone', width: '80px', align: 'center' },
    { header: '알림 일시', field: 'alarmDate', width: '150px', align: 'center' },
    { header: '알림 결과', field: 'alarmResult', width: '100px', align: 'center',
      className: (value) => `cell-${value}`,
      render: (value) => {
        const texts = { normal: '정상', abnormal: '비정상' }
        return texts[value] || value
      }
    },
    { header: '항목', field: 'item', width: '100px', align: 'center' },
    { header: 'TOC', field: 'toc', width: '100px', align: 'center' },
    { header: 'SS', field: 'ss', width: '100px', align: 'center' },
    { header: 'T-N', field: 'tn', width: '100px', align: 'center',
      className: (value) => value && parseFloat(value) > 18 ? 'cell-abnormal' : ''
    },
    { header: 'T-P', field: 'tp', width: '100px', align: 'center' },
    { header: '알림 내용', field: 'message', width: '300px', align: 'left' }
  ]

  // 샘플 데이터
  const sampleData = [
    {
      no: 1,
      category: '예측',
      zone: '4지',
      alarmDate: '2025-10-23 10:48:00',
      alarmResult: 'abnormal',
      item: 'T-N',
      toc: '30',
      ss: '5.1',
      tn: '18.5',
      tp: '0.8',
      message: 'T-N 수치 상승 예측'
    }
  ]

  const handleFilterChange = (name, value) => {
    setFilterValues({ ...filterValues, [name]: value })
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
    const params = {
      item: filterValues.item || 'all',
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      interval: queryUnit === 'minute' ? 'minute' : 'hour',
      page: 1,
      pageSize: 10000  // 모든 데이터를 받기 위해 큰 값 설정
    }
    setSearchParams(params)
    setCurrentPage(1) // 페이지를 1페이지로 초기화

    console.log('검색 조건:', params)
    console.log('조회 기간:', `${startDateTime.toISOString()} ~ ${endDateTime.toISOString()}`)
    console.log('조회 시간:', `${diffHours.toFixed(2)}시간 (${diffDays.toFixed(2)}일)`)

    // API 호출하여 예측 알림 이력 조회
    try {
      const response = await historyAPI.getAlarmPrediction(params)
      console.log('✅ 예측 알림 이력 조회 성공:', response)

      if (response && response.data) {
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const transformedData = response.data.map((item, index) => ({
          no: index + 1,
          category: '예측',
          zone: item.zone || '4지',  // 백엔드에 zone이 없으면 기본값
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
      console.error('❌ 예측 알림 이력 조회 실패:', error)
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

  return (
    <div className="history-page">
      <SearchFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onExport={handleExport}
      />

      <DataTable
        columns={columns}
        data={tableData}
        pagination={true}
        currentPage={currentPage}
        totalPages={Math.ceil(tableData.length / 15)}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default AlarmHistoryPrediction
