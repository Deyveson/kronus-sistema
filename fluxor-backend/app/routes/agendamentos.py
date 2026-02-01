from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas import Agendamento, AgendamentoCreate, AgendamentoUpdate, AgendamentoExpandido, Usuario
from app.database.mongodb import get_database
from app.routes.auth import get_current_user
from app.core.timezone import now_local, parse_datetime_local, format_datetime_iso

router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])

@router.get("/")
async def listar_agendamentos(
    skip: int = 0,
    limit: int = 100,
    status_filtro: str = None,
    data_inicio: datetime = None,
    data_fim: datetime = None,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    query = {}
    
    if status_filtro:
        query["status"] = status_filtro
    
    if data_inicio or data_fim:
        query["data_hora"] = {}
        if data_inicio:
            query["data_hora"]["$gte"] = data_inicio
        if data_fim:
            query["data_hora"]["$lte"] = data_fim
    
    agendamentos = await db.agendamentos.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    resultado = []
    for agendamento in agendamentos:
        # Buscar dados relacionados
        cliente = None
        if agendamento.get("cliente_id"):
            try:
                cliente_id = ObjectId(agendamento["cliente_id"]) if ObjectId.is_valid(agendamento["cliente_id"]) else agendamento["cliente_id"]
                cliente = await db.clientes.find_one({"_id": cliente_id})
            except:
                pass
        
        profissional = None
        try:
            prof_id = ObjectId(agendamento["profissional_id"]) if ObjectId.is_valid(agendamento["profissional_id"]) else agendamento["profissional_id"]
            profissional = await db.profissionais.find_one({"_id": prof_id})
        except:
            pass
        
        servico = None
        try:
            serv_id = ObjectId(agendamento["servico_id"]) if ObjectId.is_valid(agendamento["servico_id"]) else agendamento["servico_id"]
            servico = await db.servicos.find_one({"_id": serv_id})
        except:
            pass
        
        agendamento["_id"] = str(agendamento["_id"])
        agendamento["id"] = agendamento["_id"]  # Garantir que id seja igual a _id
        agendamento["cliente_nome"] = cliente["nome"] if cliente else "Cliente não informado"
        agendamento["profissional_nome"] = profissional["nome"] if profissional else "Profissional não encontrado"
        agendamento["servico_nome"] = servico["nome"] if servico else "Serviço não encontrado"
        agendamento["duracao"] = servico["duracao"] if servico else 0
        
        # Converter datetime para string ISO
        if "data_hora" in agendamento:
            agendamento["data_hora"] = agendamento["data_hora"].isoformat() if isinstance(agendamento["data_hora"], datetime) else agendamento["data_hora"]
        if "criado_em" in agendamento:
            agendamento["criado_em"] = agendamento["criado_em"].isoformat() if isinstance(agendamento["criado_em"], datetime) else agendamento["criado_em"]
        if "atualizado_em" in agendamento:
            agendamento["atualizado_em"] = agendamento["atualizado_em"].isoformat() if isinstance(agendamento["atualizado_em"], datetime) else agendamento["atualizado_em"]
        
        resultado.append(agendamento)
    
    return resultado

@router.get("/{agendamento_id}", response_model=AgendamentoExpandido)
async def obter_agendamento(
    agendamento_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(agendamento_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    agendamento = await db.agendamentos.find_one({"_id": ObjectId(agendamento_id)})
    
    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    # Buscar dados relacionados
    cliente = None
    if agendamento.get("cliente_id"):
        try:
            cliente_id = ObjectId(agendamento["cliente_id"]) if ObjectId.is_valid(agendamento["cliente_id"]) else agendamento["cliente_id"]
            cliente = await db.clientes.find_one({"_id": cliente_id})
        except:
            pass
    
    profissional = None
    try:
        prof_id = ObjectId(agendamento["profissional_id"]) if ObjectId.is_valid(agendamento["profissional_id"]) else agendamento["profissional_id"]
        profissional = await db.profissionais.find_one({"_id": prof_id})
    except:
        pass
    
    servico = None
    try:
        serv_id = ObjectId(agendamento["servico_id"]) if ObjectId.is_valid(agendamento["servico_id"]) else agendamento["servico_id"]
        servico = await db.servicos.find_one({"_id": serv_id})
    except:
        pass
    
    agendamento["_id"] = str(agendamento["_id"])
    agendamento["id"] = str(agendamento["_id"])  # Adicionar id também para compatibilidade
    agendamento["cliente_nome"] = cliente["nome"] if cliente else "Cliente não informado"
    agendamento["profissional_nome"] = profissional["nome"] if profissional else "Profissional não encontrado"
    agendamento["servico_nome"] = servico["nome"] if servico else "Serviço não encontrado"
    agendamento["duracao"] = servico["duracao"] if servico else 0
    
    return AgendamentoExpandido(**agendamento)

@router.post("/", response_model=Agendamento, status_code=status.HTTP_201_CREATED)
async def criar_agendamento(
    agendamento_data: AgendamentoCreate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    # Validar se cliente, profissional e serviço existem
    if not ObjectId.is_valid(agendamento_data.cliente_id):
        raise HTTPException(status_code=400, detail="ID do cliente inválido")
    if not ObjectId.is_valid(agendamento_data.profissional_id):
        raise HTTPException(status_code=400, detail="ID do profissional inválido")
    if not ObjectId.is_valid(agendamento_data.servico_id):
        raise HTTPException(status_code=400, detail="ID do serviço inválido")
    
    cliente = await db.clientes.find_one({"_id": ObjectId(agendamento_data.cliente_id)})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    profissional = await db.profissionais.find_one({"_id": ObjectId(agendamento_data.profissional_id)})
    if not profissional:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    
    servico = await db.servicos.find_one({"_id": ObjectId(agendamento_data.servico_id)})
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    agendamento_dict = agendamento_data.model_dump()
    
    # Converter data_hora para datetime local (sem UTC)
    if isinstance(agendamento_dict.get("data_hora"), str):
        agendamento_dict["data_hora"] = parse_datetime_local(agendamento_dict["data_hora"])
    
    agendamento_dict["criado_em"] = now_local().replace(tzinfo=None)
    agendamento_dict["atualizado_em"] = now_local().replace(tzinfo=None)
    
    result = await db.agendamentos.insert_one(agendamento_dict)
    created_agendamento = await db.agendamentos.find_one({"_id": result.inserted_id})
    created_agendamento["_id"] = str(created_agendamento["_id"])
    
    return Agendamento(**created_agendamento)

@router.put("/{agendamento_id}", response_model=Agendamento)
async def atualizar_agendamento(
    agendamento_id: str,
    agendamento_update: AgendamentoUpdate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(agendamento_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    update_data = {k: v for k, v in agendamento_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    # Converter data_hora para datetime local (sem UTC)
    if "data_hora" in update_data and isinstance(update_data["data_hora"], str):
        update_data["data_hora"] = parse_datetime_local(update_data["data_hora"])
    
    update_data["atualizado_em"] = now_local().replace(tzinfo=None)
    
    result = await db.agendamentos.update_one(
        {"_id": ObjectId(agendamento_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    updated_agendamento = await db.agendamentos.find_one({"_id": ObjectId(agendamento_id)})
    updated_agendamento["_id"] = str(updated_agendamento["_id"])
    
    return Agendamento(**updated_agendamento)

@router.delete("/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_agendamento(
    agendamento_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(agendamento_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await db.agendamentos.delete_one({"_id": ObjectId(agendamento_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    return None
