-- ========================================
-- 하수처리장 모니터링 시스템 DB 스키마 (MySQL 버전)
-- ========================================
-- 작성일: 2025-10-29
-- DB: MySQL / MariaDB
-- ========================================

-- 1. 센서 데이터 테이블 (실시간 측정값 저장)
CREATE TABLE IF NOT EXISTS sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    zone VARCHAR(10) NOT NULL,  -- '1', '2', '3', '4', '5' (지 번호)

    -- 혐기조 (Anaerobic)
    anaerobic_orp DECIMAL(10,2),
    anaerobic_ph DECIMAL(10,2),
    anaerobic_temp DECIMAL(10,2),
    anaerobic_do DECIMAL(10,2),

    -- 무산소조 (Anoxic)
    anoxic_orp DECIMAL(10,2),
    anoxic_ph DECIMAL(10,2),
    anoxic_temp DECIMAL(10,2),
    anoxic_do DECIMAL(10,2),

    -- 호기조 (Aerobic)
    aerobic_orp DECIMAL(10,2),
    aerobic_ph DECIMAL(10,2),
    aerobic_temp DECIMAL(10,2),
    aerobic_do DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_sensor_timestamp (timestamp),
    INDEX idx_sensor_zone (zone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2. 처리장 공종 현황 테이블
CREATE TABLE IF NOT EXISTS process_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,

    -- 유입량
    inflow_total DECIMAL(10,2),
    inflow_accumulated DECIMAL(15,2),

    -- 생물반응조 유입량
    bio_reactor_inflow DECIMAL(10,2),
    bio_reactor_accumulated DECIMAL(15,2),

    -- 방류량
    discharge_total DECIMAL(10,2),
    discharge_accumulated DECIMAL(15,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_process_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 3. 방류 TMS 데이터 (방류수질 실측값)
CREATE TABLE IF NOT EXISTS tms_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,

    toc DECIMAL(10,2),  -- 총유기탄소
    ss DECIMAL(10,2),   -- 부유물질
    tn DECIMAL(10,2),   -- 총질소
    tp DECIMAL(10,2),   -- 총인

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_tms_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 4. AI 예측 데이터 테이블
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_time DATETIME NOT NULL,      -- 예측한 시각
    forecast_time DATETIME NOT NULL,        -- 예측 대상 시각 (3시간 후)

    predicted_toc DECIMAL(10,2),
    predicted_ss DECIMAL(10,2),
    predicted_tn DECIMAL(10,2),
    predicted_tp DECIMAL(10,2),

    -- 실제 값 (나중에 비교용)
    actual_toc DECIMAL(10,2),
    actual_ss DECIMAL(10,2),
    actual_tn DECIMAL(10,2),
    actual_tp DECIMAL(10,2),

    model_version VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_predictions_time (prediction_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 5. 알림 이력 테이블
CREATE TABLE IF NOT EXISTS alarms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,

    alarm_type VARCHAR(20) NOT NULL,  -- 'process' 또는 'prediction'
    category VARCHAR(50),              -- 예: 'anaerobic_orp', 'discharge_toc'
    zone VARCHAR(10),                  -- 지 번호 (해당 시)

    severity VARCHAR(20),              -- 'normal', 'warning', 'alert', 'danger'

    parameter_name VARCHAR(50),        -- 예: 'ORP', 'TOC'
    current_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),

    message TEXT,

    acknowledged BOOLEAN DEFAULT FALSE,  -- 확인 여부
    acknowledged_by VARCHAR(100),
    acknowledged_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_alarms_timestamp (timestamp),
    INDEX idx_alarms_type (alarm_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 6. 임계값 설정 테이블
CREATE TABLE IF NOT EXISTS threshold_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(20) NOT NULL,  -- 'process' 또는 'discharge'
    parameter_name VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),       -- 예: 'anaerobic', 'anoxic', 'aerobic'

    upper_limit DECIMAL(10,2),
    lower_limit DECIMAL(10,2),

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 7. 기본 임계값 데이터 삽입
INSERT IGNORE INTO threshold_settings (category, parameter_name, sub_category, upper_limit, lower_limit) VALUES
('process', 'orp', 'anaerobic', -200, -400),
('process', 'ph', 'anaerobic', 7.5, 6.5),
('process', 'orp', 'anoxic', -50, -150),
('process', 'ph', 'anoxic', 7.5, 6.5),
('process', 'orp', 'aerobic', 150, 50),
('process', 'ph', 'aerobic', 8.0, 7.0),
('discharge', 'toc', NULL, 10, NULL),
('discharge', 'ss', NULL, 10, NULL),
('discharge', 'tn', NULL, 20, NULL),
('discharge', 'tp', NULL, 2, NULL);


-- 완료 메시지
SELECT '✅ 테이블 생성 완료! 총 6개 테이블이 생성되었습니다.' AS result;


-- ========================================
-- 테이블 확인 쿼리
-- ========================================
-- SHOW TABLES;
