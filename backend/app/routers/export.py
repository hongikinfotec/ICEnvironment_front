"""
Excel 다운로드 API 엔드포인트
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ExportRequest
from app.services.data_generator import data_generator
import pandas as pd
import io
from datetime import datetime

router = APIRouter(prefix="/api/export", tags=["Export"])


@router.post("/sensor-data", summary="센서 데이터 Excel 다운로드")
async def export_sensor_data(request: ExportRequest):
    """
    센서 데이터 Excel 다운로드
    """
    # Mock 데이터 생성
    data = data_generator.generate_historical_sensor_data(
        zone=request.zone,
        start_time=request.startDateTime,
        end_time=request.endDateTime,
        interval=request.interval
    )

    # DataFrame 생성
    records = []
    for idx, item in enumerate(data, start=1):
        records.append({
            "No.": idx,
            "지": item["zone"],
            "날짜": item["timestamp"],
            "혐기조 ORP": item["anaerobic"]["orp"],
            "혐기조 pH": item["anaerobic"]["ph"],
            "무산소조 ORP": item["anoxic"]["orp"],
            "무산소조 pH": item["anoxic"]["ph"],
            "호기조 DO": item["aerobic"]["do"],
            "호기조 pH": item["aerobic"]["ph"],
            "호기조 MLSS": item["aerobic"]["mlss"]
        })

    df = pd.DataFrame(records)

    # Excel 파일 생성
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='센서 데이터')
    output.seek(0)

    # 파일명 생성
    filename = f"sensor_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/predictions", summary="예측 이력 Excel 다운로드")
async def export_predictions(request: ExportRequest):
    """
    예측 이력 Excel 다운로드
    """
    # Mock 데이터 생성
    data = data_generator.generate_historical_predictions(
        zone=request.zone if request.zone else "all",
        result="all",
        start_time=request.startDateTime,
        end_time=request.endDateTime,
        interval=request.interval
    )

    # DataFrame 생성
    records = []
    for idx, item in enumerate(data, start=1):
        records.append({
            "No.": idx,
            # "지": item["zone"], 수질예측 페이지 내 검색조건 지 항목 삭제
            "예측일시": item["timestamp"],
            "예측결과": "정상" if item["result"] == "normal" else "비정상",
            "TOC": item["predictions"]["TOC"],
            "SS": item["predictions"]["SS"],
            "T-N": item["predictions"]["TN"],
            "T-P": item["predictions"]["TP"]
        })

    df = pd.DataFrame(records)

    # Excel 파일 생성
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='예측 이력')
    output.seek(0)

    # 파일명 생성
    filename = f"predictions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/alarms", summary="알림 이력 Excel 다운로드")
async def export_alarms(request: ExportRequest):
    """
    알림 이력 Excel 다운로드
    """
    if request.type == "process":
        # 공종 알림
        data = data_generator.generate_historical_alarms_process(
            zone=request.zone if request.zone else "all",
            process_type=request.processType if request.processType else "all",
            sensor=request.sensor if request.sensor else "all",
            start_time=request.startDateTime,
            end_time=request.endDateTime,
            interval=request.interval
        )

        # DataFrame 생성
        records = []
        for idx, item in enumerate(data, start=1):
            records.append({
                "No.": idx,
                "구분": "공종",
                "지": item["zone"],
                "알림일시": item["timestamp"],
                "알림결과": "정상" if item["result"] == "normal" else "비정상",
                "공종": item["processType"],
                "센서": item["sensor"],
                "혐기조 ORP": item["sensorData"]["anaerobicOrp"],
                "혐기조 pH": item["sensorData"]["anaerobicPh"],
                "무산소조 ORP": item["sensorData"]["anoxicOrp"],
                "무산소조 pH": item["sensorData"]["anoxicPh"],
                "호기조 DO": item["sensorData"]["aerobicDo"],
                "호기조 pH": item["sensorData"]["aerobicPh"],
                "호기조 MLSS": item["sensorData"]["aerobicMlss"],
                "알림내용": item["message"]
            })

        sheet_name = "공종 알림"
    else:
        # 예측 알림
        data = data_generator.generate_historical_alarms_prediction(
            item=request.item if request.item else "all",
            start_time=request.startDateTime,
            end_time=request.endDateTime,
            interval=request.interval
        )

        # DataFrame 생성
        records = []
        for idx, item in enumerate(data, start=1):
            records.append({
                "No.": idx,
                "구분": "예측",
                "알림일시": item["timestamp"],
                "알림결과": "정상" if item["result"] == "normal" else "비정상",
                "항목": item["item"],
                "TOC": item["predictions"]["TOC"],
                "SS": item["predictions"]["SS"],
                "T-N": item["predictions"]["T-N"],
                "T-P": item["predictions"]["T-P"],
                "알림내용": item["message"]
            })

        sheet_name = "예측 알림"

    df = pd.DataFrame(records)

    # Excel 파일 생성
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=sheet_name)
    output.seek(0)

    # 파일명 생성
    filename = f"alarms_{request.type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
