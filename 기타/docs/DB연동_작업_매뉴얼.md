# 하수처리장 모니터링 시스템 DB 연동 작업 매뉴얼

**작성일**: 2025-10-29
**대상**: 비개발자도 따라할 수 있도록 작성
**소요시간**: 약 1~2시간

---

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [DB 테이블 생성 (SQL 실행)](#2-db-테이블-생성-sql-실행)
3. [백엔드 파일 작성 (7개 파일)](#3-백엔드-파일-작성-7개-파일)
4. [패키지 설치](#4-패키지-설치)
5. [DB 연결 테스트](#5-db-연결-테스트)
6. [서버 실행 및 확인](#6-서버-실행-및-확인)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 준비

### ✅ 확인사항

- [ ] DB가 이미 설치되어 있음 (PostgreSQL, MySQL 등)
- [ ] DB 접속 정보를 알고 있음
  - 호스트 (예: localhost, 192.168.1.100)
  - 포트 (예: 5432, 3306)
  - 사용자명 (예: postgres, root)
  - 비밀번호
  - 데이터베이스명 (예: wastewater_db)

### 📝 DB 접속 정보 메모

작업 전에 여기에 적어두세요:

```
DB 종류: ____________________ (PostgreSQL, MySQL 등)
호스트: ____________________ (localhost 또는 IP 주소)
포트: ______________________ (PostgreSQL: 5432, MySQL: 3306)
사용자명: __________________
비밀번호: __________________
DB명: ______________________
```

---

## 2. DB 테이블 생성 (SQL 실행)

### 📍 작업 위치
- **DB 관리 툴 사용** (PgAdmin, MySQL Workbench, DBeaver 등)
- 또는 **명령줄 도구** 사용

### 📝 작업 내용

#### 방법 1: DB 관리 툴 사용 (추천)

1. **PgAdmin** (PostgreSQL) 또는 **MySQL Workbench** (MySQL) 실행
2. DB에 접속
3. 쿼리 창 열기 (New Query 또는 SQL 편집기)
4. 아래 SQL 전체를 복사해서 붙여넣기
5. 실행 버튼 클릭

#### 방법 2: 명령줄 도구 사용

**PostgreSQL:**
```bash
psql -h localhost -U postgres -d wastewater_db -f create_tables.sql
```

**MySQL:**
```bash
mysql -h localhost -u root -p wastewater_db < create_tables.sql
```

---

### 📄 SQL 코드 (PostgreSQL용)

아래 코드를 `create_tables.sql` 파일로 저장하거나, DB 툴에서 직접 실행하세요.

```sql
-- ========================================
-- 하수처리장 모니터링 시스템 DB 스키마
-- ========================================

-- 1. 센서 데이터 테이블 (실시간 측정값 저장)
CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (조회 속도 향상)
CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_sensor_zone ON sensor_data(zone);


-- 2. 처리장 공종 현황 테이블
CREATE TABLE IF NOT EXISTS process_status (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,

    -- 유입량
    inflow_total DECIMAL(10,2),
    inflow_accumulated DECIMAL(15,2),

    -- 생물반응조 유입량
    bio_reactor_inflow DECIMAL(10,2),
    bio_reactor_accumulated DECIMAL(15,2),

    -- 방류량
    discharge_total DECIMAL(10,2),
    discharge_accumulated DECIMAL(15,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_process_timestamp ON process_status(timestamp);


-- 3. 방류 TMS 데이터 (방류수질 실측값)
CREATE TABLE IF NOT EXISTS tms_data (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,

    toc DECIMAL(10,2),  -- 총유기탄소
    ss DECIMAL(10,2),   -- 부유물질
    tn DECIMAL(10,2),   -- 총질소
    tp DECIMAL(10,2),   -- 총인

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tms_timestamp ON tms_data(timestamp);


-- 4. AI 예측 데이터 테이블
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    prediction_time TIMESTAMP NOT NULL,      -- 예측한 시각
    forecast_time TIMESTAMP NOT NULL,        -- 예측 대상 시각 (3시간 후)

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

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predictions_time ON predictions(prediction_time);


-- 5. 알림 이력 테이블
CREATE TABLE IF NOT EXISTS alarms (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,

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
    acknowledged_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alarms_timestamp ON alarms(timestamp);
CREATE INDEX IF NOT EXISTS idx_alarms_type ON alarms(alarm_type);


-- 6. 임계값 설정 테이블
CREATE TABLE IF NOT EXISTS threshold_settings (
    id SERIAL PRIMARY KEY,
    category VARCHAR(20) NOT NULL,  -- 'process' 또는 'discharge'
    parameter_name VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50),       -- 예: 'anaerobic', 'anoxic', 'aerobic'

    upper_limit DECIMAL(10,2),
    lower_limit DECIMAL(10,2),

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100)
);


-- 7. 기본 임계값 데이터 삽입
INSERT INTO threshold_settings (category, parameter_name, sub_category, upper_limit, lower_limit) VALUES
('process', 'orp', 'anaerobic', -200, -400),
('process', 'ph', 'anaerobic', 7.5, 6.5),
('process', 'orp', 'anoxic', -50, -150),
('process', 'ph', 'anoxic', 7.5, 6.5),
('process', 'orp', 'aerobic', 150, 50),
('process', 'ph', 'aerobic', 8.0, 7.0),
('discharge', 'toc', NULL, 10, NULL),
('discharge', 'ss', NULL, 10, NULL),
('discharge', 'tn', NULL, 20, NULL),
('discharge', 'tp', NULL, 2, NULL)
ON CONFLICT DO NOTHING;


-- 완료 메시지
SELECT '✅ 테이블 생성 완료! 총 6개 테이블이 생성되었습니다.' AS result;
```

### ✅ 확인하기

SQL 실행 후 테이블이 잘 만들어졌는지 확인:

```sql
-- 테이블 목록 조회 (PostgreSQL)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- MySQL
SHOW TABLES;
```

다음 테이블들이 보여야 합니다:
- sensor_data
- process_status
- tms_data
- predictions
- alarms
- threshold_settings

---

## 3. 백엔드 파일 작성 (7개 파일)

이제 Python 백엔드 코드를 작성합니다.

---

### 📁 파일 1: `backend/.env`

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\.env`

**작업**: 새 파일 만들기

**내용**:
```env
# 데이터베이스 설정
# ⚠️ 아래 값을 실제 DB 정보로 수정하세요!

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=여기에_실제_비밀번호_입력
DB_NAME=wastewater_db

# PostgreSQL 예시:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=mypassword123
# DB_NAME=wastewater_db

# MySQL 예시:
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=mypassword123
# DB_NAME=wastewater_db
```

**❗주의사항**:
- 이 파일은 보안상 Git에 올리지 마세요!
- 실제 비밀번호를 입력하세요!

---

### 📁 파일 2: `backend/app/database.py`

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\app\database.py`

**작업**: 새 파일 만들기

**내용**:
```python
"""
데이터베이스 연결 설정
SQLAlchemy를 사용한 DB 연결 관리
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# ========================================
# 데이터베이스 URL 구성
# ========================================
# PostgreSQL: postgresql://user:password@host:port/database
# MySQL: mysql+pymysql://user:password@host:port/database
# SQL Server: mssql+pyodbc://user:password@host:port/database

DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# MySQL 사용 시 (위 줄을 주석처리하고 아래 줄 사용)
# DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"


# ========================================
# SQLAlchemy 엔진 생성
# ========================================
engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # 커넥션 풀 크기 (동시 접속 수)
    max_overflow=20,        # 최대 추가 연결 수
    pool_pre_ping=True,     # 연결 전 체크 (끊김 방지)
    echo=False              # SQL 로그 출력 (개발 시 True로 변경)
)


# ========================================
# 세션 생성기
# ========================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ========================================
# Base 클래스 (모든 모델이 상속)
# ========================================
Base = declarative_base()


# ========================================
# 의존성 주입용 함수
# ========================================
def get_db():
    """
    데이터베이스 세션을 얻는 함수
    FastAPI의 Depends()에서 사용

    사용 예:
    @app.get("/data")
    def get_data(db: Session = Depends(get_db)):
        data = db.query(Model).all()
        return data
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

### 📁 파일 3: `backend/app/config.py` (수정)

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\app\config.py`

**작업**: 기존 파일 열어서 DB 설정 추가

**수정 방법**:
1. 파일을 엽니다
2. `Settings` 클래스 안에 DB 설정 추가

**추가할 내용** (클래스 안에 추가):
```python
"""
애플리케이션 설정
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # ========================================
    # 기존 설정 (그대로 유지)
    # ========================================
    API_TITLE: str = "하수처리장 방류수질 예측 모니터링 시스템 API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "인천환경공단 남항사업소 AI 기반 수질 예측 시스템"

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    # ========================================
    # 데이터베이스 설정 (새로 추가)
    # ========================================
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "wastewater_db"

    class Config:
        env_file = ".env"


settings = Settings()
```

---

### 📁 파일 4: `backend/app/models/database_models.py`

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\app\models\database_models.py`

**작업**: 새 파일 만들기

**내용**:
```python
"""
SQLAlchemy ORM 모델 정의
DB 테이블을 Python 클래스로 매핑
"""
from sqlalchemy import Column, Integer, String, DECIMAL, TIMESTAMP, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base


# ========================================
# 1. 센서 데이터 모델
# ========================================
class SensorData(Base):
    """센서 데이터 테이블 (sensor_data)"""
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, nullable=False, index=True)
    zone = Column(String(10), nullable=False, index=True)

    # 혐기조 (Anaerobic)
    anaerobic_orp = Column(DECIMAL(10, 2))
    anaerobic_ph = Column(DECIMAL(10, 2))
    anaerobic_temp = Column(DECIMAL(10, 2))
    anaerobic_do = Column(DECIMAL(10, 2))

    # 무산소조 (Anoxic)
    anoxic_orp = Column(DECIMAL(10, 2))
    anoxic_ph = Column(DECIMAL(10, 2))
    anoxic_temp = Column(DECIMAL(10, 2))
    anoxic_do = Column(DECIMAL(10, 2))

    # 호기조 (Aerobic)
    aerobic_orp = Column(DECIMAL(10, 2))
    aerobic_ph = Column(DECIMAL(10, 2))
    aerobic_temp = Column(DECIMAL(10, 2))
    aerobic_do = Column(DECIMAL(10, 2))

    created_at = Column(TIMESTAMP, server_default=func.now())


# ========================================
# 2. 처리장 공종 현황 모델
# ========================================
class ProcessStatus(Base):
    """처리장 공종 현황 테이블 (process_status)"""
    __tablename__ = "process_status"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, nullable=False, index=True)

    inflow_total = Column(DECIMAL(10, 2))
    inflow_accumulated = Column(DECIMAL(15, 2))

    bio_reactor_inflow = Column(DECIMAL(10, 2))
    bio_reactor_accumulated = Column(DECIMAL(15, 2))

    discharge_total = Column(DECIMAL(10, 2))
    discharge_accumulated = Column(DECIMAL(15, 2))

    created_at = Column(TIMESTAMP, server_default=func.now())


# ========================================
# 3. 방류 TMS 데이터 모델
# ========================================
class TMSData(Base):
    """방류 TMS 데이터 테이블 (tms_data)"""
    __tablename__ = "tms_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, nullable=False, index=True)

    toc = Column(DECIMAL(10, 2))
    ss = Column(DECIMAL(10, 2))
    tn = Column(DECIMAL(10, 2))
    tp = Column(DECIMAL(10, 2))

    created_at = Column(TIMESTAMP, server_default=func.now())


# ========================================
# 4. AI 예측 데이터 모델
# ========================================
class Prediction(Base):
    """AI 예측 데이터 테이블 (predictions)"""
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_time = Column(TIMESTAMP, nullable=False, index=True)
    forecast_time = Column(TIMESTAMP, nullable=False)

    predicted_toc = Column(DECIMAL(10, 2))
    predicted_ss = Column(DECIMAL(10, 2))
    predicted_tn = Column(DECIMAL(10, 2))
    predicted_tp = Column(DECIMAL(10, 2))

    actual_toc = Column(DECIMAL(10, 2))
    actual_ss = Column(DECIMAL(10, 2))
    actual_tn = Column(DECIMAL(10, 2))
    actual_tp = Column(DECIMAL(10, 2))

    model_version = Column(String(50))
    created_at = Column(TIMESTAMP, server_default=func.now())


# ========================================
# 5. 알림 이력 모델
# ========================================
class Alarm(Base):
    """알림 이력 테이블 (alarms)"""
    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, nullable=False, index=True)

    alarm_type = Column(String(20), nullable=False, index=True)
    category = Column(String(50))
    zone = Column(String(10))

    severity = Column(String(20))

    parameter_name = Column(String(50))
    current_value = Column(DECIMAL(10, 2))
    threshold_value = Column(DECIMAL(10, 2))

    message = Column(Text)

    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String(100))
    acknowledged_at = Column(TIMESTAMP)

    created_at = Column(TIMESTAMP, server_default=func.now())


# ========================================
# 6. 임계값 설정 모델
# ========================================
class ThresholdSetting(Base):
    """임계값 설정 테이블 (threshold_settings)"""
    __tablename__ = "threshold_settings"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(20), nullable=False)
    parameter_name = Column(String(50), nullable=False)
    sub_category = Column(String(50))

    upper_limit = Column(DECIMAL(10, 2))
    lower_limit = Column(DECIMAL(10, 2))

    updated_at = Column(TIMESTAMP, server_default=func.now())
    updated_by = Column(String(100))
