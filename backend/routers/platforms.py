from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

import crud
import schemas
from database import get_db

router = APIRouter(prefix="/api/platforms", tags=["platforms"])


@router.get("/", response_model=List[schemas.PlatformResponse])
def list_platforms(
    skip: int = 0,
    limit: int = 1000,
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_platforms(db, skip=skip, limit=limit, search=search, status=status)


@router.post("/", response_model=schemas.PlatformResponse, status_code=status.HTTP_201_CREATED)
def create_platform(platform: schemas.PlatformCreate, db: Session = Depends(get_db)):
    return crud.create_platform(db, platform)


@router.get("/{platform_id}", response_model=schemas.PlatformResponse)
def get_platform(platform_id: int, db: Session = Depends(get_db)):
    db_platform = crud.get_platform(db, platform_id)
    if not db_platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return db_platform


@router.put("/{platform_id}", response_model=schemas.PlatformResponse)
def update_platform(
    platform_id: int,
    platform: schemas.PlatformUpdate,
    db: Session = Depends(get_db),
):
    db_platform = crud.update_platform(db, platform_id, platform)
    if not db_platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return db_platform


@router.delete("/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_platform(platform_id: int, db: Session = Depends(get_db)):
    db_platform = crud.delete_platform(db, platform_id)
    if not db_platform:
        raise HTTPException(status_code=404, detail="Platform not found")


@router.get("/{platform_id}/instances/", response_model=List[schemas.InstanceResponse])
def get_platform_instances(platform_id: int, db: Session = Depends(get_db)):
    platform = crud.get_platform(db, platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return crud.get_instances(db, platform_id)


@router.get("/{platform_id}/activity/")
def get_platform_activity(platform_id: int, db: Session = Depends(get_db)):
    platform = crud.get_platform(db, platform_id)
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return [
        {"event": "Platform created",                          "timestamp": platform.created_at.isoformat(), "type": "create"},
        {"event": f"Status set to {platform.status}",          "timestamp": platform.created_at.isoformat(), "type": "status"},
        {"event": f"{platform.users} users currently active",  "timestamp": platform.created_at.isoformat(), "type": "users"},
        {"event": f"Uptime running at {platform.uptime}",      "timestamp": platform.created_at.isoformat(), "type": "uptime"},
    ]
