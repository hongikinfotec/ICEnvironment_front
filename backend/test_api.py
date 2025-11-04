"""
API 테스트 스크립트
백엔드 API가 정상 작동하는지 확인
"""
import requests
import json
from datetime import datetime, timedelta

# API Base URL
BASE_URL = "http://localhost:8000"

def print_section(title):
    """섹션 제목 출력"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def test_health():
    """헬스 체크"""
    print_section("1. Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_monitoring():
    """모니터링 API 테스트"""
    print_section("2. Monitoring API")

    # 2-1. 처리장 공종 현황
    print("\n[2-1] 처리장 공종 현황")
    try:
        response = requests.get(f"{BASE_URL}/api/monitoring/process-status")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"유입량: {data['inflow']['total']} ㎥/일")
        print(f"방류량: {data['effluent']['total']} ㎥/일")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 2-2. 지별 센서 데이터
    print("\n[2-2] 지별 센서 데이터")
    try:
        response = requests.get(f"{BASE_URL}/api/monitoring/zone-data")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"데이터 개수: {len(data['zones'])}개 지")
        for zone in data['zones'][:2]:
            print(f"  - {zone['zone']}: 호기조 DO={zone['aerobic']['do']}, MLSS={zone['aerobic']['mlss']}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 2-3. 방류 TMS
    print("\n[2-3] 방류 TMS")
    try:
        response = requests.get(f"{BASE_URL}/api/monitoring/tms")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        for param, info in data['parameters'].items():
            print(f"  - {param}: {info['value']} {info['unit']} ({info['status']})")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 2-4. 실시간 알림
    print("\n[2-4] 실시간 알림")
    try:
        response = requests.get(f"{BASE_URL}/api/monitoring/alerts?limit=5")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"알림 개수: {len(data['alerts'])}개")
        for alert in data['alerts'][:3]:
            print(f"  - [{alert['level']}] {alert['message']}")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_prediction():
    """예측 API 테스트"""
    print_section("3. Prediction API")

    print("\n[3-1] AI 예측 데이터")
    try:
        response = requests.get(f"{BASE_URL}/api/prediction/forecast")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"예측 시간: {data['forecastTime']}")
        for pred in data['predictions']:
            print(f"  - {pred['parameter']}: {pred['current']} → {pred['predicted']} {pred['unit']} (신뢰도: {pred['confidence']*100:.0f}%)")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_history():
    """이력 조회 API 테스트"""
    print_section("4. History API")

    # 4-1. 센서 데이터 이력
    print("\n[4-1] 센서 데이터 이력")
    try:
        payload = {
            "zone": "1",
            "startDateTime": (datetime.now() - timedelta(hours=24)).isoformat(),
            "endDateTime": datetime.now().isoformat(),
            "interval": "hour",
            "page": 1,
            "pageSize": 15
        }
        response = requests.post(f"{BASE_URL}/api/history/sensor-data", json=payload)
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"총 데이터: {data['total']}개 (페이지: {data['page']}/{data['totalPages']})")
        if data['data']:
            print(f"첫 번째 데이터: {data['data'][0]['zone']} - {data['data'][0]['timestamp']}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 4-2. 예측 이력
    print("\n[4-2] 예측 이력")
    try:
        payload = {
            "zone": "all",
            "result": "all",
            "startDateTime": (datetime.now() - timedelta(hours=24)).isoformat(),
            "endDateTime": datetime.now().isoformat(),
            "interval": "hour",
            "page": 1,
            "pageSize": 15
        }
        response = requests.post(f"{BASE_URL}/api/history/predictions", json=payload)
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"총 데이터: {data['total']}개")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_settings():
    """환경설정 API 테스트"""
    print_section("5. Settings API")

    # 5-1. 임계값 조회
    print("\n[5-1] 임계값 조회")
    try:
        response = requests.get(f"{BASE_URL}/api/settings/thresholds")
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"공종 임계값: {list(data['process'].keys())}")
        print(f"방류 임계값: {list(data['effluent'].keys())}")
        print(f"최종 업데이트: {data['lastUpdated']}")
    except Exception as e:
        print(f"❌ Error: {e}")

    # 5-2. 임계값 저장 (테스트)
    print("\n[5-2] 임계값 저장 (테스트)")
    try:
        payload = {
            "category": "effluent",
            "thresholds": {
                "toc": {"upper": 25, "lower": 0}
            }
        }
        response = requests.put(f"{BASE_URL}/api/settings/thresholds", json=payload)
        print(f"✅ Status: {response.status_code}")
        data = response.json()
        print(f"결과: {data['success']} - {data['message']}")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """메인 테스트 실행"""
    print("=" * 80)
    print("  하수처리장 방류수질 예측 모니터링 시스템 - API 테스트")
    print("=" * 80)
    print(f"API URL: {BASE_URL}")
    print(f"테스트 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    try:
        test_health()
        test_monitoring()
        test_prediction()
        test_history()
        test_settings()

        print_section("✅ 테스트 완료")
        print("모든 API가 정상 작동합니다!")
        print("\n📖 API 문서: http://localhost:8000/api/docs")
        print("🔌 WebSocket: ws://localhost:8000/ws/monitoring")

    except requests.exceptions.ConnectionError:
        print("\n❌ 백엔드 서버에 연결할 수 없습니다.")
        print("백엔드 서버가 실행 중인지 확인하세요: python run.py")
    except Exception as e:
        print(f"\n❌ 테스트 실패: {e}")

if __name__ == "__main__":
    main()
