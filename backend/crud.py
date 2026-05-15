from sqlalchemy.orm import Session
from sqlalchemy import cast, String
from models import Platform, Instance, VirtualMachine, VMDisk
from schemas import PlatformCreate, PlatformUpdate
import uuid


def get_platforms(db: Session, skip: int = 0, limit: int = 100, search: str = None, status: str = None):
    q = db.query(Platform).order_by(Platform.created_at.desc())
    if search:
        q = q.filter(Platform.pas_name.ilike(f"%{search}%") | cast(Platform.id, String).ilike(f"%{search}%"))
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
