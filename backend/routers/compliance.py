from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/compliance", tags=["compliance"])


@router.get("/regions")
def get_compliance_regions(db: Session = Depends(get_db)):
    return [{"id": r.id, "name": r.name} for r in db.query(models.Region).order_by(models.Region.name).all()]


@router.get("/pods")
def get_compliance_pods(db: Session = Depends(get_db)):
    return [{"id": p.id, "name": p.name} for p in db.query(models.Pod).order_by(models.Pod.name).all()]


@router.get("/statuses")
def get_compliance_statuses(db: Session = Depends(get_db)):
    return [{"id": s.id, "name": s.name} for s in db.query(models.PlatformStatus).order_by(models.PlatformStatus.name).all()]


@router.get("/templates")
def get_compliance_templates(db: Session = Depends(get_db)):
    return [{"id": t.id, "name": t.name} for t in db.query(models.ComplianceTemplate).order_by(models.ComplianceTemplate.name).all()]


@router.get("/tags")
def get_compliance_tags(db: Session = Depends(get_db)):
    return [{"id": t.id, "name": t.name} for t in db.query(models.ComplianceTag).order_by(models.ComplianceTag.name).all()]


@router.post("/submit", status_code=201)
def submit_compliance_policy(
    payload: schemas.CompliancePolicySubmissionCreate,
    db: Session = Depends(get_db),
):
    platform = db.query(models.Platform).filter(models.Platform.id == payload.platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")

    submission = models.CompliancePolicySubmission(
        platform_id=payload.platform_id,
        platform_name=payload.platform_name,
        templates=",".join(payload.templates) if payload.templates else None,
        tags=",".join(payload.tags) if payload.tags else None,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return {
        "id": submission.id,
        "message": f"Compliance policy submitted for '{platform.pas_name}'",
        "templates": payload.templates,
        "tags": payload.tags,
    }


@router.get("/submissions", response_model=List[schemas.CompliancePolicySubmissionResponse])
def get_compliance_submissions(
    search: str = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.CompliancePolicySubmission).order_by(
        models.CompliancePolicySubmission.submitted_at.desc()
    )
    if search:
        term = f"%{search}%"
        q = q.filter(
            models.CompliancePolicySubmission.platform_name.ilike(term) |
            models.CompliancePolicySubmission.templates.ilike(term) |
            models.CompliancePolicySubmission.tags.ilike(term)
        )
    return q.all()


@router.delete("/submissions/{submission_id}", status_code=204)
def delete_compliance_submission(submission_id: int, db: Session = Depends(get_db)):
    row = db.query(models.CompliancePolicySubmission).filter(
        models.CompliancePolicySubmission.id == submission_id
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(row)
    db.commit()
