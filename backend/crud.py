from sqlalchemy.orm import Session
from models import Platform, Instance, VirtualMachine, VMDisk, Job, JobNotification
from schemas import PlatformCreate, PlatformUpdate, JobCreate, JobUpdate
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

NOTIFY_LEAD_MIN = 30


def _notify_at_for(start: datetime) -> datetime:
    return start - timedelta(minutes=NOTIFY_LEAD_MIN)


def _upsert_notification(db: Session, job: Job):
    notif = db.query(JobNotification).filter(JobNotification.job_id == job.id).first()
    notify_at = _notify_at_for(job.start)
    if notif:
        notif.notify_at = notify_at
        notif.status = "pending"
    else:
        db.add(JobNotification(job_id=job.id, notify_at=notify_at, status="pending"))
    db.commit()


def get_platforms(db: Session, skip: int = 0, limit: int = 100, search: str = None, status: str = None):
    q = db.query(Platform).order_by(Platform.created_at.desc())
    if search:
        q = q.filter(Platform.pas_name.ilike(f"%{search}%") | Platform.pas_id.ilike(f"%{search}%"))
    if status:
        q = q.filter(Platform.status == status)
    return q.offset(skip).limit(limit).all()


def get_platform(db: Session, platform_id: int):
    return db.query(Platform).filter(Platform.id == platform_id).first()


def create_platform(db: Session, platform: PlatformCreate):
    db_platform = Platform(**platform.model_dump())
    db.add(db_platform)
    db.commit()
    db.refresh(db_platform)
    return db_platform


def update_platform(db: Session, platform_id: int, platform: PlatformUpdate):
    db_platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not db_platform:
        return None
    for key, value in platform.model_dump(exclude_unset=True).items():
        setattr(db_platform, key, value)
    db.commit()
    db.refresh(db_platform)
    return db_platform


def delete_platform(db: Session, platform_id: int):
    db_platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not db_platform:
        return None
    db.delete(db_platform)
    db.commit()
    return db_platform


def get_instances(db: Session, platform_id: int):
    return db.query(Instance).filter(Instance.platform_id == platform_id).order_by(Instance.id).all()


# ── Virtual Machine CRUD ─────────────────────────────────────────────────────

def get_vms(db: Session, skip: int = 0, limit: int = 100, search: str = None, power_state: str = None):
    q = db.query(VirtualMachine).order_by(VirtualMachine.created_at.desc())
    if search:
        q = q.filter(
            VirtualMachine.vm_name.ilike(f"%{search}%") |
            VirtualMachine.vm_uuid.ilike(f"%{search}%") |
            VirtualMachine.primary_ip.ilike(f"%{search}%")
        )
    if power_state:
        q = q.filter(VirtualMachine.power_state == power_state)
    return q.offset(skip).limit(limit).all()


def get_vm(db: Session, vm_id: int):
    return db.query(VirtualMachine).filter(VirtualMachine.id == vm_id).first()


def create_vm(db: Session, vm_data):
    vm_dict = vm_data.model_dump()
    vm_dict['vm_uuid'] = str(uuid.uuid4())
    db_vm = VirtualMachine(**vm_dict)
    db.add(db_vm)
    db.commit()
    db.refresh(db_vm)
    # Auto-create one default disk
    storage_uuid = str(uuid.uuid4()).replace('-', '')[:32]
    disk = VMDisk(
        vm_id=db_vm.id,
        disk_name="Hard disk 1",
        storage_uuid=storage_uuid,
        size_gb=vm_dict.get('total_disk_size', 50),
        iops=500,
        disk_class="Fixed",
    )
    db.add(disk)
    db.commit()
    return db_vm


def update_vm(db: Session, vm_id: int, vm_data):
    db_vm = db.query(VirtualMachine).filter(VirtualMachine.id == vm_id).first()
    if not db_vm:
        return None
    for k, v in vm_data.model_dump(exclude_unset=True).items():
        setattr(db_vm, k, v)
    db.commit()
    db.refresh(db_vm)
    return db_vm


def delete_vm(db: Session, vm_id: int):
    db_vm = db.query(VirtualMachine).filter(VirtualMachine.id == vm_id).first()
    if not db_vm:
        return None
    db.delete(db_vm)
    db.commit()
    return db_vm


def get_vm_disks(db: Session, vm_id: int, search: str = None):
    q = db.query(VMDisk).filter(VMDisk.vm_id == vm_id)
    if search:
        q = q.filter(VMDisk.disk_name.ilike(f"%{search}%"))
    return q.order_by(VMDisk.id).all()


def add_vm_disk(db: Session, vm_id: int, disk_data):
    storage_uuid = str(uuid.uuid4()).replace('-', '')[:32]
    disk = VMDisk(vm_id=vm_id, storage_uuid=storage_uuid, **disk_data.model_dump())
    db.add(disk)
    db.commit()
    db.refresh(disk)
    return disk


def update_vm_disk(db: Session, disk_id: int, disk_data):
    disk = db.query(VMDisk).filter(VMDisk.id == disk_id).first()
    if not disk:
        return None
    for field, value in disk_data.model_dump(exclude_unset=True).items():
        setattr(disk, field, value)
    db.commit()
    db.refresh(disk)
    return disk


def delete_vm_disk(db: Session, disk_id: int):
    disk = db.query(VMDisk).filter(VMDisk.id == disk_id).first()
    if not disk:
        return None
    db.delete(disk)
    db.commit()
    return disk


# ── Calendar Job CRUD ────────────────────────────────────────────────────────

def get_jobs(
    db: Session,
    skip: int = 0,
    limit: int = 1000,
    search: Optional[str] = None,
    category: Optional[str] = None,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
):
    q = db.query(Job).order_by(Job.start.asc())
    if search:
        q = q.filter(Job.title.ilike(f"%{search}%"))
    if category:
        q = q.filter(Job.category == category)
    if start is not None:
        q = q.filter(Job.end >= start)
    if end is not None:
        q = q.filter(Job.start <= end)
    return q.offset(skip).limit(limit).all()


def get_job(db: Session, job_id: int):
    return db.query(Job).filter(Job.id == job_id).first()


def create_job(db: Session, job: JobCreate):
    db_job = Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    _upsert_notification(db, db_job)
    return db_job


def update_job(db: Session, job_id: int, job: JobUpdate):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        return None
    payload = job.model_dump(exclude_unset=True)
    start_changed = "start" in payload and payload["start"] != db_job.start
    for key, value in payload.items():
        setattr(db_job, key, value)
    db.commit()
    db.refresh(db_job)
    if start_changed:
        _upsert_notification(db, db_job)
    return db_job


def delete_job(db: Session, job_id: int):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        return None
    db.delete(db_job)
    db.commit()
    return db_job


def get_job_stats(db: Session):
    from sqlalchemy import func as _func
    rows = (
        db.query(Job.category, _func.count(Job.id))
          .group_by(Job.category)
          .all()
    )
    return {category: count for category, count in rows}