```

---

### 📁 파일 5: `backend/app/init_db.py`

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\app\init_db.py`

**작업**: 새 파일 만들기

**내용**:
```python
"""
데이터베이스 초기화 스크립트
테이블 생성 확인용
"""
from app.database import engine, Base
from app.models import database_models


def init_db():
    """
    모든 테이블 생성
    (이미 SQL로 만들었다면 생략 가능)
    """
    print("=" * 60)
    print("데이터베이스 테이블 생성 중...")
    print("=" * 60)

    try:
        Base.metadata.create_all(bind=engine)
        print("✅ 데이터베이스 테이블이 성공적으로 생성되었습니다!")
        print("\n생성된 테이블:")
        print("  - sensor_data")
        print("  - process_status")
        print("  - tms_data")
        print("  - predictions")
        print("  - alarms")
        print("  - threshold_settings")
        print("=" * 60)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")


if __name__ == "__main__":
    init_db()
```

---

### 📁 파일 6: `backend/app/test_db_connection.py`

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\app\test_db_connection.py`

**작업**: 새 파일 만들기

**내용**:
```python
"""
DB 연결 테스트 스크립트
"""
from app.database import engine, SessionLocal
from app.models import database_models as db_models
from datetime import datetime


def test_connection():
    """DB 연결 테스트"""
    print("=" * 60)
    print("데이터베이스 연결 테스트 중...")
    print("=" * 60)

    try:
        # 1. 엔진 연결 테스트
        with engine.connect() as conn:
            print("✅ DB 엔진 연결 성공!")

        # 2. 세션 테스트
        db = SessionLocal()
        print("✅ DB 세션 생성 성공!")

        # 3. 테이블 조회 테스트
        count = db.query(db_models.SensorData).count()
        print(f"✅ sensor_data 테이블 조회 성공! (현재 데이터 수: {count}개)")

        db.close()
        print("=" * 60)
        print("🎉 모든 테스트 통과! DB 연동 완료!")
        print("=" * 60)

        return True

    except Exception as e:
        print("=" * 60)
        print(f"❌ DB 연결 실패!")
        print(f"오류 내용: {e}")
        print("\n확인사항:")
        print("  1. .env 파일에 DB 정보가 올바른가요?")
        print("  2. DB 서버가 실행 중인가요?")
        print("  3. 방화벽에서 포트가 열려있나요?")
        print("=" * 60)
        return False


