import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "")
if _raw_url:
    # Re-encode the URL so special chars in the password (e.g. @) don't break parsing.
    # Expected format: postgresql://user:password@host:port/db
    _proto, _rest = _raw_url.split("://", 1)
    _userinfo, _hostinfo = _rest.rsplit("@", 1)
    _user, _password = _userinfo.split(":", 1)
    DATABASE_URL = f"{_proto}://{_user}:{quote_plus(_password)}@{_hostinfo}"
else:
    DATABASE_URL = "postgresql://postgres:password@localhost:5432/pas_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
