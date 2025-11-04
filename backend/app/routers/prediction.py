"""
AI 예측 API 엔드포인트
"""
from fastapi import APIRouter
from app.services.data_generator import data_generator

router = APIRouter(prefix="/api/prediction", tags=["Prediction"])


@router.get("/forecast", summary="AI 방류수질 예측 (3시간 후)")
async def get_forecast():
    """
    AI 예측 방류수질 조회 (3시간 후)
    - TOC, SS, T-N, T-P 예측값
    - 예측 신뢰도
    - 임계값 기준 상태
    """
    return data_generator.generate_prediction_data(hours=3)


@router.get("/forecast/1hour", summary="AI 방류수질 예측 (1시간 후)")
async def get_forecast_1hour():
    """
    AI 예측 방류수질 조회 (1시간 후)
    - TOC, SS, T-N, T-P 예측값
    - 예측 신뢰도
    - 임계값 기준 상태
    """
    return data_generator.generate_prediction_data(hours=1)