if __name__ == "__main__":
    test_connection()
```

---

### 📁 파일 7: `backend/app/insert_test_data.py`

**위치**: `D:\이정은\인천환경공단\wastewater-monitoring-system\backend\app\insert_test_data.py`

**작업**: 새 파일 만들기

**내용**:
```python
"""
테스트 데이터 삽입 스크립트
DB 연동 확인용 더미 데이터
"""
from app.database import SessionLocal
from app.models import database_models as db_models
from datetime import datetime, timedelta
import random


def insert_test_data():
    """테스트 데이터 삽입"""
    print("=" * 60)
    print("테스트 데이터 삽입 중...")
    print("=" * 60)

    db = SessionLocal()

    try:
        # 1. 센서 데이터 삽입 (5개 지 × 10개)
        print("1. 센서 데이터 삽입 중...")
        for i in range(10):
            for zone in ['1', '2', '3', '4', '5']:
                sensor = db_models.SensorData(
                    timestamp=datetime.now() - timedelta(minutes=i*5),
                    zone=zone,
                    anaerobic_orp=random.uniform(-350, -250),
                    anaerobic_ph=random.uniform(6.8, 7.2),
                    anaerobic_temp=random.uniform(18, 22),
                    anaerobic_do=random.uniform(0.1, 0.5),
                    anoxic_orp=random.uniform(-120, -80),
                    anoxic_ph=random.uniform(7.0, 7.4),
                    anoxic_temp=random.uniform(19, 23),
                    anoxic_do=random.uniform(0.3, 0.7),
                    aerobic_orp=random.uniform(80, 120),
                    aerobic_ph=random.uniform(7.2, 7.8),
                    aerobic_temp=random.uniform(20, 24),
                    aerobic_do=random.uniform(2.0, 4.0)
                )
                db.add(sensor)
        db.commit()
        print("   ✅ 센서 데이터 50개 삽입 완료")

        # 2. 처리장 공종 현황 삽입 (10개)
        print("2. 처리장 공종 현황 삽입 중...")
        for i in range(10):
            process = db_models.ProcessStatus(
                timestamp=datetime.now() - timedelta(minutes=i*5),
                inflow_total=random.uniform(12000, 16000),
                inflow_accumulated=random.uniform(8000000, 10000000),
                bio_reactor_inflow=random.uniform(11000, 15000),
                bio_reactor_accumulated=random.uniform(7500000, 9500000),
                discharge_total=random.uniform(12000, 16000),
                discharge_accumulated=random.uniform(8000000, 10000000)
            )
            db.add(process)
        db.commit()
        print("   ✅ 처리장 공종 현황 10개 삽입 완료")

        # 3. 방류 TMS 데이터 삽입 (10개)
        print("3. 방류 TMS 데이터 삽입 중...")
        for i in range(10):
            tms = db_models.TMSData(
                timestamp=datetime.now() - timedelta(minutes=i*5),
                toc=random.uniform(5, 8),
                ss=random.uniform(3, 7),
                tn=random.uniform(10, 15),
                tp=random.uniform(0.5, 1.5)
            )
            db.add(tms)
        db.commit()
        print("   ✅ 방류 TMS 데이터 10개 삽입 완료")

        # 4. 예측 데이터 삽입 (5개)
        print("4. 예측 데이터 삽입 중...")
        for i in range(5):
            prediction = db_models.Prediction(
                prediction_time=datetime.now() - timedelta(hours=i*3),
                forecast_time=datetime.now() - timedelta(hours=i*3) + timedelta(hours=3),
                predicted_toc=random.uniform(6, 9),
                predicted_ss=random.uniform(4, 8),
                predicted_tn=random.uniform(11, 16),
                predicted_tp=random.uniform(0.6, 1.6),
                model_version="v1.0.0"
            )
            db.add(prediction)
        db.commit()
        print("   ✅ 예측 데이터 5개 삽입 완료")

        # 5. 알림 데이터 삽입 (10개)
        print("5. 알림 데이터 삽입 중...")
        severities = ['warning', 'alert', 'danger']
        for i in range(10):
            alarm = db_models.Alarm(
                timestamp=datetime.now() - timedelta(minutes=i*10),
                alarm_type='process' if i % 2 == 0 else 'prediction',
                category='anaerobic_orp',
                zone=str(random.randint(1, 5)),
                severity=random.choice(severities),
                parameter_name='ORP',
                current_value=-280,
                threshold_value=-250,
                message=f"테스트 알림 {i+1}: ORP 값이 임계값을 초과했습니다."
            )
            db.add(alarm)
        db.commit()
        print("   ✅ 알림 데이터 10개 삽입 완료")

        print("=" * 60)
        print("🎉 테스트 데이터 삽입 완료!")
        print("=" * 60)

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    insert_test_data()
```

---

## 4. 패키지 설치

### 📍 작업 위치
터미널 (명령 프롬프트 또는 PowerShell)

### 📝 실행 명령어

```bash
# 1. backend 폴더로 이동
cd D:\이정은\인천환경공단\wastewater-monitoring-system\backend

