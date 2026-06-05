from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/recycle-bin", tags=["recycle-bin"])


# ── Dropdown Options ─────────────────────────────────────────────────────────

@router.get("/dropdown-options/{category}", response_model=List[str])
def get_dropdown_options(category: str, db: Session = Depends(get_db)):
    rows = (
        db.query(models.DropdownOption)
        .filter(models.DropdownOption.category == category)
        .order_by(models.DropdownOption.sort_order, models.DropdownOption.value)
        .all()
    )
    return [r.value for r in rows]


# ── Resource Groups ──────────────────────────────────────────────────────────

@router.get("/resource-groups", response_model=List[schemas.ResourceGroupResponse])
def list_resource_groups(search: str = None, db: Session = Depends(get_db)):
    q = db.query(models.ResourceGroup).order_by(models.ResourceGroup.name)
    if search:
        q = q.filter(models.ResourceGroup.name.ilike(f"%{search}%"))
    groups = q.all()

    # Annotate each with its resource count
    counts = dict(
        db.query(
            models.RecycleResource.resource_group_id,
            func.count(models.RecycleResource.id),
        ).group_by(models.RecycleResource.resource_group_id).all()
    )
    result = []
    for g in groups:
        result.append({
            "id": g.id,
            "name": g.name,
            "subscription": g.subscription,
            "location": g.location,
            "created_at": g.created_at,
            "resource_count": counts.get(g.id, 0),
        })
    return result


@router.post("/resource-groups", response_model=schemas.ResourceGroupResponse, status_code=201)
def create_resource_group(
    payload: schemas.ResourceGroupCreate,
    db: Session = Depends(get_db),
):
    if db.query(models.ResourceGroup).filter(models.ResourceGroup.name == payload.name).first():
        raise HTTPException(status_code=400, detail="A resource group with this name already exists")

    row = models.ResourceGroup(
        name=payload.name,
        subscription=payload.subscription,
        location=payload.location,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": row.id,
        "name": row.name,
        "subscription": row.subscription,
        "location": row.location,
        "created_at": row.created_at,
        "resource_count": 0,
    }


@router.get("/resource-groups/{group_id}", response_model=schemas.ResourceGroupResponse)
def get_resource_group(group_id: int, db: Session = Depends(get_db)):
    row = db.query(models.ResourceGroup).filter(models.ResourceGroup.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Resource group not found")
    count = db.query(models.RecycleResource).filter(
        models.RecycleResource.resource_group_id == group_id
    ).count()
    return {
        "id": row.id,
        "name": row.name,
        "subscription": row.subscription,
        "location": row.location,
        "created_at": row.created_at,
        "resource_count": count,
    }


@router.delete("/resource-groups/{group_id}", status_code=204)
def delete_resource_group(group_id: int, db: Session = Depends(get_db)):
    row = db.query(models.ResourceGroup).filter(models.ResourceGroup.id == group_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Resource group not found")
    db.delete(row)
    db.commit()


# ── Resources inside a Resource Group ───────────────────────────────────────

@router.get(
    "/resource-groups/{group_id}/resources",
    response_model=List[schemas.RecycleResourceResponse],
)
def list_resources(group_id: int, db: Session = Depends(get_db)):
    if not db.query(models.ResourceGroup).filter(models.ResourceGroup.id == group_id).first():
        raise HTTPException(status_code=404, detail="Resource group not found")
    return db.query(models.RecycleResource).filter(
        models.RecycleResource.resource_group_id == group_id
    ).order_by(models.RecycleResource.name).all()


@router.post(
    "/resource-groups/{group_id}/resources",
    response_model=schemas.RecycleResourceResponse,
    status_code=201,
)
def create_resource(
    group_id: int,
    payload: schemas.RecycleResourceCreate,
    db: Session = Depends(get_db),
):
    if not db.query(models.ResourceGroup).filter(models.ResourceGroup.id == group_id).first():
        raise HTTPException(status_code=404, detail="Resource group not found")

    row = models.RecycleResource(
        resource_group_id=group_id,
        name=payload.name,
        type=payload.type,
        location=payload.location,
        status=payload.status,
        runtime_version=payload.runtime_version,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/resources/{resource_id}", response_model=schemas.RecycleResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    row = db.query(models.RecycleResource).filter(models.RecycleResource.id == resource_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Resource not found")
    return row


@router.delete("/resources/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    row = db.query(models.RecycleResource).filter(models.RecycleResource.id == resource_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(row)
    db.commit()


# ── Functions inside a Function App resource ────────────────────────────────

@router.get(
    "/resources/{resource_id}/functions",
    response_model=List[schemas.RecycleFunctionResponse],
)
def list_functions(resource_id: int, db: Session = Depends(get_db)):
    if not db.query(models.RecycleResource).filter(models.RecycleResource.id == resource_id).first():
        raise HTTPException(status_code=404, detail="Resource not found")
    return db.query(models.RecycleFunction).filter(
        models.RecycleFunction.resource_id == resource_id
    ).order_by(models.RecycleFunction.created_at.desc()).all()


@router.post(
    "/resources/{resource_id}/functions",
    response_model=schemas.RecycleFunctionResponse,
    status_code=201,
)
def create_function(
    resource_id: int,
    payload: schemas.RecycleFunctionCreate,
    db: Session = Depends(get_db),
):
    resource = db.query(models.RecycleResource).filter(
        models.RecycleResource.id == resource_id
    ).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.type != "Function App":
        raise HTTPException(status_code=400, detail="Functions can only be created on a Function App resource")

    row = models.RecycleFunction(
        resource_id=resource_id,
        name=payload.name,
        trigger=payload.trigger,
        language=payload.language,
        status=payload.status,
        description=payload.description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/functions/{function_id}", response_model=schemas.RecycleFunctionResponse)
def get_function(function_id: int, db: Session = Depends(get_db)):
    row = db.query(models.RecycleFunction).filter(models.RecycleFunction.id == function_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Function not found")
    return row


@router.delete("/functions/{function_id}", status_code=204)
def delete_function(function_id: int, db: Session = Depends(get_db)):
    row = db.query(models.RecycleFunction).filter(models.RecycleFunction.id == function_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Function not found")
    db.delete(row)
    db.commit()
