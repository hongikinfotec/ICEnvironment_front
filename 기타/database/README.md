# 🗄️ 데이터베이스 스키마 폴더

이 폴더에는 데이터베이스 테이블 생성 SQL 파일들이 있습니다.

## 📄 파일 목록

| 파일명 | 데이터베이스 | 용도 |
|--------|-------------|------|
| `create_tables.sql` | **PostgreSQL** | 테이블 생성 (권장) |
| `create_tables_mysql.sql` | MySQL | 테이블 생성 (대체) |

## 🎯 데이터베이스 테이블 (6개)

### 1. sensor_data - 센서 측정 데이터
- 혐기조/무산소조/호기조 센서 값
- ORP, pH, 온도, DO 등

### 2. process_status - 처리장 공종 현황
- 유입 하수량
- 생물반응조 유입량
- 방류 유량

### 3. tms_data - 방류 TMS 데이터
- TOC (총 유기탄소)
- SS (부유물질)
- T-N (총 질소)
- T-P (총 인)

### 4. predictions - AI 예측 데이터
- 3시간 후 수질 예측값
- 예측 시간, 실제 시간
- 모델 버전

### 5. alarms - 알림 이력
- 공종 알림 (센서 임계값 위반)
- 예측 알림 (수질 예측 이상)
- 알림 확인 여부

### 6. threshold_settings - 임계값 설정
- 공종별 임계값 (상한/하한)
- 방류 임계값
- 업데이트 이력

## 🚀 사용 방법

### PostgreSQL 사용 시 (권장)

1. **PostgreSQL 설치 및 데이터베이스 생성**
```sql
CREATE DATABASE wastewater_db;
```

2. **테이블 생성**
```bash
psql -U postgres -d wastewater_db -f create_tables.sql
```

또는 pgAdmin에서:
- 데이터베이스 선택
- Query Tool 열기
- `create_tables.sql` 파일 열기
- 실행 (F5)

### MySQL 사용 시

1. **MySQL 설치 및 데이터베이스 생성**
```sql
CREATE DATABASE wastewater_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **테이블 생성**
```bash
mysql -u root -p wastewater_db < create_tables_mysql.sql
```

또는 MySQL Workbench에서:
- 데이터베이스 선택
- SQL Editor 열기
- `create_tables_mysql.sql` 파일 열기
- 실행

## 🔧 백엔드 연동

테이블 생성 후 백엔드 설정:

1. **backend/.env 파일 생성**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=wastewater_db
```

2. **backend/app/config.py 확인**
- DATABASE_URL 설정 확인

3. **백엔드 재시작**

자세한 내용은 `docs/DB연동_작업_매뉴얼.md` 참고

## 📊 ERD (엔티티 관계도)

```
sensor_data ─────┐
                  │
process_status ──┼──→ (시간 기준 연관)
                  │
tms_data ────────┤
                  │
predictions ─────┘

alarms ───→ sensor_data, predictions 참조

threshold_settings ───→ 전역 설정
```

## ⚠️ 주의사항

- **SQL Server 사용 시**: 별도 스키마 파일 작성 필요
- **기존 테이블이 있으면**: `DROP TABLE IF EXISTS` 로 삭제 후 재생성
- **데이터 백업**: 중요한 데이터가 있으면 백업 후 작업
- **권한 설정**: 백엔드 사용자에게 적절한 권한 부여 필요

## 🔍 테이블 확인

### PostgreSQL
```sql
-- 테이블 목록 확인
\dt

-- 테이블 구조 확인
\d sensor_data
```

### MySQL
```sql
-- 테이블 목록 확인
SHOW TABLES;

-- 테이블 구조 확인
DESCRIBE sensor_data;
```

## 📝 샘플 데이터

현재는 백엔드의 `data_generator.py`가 Mock 데이터를 생성합니다.

실제 DB 연동 후:
- Mock 데이터 생성기 비활성화
- 실제 센서 데이터 수집 시작
- PLC/SCADA 연동
