"""
Mock data generator for wastewater monitoring system
실제 센서가 없으므로 실시간 데이터를 시뮬레이션
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.config import settings


class DataGenerator:
    """Mock 데이터 생성기"""

    def __init__(self):
        self.zone_count = settings.ZONE_COUNT
        self.process_thresholds = settings.DEFAULT_PROCESS_THRESHOLDS
        self.effluent_thresholds = settings.DEFAULT_EFFLUENT_THRESHOLDS

    def generate_process_status(self) -> Dict:
        """처리장 공종 현황 생성"""
        return {
            "timestamp": datetime.now().isoformat(),
            "inflow": {
                "total": random.randint(12000, 15000),
                "accumulated": random.randint(8000000, 10000000)
            },
            "biologicalInflow": {
                "total": random.randint(9000, 11000),
                "accumulated": random.randint(15000000, 18000000)
            },
            "effluent": {
                "total": random.randint(12000, 15000),
                "accumulated": random.randint(6000000, 7000000)
            }
        }

    def generate_zone_data(self) -> Dict:
        """5개 지별 센서 데이터 생성"""
        zones = []
        for i in range(1, self.zone_count + 1):
            # 혐기조 ORP: 1지, 4지만 센서 있음
            has_anaerobic_orp = i in [1, 4]
            # 혐기조 pH: 4지만 센서 있음
            has_anaerobic_ph = i in [4]
            # MLSS 센서는 1지와 4지에만 설치됨
            has_mlss = i in [1, 4]

            zone_data = {
                "zone": f"{i}지",
                "anaerobic": {
                    "orp": round(random.uniform(-320, -290), 1) if has_anaerobic_orp else None,
                    "ph": round(random.uniform(6.8, 7.2), 2) if has_anaerobic_ph else None,
                    "status": self._get_status("anaerobic", "orp", random.uniform(-320, -290))
                },
                "anoxic": {
                    "orp": round(random.uniform(-330, -300), 1),
                    "ph": round(random.uniform(6.5, 7.0), 2),
                    "status": "normal"
                },
                "aerobic": {
                    "orp": None,
                    "ph": round(random.uniform(6.3, 6.8), 2),
                    "do": round(random.uniform(4.0, 6.0), 2),
                    "mlss": round(random.uniform(5500, 7500), 1) if has_mlss else None,
                    "status": "normal"
                }
            }
            zones.append(zone_data)

        return {
            "timestamp": datetime.now().isoformat(),
            "zones": zones
        }

    def generate_tms_data(self) -> Dict:
        """방류 TMS 데이터 생성"""
        parameters = {}
        for param, threshold in self.effluent_thresholds.items():
            if param == "toc":
                value = round(random.uniform(14, 18), 1)
            elif param == "ss":
                value = round(random.uniform(4, 7), 1)
            elif param == "tn":
                value = round(random.uniform(16, 19), 1)
            elif param == "tp":
                value = round(random.uniform(0.7, 1.2), 1)
            else:
                value = 0

            # 가끔 비정상 값 생성 (10% 확률)
            if random.random() < 0.1:
                value = threshold["upper"] + random.uniform(0.5, 2)

            status = "abnormal" if value > threshold["upper"] else "normal"

            parameters[param.upper()] = {
                "value": value,
                "unit": "mg/L",
                "status": status,
                "threshold": threshold
            }

        return {
            "timestamp": datetime.now().isoformat(),
            "parameters": parameters
        }

    def generate_prediction_data(self, hours: int = 3) -> Dict:
        """AI 예측 데이터 생성 (1시간 또는 3시간 후)"""
        current_time = datetime.now()
        forecast_time = current_time + timedelta(hours=hours)

        predictions = []
        for param, threshold in self.effluent_thresholds.items():
            if param == "toc":
                current_val = round(random.uniform(15, 17), 1)
                predicted_val = round(current_val + random.uniform(-1, 1.5), 1)
            elif param == "ss":
                current_val = round(random.uniform(4.5, 6), 1)
                predicted_val = round(current_val + random.uniform(-0.5, 1), 1)
            elif param == "tn":
                current_val = round(random.uniform(17, 19), 1)
                predicted_val = round(current_val + random.uniform(-0.5, 1.5), 1)
            elif param == "tp":
                current_val = round(random.uniform(0.8, 1.1), 1)
                predicted_val = round(current_val + random.uniform(-0.1, 0.3), 1)
            else:
                current_val = 0
                predicted_val = 0

            # 가끔 비정상 예측 (15% 확률)
            if random.random() < 0.15:
                predicted_val = threshold["upper"] + random.uniform(0.5, 2)

            status = "abnormal" if predicted_val > threshold["upper"] else "normal"

            predictions.append({
                "parameter": param.upper().replace("N", "-N").replace("P", "-P"),
                "current": current_val,
                "predicted": predicted_val,
                "unit": "mg/L",
                "confidence": round(random.uniform(0.85, 0.95), 2),
                "status": status,
                "threshold": threshold
            })

        return {
            "timestamp": current_time.isoformat(),
            "forecastTime": forecast_time.isoformat(),
            "predictions": predictions
        }

    def generate_alerts(self, limit: int = 10) -> Dict:
        """실시간 알림 생성"""
        alerts = []
        current_time = datetime.now()

        # 공종 알림
        if random.random() < 0.3:
            zone_num = random.randint(1, 5)
            zone = f"{zone_num}지"
            process_types = ["anaerobic", "anoxic", "aerobic"]
            process_type = random.choice(process_types)
            process_names = {"anaerobic": "혐기조", "anoxic": "무산소조", "aerobic": "호기조"}

            # 센서 설치 여부에 따라 사용 가능한 센서 결정
            available_sensors = []
            if process_type == "anaerobic":
                # 혐기조 ORP: 1지, 4지만 / 혐기조 pH: 4지만
                if zone_num in [1, 4]:
                    available_sensors.append("ORP")
                if zone_num in [4]:
                    available_sensors.append("pH")
            elif process_type == "anoxic":
                available_sensors = ["ORP", "pH"]
            elif process_type == "aerobic":
                available_sensors = ["DO", "pH"]
                # MLSS: 1지, 4지만
                if zone_num in [1, 4]:
                    available_sensors.append("MLSS")

            # 사용 가능한 센서가 없으면 알림 생성 안 함
            if not available_sensors:
                return self.generate_alerts(limit)

            sensor = random.choice(available_sensors)

            alert_time = current_time - timedelta(minutes=random.randint(1, 30))
            alerts.append({
                "id": f"alarm_{alert_time.strftime('%Y%m%d_%H%M%S')}_{len(alerts)+1}",
                "timestamp": alert_time.isoformat(),
                "level": "abnormal",
                "category": "process",
                "zone": zone,
                "message": f"[비정상] {zone} {process_names[process_type]} {sensor} 이상 감지",
                "details": {
                    "processType": process_type,
                    "sensor": sensor.lower(),
                    "value": random.uniform(-450, -180) if sensor == "ORP" else random.uniform(5.5, 8.0),
                    "threshold": self.process_thresholds[process_type].get(sensor.lower(), {})
                }
            })

        # 예측 알림
        if random.random() < 0.2:
            param = random.choice(["TOC", "SS", "T-N", "T-P"])
            alert_time = current_time - timedelta(minutes=random.randint(5, 60))
            predicted_val = round(random.uniform(22, 28), 1)

            alerts.append({
                "id": f"alarm_{alert_time.strftime('%Y%m%d_%H%M%S')}_{len(alerts)+1}",
                "timestamp": alert_time.isoformat(),
                "level": "abnormal",
                "category": "prediction",
                "zone": None,
                "message": f"[비정상] {param} 예측값 {predicted_val} mg/L (상한 초과 예상, 3시간 후)",
                "details": {
                    "parameter": param,
                    "predictedValue": predicted_val,
                    "threshold": {"upper": 25},
                    "forecastTime": (alert_time + timedelta(hours=3)).isoformat()
                }
            })

        # 정상 알림 (알림이 없으면)
        if len(alerts) == 0:
            alerts.append({
                "id": f"alarm_{current_time.strftime('%Y%m%d_%H%M%S')}_normal",
                "timestamp": current_time.isoformat(),
                "level": "normal",
                "category": "process",
                "zone": None,
                "message": "[정상] 모든 센서 정상 범위 유지 중",
                "details": {}
            })

        return {"alerts": alerts[:limit]}

    def _get_status(self, process_type: str, sensor: str, value: Optional[float]) -> str:
        """임계값 기준으로 상태 판단"""
        if value is None:
            return "normal"

        threshold = self.process_thresholds.get(process_type, {}).get(sensor, {})
        if not threshold:
            return "normal"

        upper = threshold.get("upper")
        lower = threshold.get("lower")

        if upper and lower:
            if value > upper or value < lower:
                return "abnormal"

        return "normal"

    def generate_historical_sensor_data(
        self,
        zone: str,
        start_time: datetime,
        end_time: datetime,
        interval: str = "hour"
    ) -> List[Dict]:
        """과거 센서 데이터 생성 (이력 조회용)"""
        data = []
        current = start_time

        # 시간 간격 설정
        delta = timedelta(hours=1) if interval == "hour" else timedelta(minutes=1)

        while current <= end_time:
            if zone == "all":
                # 전체 지 데이터 생성
                for i in range(1, self.zone_count + 1):
                    record = self._generate_single_sensor_record(f"{i}지", current)
                    data.append(record)
            else:
                # 특정 지 데이터만 생성
                record = self._generate_single_sensor_record(f"{zone}지", current)
                data.append(record)

            current += delta

        return data

    def _generate_single_sensor_record(self, zone: str, timestamp: datetime) -> Dict:
        """단일 센서 레코드 생성"""
        # 혐기조 ORP: 1지, 4지만 센서 있음
        has_anaerobic_orp = zone in ["1지", "4지"]
        # 혐기조 pH: 4지만 센서 있음
        has_anaerobic_ph = zone in ["4지"]
        # MLSS 센서는 1지와 4지에만 설치됨
        has_mlss = zone in ["1지", "4지"]

        return {
            "timestamp": timestamp.isoformat(),
            "zone": zone,
            "anaerobic": {
                "orp": round(random.uniform(-320, -290), 1) if has_anaerobic_orp else None,
                "ph": round(random.uniform(6.8, 7.2), 2) if has_anaerobic_ph else None,
                "status": "normal"
            },
            "anoxic": {
                "orp": round(random.uniform(-330, -300), 1),
                "ph": round(random.uniform(6.5, 7.0), 2),
                "status": "normal"
            },
            "aerobic": {
                "orp": None,
                "ph": round(random.uniform(6.3, 6.8), 2),
                "do": round(random.uniform(4.0, 6.0), 2),
                "mlss": round(random.uniform(5500, 7500), 1) if has_mlss else None,
                "status": "normal"
            }
        }

    def generate_historical_predictions(
        self,
        zone: str,
        result: str,
        start_time: datetime,
        end_time: datetime,
        interval: str = "hour"
    ) -> List[Dict]:
        """과거 예측 데이터 생성 (이력 조회용)"""
        data = []
        current = start_time

        # 시간 간격 설정
        delta = timedelta(hours=1) if interval == "hour" else timedelta(minutes=1)

        while current <= end_time:
            # 결과 필터 적용 (20% 확률로 비정상)
            is_abnormal = random.random() < 0.2
            record_result = "abnormal" if is_abnormal else "normal"

            # result 필터가 있으면 적용
            if result != "all" and record_result != result:
                current += delta
                continue

            zone_num = zone if zone != "all" else f"{random.randint(1, 5)}"
            forecast_time = current + timedelta(hours=3)

            predictions = {
                "TOC": round(random.uniform(15, 20), 1),
                "SS": round(random.uniform(5, 8), 1),
                "TN": round(random.uniform(17, 19), 1),
                "TP": round(random.uniform(0.8, 1.2), 1)
            }

            # 비정상일 경우 하나의 값을 임계값 초과시킴
            if is_abnormal:
                abnormal_param = random.choice(["TOC", "SS", "TN", "TP"])
                threshold = self.effluent_thresholds[abnormal_param.lower().replace("-", "")]
                predictions[abnormal_param] = round(threshold["upper"] + random.uniform(0.5, 3), 1)

            data.append({
                "timestamp": current.isoformat(),
                "forecastTime": forecast_time.isoformat(),
                "zone": f"{zone_num}지",
                "result": record_result,
                "predictions": predictions,
                "thresholds": {k.upper(): v for k, v in self.effluent_thresholds.items()}
            })

            current += delta

        return data

    def generate_historical_alarms_process(
        self,
        zone: str,
        process_type: str,
        sensor: str,
        start_time: datetime,
        end_time: datetime,
        interval: str = "hour"
    ) -> List[Dict]:
        """과거 공종 알림 데이터 생성"""
        data = []
        current = start_time

        # 시간 간격 설정
        delta = timedelta(hours=1) if interval == "hour" else timedelta(minutes=1)

        # 알림은 가끔 발생 (30% 확률)
        while current <= end_time:
            if random.random() > 0.3:
                current += delta
                continue

            process_names = {"anaerobic": "혐기조", "anoxic": "무산소조", "aerobic": "호기조"}
            sensors_map = {
                "anaerobic": ["orp", "ph"],
                "anoxic": ["orp", "ph"],
                "aerobic": ["do", "ph", "mlss"]
            }

            # 필터 적용
            selected_process = process_type if process_type != "all" else random.choice(list(process_names.keys()))
            available_sensors = sensors_map[selected_process]
            selected_sensor = sensor if sensor != "all" and sensor in available_sensors else random.choice(available_sensors)

            zone_num = zone if zone != "all" else f"{random.randint(1, 5)}"
            # 혐기조 ORP: 1지, 4지만 센서 있음
            has_anaerobic_orp = zone_num in ["1", "4"]
            # 혐기조 pH: 4지만 센서 있음
            has_anaerobic_ph = zone_num in ["4"]
            # MLSS 센서는 1지와 4지에만 설치됨
            has_mlss = zone_num in ["1", "4"]

            sensor_data = {
                "anaerobicOrp": round(random.uniform(-320, -290), 1) if has_anaerobic_orp else None,
                "anaerobicPh": round(random.uniform(6.8, 7.2), 2) if has_anaerobic_ph else None,
                "anoxicOrp": round(random.uniform(-330, -300), 1),
                "anoxicPh": round(random.uniform(6.5, 7.0), 2),
                "aerobicDo": round(random.uniform(4.0, 6.0), 2),
                "aerobicPh": round(random.uniform(6.3, 6.8), 2),
                "aerobicMlss": round(random.uniform(5500, 7500), 1) if has_mlss else None
            }

            threshold = self.process_thresholds.get(selected_process, {}).get(selected_sensor, {})

            data.append({
                "id": f"alarm_{current.strftime('%Y%m%d_%H%M%S')}_{len(data)+1}",
                "timestamp": current.isoformat(),
                "zone": f"{zone_num}지",
                "result": "abnormal",
                "processType": process_names[selected_process],
                "sensor": selected_sensor.upper(),
                "sensorData": sensor_data,
                "threshold": threshold,
                "message": f"{process_names[selected_process]} {selected_sensor.upper()} 센서 이상 감지"
            })

            current += delta

        return data

    def generate_historical_alarms_prediction(
        self,
        item: str,
        start_time: datetime,
        end_time: datetime,
        interval: str = "hour"
    ) -> List[Dict]:
        """과거 예측 알림 데이터 생성"""
        data = []
        current = start_time

        # 시간 간격 설정
        delta = timedelta(hours=1) if interval == "hour" else timedelta(minutes=1)

        # 알림은 가끔 발생 (20% 확률)
        while current <= end_time:
            if random.random() > 0.2:
                current += delta
                continue

            items = ["TOC", "SS", "T-N", "T-P"]
            selected_item = item.upper() if item != "all" else random.choice(items)

            predictions = {
                "TOC": round(random.uniform(15, 20), 1),
                "SS": round(random.uniform(5, 8), 1),
                "T-N": round(random.uniform(17, 19), 1),
                "T-P": round(random.uniform(0.8, 1.2), 1)
            }

            # 선택된 항목의 값을 임계값 초과시킴
            threshold_key = selected_item.lower().replace("-", "")
            threshold = self.effluent_thresholds[threshold_key]
            predictions[selected_item] = round(threshold["upper"] + random.uniform(0.5, 3), 1)

            data.append({
                "id": f"alarm_pred_{current.strftime('%Y%m%d_%H%M%S')}_{len(data)+1}",
                "timestamp": current.isoformat(),
                "result": "abnormal",
                "item": selected_item,
                "predictions": predictions,
                "thresholds": {k.upper(): v for k, v in self.effluent_thresholds.items()},
                "message": f"{selected_item} 수치 기준치 초과 예측"
            })

            current += delta

        return data


# 전역 인스턴스
data_generator = DataGenerator()
