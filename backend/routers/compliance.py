from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

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
