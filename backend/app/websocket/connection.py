"""
WebSocket 실시간 통신
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import asyncio
import json
from app.services.data_generator import data_generator


class ConnectionManager:
    """WebSocket 연결 관리자"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """클라이언트 연결"""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """클라이언트 연결 해제"""
        self.active_connections.remove(websocket)
        print(f"❌ Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """모든 연결된 클라이언트에게 메시지 브로드캐스트"""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message, ensure_ascii=False))
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                print(f"Error sending message: {e}")
                disconnected.append(connection)

        # 연결이 끊긴 클라이언트 제거
        for conn in disconnected:
            if conn in self.active_connections:
                self.active_connections.remove(conn)


# 전역 ConnectionManager 인스턴스
manager = ConnectionManager()


async def start_data_streaming():
    """실시간 데이터 스트리밍 시작"""
    while True:
        # 5초마다 데이터 전송
        await asyncio.sleep(5)

        # 지별 센서 데이터 업데이트
        zone_data = data_generator.generate_zone_data()
        await manager.broadcast({
            "type": "zone_data_update",
            "timestamp": zone_data["timestamp"],
            "data": zone_data
        })

        # TMS 데이터 업데이트 (10초마다)
        if asyncio.get_event_loop().time() % 10 < 5:
            tms_data = data_generator.generate_tms_data()
            await manager.broadcast({
                "type": "tms_update",
                "timestamp": tms_data["timestamp"],
                "data": tms_data
            })

        # 처리장 공종 현황 업데이트 (15초마다)
        if asyncio.get_event_loop().time() % 15 < 5:
            process_status = data_generator.generate_process_status()
            await manager.broadcast({
                "type": "process_status_update",
                "timestamp": process_status["timestamp"],
                "data": process_status
            })

        # 예측 데이터 업데이트 (30초마다)
        if asyncio.get_event_loop().time() % 30 < 5:
            prediction_data = data_generator.generate_prediction_data()
            await manager.broadcast({
                "type": "prediction_update",
                "timestamp": prediction_data["timestamp"],
                "data": prediction_data
            })

        # 알림 업데이트 (7초마다)
        if asyncio.get_event_loop().time() % 7 < 5:
            alerts = data_generator.generate_alerts(limit=10)
            if alerts["alerts"]:
                # 알림이 있을 때만 전송
                await manager.broadcast({
                    "type": "alert",
                    "timestamp": alerts["alerts"][0]["timestamp"] if alerts["alerts"] else None,
                    "data": alerts
                })
