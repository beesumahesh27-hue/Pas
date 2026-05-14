from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from models import Region
from database import get_db

router = APIRouter(prefix="/api/regions", tags=["regions"])


@router.get("/", response_model=List[schemas.RegionResponse])
def list_regions(db: Session = Depends(get_db)):
    return db.query(Region).order_by(Region.name).all()
