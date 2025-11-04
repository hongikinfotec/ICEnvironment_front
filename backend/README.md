# 하수처리장 방류수질 예측 모니터링 시스템 - Backend API

AI 기반 하수처리장 방류수질 예측 모니터링 시스템의 백엔드 API 서버입니다.

## 🛠️ 기술 스택

- **FastAPI**: 고성능 Python 웹 프레임워크
- **Python 3.8+**: 프로그래밍 언어
- **Uvicorn**: ASGI 서버
- **WebSocket**: 실시간 데이터 스트리밍
- **Pandas**: 데이터 처리 및 Excel 생성
- **Pydantic**: 데이터 검증

## 📁 프로젝트 구조

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI 메인 애플리케이션
│   ├── config.py                # 설정 파일
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py           # Pydantic 데이터 모델
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── monitoring.py        # 실시간 모니터링 API
│   │   ├── prediction.py        # AI 예측 API
│   │   ├── history.py           # 이력 조회 API
│   │   ├── export.py            # Excel 다운로드 API
│   │   └── settings.py          # 환경설정 API
│   ├── services/
│   │   ├── __init__.py
│   │   └── data_generator.py   # Mock 데이터 생성기
│   └── websocket/
│       ├── __init__.py
│       └── connection.py        # WebSocket 연결 관리
├── requirements.txt             # Python 패키지 목록
└── README.md                    # 이 파일
```

## 🚀 설치 및 실행

### 1. Python 가상환경 생성 (권장)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. 패키지 설치

```bash
cd backend
pip install -r requirements.txt
```

### 3. 서버 실행

```bash
# 개발 모드 (자동 리로드)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 또는
python app/main.py
```

서버가 실행되면:
- **API 서버**: http://localhost:8000
- **API 문서**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **WebSocket**: ws://localhost:8000/ws/monitoring

## 📊 API 엔드포인트

### 1. 실시간 모니터링 API

#### 처리장 공종 현황
```http
GET /api/monitoring/process-status
```

#### 5개 지별 센서 데이터
```http
GET /api/monitoring/zone-data
```

#### 방류 TMS
```http
GET /api/monitoring/tms
```

#### 실시간 알림
```http
GET /api/monitoring/alerts?limit=10
```

### 2. AI 예측 API

#### 3시간 후 예측값
```http
GET /api/prediction/forecast
```

### 3. 이력 조회 API

#### 센서 데이터 이력
```http
POST /api/history/sensor-data
Content-Type: application/json

{
  "zone": "1",
  "startDateTime": "2025-10-01T00:00:00Z",
  "endDateTime": "2025-10-01T23:59:59Z",
  "interval": "hour",
  "page": 1,
  "pageSize": 15
}
```

#### 예측 이력
```http
POST /api/history/predictions
```

#### 알림 이력 (공종)
```http
POST /api/history/alarms/process
```

#### 알림 이력 (예측)
```http
POST /api/history/alarms/prediction
```

### 4. Excel 다운로드 API

#### 센서 데이터 다운로드
```http
POST /api/export/sensor-data
```

#### 예측 이력 다운로드
```http
POST /api/export/predictions
```

#### 알림 이력 다운로드
```http
POST /api/export/alarms
```

### 5. 환경설정 API

#### 임계값 조회
```http
GET /api/settings/thresholds
```

#### 임계값 저장
```http
PUT /api/settings/thresholds
Content-Type: application/json

{
  "category": "process",
  "thresholds": {
    "anaerobic": {
      "orp": {"upper": -200, "lower": -400},
      "ph": {"upper": 7.5, "lower": 6.5}
    }
  }
}
```

## 🔌 WebSocket 사용법

### JavaScript/React 예제

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/monitoring')

ws.onopen = () => {
  console.log('✅ WebSocket 연결 성공')
}

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('수신:', data.type, data)

  switch (data.type) {
    case 'zone_data_update':
      // 지별 센서 데이터 업데이트
      break
    case 'tms_update':
      // TMS 데이터 업데이트
      break
    case 'prediction_update':
      // 예측 데이터 업데이트
      break
    case 'alert':
      // 알림 수신
      break
  }
}

ws.onerror = (error) => {
  console.error('❌ WebSocket 오류:', error)
}

ws.onclose = () => {
  console.log('👋 WebSocket 연결 종료')
}
```

## 📝 개발 노트

### Mock 데이터

현재 API는 **실제 센서 연동 없이 Mock 데이터를 생성**합니다.
- `app/services/data_generator.py`: 시뮬레이션 데이터 생성기
- 실제 센서 연동 시 이 부분을 데이터베이스 조회로 대체

### 데이터베이스 연동 (향후)

```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost/wastewater_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 환경 변수 설정

`.env` 파일 생성:
```env
API_TITLE="하수처리장 방류수질 예측 모니터링 시스템 API"
API_VERSION="1.0.0"
HOST="0.0.0.0"
PORT=8000
SECRET_KEY="your-secret-key-here"
DATABASE_URL="postgresql://user:password@localhost/wastewater_db"
```

## 🧪 테스트

```bash
# 전체 테스트 실행
pytest

# 특정 파일 테스트
pytest tests/test_monitoring.py

# 커버리지 확인
pytest --cov=app tests/
```

## 🐛 문제 해결

### CORS 오류
프론트엔드 URL이 `config.py`의 `CORS_ORIGINS`에 포함되어 있는지 확인

### WebSocket 연결 실패
방화벽에서 포트 8000이 열려있는지 확인

### 패키지 설치 오류
Python 버전 확인 (3.8 이상 필요)
```bash
python --version
```

## 📞 문의

**프로젝트**: AI 기반 하수처리장 방류수질 예측 시스템
**수행기관**: 홍익정보기술(주)
**협력기관**: 인천환경공단 남항사업소
**기술문의**: bestcho93@nate.com

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
