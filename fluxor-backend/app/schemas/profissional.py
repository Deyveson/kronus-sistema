"""
Schemas de Profissional
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class ProfissionalBase(BaseModel):
    nome: str
    especialidade: str
    registro_profissional: Optional[str] = None
    telefone: str
    email: Optional[EmailStr] = None
    horario_trabalho: Optional[dict] = None
    acesso_sistema: bool = False
    ativo: bool = True


class ProfissionalCreate(ProfissionalBase):
    pass


class ProfissionalUpdate(BaseModel):
    nome: Optional[str] = None
    especialidade: Optional[str] = None
    registro_profissional: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    horario_trabalho: Optional[dict] = None
    acesso_sistema: Optional[bool] = None
    ativo: Optional[bool] = None


class Profissional(ProfissionalBase):
    id: str = Field(alias="_id")
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
