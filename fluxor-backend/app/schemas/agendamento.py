"""
Schemas de Agendamento
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId


class AgendamentoBase(BaseModel):
    cliente_id: str
    profissional_id: str
    servico_id: str
    data_hora: datetime
    status: str = "agendado"  # agendado, confirmado, em_atendimento, finalizado, cancelado
    observacoes: Optional[str] = None


class AgendamentoCreate(AgendamentoBase):
    pass


class AgendamentoUpdate(BaseModel):
    cliente_id: Optional[str] = None
    profissional_id: Optional[str] = None
    servico_id: Optional[str] = None
    data_hora: Optional[datetime] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None


class Agendamento(AgendamentoBase):
    id: str = Field(alias="_id")
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class AgendamentoExpandido(AgendamentoBase):
    """Agendamento com dados expandidos dos relacionamentos"""
    id: str = Field(alias="_id")
    cliente_nome: str
    profissional_nome: str
    servico_nome: str
    duracao: int  # duracao do servico em minutos
    criado_em: datetime
    atualizado_em: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011"
            }
        }
