from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import crud
import schemas
from models import JobCategory
from database import get_db

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/stats")
def job_stats(db: Session = Depends(get_db)):
    return crud.get_job_stats(db)


@router.get("/categories", response_model=List[schemas.JobCategoryResponse])
def list_job_categories(db: Session = Depends(get_db)):
    return db.query(JobCategory).order_by(JobCategory.sort_order, JobCategory.id).all()


@router.get("/", response_model=List[schemas.JobResponse])
def list_jobs(
    skip: int = 0,
    limit: int = 1000,
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    start: Optional[datetime] = Query(None, description="Return jobs ending on/after this datetime"),
    end: Optional[datetime] = Query(None, description="Return jobs starting on/before this datetime"),
    db: Session = Depends(get_db),
):
    return crud.get_jobs(db, skip=skip, limit=limit, search=search, category=category, start=start, end=end)


@router.post("/", response_model=schemas.JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    if job.end < job.start:
        raise HTTPException(status_code=400, detail="end must be on/after start")
    return crud.create_job(db, job)


@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    db_job = crud.get_job(db, job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@router.put("/{job_id}", response_model=schemas.JobResponse)
def update_job(job_id: int, job: schemas.JobUpdate, db: Session = Depends(get_db)):
    if job.start is not None and job.end is not None and job.end < job.start:
        raise HTTPException(status_code=400, detail="end must be on/after start")
    db_job = crud.update_job(db, job_id, job)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    db_job = crud.delete_job(db, job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