# 2. 기존 패키지 설치
pip install -r requirements.txt

# 3. DB 드라이버 설치

# PostgreSQL 사용 시:
pip install psycopg2-binary

# MySQL 사용 시:
pip install pymysql

# SQL Server 사용 시:
pip install pyodbc
```

### ✅ 설치 확인

```bash
pip list | findstr psycopg2
# 또는
pip list | findstr pymysql
```

---

## 5. DB 연결 테스트

이제 DB가 잘 연결되는지 테스트합니다.

### 📍 작업 위치
터미널 (backend 폴더)

### 📝 실행 명령어

```bash
# 1. DB 연결 테스트
python -m app.test_db_connection
```

### ✅ 성공 시 출력

```
============================================================
데이터베이스 연결 테스트 중...
============================================================
✅ DB 엔진 연결 성공!
✅ DB 세션 생성 성공!
✅ sensor_data 테이블 조회 성공! (현재 데이터 수: 0개)
============================================================
🎉 모든 테스트 통과! DB 연동 완료!
============================================================
```

### ❌ 실패 시 대처

실패 메시지를 보고 [7. 문제 해결](#7-문제-해결) 섹션 확인

---

### 📝 테스트 데이터 삽입 (선택사항)

DB 연결이 성공했으면, 테스트 데이터를 넣어봅니다:

```bash
python -m app.insert_test_data
```

### ✅ 성공 시 출력

```
============================================================
테스트 데이터 삽입 중...
============================================================
1. 센서 데이터 삽입 중...
   ✅ 센서 데이터 50개 삽입 완료
