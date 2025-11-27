from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "India Tour Safety API"

    # Database
    DATABASE_URL: str

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | List[str] = []

    # Supabase / JWT
    SUPABASE_JWT_AUDIENCE: str | None = None
    SUPABASE_JWT_ISSUER: str | None = None
    SUPABASE_JWT_SECRET: str | None = None  # optional if using public key verification later

    # Admin configuration
    SAFETY_ADMIN_EMAILS: List[str] = []

    # Simple field-level encryption key for sensitive profile fields
    SAFETY_ENCRYPTION_KEY: str | None = None

    # Optional real alert dispatch configuration (SMS / email)
    SAFETY_DISPATCH_ENABLED: bool = False
    SAFETY_DISPATCH_PROVIDER: str | None = None  # e.g. "twilio" or "sendgrid"
    TWILIO_ACCOUNT_SID: str | None = None
    TWILIO_AUTH_TOKEN: str | None = None
    TWILIO_FROM_NUMBER: str | None = None
    SENDGRID_API_KEY: str | None = None
    SAFETY_DISPATCH_FROM_EMAIL: str | None = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
