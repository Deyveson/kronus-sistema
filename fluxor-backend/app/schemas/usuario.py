"""
Schemas de Usuário
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    tipo: str  # "admin", "profissional", "recepcionista"
    ativo: bool = True


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    tipo: Optional[str] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = None


class Usuario(UsuarioBase):
    id: str = Field(alias="_id")
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
