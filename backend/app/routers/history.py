"""
이력 관리 API 엔드포인트
"""
from fastapi import APIRouter
from app.models.schemas import (
    SensorDataHistoryRequest,
    SensorDataHistoryResponse,
    PredictionHistoryRequest,
    PredictionHistoryResponse,
    AlarmProcessHistoryRequest,
    AlarmProcessHistoryResponse,
    AlarmPredictionHistoryRequest,
    AlarmPredictionHistoryResponse
)
from app.services.data_generator import data_generator
import math

router = APIRouter(prefix="/api/history", tags=["History"])


@router.post("/sensor-data", response_model=SensorDataHistoryResponse, summary="센서 데이터 이력 조회")
async def get_sensor_data_history(request: SensorDataHistoryRequest):
    """
    센서 데이터 이력 조회
    - 지별 필터
    - 시간 범위 (시간 단위 / 1분 단위)
    - 페이지네이션
    """
    # Mock 데이터 생성
    all_data = data_generator.generate_historical_sensor_data(
        zone=request.zone,
        start_time=request.startDateTime,
        end_time=request.endDateTime,
        interval=request.interval
    )

    # 페이지네이션 적용
    total = len(all_data)
    total_pages = math.ceil(total / request.pageSize)
    start_idx = (request.page - 1) * request.pageSize
    end_idx = start_idx + request.pageSize
    paginated_data = all_data[start_idx:end_idx]

    return {
        "total": total,
        "page": request.page,
        "pageSize": request.pageSize,
        "totalPages": total_pages,
        "data": paginated_data
    }


@router.post("/predictions", response_model=PredictionHistoryResponse, summary="수질예측 이력 조회")
async def get_prediction_history(request: PredictionHistoryRequest):
    """
    수질예측 이력 조회
    - 지별 필터
    - 예측결과 필터 (정상/비정상)
    - 시간 범위
    - 페이지네이션
    """
    # Mock 데이터 생성
    all_data = data_generator.generate_historical_predictions(
        zone=request.zone,
        result=request.result,
        start_time=request.startDateTime,
        end_time=request.endDateTime,
        interval=request.interval
    )

    # 페이지네이션 적용
    total = len(all_data)
    total_pages = math.ceil(total / request.pageSize)
    start_idx = (request.page - 1) * request.pageSize
    end_idx = start_idx + request.pageSize
    paginated_data = all_data[start_idx:end_idx]

    return {
        "total": total,
        "page": request.page,
        "pageSize": request.pageSize,
        "totalPages": total_pages,
        "data": paginated_data
    }


@router.post("/alarms/process", response_model=AlarmProcessHistoryResponse, summary="알림 이력 조회 (공종)")
async def get_alarm_process_history(request: AlarmProcessHistoryRequest):
    """
    알림 이력 조회 (공종)
    - 지별 필터
    - 공종 필터 (혐기조/무산소조/호기조)
    - 센서 필터 (ORP/pH/DO/MLSS)
    - 시간 범위
    - 페이지네이션
    """
    # Mock 데이터 생성
    all_data = data_generator.generate_historical_alarms_process(
        zone=request.zone,
        process_type=request.processType,
        sensor=request.sensor,
        start_time=request.startDateTime,
        end_time=request.endDateTime,
        interval=request.interval
    )

    # 페이지네이션 적용
    total = len(all_data)
    total_pages = math.ceil(total / request.pageSize)
    start_idx = (request.page - 1) * request.pageSize
    end_idx = start_idx + request.pageSize
    paginated_data = all_data[start_idx:end_idx]

    return {
        "total": total,
        "page": request.page,
        "pageSize": request.pageSize,
        "totalPages": total_pages,
        "data": paginated_data
    }


@router.post("/alarms/prediction", response_model=AlarmPredictionHistoryResponse, summary="알림 이력 조회 (예측)")
async def get_alarm_prediction_history(request: AlarmPredictionHistoryRequest):
    """
    알림 이력 조회 (예측)
    - 항목 필터 (TOC/SS/T-N/T-P)
    - 시간 범위
    - 페이지네이션
    """
    # Mock 데이터 생성
    all_data = data_generator.generate_historical_alarms_prediction(
        item=request.item,
        start_time=request.startDateTime,
        end_time=request.endDateTime,
        interval=request.interval
    )

    # 페이지네이션 적용
    total = len(all_data)
    total_pages = math.ceil(total / request.pageSize)
    start_idx = (request.page - 1) * request.pageSize
    end_idx = start_idx + request.pageSize
    paginated_data = all_data[start_idx:end_idx]

    return {
        "total": total,
        "page": request.page,
        "pageSize": request.pageSize,
        "totalPages": total_pages,
        "data": paginated_data
    }
