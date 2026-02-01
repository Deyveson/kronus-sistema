"""
Schemas de Serviço
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId


class ServicoBase(BaseModel):
    nome: str
    tipo: str  # Consulta, Retorno, Procedimento, Avaliação
    descricao: Optional[str] = None
    duracao: int  # em minutos
    valor: float
    profissionais_habilitados: List[str] = []  # IDs dos profissionais
    ativo: bool = True


class ServicoCreate(ServicoBase):
    pass


class ServicoUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None
    descricao: Optional[str] = None
    duracao: Optional[int] = None
    valor: Optional[float] = None
    profissionais_habilitados: Optional[List[str]] = None
    ativo: Optional[bool] = None


class Servico(ServicoBase):
    id: str = Field(alias="_id")
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
