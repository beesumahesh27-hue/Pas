from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas
from database import get_db
from models import Job, JobNotification

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _to_response(n: JobNotification, job: Job | None) -> schemas.NotificationResponse:
    return schemas.NotificationResponse(
        id=n.id,
        job_id=n.job_id,
        notify_at=n.notify_at,
        status=n.status,
        created_at=n.created_at,
        job_title=job.title if job else None,
        job_start=job.start if job else None,
        job_category=job.category if job else None,
    )


@router.get("/due", response_model=List[schemas.NotificationResponse])
def list_due_notifications(db: Session = Depends(get_db)):
    """Notifications that should be shown right now:
       notify_at has arrived, the job has not yet started, and the user
       has not dismissed it."""
    now = datetime.now(timezone.utc)
    rows = (
        db.query(JobNotification, Job)
          .join(Job, JobNotification.job_id == Job.id)
          .filter(JobNotification.status == "pending")
          .filter(JobNotification.notify_at <= now)
          .filter(Job.start > now)
          .order_by(JobNotification.notify_at.asc())
          .all()
    )
    return [_to_response(n, job) for n, job in rows]


@router.get("/", response_model=List[schemas.NotificationResponse])
def list_all_notifications(db: Session = Depends(get_db)):
    rows = (
        db.query(JobNotification, Job)
          .join(Job, JobNotification.job_id == Job.id)
          .order_by(JobNotification.notify_at.desc())
          .all()
    )
    return [_to_response(n, job) for n, job in rows]


@router.post("/{notification_id}/dismiss", response_model=schemas.NotificationResponse)
def dismiss_notification(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(JobNotification).filter(JobNotification.id == notification_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.status = "dismissed"
    db.commit()
    db.refresh(n)
    job = db.query(Job).filter(Job.id == n.job_id).first()
    return _to_response(n, job)
