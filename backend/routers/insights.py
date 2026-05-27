from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import crud
from database import get_db

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("/summary")
def insights_summary(db: Session = Depends(get_db)):
    """Aggregated metrics for the Insights home page.

    Per-component totals, running/active counts, utilization % and full status
    breakdowns for VMs, platforms, compliance and jobs — all computed live.
    """
    return crud.get_insights_summary(db)