2. 처리장 공종 현황 삽입 중...
   ✅ 처리장 공종 현황 10개 삽입 완료
3. 방류 TMS 데이터 삽입 중...
   ✅ 방류 TMS 데이터 10개 삽입 완료
4. 예측 데이터 삽입 중...
   ✅ 예측 데이터 5개 삽입 완료
5. 알림 데이터 삽입 중...
   ✅ 알림 데이터 10개 삽입 완료
============================================================
🎉 테스트 데이터 삽입 완료!
============================================================
```

---

## 6. 서버 실행 및 확인

이제 서버를 실행해서 DB 연동이 잘 되는지 확인합니다.

### 📝 실행 명령어

```bash
# backend 폴더에서
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### ✅ 서버 시작 확인

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
================================================================================
[START] 하수처리장 방류수질 예측 모니터링 시스템 API
[VERSION] 1.0.0
[SERVER] http://0.0.0.0:8000
[API DOCS] http://0.0.0.0:8000/api/docs
[WEBSOCKET] ws://0.0.0.0:8000/ws/monitoring
================================================================================
```

---

### 📱 API 테스트

브라우저에서 다음 주소를 열어보세요:

1. **API 문서 확인**
   ```
   http://localhost:8000/api/docs
   ```

2. **센서 데이터 조회 테스트**
   - API 문서에서 `Monitoring` 섹션 펼치기
   - `GET /api/monitoring/zone-data` 클릭
   - "Try it out" 버튼 클릭
   - "Execute" 버튼 클릭
   - 응답에서 DB 데이터가 나오는지 확인

3. **처리장 공종 현황 조회 테스트**
   - `GET /api/monitoring/process-status` 실행
   - 응답 확인

---

## 7. 문제 해결

### ❌ 오류 1: "No module named 'psycopg2'"

**원인**: PostgreSQL 드라이버가 설치되지 않음

**해결**:
```bash
pip install psycopg2-binary
```

---

### ❌ 오류 2: "could not connect to server"

**원인**: DB 서버가 실행되지 않았거나, 연결 정보가 틀림

**해결**:
1. DB 서버가 실행 중인지 확인
   ```bash
   # PostgreSQL 서비스 확인 (Windows)
   sc query postgresql-x64-14

   # 또는 작업 관리자 > 서비스 탭에서 확인
   ```

2. `.env` 파일 내용 재확인
   - 호스트, 포트, 사용자명, 비밀번호, DB명이 정확한지

3. 방화벽 확인
   - 포트가 열려있는지 (PostgreSQL: 5432, MySQL: 3306)

---

### ❌ 오류 3: "relation 'sensor_data' does not exist"

**원인**: 테이블이 생성되지 않음

**해결**:
```bash
# 테이블 생성 실행
python -m app.init_db

