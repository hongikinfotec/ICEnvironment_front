"""
Pydantic schemas for request/response models
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# ============================================================================
# Base Models
# ============================================================================

class ProcessData(BaseModel):
    """생물반응조 데이터"""
    orp: Optional[float] = Field(None, description="ORP (mV)")
    ph: Optional[float] = Field(None, description="pH")
    status: str = Field("normal", description="Status: normal / abnormal")


class AerobicData(ProcessData):
    """호기조 데이터 (DO, MLSS 추가)"""
    do: Optional[float] = Field(None, description="DO (ppm)")
    mlss: Optional[float] = Field(None, description="MLSS (mg/L)")


class ZoneData(BaseModel):
    """지별 센서 데이터"""
    zone: str = Field(..., description="지 번호 (예: 1지)")
    anaerobic: ProcessData = Field(..., description="혐기조 데이터")
    anoxic: ProcessData = Field(..., description="무산소조 데이터")
    aerobic: AerobicData = Field(..., description="호기조 데이터")


class Threshold(BaseModel):
    """임계값"""
    upper: float = Field(..., description="상한값")
    lower: float = Field(..., description="하한값")


class EffluentThreshold(BaseModel):
    """방류 임계값 (하한값 없음)"""
    upper: float = Field(..., description="상한값")
    lower: Optional[float] = Field(0, description="하한값")


# ============================================================================
# Monitoring API Models
# ============================================================================

class ProcessStatus(BaseModel):
    """처리장 공종 현황"""
    total: int = Field(..., description="㎥/일")
    accumulated: int = Field(..., description="금일적산 (㎥)")


class ProcessStatusResponse(BaseModel):
    """처리장 공종 현황 응답"""
    timestamp: datetime
    inflow: ProcessStatus
    biologicalInflow: ProcessStatus
    effluent: ProcessStatus


class ZoneDataResponse(BaseModel):
    """지별 데이터 응답"""
    timestamp: datetime
    zones: List[ZoneData]


class TMSParameter(BaseModel):
    """TMS 파라미터 데이터"""
    value: float
    unit: str = "mg/L"
    status: str = Field("normal", description="normal / abnormal")
    threshold: EffluentThreshold


class TMSResponse(BaseModel):
    """방류 TMS 응답"""
    timestamp: datetime
    parameters: dict[str, TMSParameter]


class AlertDetail(BaseModel):
    """알림 상세 정보"""
    processType: Optional[str] = None
    sensor: Optional[str] = None
    value: Optional[float] = None
    threshold: Optional[dict] = None
    parameter: Optional[str] = None
    predictedValue: Optional[float] = None
    forecastTime: Optional[datetime] = None


class Alert(BaseModel):
    """알림 데이터"""
    id: str
    timestamp: datetime
    level: Literal["normal", "abnormal"]
    category: Literal["process", "prediction", "tms"]
    zone: Optional[str] = None
    message: str
    details: AlertDetail


class AlertsResponse(BaseModel):
    """실시간 알림 응답"""
    alerts: List[Alert]


# ============================================================================
# Prediction API Models
# ============================================================================

class PredictionParameter(BaseModel):
    """예측 파라미터"""
    parameter: str
    current: float
    predicted: float
    unit: str = "mg/L"
    confidence: float = Field(..., ge=0, le=1, description="예측 신뢰도 (0~1)")
    status: str = Field("normal", description="normal / abnormal")
    threshold: EffluentThreshold


class PredictionResponse(BaseModel):
    """AI 예측 응답"""
    timestamp: datetime
    forecastTime: datetime = Field(..., description="예측 시간 (3시간 후)")
    predictions: List[PredictionParameter]


# ============================================================================
# History API Models
# ============================================================================

class SensorDataHistoryRequest(BaseModel):
    """센서 데이터 이력 조회 요청"""
    zone: str = Field("all", description="지 번호 또는 'all'")
    startDateTime: datetime
    endDateTime: datetime
    interval: Literal["hour", "minute"] = "hour"
    page: int = Field(1, ge=1)
    pageSize: int = Field(15, ge=1, le=10000)


class SensorDataRecord(BaseModel):
    """센서 데이터 레코드"""
    timestamp: datetime
    zone: str
    anaerobic: ProcessData
    anoxic: ProcessData
    aerobic: AerobicData


class SensorDataHistoryResponse(BaseModel):
    """센서 데이터 이력 응답"""
    total: int
    page: int
    pageSize: int
    totalPages: int
    data: List[SensorDataRecord]


class PredictionHistoryRequest(BaseModel):
    """예측 이력 조회 요청"""
    zone: str = Field("all", description="지 번호 또는 'all'")
    result: str = Field("all", description="all / normal / abnormal")
    startDateTime: datetime
    endDateTime: datetime
    interval: Literal["hour", "minute"] = "hour"
    page: int = Field(1, ge=1)
    pageSize: int = Field(15, ge=1, le=10000)


class PredictionRecord(BaseModel):
    """예측 레코드"""
    timestamp: datetime
    forecastTime: datetime
    zone: str
    result: str
    predictions: dict[str, float]
    thresholds: dict[str, dict]


class PredictionHistoryResponse(BaseModel):
    """예측 이력 응답"""
    total: int
    page: int
    pageSize: int
    totalPages: int
    data: List[PredictionRecord]


class AlarmProcessHistoryRequest(BaseModel):
    """공종 알림 이력 조회 요청"""
    zone: str = Field("all")
    processType: str = Field("all", description="anaerobic / anoxic / aerobic")
    sensor: str = Field("all", description="orp / ph / do / mlss")
    startDateTime: datetime
    endDateTime: datetime
    interval: Literal["hour", "minute"] = "hour"
    page: int = Field(1, ge=1)
    pageSize: int = Field(15, ge=1, le=10000)


class AlarmProcessRecord(BaseModel):
    """공종 알림 레코드"""
    id: str
    timestamp: datetime
    zone: str
    result: str
    processType: str
    sensor: str
    sensorData: dict
    threshold: Threshold
    message: str


class AlarmProcessHistoryResponse(BaseModel):
    """공종 알림 이력 응답"""
    total: int
    page: int
    pageSize: int
    totalPages: int
    data: List[AlarmProcessRecord]


class AlarmPredictionHistoryRequest(BaseModel):
    """예측 알림 이력 조회 요청"""
    item: str = Field("all", description="toc / ss / tn / tp")
    startDateTime: datetime
    endDateTime: datetime
    interval: Literal["hour", "minute"] = "hour"
    page: int = Field(1, ge=1)
    pageSize: int = Field(15, ge=1, le=10000)


class AlarmPredictionRecord(BaseModel):
    """예측 알림 레코드"""
    id: str
    timestamp: datetime
    result: str
    item: str
    predictions: dict[str, float]
    thresholds: dict
    message: str


class AlarmPredictionHistoryResponse(BaseModel):
    """예측 알림 이력 응답"""
    total: int
    page: int
    pageSize: int
    totalPages: int
    data: List[AlarmPredictionRecord]


# ============================================================================
# Settings API Models
# ============================================================================

class ProcessThresholds(BaseModel):
    """공종 임계값"""
    anaerobic: dict[str, Threshold]
    anoxic: dict[str, Threshold]
    aerobic: dict[str, Threshold]


class EffluentThresholds(BaseModel):
    """방류 임계값"""
    toc: EffluentThreshold
    ss: EffluentThreshold
    tn: EffluentThreshold
    tp: EffluentThreshold


class ThresholdsResponse(BaseModel):
    """임계값 조회 응답"""
    process: ProcessThresholds
    effluent: EffluentThresholds
    lastUpdated: datetime
    updatedBy: str = "system"


class ThresholdsUpdateRequest(BaseModel):
    """임계값 저장 요청"""
    category: Literal["process", "effluent"]
    thresholds: dict


class ThresholdsUpdateResponse(BaseModel):
    """임계값 저장 응답"""
    success: bool
    message: str
    timestamp: datetime


# ============================================================================
# Export API Models
# ============================================================================

class ExportRequest(BaseModel):
    """Excel 내보내기 요청"""
    zone: Optional[str] = "all"
    startDateTime: datetime
    endDateTime: datetime
    interval: Literal["hour", "minute"] = "hour"
    # 알림 이력용 추가 필드
    type: Optional[str] = None
    processType: Optional[str] = None
    sensor: Optional[str] = None
    item: Optional[str] = None


# ============================================================================
# Auth API Models
# ============================================================================

class LoginRequest(BaseModel):
    """로그인 요청"""
    username: str
    password: str


class UserInfo(BaseModel):
    """사용자 정보"""
    id: int
    username: str
    role: str
    name: str


class LoginResponse(BaseModel):
    """로그인 응답"""
    success: bool
    token: Optional[str] = None
    user: Optional[UserInfo] = None
    expiresIn: Optional[int] = None
    message: Optional[str] = None
