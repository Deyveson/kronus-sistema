"""
Schemas de Lista de Espera
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class ListaEsperaBase(BaseModel):
    cliente_id: str
    servico_id: str
    prioridade: int = 1  # 1-5, sendo 5 a maior prioridade
    observacoes: Optional[str] = None
    status: str = "aguardando"  # aguardando, contatado, agendado, cancelado


class ListaEsperaCreate(ListaEsperaBase):
    pass


class ListaEsperaUpdate(BaseModel):
    cliente_id: Optional[str] = None
    servico_id: Optional[str] = None
    prioridade: Optional[int] = None
    observacoes: Optional[str] = None
    status: Optional[str] = None


class ListaEspera(ListaEsperaBase):
    id: str = Field(alias="_id")
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ListaEsperaExpandida(ListaEsperaBase):
    """Lista de Espera com dados expandidos dos relacionamentos"""
    id: str = Field(alias="_id")
    cliente_nome: str
    cliente_telefone: str
    servico_nome: str
    profissional_id: Optional[str] = None
    profissional_nome: Optional[str] = None
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
