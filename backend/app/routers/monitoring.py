"""
실시간 모니터링 API 엔드포인트
"""
from fastapi import APIRouter, Query
from app.services.data_generator import data_generator

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


@router.get("/process-status", summary="처리장 공종 현황 조회")
async def get_process_status():
    """
    처리장 공종 현황 조회
    - 유입량, 생물반응조 유입량, 방류량
    """
    return data_generator.generate_process_status()


@router.get("/zone-data", summary="5개 지별 생물반응조 실시간 데이터")
async def get_zone_data():
    """
    5개 지별 생물반응조 실시간 데이터 조회
    - 혐기조: ORP, pH
    - 무산소조: ORP, pH
    - 호기조: DO, pH, MLSS
    """
    return data_generator.generate_zone_data()


@router.get("/tms", summary="방류 TMS 실시간 측정값")
async def get_tms_data():
    """
    방류 TMS 실시간 측정값 조회
    - TOC, SS, T-N, T-P
    """
    return data_generator.generate_tms_data()


@router.get("/alerts", summary="실시간 알림 목록")
async def get_alerts(
    limit: int = Query(10, ge=1, le=50, description="조회할 알림 개수")
):
    """
    실시간 알림 목록 조회
    - 공종 센서 알림
    - 예측 알림
    - TMS 알림
    """
    return data_generator.generate_alerts(limit=limit)
