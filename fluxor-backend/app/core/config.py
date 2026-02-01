"""
Configurações da aplicação
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Aplicação
    APP_NAME: str = "Fluxor API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # MongoDB
    MONGODB_URL: str = "mongodb://admin:fluxor123@mongodb:27017/fluxor?authSource=admin"
    DATABASE_NAME: str = "fluxor"
    
    # JWT
    SECRET_KEY: str = "sua-chave-secreta-super-segura-aqui-mude-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Fuso horário da aplicação
    TIMEZONE: str = "America/Manaus"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:4200",
        "http://localhost:80",
        "http://frontend:80"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
