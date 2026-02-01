from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas import Profissional, ProfissionalCreate, ProfissionalUpdate, Usuario
from app.database.mongodb import get_database
from app.routes.auth import get_current_user

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])

@router.get("/", response_model=List[Profissional])
async def listar_profissionais(
    skip: int = 0,
    limit: int = 100,
    ativo: bool = None,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    query = {}
    
    if ativo is not None:
        query["ativo"] = ativo
    
    profissionais = await db.profissionais.find(query).skip(skip).limit(limit).to_list(length=limit)
    
    for profissional in profissionais:
        profissional["_id"] = str(profissional["_id"])
    
    return [Profissional(**profissional) for profissional in profissionais]

@router.get("/{profissional_id}", response_model=Profissional)
async def obter_profissional(
    profissional_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(profissional_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    profissional = await db.profissionais.find_one({"_id": ObjectId(profissional_id)})
    
    if not profissional:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    
    profissional["_id"] = str(profissional["_id"])
    return Profissional(**profissional)

@router.post("/", response_model=Profissional, status_code=status.HTTP_201_CREATED)
async def criar_profissional(
    profissional_data: ProfissionalCreate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    profissional_dict = profissional_data.model_dump()
    profissional_dict["criado_em"] = datetime.utcnow()
    profissional_dict["atualizado_em"] = datetime.utcnow()
    
    result = await db.profissionais.insert_one(profissional_dict)
    created_profissional = await db.profissionais.find_one({"_id": result.inserted_id})
    created_profissional["_id"] = str(created_profissional["_id"])
    
    return Profissional(**created_profissional)

@router.put("/{profissional_id}", response_model=Profissional)
async def atualizar_profissional(
    profissional_id: str,
    profissional_update: ProfissionalUpdate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(profissional_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    update_data = {k: v for k, v in profissional_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    update_data["atualizado_em"] = datetime.utcnow()
    
    result = await db.profissionais.update_one(
        {"_id": ObjectId(profissional_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    
    updated_profissional = await db.profissionais.find_one({"_id": ObjectId(profissional_id)})
    updated_profissional["_id"] = str(updated_profissional["_id"])
    
    return Profissional(**updated_profissional)

@router.delete("/{profissional_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_profissional(
    profissional_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(profissional_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await db.profissionais.delete_one({"_id": ObjectId(profissional_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    
    return None
