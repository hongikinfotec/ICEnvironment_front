"""
백엔드 서버 실행 스크립트
"""
import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("=" * 80)
    print(f"[START] {settings.API_TITLE}")
    print(f"[VERSION] {settings.API_VERSION}")
    print(f"[SERVER] http://{settings.HOST}:{settings.PORT}")
    print(f"[API DOCS] http://{settings.HOST}:{settings.PORT}/api/docs")
    print(f"[WEBSOCKET] ws://{settings.HOST}:{settings.PORT}/ws/monitoring")
    print("=" * 80)
    print("\nPress CTRL+C to stop the server\n")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD,
        log_level="info"
    )
