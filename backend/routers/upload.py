"""文件上传路由。"""

import os
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from config import settings
from schemas.auth import TokenPayload
from services.auth_service import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    user: TokenPayload = Depends(get_current_user),  # 需登录
):
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large",
        )

    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{uuid.uuid4()}{ext}"
    dest = settings.uploads_dir / filename
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(content)

    return {"filename": filename, "url": f"/uploads/{filename}"}
