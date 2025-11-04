import React, { useState, useEffect } from 'react'
import { useThreshold } from '../context/ThresholdContext'
import { settingsAPI } from '../utils/api'
import './Settings.css'

function Settings() {
  const { processThresholds, effluentThresholds, updateProcessThreshold, updateEffluentThreshold } = useThreshold()

  // 공종별 설정값 (Context에서 가져온 값으로 초기화)
  const [processSettings, setProcessSettings] = useState(processThresholds)

  // 방류수질 설정값 (Context에서 가져온 값으로 초기화)
  const [effluentSettings, setEffluentSettings] = useState(effluentThresholds)

  // 백엔드에서 설정 불러오기 (초기 마운트 시)
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.getThresholds()
        console.log('✅ 설정 불러오기 성공:', response)

        if (response) {
          // Context 업데이트
          if (response.process) {
            Object.keys(response.process).forEach(process => {
              Object.keys(response.process[process]).forEach(parameter => {
                Object.keys(response.process[process][parameter]).forEach(type => {
                  updateProcessThreshold(process, parameter, type, response.process[process][parameter][type])
                })
              })
            })
          }

          if (response.effluent) {
            Object.keys(response.effluent).forEach(parameter => {
              Object.keys(response.effluent[parameter]).forEach(type => {
                updateEffluentThreshold(parameter, type, response.effluent[parameter][type])
              })
            })
          }
        }
      } catch (error) {
        console.error('❌ 설정 불러오기 실패:', error)
      }
    }

    loadSettings()
  }, [])

  // Context의 임계값이 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setProcessSettings(processThresholds)
  }, [processThresholds])

  useEffect(() => {
    setEffluentSettings(effluentThresholds)
  }, [effluentThresholds])

  const handleProcessChange = (process, parameter, type, value) => {
    setProcessSettings({
      ...processSettings,
      [process]: {
        ...processSettings[process],
        [parameter]: {
          ...processSettings[process][parameter],
          [type]: value
        }
      }
    })
  }

  const handleEffluentChange = (parameter, type, value) => {
    setEffluentSettings({
      ...effluentSettings,
      [parameter]: {
        ...effluentSettings[parameter],
        [type]: value
      }
    })
  }

  const handleSave = async (section) => {
    try {
      if (section === 'process') {
        // 공종 설정 저장 - Context에 반영
        Object.keys(processSettings).forEach(process => {
          Object.keys(processSettings[process]).forEach(parameter => {
            Object.keys(processSettings[process][parameter]).forEach(type => {
              updateProcessThreshold(process, parameter, type, processSettings[process][parameter][type])
            })
          })
        })

        // 백엔드에 저장
        await settingsAPI.updateThresholds({
          category: 'process',
          thresholds: processSettings
        })

        alert('공종 설정이 저장되었습니다.\n모니터링 페이지에 실시간 반영됩니다.')
      } else {
        // 방류 설정 저장 - Context에 반영
        Object.keys(effluentSettings).forEach(parameter => {
          Object.keys(effluentSettings[parameter]).forEach(type => {
            updateEffluentThreshold(parameter, type, effluentSettings[parameter][type])
          })
        })

        // 백엔드에 저장
        await settingsAPI.updateThresholds({
          category: 'effluent',
          thresholds: effluentSettings
        })

        alert('방류 설정이 저장되었습니다.\n모니터링 페이지에 실시간 반영됩니다.')
      }
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error)
      alert('설정 저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="settings-page">
      {/* 공종 설정 */}
      <section className="settings-section">
        <h2 className="settings-title">공종</h2>

        <div className="settings-grid">
          {/* 혐기조 */}
          <div className="settings-card">
            <h3 className="card-title">혐기조</h3>
            <div className="settings-controls">
              <div className="control-row">
                <label className="control-label-inline">ORP</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    className="control-input"
                    value={processSettings.anaerobic.orp.upper}
                    onChange={(e) => handleProcessChange('anaerobic', 'orp', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    className="control-input"
                    value={processSettings.anaerobic.orp.lower}
                    onChange={(e) => handleProcessChange('anaerobic', 'orp', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>

              <div className="control-row">
                <label className="control-label-inline">pH</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.anaerobic.ph.upper}
                    onChange={(e) => handleProcessChange('anaerobic', 'ph', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.anaerobic.ph.lower}
                    onChange={(e) => handleProcessChange('anaerobic', 'ph', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('process')}>저장</button>
          </div>

          {/* 무산소조 */}
          <div className="settings-card">
            <h3 className="card-title">무산소조</h3>
            <div className="settings-controls">
              <div className="control-row">
                <label className="control-label-inline">ORP</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    className="control-input"
                    value={processSettings.anoxic.orp.upper}
                    onChange={(e) => handleProcessChange('anoxic', 'orp', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    className="control-input"
                    value={processSettings.anoxic.orp.lower}
                    onChange={(e) => handleProcessChange('anoxic', 'orp', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>

              <div className="control-row">
                <label className="control-label-inline">pH</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.anoxic.ph.upper}
                    onChange={(e) => handleProcessChange('anoxic', 'ph', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.anoxic.ph.lower}
                    onChange={(e) => handleProcessChange('anoxic', 'ph', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('process')}>저장</button>
          </div>

          {/* 호기조 */}
          <div className="settings-card">
            <h3 className="card-title">호기조</h3>
            <div className="settings-controls">
              <div className="control-row">
                <label className="control-label-inline">DO</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.aerobic.do.upper}
                    onChange={(e) => handleProcessChange('aerobic', 'do', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.aerobic.do.lower}
                    onChange={(e) => handleProcessChange('aerobic', 'do', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>

              <div className="control-row">
                <label className="control-label-inline">pH</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.aerobic.ph.upper}
                    onChange={(e) => handleProcessChange('aerobic', 'ph', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    step="0.1"
                    className="control-input"
                    value={processSettings.aerobic.ph.lower}
                    onChange={(e) => handleProcessChange('aerobic', 'ph', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>

              <div className="control-row">
                <label className="control-label-inline">MLSS</label>
                <div className="control-input-inline">
                  <label>상한</label>
                  <input
                    type="number"
                    className="control-input"
                    value={processSettings.aerobic.mlss.upper}
                    onChange={(e) => handleProcessChange('aerobic', 'mlss', 'upper', e.target.value)}
                    placeholder="상한값"
                  />
                </div>
                <div className="control-input-inline">
                  <label>하한</label>
                  <input
                    type="number"
                    className="control-input"
                    value={processSettings.aerobic.mlss.lower}
                    onChange={(e) => handleProcessChange('aerobic', 'mlss', 'lower', e.target.value)}
                    placeholder="하한값"
                  />
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('process')}>저장</button>
          </div>
        </div>
      </section>

      {/* 방류 설정 */}
      <section className="settings-section">
        <h2 className="settings-title">방류</h2>

        <div className="settings-grid effluent-grid">
          {/* TOC */}
          <div className="settings-card">
            <h3 className="card-title">TOC</h3>
            <div className="settings-controls">
              <div className="control-group">
                <div className="control-inputs">
                  <div className="input-group">
                    <label>상한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.toc.upper}
                      onChange={(e) => handleEffluentChange('toc', 'upper', e.target.value)}
                      placeholder="상한값"
                    />
                  </div>
                  <div className="input-group">
                    <label>하한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.toc.lower}
                      onChange={(e) => handleEffluentChange('toc', 'lower', e.target.value)}
                      placeholder="하한값"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('effluent')}>저장</button>
          </div>

          {/* SS */}
          <div className="settings-card">
            <h3 className="card-title">SS</h3>
            <div className="settings-controls">
              <div className="control-group">
                <div className="control-inputs">
                  <div className="input-group">
                    <label>상한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.ss.upper}
                      onChange={(e) => handleEffluentChange('ss', 'upper', e.target.value)}
                      placeholder="상한값"
                    />
                  </div>
                  <div className="input-group">
                    <label>하한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.ss.lower}
                      onChange={(e) => handleEffluentChange('ss', 'lower', e.target.value)}
                      placeholder="하한값"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('effluent')}>저장</button>
          </div>

          {/* T-N */}
          <div className="settings-card">
            <h3 className="card-title">T-N</h3>
            <div className="settings-controls">
              <div className="control-group">
                <div className="control-inputs">
                  <div className="input-group">
                    <label>상한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.tn.upper}
                      onChange={(e) => handleEffluentChange('tn', 'upper', e.target.value)}
                      placeholder="상한값"
                    />
                  </div>
                  <div className="input-group">
                    <label>하한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.tn.lower}
                      onChange={(e) => handleEffluentChange('tn', 'lower', e.target.value)}
                      placeholder="하한값"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('effluent')}>저장</button>
          </div>

          {/* T-P */}
          <div className="settings-card">
            <h3 className="card-title">T-P</h3>
            <div className="settings-controls">
              <div className="control-group">
                <div className="control-inputs">
                  <div className="input-group">
                    <label>상한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.tp.upper}
                      onChange={(e) => handleEffluentChange('tp', 'upper', e.target.value)}
                      placeholder="상한값"
                    />
                  </div>
                  <div className="input-group">
                    <label>하한</label>
                    <input
                      type="number"
                      step="0.1"
                      className="control-input"
                      value={effluentSettings.tp.lower}
                      onChange={(e) => handleEffluentChange('tp', 'lower', e.target.value)}
                      placeholder="하한값"
                    />
                  </div>
                </div>
              </div>
            </div>
            <button className="btn-save" onClick={() => handleSave('effluent')}>저장</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Settings
