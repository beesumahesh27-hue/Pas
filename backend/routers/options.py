from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import schemas
from models import PlatformType, PlatformStatus, DiskClass, DiskEncryption
from database import get_db

router = APIRouter(prefix="/api/options", tags=["options"])


@router.get("/types", response_model=List[schemas.PlatformTypeResponse])
def list_types(db: Session = Depends(get_db)):
    return db.query(PlatformType).order_by(PlatformType.name).all()


@router.get("/statuses", response_model=List[schemas.PlatformStatusResponse])
def list_statuses(db: Session = Depends(get_db)):
    return db.query(PlatformStatus).order_by(PlatformStatus.id).all()


@router.get("/disk-classes")
def list_disk_classes(db: Session = Depends(get_db)):
    return [{"id": r.id, "name": r.name} for r in db.query(DiskClass).order_by(DiskClass.id).all()]


@router.get("/disk-encryptions")
def list_disk_encryptions(db: Session = Depends(get_db)):
    return [{"id": r.id, "name": r.name} for r in db.query(DiskEncryption).order_by(DiskEncryption.id).all()]
