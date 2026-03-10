from fileinput import filename

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.document_service import extract_document_text
from app.orchestrator.compliance_pipeline import run_compliance_pipeline

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

        result = run_compliance_pipeline(document_text)

        return {
            "status": "success",
            "filename": file.filename,
            "result": result
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")