# 📦 기타 (프로젝트 관련 자료)

이 폴더에는 프로젝트 개발과 직접적인 연관은 없지만, 프로젝트 실행, 문서화, 데이터베이스 설정 등에 필요한 보조 파일들을 모아두었습니다.

## 📁 폴더 구조

```
기타/
├─ docs/          📚 문서 폴더
├─ scripts/       🚀 실행 스크립트 폴더
└─ database/      🗄️ 데이터베이스 스키마 폴더
```

## 📚 docs/ - 문서 폴더

프로젝트 관련 문서들이 있습니다.

- **프로젝트_파일_구조_가이드.md** - 전체 프로젝트 구조 상세 가이드 (개발자용)
- **README_SIMPLE.txt** - 간단 사용 설명서 (일반 사용자용)
- **DB연동_작업_매뉴얼.md** - 데이터베이스 연동 상세 가이드 (1,119줄)
- **DB연동_빠른시작.txt** - DB 연동 빠른 시작 (개발자용)
- **API_쉬운_설명.txt** - API 테스트 방법 (238줄)

자세한 내용: `docs/README.md` 참고

## 🚀 scripts/ - 실행 스크립트 폴더

프로젝트 설치 및 실행을 위한 배치 파일들이 있습니다.

| 파일명 | 용도 |
|--------|------|
| `0_INSTALL.bat` | **전체 설치** (최초 1회) |
| `START_ALL.bat` | **개발 모드 실행** (매일 사용) |
| `BUILD_AND_RUN.bat` | 빌드 후 실행 (배포용) |
| `RUN_PRODUCTION.bat` | 프로덕션 실행 (빌드 완료 후) |

자세한 내용: `scripts/README.md` 참고

## 🗄️ database/ - 데이터베이스 스키마 폴더

데이터베이스 테이블 생성 SQL 파일들이 있습니다.

- **create_tables.sql** - PostgreSQL용 테이블 생성 (권장)
- **create_tables_mysql.sql** - MySQL용 테이블 생성

### 테이블 목록 (6개)
1. `sensor_data` - 센서 측정 데이터
2. `process_status` - 처리장 공종 현황
3. `tms_data` - 방류 TMS 데이터
4. `predictions` - AI 예측 데이터
5. `alarms` - 알림 이력
6. `threshold_settings` - 임계값 설정

자세한 내용: `database/README.md` 참고

## 🎯 빠른 시작

### 처음 사용하는 경우
1. `scripts/0_INSTALL.bat` 실행
2. `database/create_tables.sql` 실행 (DB 사용 시)
3. `scripts/START_ALL.bat` 실행

### 프로젝트 구조를 알고 싶은 경우
- `docs/프로젝트_파일_구조_가이드.md` 읽기

### 데이터베이스 연동하려는 경우
- `database/create_tables.sql` 실행
- `docs/DB연동_작업_매뉴얼.md` 참고

### API 테스트하려는 경우
- `docs/API_쉬운_설명.txt` 참고

---

**개발사**: 홍익정보기술(주)
**정리일**: 2025-01-03
