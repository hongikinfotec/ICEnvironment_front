import React from 'react'
import './SearchFilter.css'

function SearchFilter({ filters, onFilterChange, onSearch }) {
  // 필터를 그룹별로 분리
  const radioFilters = filters.filter(f => !f.hidden && f.type === 'radio')

  // 기간 필드명 정의
  const dateTimeFields = ['startDate', 'startTime', 'endDate', 'endTime']

  // 기간 필터와 일반 필터 분리
  const dateTimeFilters = filters.filter(f => !f.hidden && f.type !== 'radio' && dateTimeFields.includes(f.name))
  const normalFilters = filters.filter(f => !f.hidden && f.type !== 'radio' && !dateTimeFields.includes(f.name))

  const renderFilterInput = (filter) => {
    if (filter.type === 'select') {
      return (
        <select
          className="filter-select"
          value={filter.value || ''}
          onChange={(e) => onFilterChange(filter.name, e.target.value)}
        >
          <option value="">{filter.placeholder || '선택'}</option>
          {filter.options.map((option, optIndex) => (
            <option key={optIndex} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    } else if (filter.type === 'date') {
      return (
        <input
          type="date"
          className="filter-input"
          value={filter.value || ''}
          onChange={(e) => onFilterChange(filter.name, e.target.value)}
        />
      )
    } else if (filter.type === 'time') {
      return (
        <input
          type="time"
          className="filter-input"
          value={filter.value || ''}
          onChange={(e) => onFilterChange(filter.name, e.target.value)}
        />
      )
    } else if (filter.type === 'hour') {
      return (
        <select
          className="filter-select"
          value={filter.value || ''}
          onChange={(e) => onFilterChange(filter.name, e.target.value)}
        >
          <option value="">선택</option>
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={String(i).padStart(2, '0')}>
              {String(i).padStart(2, '0')}시
            </option>
          ))}
        </select>
      )
    } else {
      return (
        <input
          type="text"
          className="filter-input"
          placeholder={filter.placeholder || '입력'}
          value={filter.value || ''}
          onChange={(e) => onFilterChange(filter.name, e.target.value)}
        />
      )
    }
  }

  return (
    <div className="search-filter">
      <div className="filter-section">
        <h3 className="filter-title">검색조건</h3>

        {/* 첫 번째 줄: 일반 필터 (지, 공종 등) + 조회 버튼 */}
        {normalFilters.length > 0 && (
          <div className="filter-row filter-row-with-button">
            <div className="filter-row-items">
              {normalFilters.map((filter, index) => (
                <div key={index} className="filter-item">
                  <label className="filter-label">{filter.label}</label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
            <div className="filter-actions-inline">
              <button className="btn btn-primary" onClick={onSearch}>
                🔍 조회
              </button>
            </div>
          </div>
        )}

        {/* 두 번째 줄: 조회단위 + 기간 필터 */}
        <div className="filter-row filter-row-main">
          {/* 조회단위 라디오 */}
          {radioFilters.map((filter, index) => {
            const selectedOption = filter.options.find(opt => opt.value === filter.value)
            return (
              <div key={index} className="filter-item filter-item-inline">
                <div className="filter-label-with-description">
                  <label className="filter-label">{filter.label}</label>
                  {selectedOption && selectedOption.description && (
                    <span className="filter-description">※ {selectedOption.description}</span>
                  )}
                </div>
                <div className="filter-radio-group-inline">
                  {filter.options.map((option, optIndex) => (
                    <label key={optIndex} className="filter-radio-label">
                      <input
                        type="radio"
                        name={filter.name}
                        value={option.value}
                        checked={filter.value === option.value}
                        onChange={(e) => onFilterChange(filter.name, e.target.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )
          })}

          {/* 기간 필터 (시작일, 시작 시간, 종료일, 종료 시간) */}
          {dateTimeFilters.map((filter, index) => (
            <div key={index} className="filter-item">
              <label className="filter-label">{filter.label}</label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SearchFilter
