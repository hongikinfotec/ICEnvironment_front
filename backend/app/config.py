"""
Configuration settings for the Wastewater Monitoring System API
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    API_TITLE: str = "하수처리장 방류수질 예측 모니터링 시스템 API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "AI 기반 하수처리장 방류수질 예측 모니터링 시스템 - 인천환경공단 남항사업소"

    # Server Settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    # CORS Settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175"
    ]

    # Database Settings (Optional - for future use)
    DATABASE_URL: Optional[str] = None

    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Data Generation Settings
    ZONE_COUNT: int = 5  # 5개 지(池)

    # Default Thresholds
    DEFAULT_PROCESS_THRESHOLDS: dict = {
        "anaerobic": {
            "orp": {"upper": -200, "lower": -400},
            "ph": {"upper": 7.5, "lower": 6.5}
        },
        "anoxic": {
            "orp": {"upper": -200, "lower": -400},
            "ph": {"upper": 7.5, "lower": 6.5}
        },
        "aerobic": {
            "do": {"upper": 6.0, "lower": 2.0},
            "ph": {"upper": 7.5, "lower": 6.0},
            "mlss": {"upper": 7000, "lower": 3000}
        }
    }

    DEFAULT_EFFLUENT_THRESHOLDS: dict = {
        "toc": {"upper": 25, "lower": 0},
        "ss": {"upper": 10, "lower": 0},
        "tn": {"upper": 20, "lower": 0},
        "tp": {"upper": 2, "lower": 0}
    }

    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
