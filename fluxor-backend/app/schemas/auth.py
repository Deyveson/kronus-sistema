"""
Schemas de Autenticação
"""
from pydantic import BaseModel, EmailStr
from .usuario import Usuario


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: Usuario
