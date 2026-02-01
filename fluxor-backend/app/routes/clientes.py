from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas import Cliente, ClienteCreate, ClienteUpdate, Usuario
from app.database.mongodb import get_database
from app.routes.auth import get_current_user

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.get("/", response_model=List[Cliente])
async def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    query = {}
    
    if ativo is not None:
        query["ativo"] = ativo
    
    clientes = await db.clientes.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    for cliente in clientes:
        cliente["_id"] = str(cliente["_id"])
    
    return [Cliente(**cliente) for cliente in clientes]

@router.get("/{cliente_id}", response_model=Cliente)
async def obter_cliente(
    cliente_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(cliente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    cliente = await db.clientes.find_one({"_id": ObjectId(cliente_id)})
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    cliente["_id"] = str(cliente["_id"])
    return Cliente(**cliente)

@router.post("/", response_model=Cliente, status_code=status.HTTP_201_CREATED)
async def criar_cliente(
    cliente_data: ClienteCreate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    cliente_dict = cliente_data.model_dump()
    cliente_dict["criado_em"] = datetime.utcnow()
    cliente_dict["atualizado_em"] = datetime.utcnow()
    
    result = await db.clientes.insert_one(cliente_dict)
    created_cliente = await db.clientes.find_one({"_id": result.inserted_id})
    created_cliente["_id"] = str(created_cliente["_id"])
    
    return Cliente(**created_cliente)

@router.put("/{cliente_id}", response_model=Cliente)
async def atualizar_cliente(
    cliente_id: str,
    cliente_update: ClienteUpdate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(cliente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    update_data = {k: v for k, v in cliente_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    update_data["atualizado_em"] = datetime.utcnow()
    
    result = await db.clientes.update_one(
        {"_id": ObjectId(cliente_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    updated_cliente = await db.clientes.find_one({"_id": ObjectId(cliente_id)})
    updated_cliente["_id"] = str(updated_cliente["_id"])
    
    return Cliente(**updated_cliente)

@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_cliente(
    cliente_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(cliente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await db.clientes.delete_one({"_id": ObjectId(cliente_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return None
