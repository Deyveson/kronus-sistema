from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.schemas import ListaEspera, ListaEsperaCreate, ListaEsperaUpdate, ListaEsperaExpandida, Usuario
from app.database.mongodb import get_database
from app.routes.auth import get_current_user

router = APIRouter(prefix="/lista-espera", tags=["Lista de Espera"])

@router.get("/", response_model=List[ListaEsperaExpandida])
async def listar_lista_espera(
    skip: int = 0,
    limit: int = 100,
    status_filtro: str = None,
    prioridade: str = None,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    query = {}
    
    if status_filtro:
        query["status"] = status_filtro
    
    if prioridade:
        try:
            query["prioridade"] = int(prioridade)
        except ValueError:
            pass
    
    lista_espera = await db.lista_espera.find(query).sort("prioridade", -1).skip(skip).limit(limit).to_list(length=limit)
    
    resultado = []
    for item in lista_espera:
        # Buscar dados relacionados
        cliente = await db.clientes.find_one({"_id": ObjectId(item["cliente_id"])})
        servico = await db.servicos.find_one({"_id": ObjectId(item["servico_id"])})
        
        item["_id"] = str(item["_id"])
        item["cliente_nome"] = cliente["nome"] if cliente else "Cliente não encontrado"
        item["cliente_telefone"] = cliente["telefone"] if cliente else ""
        item["servico_nome"] = servico["nome"] if servico else "Serviço não encontrado"
        item["profissional_id"] = None
        item["profissional_nome"] = None
        
        resultado.append(ListaEsperaExpandida(**item))
    
    return resultado

@router.get("/{item_id}", response_model=ListaEsperaExpandida)
async def obter_item_lista_espera(
    item_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    item = await db.lista_espera.find_one({"_id": ObjectId(item_id)})
    
    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    # Buscar dados relacionados
    cliente = await db.clientes.find_one({"_id": ObjectId(item["cliente_id"])})
    servico = await db.servicos.find_one({"_id": ObjectId(item["servico_id"])})
    
    item["_id"] = str(item["_id"])
    item["cliente_nome"] = cliente["nome"] if cliente else "Cliente não encontrado"
    item["cliente_telefone"] = cliente["telefone"] if cliente else ""
    item["servico_nome"] = servico["nome"] if servico else "Serviço não encontrado"
    item["profissional_id"] = None
    item["profissional_nome"] = None
    
    return ListaEsperaExpandida(**item)

@router.post("/", response_model=ListaEspera, status_code=status.HTTP_201_CREATED)
async def criar_item_lista_espera(
    item_data: ListaEsperaCreate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    # Validar se cliente e serviço existem
    if not ObjectId.is_valid(item_data.cliente_id):
        raise HTTPException(status_code=400, detail="ID do cliente inválido")
    if not ObjectId.is_valid(item_data.servico_id):
        raise HTTPException(status_code=400, detail="ID do serviço inválido")
    
    cliente = await db.clientes.find_one({"_id": ObjectId(item_data.cliente_id)})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    servico = await db.servicos.find_one({"_id": ObjectId(item_data.servico_id)})
    if not servico:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    item_dict = item_data.model_dump()
    item_dict["criado_em"] = datetime.utcnow()
    item_dict["atualizado_em"] = datetime.utcnow()
    
    result = await db.lista_espera.insert_one(item_dict)
    created_item = await db.lista_espera.find_one({"_id": result.inserted_id})
    created_item["_id"] = str(created_item["_id"])
    
    return ListaEspera(**created_item)

@router.put("/{item_id}", response_model=ListaEspera)
async def atualizar_item_lista_espera(
    item_id: str,
    item_update: ListaEsperaUpdate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    update_data = {k: v for k, v in item_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum dado para atualizar")
    
    update_data["atualizado_em"] = datetime.utcnow()
    
    result = await db.lista_espera.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    updated_item = await db.lista_espera.find_one({"_id": ObjectId(item_id)})
    updated_item["_id"] = str(updated_item["_id"])
    
    return ListaEspera(**updated_item)

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_item_lista_espera(
    item_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await db.lista_espera.delete_one({"_id": ObjectId(item_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    return None
