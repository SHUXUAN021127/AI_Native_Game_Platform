import os
import uuid

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "..",
    "storage",
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


@router.post("/")
async def upload_file(
    file: UploadFile = File(...)
):

    extension = os.path.splitext(
        file.filename
    )[1]

    filename = (
        f"{uuid.uuid4()}"
        f"{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    content = await file.read()

    with open(
        file_path,
        "wb"
    ) as f:

        f.write(content)

    return {
        "filename": filename,
        "url":
        f"/uploads/{filename}"
    }