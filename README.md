# 하수처리장 방류수질 예측 모니터링 시스템

AI 기반 하수처리장 방류수질 예측 모니터링 시스템 - 인천환경공단 남항사업소

## 📋 프로젝트 개요

**프로젝트명**: AI 기반 하수처리장 방류수질 예측 시스템
**사업**: 2025년 인천스타트업파크 'TRYOUT' 공공 실증 프로그램
**수행기관**: 홍익정보기술(주)
**협력기관**: 인천환경공단 남항사업소
**사업기간**: 2025.06.01 ~ 2025.10.31 (5개월)

### 핵심 기능
- 🔍 **실시간 모니터링**: 5개 지(池)별 생물반응조(혐기조/무산소조/호기조) 실시간 데이터 모니터링
- 🤖 **AI 예측**: 3시간 후 방류수질 예측 (TOC, SS, T-N, T-P)
- 📊 **이력 관리**: 데이터 이력, 수질예측 이력, 알림 이력 관리
- ⚙️ **임계값 설정**: 공종별/방류별 경보 임계값 설정
- 📈 **데이터 내보내기**: Excel 다운로드 기능

---

## 🛠️ 기술 스택

### Frontend
- **React 18.2.0**: 사용자 인터페이스 라이브러리
- **React Router DOM 6.20.0**: 페이지 라우팅
- **Recharts 2.10.0**: 데이터 시각화
- **Vite 5.0.0**: 빌드 도구

### 개발 환경
- **Node.js**: 18.x 이상 권장
- **npm** 또는 **yarn**: 패키지 관리자

---

## 📁 프로젝트 구조

\`\`\`
wastewater-monitoring-system/
├── public/                    # 정적 파일
├── src/
│   ├── components/            # 공통 컴포넌트
│   │   ├── Layout.jsx        # 메인 레이아웃
│   │   ├── Sidebar.jsx       # 사이드바 네비게이션
│   │   ├── Header.jsx        # 헤더 (시간, 로고)
│   │   ├── DataTable.jsx     # 데이터 테이블 컴포넌트
│   │   ├── SearchFilter.jsx  # 검색 필터 컴포넌트
│   │   └── *.css             # 컴포넌트별 스타일
│   │
│   ├── pages/                 # 페이지 컴포넌트
│   │   ├── Monitoring.jsx              # 모니터링 메인 화면
│   │   ├── DataHistory.jsx             # 데이터 이력관리
│   │   ├── PredictionHistory.jsx       # 수질예측 이력관리
│   │   ├── AlarmHistoryProcess.jsx     # 알림 이력(공종)
│   │   ├── AlarmHistoryPrediction.jsx  # 알림 이력(예측)
│   │   ├── Settings.jsx                # 환경설정
│   │   └── *.css                       # 페이지별 스타일
│   │
│   ├── styles/                # 글로벌 스타일
│   │   └── global.css        # 전역 CSS 변수 및 스타일
│   │
│   ├── App.jsx               # 메인 앱 컴포넌트
│   └── main.jsx              # 애플리케이션 진입점
│
├── index.html                # HTML 템플릿
├── package.json              # 의존성 관리
├── vite.config.js            # Vite 설정
└── README.md                 # 프로젝트 문서
\`\`\`

---

## 🚀 시작하기

### 1. 프로젝트 클론 또는 폴더 이동
\`\`\`bash
cd wastewater-monitoring-system
\`\`\`

### 2. 의존성 설치
\`\`\`bash
npm install
# 또는
yarn install
\`\`\`

### 3. 개발 서버 실행
\`\`\`bash
npm run dev
# 또는
yarn dev
\`\`\`

개발 서버가 실행되면 브라우저에서 http://localhost:3000 으로 접속하세요.

### 4. 프로덕션 빌드
\`\`\`bash
npm run build
# 또는
yarn build
\`\`\`

빌드된 파일은 \`dist/\` 폴더에 생성됩니다.

### 5. 프로덕션 미리보기
\`\`\`bash
npm run preview
# 또는
yarn preview
\`\`\`

---

## 📱 주요 화면

### 1. 모니터링 (메인 화면)
- **처리장 공종 현황**: 유입량, 생물반응조 유입량, 방류량 실시간 표시
- **5개 지별 데이터 테이블**: 혐기조/무산소조/호기조 측정값
- **AI 예측 방류수질**: TOC, SS, T-N, T-P 3시간 후 예측값
- **방류 TMS**: 실시간 방류수질 측정값
- **실시간 알림**: 경보 및 이벤트 로그

### 2. 이력관리
- **데이터 이력관리**: 공종별 센서 데이터 조회 및 엑셀 다운로드
- **수질예측 이력관리**: AI 예측 결과 이력 조회
- **알림 이력관리 (공종)**: 공종별 알림 이력
- **알림 이력관리 (예측)**: 예측 알림 이력

### 3. 환경설정
- **공종 설정**: 혐기조/무산소조/호기조 임계값 설정
- **방류 설정**: TOC, SS, T-N, T-P 임계값 설정

---

## 🎨 디자인 시스템

### 색상 체계
- **Primary Color**: #1e3a8a (인천환경공단 브랜드 컬러)
- **상태 색상**:
  - 정상(Normal): #10b981 (녹색)
  - 주의(Warning): #f59e0b (노란색)
  - 경고(Alert): #f97316 (주황색)
  - 위험(Danger): #ef4444 (빨간색)

### 반응형 디자인
- **Desktop**: 1440px 이상
- **Tablet**: 768px ~ 1439px
- **Mobile**: 768px 미만

---

## 🔧 향후 개발 계획

### 백엔드 연동
\`\`\`javascript
// src/utils/api.js
import axios from 'axios'

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 실시간 데이터 조회
export const getRealtimeData = () => api.get('/api/monitoring/realtime')

// 예측 데이터 조회
export const getPredictionData = () => api.get('/api/prediction/latest')

// 이력 데이터 조회
export const getHistoryData = (params) => api.get('/api/history/data', { params })
\`\`\`

### WebSocket 연동
\`\`\`javascript
// src/utils/websocket.js
const WS_URL = process.env.VITE_WS_URL || 'ws://localhost:8000/ws'

export class WebSocketClient {
  connect(onMessage) {
    this.ws = new WebSocket(WS_URL)

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
\`\`\`

---

## 📞 문의

**프로젝트**: AI 기반 하수처리장 방류수질 예측 시스템
**수행기관**: 홍익정보기술(주)
**협력기관**: 인천환경공단
**기술문의**: bestcho93@nate.com

---

## 📄 라이센스

이 프로젝트는 인천환경공단 및 홍익정보기술(주)의 소유입니다.
무단 복제 및 배포를 금지합니다.

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
# TempRepository
