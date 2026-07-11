from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def clustering_root():
    return {"message": "Clustering endpoints"}
