from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def classification_root():
    return {"message": "Classification endpoints"}
