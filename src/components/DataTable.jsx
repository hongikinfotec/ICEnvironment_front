import React from 'react'
import './DataTable.css'

function DataTable({ columns, data, pagination = true, currentPage = 1, totalPages = 10, onPageChange, itemsPerPage = 15 }) {
  // 컬럼을 평탄화 (그룹 헤더의 children을 펼침)
  const flattenColumns = (cols) => {
    const result = []
    cols.forEach(col => {
      if (col.children && col.children.length > 0) {
        result.push(...col.children)
      } else {
        result.push(col)
      }
    })
    return result
  }

  // 그룹 헤더가 있는지 확인
  const hasGroupHeaders = columns.some(col => col.children && col.children.length > 0)

  // 평탄화된 컬럼 (데이터 렌더링용)
  const flatColumns = flattenColumns(columns)

  // 페이지네이션 적용: 현재 페이지에 해당하는 데이터만 추출
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = pagination ? data.slice(startIndex, endIndex) : data

  const handlePageClick = (page) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const renderPagination = () => {
    if (!pagination) return null

    const pages = []
    const maxVisiblePages = 10

    // 이전 버튼
    pages.push(
      <button
        key="prev-first"
        className="pagination-btn"
        onClick={() => handlePageClick(1)}
        disabled={currentPage === 1}
      >
        ‹‹
      </button>
    )

    pages.push(
      <button
        key="prev"
        className="pagination-btn"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹
      </button>
    )

    // 페이지 번호 범위 계산
    let startPage = Math.floor((currentPage - 1) / maxVisiblePages) * maxVisiblePages + 1
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages)

    // 페이지 번호 렌더링
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      )
    }

    // 다음 버튼
    pages.push(
      <button
        key="next"
        className="pagination-btn"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    )

    pages.push(
      <button
        key="next-last"
        className="pagination-btn"
        onClick={() => handlePageClick(totalPages)}
        disabled={currentPage === totalPages}
      >
        ››
      </button>
    )

    return <div className="pagination">{pages}</div>
  }

  // 그룹 헤더 렌더링
  const renderGroupHeaders = () => {
    if (!hasGroupHeaders) {
      // 그룹 헤더가 없으면 기존 방식
      return (
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              style={{ width: column.width, textAlign: column.align || 'left' }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      )
    }

    // 그룹 헤더가 있으면 2단계 헤더
    return (
      <>
        {/* 첫 번째 행: 그룹 헤더 */}
        <tr>
          {columns.map((column, index) => {
            if (column.children && column.children.length > 0) {
              // 그룹 헤더 (colSpan)
              return (
                <th
                  key={index}
                  colSpan={column.children.length}
                  style={{ textAlign: 'center' }}
                  className="group-header"
                >
                  {column.header}
                </th>
              )
            } else {
              // 일반 헤더 (rowSpan=2)
              return (
                <th
                  key={index}
                  rowSpan={2}
                  style={{ width: column.width, textAlign: column.align || 'left' }}
                >
                  {column.header}
                </th>
              )
            }
          })}
        </tr>

        {/* 두 번째 행: 하위 헤더 */}
        <tr>
          {columns.map((column, index) => {
            if (column.children && column.children.length > 0) {
              return column.children.map((child, childIndex) => (
                <th
                  key={`${index}-${childIndex}`}
                  style={{ width: child.width, textAlign: child.align || 'left' }}
                  className="sub-header"
                >
                  {child.header}
                </th>
              ))
            }
            return null
          })}
        </tr>
      </>
    )
  }

  return (
    <div className="data-table-container">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            {renderGroupHeaders()}
          </thead>
          <tbody>
            {paginatedData && paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => {
                // 실제 행 번호 계산 (페이지 고려)
                const actualRowNumber = startIndex + rowIndex + 1

                return (
                  <tr key={rowIndex}>
                    {flatColumns.map((column, colIndex) => {
                      // No. 컬럼인 경우 자동으로 계산
                      const cellValue = column.field === 'no' ? actualRowNumber : row[column.field]

                      return (
                        <td
                          key={colIndex}
                          style={{ textAlign: column.align || 'left' }}
                          className={column.className ? column.className(row[column.field], row) : ''}
                        >
                          {column.render ? column.render(cellValue, row) : cellValue || '-'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={flatColumns.length} className="no-data">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  )
}

export default DataTable
