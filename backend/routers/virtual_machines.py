from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

import crud, schemas
from database import get_db

router = APIRouter(prefix="/api/vms", tags=["virtual_machines"])


@router.get("/", response_model=List[schemas.VMResponse])
def list_vms(
    skip: int = 0,
    limit: int = 1000,
    search: Optional[str] = Query(None),
    power_state: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud.get_vms(db, skip, limit, search=search, power_state=power_state)


@router.post("/", response_model=schemas.VMResponse, status_code=status.HTTP_201_CREATED)
def create_vm(vm: schemas.VMCreate, db: Session = Depends(get_db)):
    return crud.create_vm(db, vm)


@router.get("/{vm_id}", response_model=schemas.VMResponse)
def get_vm(vm_id: int, db: Session = Depends(get_db)):
    vm = crud.get_vm(db, vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return vm


@router.put("/{vm_id}", response_model=schemas.VMResponse)
def update_vm(vm_id: int, vm: schemas.VMUpdate, db: Session = Depends(get_db)):
    db_vm = crud.update_vm(db, vm_id, vm)
    if not db_vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return db_vm


@router.delete("/{vm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vm(vm_id: int, db: Session = Depends(get_db)):
    vm = crud.delete_vm(db, vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")


@router.get("/{vm_id}/disks", response_model=List[schemas.VMDiskResponse])
def get_disks(vm_id: int, search: Optional[str] = Query(None), db: Session = Depends(get_db)):
    vm = crud.get_vm(db, vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return crud.get_vm_disks(db, vm_id, search=search)


@router.post("/{vm_id}/disks", response_model=schemas.VMDiskResponse, status_code=201)
def add_disk(vm_id: int, disk: schemas.VMDiskCreate, db: Session = Depends(get_db)):
    vm = crud.get_vm(db, vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return crud.add_vm_disk(db, vm_id, disk)


@router.put("/{vm_id}/disks/{disk_id}", response_model=schemas.VMDiskResponse)
def update_disk(vm_id: int, disk_id: int, disk: schemas.VMDiskUpdate, db: Session = Depends(get_db)):
    updated = crud.update_vm_disk(db, disk_id, disk)
    if not updated:
        raise HTTPException(status_code=404, detail="Disk not found")
    return updated


@router.delete("/{vm_id}/disks/{disk_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disk(vm_id: int, disk_id: int, db: Session = Depends(get_db)):
    disk = crud.delete_vm_disk(db, disk_id)
    if not disk:
        raise HTTPException(status_code=404, detail="Disk not found")


@router.get("/{vm_id}/activity")
def get_activity(vm_id: int, db: Session = Depends(get_db)):
    vm = crud.get_vm(db, vm_id)
    if not vm:
        raise HTTPException(status_code=404, detail="VM not found")
    return [
        {"event": "VM created", "timestamp": vm.created_at.isoformat(), "type": "create"},
        {"event": f"Power state: {vm.power_state}", "timestamp": vm.created_at.isoformat(), "type": "status"},
        {"event": f"Region: {vm.region or 'N/A'}", "timestamp": vm.created_at.isoformat(), "type": "config"},
    ]
