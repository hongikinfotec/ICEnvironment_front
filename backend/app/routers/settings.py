"""
환경설정 API 엔드포인트
"""
from fastapi import APIRouter
from app.models.schemas import (
    ThresholdsResponse,
    ThresholdsUpdateRequest,
    ThresholdsUpdateResponse
)
from app.config import settings
from datetime import datetime

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# 임계값 저장소 (실제로는 DB에 저장)
thresholds_storage = {
    "process": settings.DEFAULT_PROCESS_THRESHOLDS.copy(),
    "effluent": settings.DEFAULT_EFFLUENT_THRESHOLDS.copy(),
    "lastUpdated": datetime.now(),
    "updatedBy": "system"
}


@router.get("/thresholds", response_model=ThresholdsResponse, summary="임계값 조회")
async def get_thresholds():
    """
    임계값 조회
    - 공종별 임계값 (혐기조/무산소조/호기조)
    - 방류 임계값 (TOC/SS/T-N/T-P)
    """
    return {
        "process": thresholds_storage["process"],
        "effluent": thresholds_storage["effluent"],
        "lastUpdated": thresholds_storage["lastUpdated"],
        "updatedBy": thresholds_storage["updatedBy"]
    }


@router.put("/thresholds", response_model=ThresholdsUpdateResponse, summary="임계값 저장")
async def update_thresholds(request: ThresholdsUpdateRequest):
    """
    임계값 저장
    - 공종 설정 또는 방류 설정 업데이트
    """
    if request.category == "process":
        # 공종 임계값 업데이트
        thresholds_storage["process"].update(request.thresholds)
    elif request.category == "effluent":
        # 방류 임계값 업데이트
        thresholds_storage["effluent"].update(request.thresholds)
    else:
        return {
            "success": False,
            "message": "잘못된 카테고리입니다.",
            "timestamp": datetime.now()
        }

    # 업데이트 시간 기록
    thresholds_storage["lastUpdated"] = datetime.now()
    thresholds_storage["updatedBy"] = "admin"  # 실제로는 인증된 사용자 정보

    return {
        "success": True,
        "message": f"{request.category} 임계값이 성공적으로 저장되었습니다.",
        "timestamp": datetime.now()
    }
