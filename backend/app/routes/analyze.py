from typing import Any, Dict

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_service import extract_document_text
from app.orchestrator.compliance_pipeline import run_compliance_pipeline
from app.services.history_service import get_analysis, list_analyses, save_analysis, update_analysis_review

router = APIRouter()

@router.post("/analyze")
async def analyze_document(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if not file.filename:
            raise HTTPException(status_code=400, detail="Uploaded file has no filename.")

        document_text = extract_document_text(file.filename, file_bytes)

        if not document_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document.")

        result = run_compliance_pipeline(document_text, filename=file.filename)
        analysis_id = save_analysis(
            filename=file.filename,
            summary=result["summary"],
            compliance_score=result["compliance_score"],
            overall_risk=result["overall_risk"],
            raw_result_json=result,
        )

        return {
            "status": "success",
            "filename": file.filename,
            "analysis_id": analysis_id,
            "result": result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analyses")
def get_analyses():
    return {
        "status": "success",
        "items": list_analyses(),
    }


@router.get("/analyses/{analysis_id}")
def get_analysis_by_id(analysis_id: int):
    analysis = get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {
        "status": "success",
        "item": analysis,
    }


@router.patch("/analyses/{analysis_id}/review")
def patch_analysis_review(analysis_id: int, payload: Dict[str, Any]):
    review_status = (
        payload.get("review_status")
        or payload.get("reviewStatus")
        or payload.get("status")
    )
    review_note = payload.get("review_note")
    if review_note is None:
        review_note = payload.get("reviewNote")
    if review_note is None:
        review_note = payload.get("note")

    if not review_status:
        raise HTTPException(
            status_code=400,
            detail="Missing review status. Use review_status, reviewStatus, or status.",
        )

    try:
        analysis = update_analysis_review(
            analysis_id,
            str(review_status),
            str(review_note) if review_note is not None else None,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return {
        "status": "success",
        "item": analysis,
    }
