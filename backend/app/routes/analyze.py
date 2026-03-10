from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import tempfile

from app.services.parser_service import extract_text_from_pdf
from app.orchestrator.compliance_pipeline import run_compliance_pipeline

router = APIRouter()

@router.post("/analyze")
async def analyze_document(document_file: UploadFile = File(...)):
    if not document_file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must have a filename."
        )

    suffix = os.path.splitext(document_file.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        content = await document_file.read()
        temp_file.write(content)
        temp_path = temp_file.name

    try:
        document_text = extract_text_from_pdf(temp_path)
        result = run_compliance_pipeline(document_text)
        return result
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)