from fastapi import APIRouter

router = APIRouter()

@router.post("/upload-policy")
async def upload_policy():
    return {"message": "Policy upload route placeholder"}

@router.post("/upload-document")
async def upload_document():
    return {"message": "Document upload route placeholder"}