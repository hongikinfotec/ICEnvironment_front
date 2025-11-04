"""
FastAPI Main Application
하수처리장 방류수질 예측 모니터링 시스템 API
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.routers import monitoring, prediction, history, export, settings as settings_router
from app.websocket.connection import manager, start_data_streaming
import asyncio
import os
from pathlib import Path


# FastAPI 앱 생성
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 라우터 등록
app.include_router(monitoring.router)
app.include_router(prediction.router)
app.include_router(history.router)
app.include_router(export.router)
app.include_router(settings_router.router)


# 정적 파일 서빙 (프로덕션 모드)
DIST_PATH = Path(__file__).parent.parent / "dist"
if DIST_PATH.exists():
    # 프로덕션 모드: 빌드된 프론트엔드 서빙
    app.mount("/assets", StaticFiles(directory=str(DIST_PATH / "assets")), name="assets")

    @app.get("/")
    async def serve_frontend():
        """프론트엔드 index.html 서빙"""
        return FileResponse(str(DIST_PATH / "index.html"))

    @app.get("/{full_path:path}")
    async def serve_frontend_routes(full_path: str):
        """프론트엔드 라우팅 처리"""
        # API 경로가 아니면 프론트엔드로 전달
        if not full_path.startswith("api/") and not full_path.startswith("ws/"):
            file_path = DIST_PATH / full_path
            if file_path.exists() and file_path.is_file():
                return FileResponse(str(file_path))
            return FileResponse(str(DIST_PATH / "index.html"))
else:
    # 개발 모드: API만 제공
    @app.get("/")
    async def root():
        """API 루트 엔드포인트"""
        return {
            "message": "하수처리장 방류수질 예측 모니터링 시스템 API",
            "version": settings.API_VERSION,
            "docs": "/api/docs",
            "websocket": "ws://localhost:8000/ws/monitoring",
            "mode": "development"
        }


# 헬스 체크
@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "wastewater-monitoring-api",
        "version": settings.API_VERSION
    }


# WebSocket 엔드포인트
@app.websocket("/ws/monitoring")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket 실시간 데이터 스트리밍
    - 5초마다 센서 데이터 전송
    - 10초마다 TMS 데이터 전송
    - 15초마다 처리장 공종 현황 전송
    - 30초마다 예측 데이터 전송
    - 7초마다 알림 데이터 전송
    """
    await manager.connect(websocket)
    try:
        # 클라이언트로부터 메시지 수신 대기
        while True:
            data = await websocket.receive_text()
            # 클라이언트 메시지 처리 (필요시)
            print(f"Received message from client: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected")


# 앱 시작 시 실행
@app.on_event("startup")
async def startup_event():
    """앱 시작 시 실행되는 이벤트"""
    print("=" * 80)
    print(f"[START] {settings.API_TITLE}")
    print(f"[VERSION] {settings.API_VERSION}")
    print(f"[SERVER] http://{settings.HOST}:{settings.PORT}")
    print(f"[API DOCS] http://{settings.HOST}:{settings.PORT}/api/docs")
    print(f"[WEBSOCKET] ws://{settings.HOST}:{settings.PORT}/ws/monitoring")
    print("=" * 80)

    # WebSocket 데이터 스트리밍 시작
    asyncio.create_task(start_data_streaming())


# 앱 종료 시 실행
@app.on_event("shutdown")
async def shutdown_event():
    """앱 종료 시 실행되는 이벤트"""
    print("\n[SHUTDOWN] Shutting down API server...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