# 또는 SQL 파일 다시 실행
```

---

### ❌ 오류 4: "Access denied for user"

**원인**: DB 사용자 비밀번호가 틀림

**해결**:
1. `.env` 파일에서 비밀번호 재확인
2. DB 관리 툴로 로그인 시도해서 비밀번호 확인

---

### ❌ 오류 5: "No such file or directory: '.env'"

**원인**: `.env` 파일이 없거나 위치가 틀림

**해결**:
1. `.env` 파일이 `backend` 폴더에 있는지 확인
2. 경로 확인:
   ```
   D:\이정은\인천환경공단\wastewater-monitoring-system\backend\.env
   ```

---

## 8. 최종 체크리스트

모든 작업이 완료되었는지 확인하세요:

- [ ] DB 테이블 생성 완료 (SQL 실행)
- [ ] `backend/.env` 파일 작성 및 DB 정보 입력
- [ ] `backend/app/database.py` 파일 생성
- [ ] `backend/app/config.py` 파일 수정 (DB 설정 추가)
- [ ] `backend/app/models/database_models.py` 파일 생성
- [ ] `backend/app/init_db.py` 파일 생성
- [ ] `backend/app/test_db_connection.py` 파일 생성
- [ ] `backend/app/insert_test_data.py` 파일 생성
- [ ] DB 드라이버 설치 (psycopg2-binary 등)
- [ ] DB 연결 테스트 성공
- [ ] 테스트 데이터 삽입 성공
- [ ] 서버 실행 성공
- [ ] API 문서에서 데이터 조회 성공

---

## 9. 다음 단계

DB 연동이 완료되었으면, 다음 작업을 진행할 수 있습니다:

1. **실제 센서 연동**: SCADA 시스템에서 데이터 수집
2. **API 수정**: Mock 데이터 대신 DB에서 조회하도록 수정
3. **WebSocket 수정**: DB 데이터를 실시간으로 전송
4. **AI 모델 연동**: 예측 결과를 DB에 저장

---

## 📞 문의

작업 중 문제가 발생하면:
- 오류 메시지 전체를 복사해서 문의
- 어떤 단계에서 막혔는지 알려주기
- `.env` 파일 내용 (비밀번호 제외) 공유

**기술 문의**: bestcho93@nate.com

---

**마지막 업데이트**: 2025-10-29
**버전**: 1.0.0
