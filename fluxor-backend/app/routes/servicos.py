from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas import Servico, ServicoCreate, ServicoUpdate, Usuario
from app.database.mongodb import get_database
from app.routes.auth import get_current_user

router = APIRouter(prefix="/servicos", tags=["Serviços"])

@router.get("/", response_model=List[Servico])
async def listar_servicos(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    query = {}
    
    if ativo is not None:
        query["ativo"] = ativo
    
    servicos = await db.servicos.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    for servico in servicos:
        servico["_id"] = str(servico["_id"])
    
    return [Servico(**servico) for servico in servicos]

@router.get("/{servico_id}", response_model=Servico)
async def obter_servico(
    servico_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(servico_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    servico = await db.servicos.find_one({"_id": ObjectId(servico_id)})
    
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    servico["_id"] = str(servico["_id"])
    return Servico(**servico)

@router.post("/", response_model=Servico, status_code=status.HTTP_201_CREATED)
async def criar_servico(
    servico_data: ServicoCreate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    servico_dict = servico_data.model_dump()
    servico_dict["criado_em"] = datetime.utcnow()
    servico_dict["atualizado_em"] = datetime.utcnow()
    
    result = await db.servicos.insert_one(servico_dict)
    created_servico = await db.servicos.find_one({"_id": result.inserted_id})
    created_servico["_id"] = str(created_servico["_id"])
    
    return Servico(**created_servico)

@router.put("/{servico_id}", response_model=Servico)
async def atualizar_servico(
    servico_id: str,
    servico_update: ServicoUpdate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(servico_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    update_data = {k: v for k, v in servico_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    update_data["atualizado_em"] = datetime.utcnow()
    
    result = await db.servicos.update_one(
        {"_id": ObjectId(servico_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    updated_servico = await db.servicos.find_one({"_id": ObjectId(servico_id)})
    updated_servico["_id"] = str(updated_servico["_id"])
    
    return Servico(**updated_servico)

@router.delete("/{servico_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_servico(
    servico_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(servico_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await db.servicos.delete_one({"_id": ObjectId(servico_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    return None
