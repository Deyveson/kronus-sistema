from fastapi import APIRouter, HTTPException, Depends, Body
from typing import Optional
from pydantic import BaseModel
import secrets
from datetime import datetime
from bson import ObjectId
from app.database.mongodb import get_database
from app.schemas import Usuario
from app.core.timezone import now_local, parse_datetime_local
from .auth import get_current_user

router = APIRouter(prefix="/agendamento-online", tags=["Agendamento Online"])


class ValidarCpfRequest(BaseModel):
    cpf: str


@router.post("/validar-cpf")
async def validar_cpf(request: ValidarCpfRequest):
    """Valida CPF e retorna dados do cliente (público)"""
    
    db = get_database()
    
    # Remover formatação do CPF
    cpf_limpo = ''.join(filter(str.isdigit, request.cpf))
    
    # Buscar cliente por CPF
    cliente = await db.clientes.find_one({"cpf": cpf_limpo, "ativo": True})
    if not cliente:
        raise HTTPException(status_code=404, detail="CPF não encontrado em nossa base de clientes")
    
    # Verificar se já existe um link para este cliente
    link = await db.links_agendamento.find_one({"cliente_id": cliente["_id"]})
    
    if link and link.get("ativo"):
        # Retornar link existente
        token = link["token"]
    else:
        # Gerar novo token
        token = secrets.token_urlsafe(32)
        link_data = {
            "cliente_id": cliente["_id"],
            "token": token,
            "ativo": True,
            "criado_em": datetime.utcnow().isoformat(),
            "acessos": 0
        }
        
        if link:
            # Atualizar link existente
            await db.links_agendamento.update_one(
                {"cliente_id": cliente["_id"]},
                {"$set": link_data}
            )
        else:
            # Criar novo link
            await db.links_agendamento.insert_one(link_data)
    
    return {
        "token": token,
        "cliente": {
            "_id": str(cliente["_id"]),
            "nome": cliente["nome"],
            "telefone": cliente.get("telefone"),
            "email": cliente.get("email")
        }
    }


@router.post("/gerar-link/{cliente_id}")
async def gerar_link_cliente(
    cliente_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    """Gera um link único para o cliente agendar online"""
    
    db = get_database()
    
    # Converter string para ObjectId
    try:
        cliente_oid = ObjectId(cliente_id)
    except:
        raise HTTPException(status_code=400, detail="ID do cliente inválido")
    
    # Verificar se o cliente existe
    cliente = await db.clientes.find_one({"_id": cliente_oid})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # Gerar token único
    token = secrets.token_urlsafe(32)
    
    # Criar/atualizar link de agendamento
    link_data = {
        "cliente_id": cliente_oid,
        "token": token,
        "ativo": True,
        "criado_em": datetime.utcnow().isoformat(),
        "criado_por": current_user.id,
        "acessos": 0
    }
    
    # Verificar se já existe um link para este cliente
    existing_link = await db.links_agendamento.find_one({"cliente_id": cliente_oid})
    
    if existing_link:
        # Atualizar link existente
        await db.links_agendamento.update_one(
            {"cliente_id": cliente_oid},
            {"$set": link_data}
        )
    else:
        # Criar novo link
        await db.links_agendamento.insert_one(link_data)
    
    return {
        "cliente_id": cliente_id,
        "cliente_nome": cliente.get("nome"),
        "token": token,
        "link": f"http://localhost:4200/agendamento-online?token={token}",
        "ativo": True
    }


@router.get("/validar/{token}")
async def validar_token(token: str):
    """Valida um token de agendamento e retorna dados do cliente"""
    
    db = get_database()
    
    link = await db.links_agendamento.find_one({"token": token, "ativo": True})
    if not link:
        raise HTTPException(status_code=404, detail="Link inválido ou expirado")
    
    # Incrementar contador de acessos
    await db.links_agendamento.update_one(
        {"token": token},
        {"$inc": {"acessos": 1}}
    )
    
    # Buscar dados do cliente
    cliente = await db.clientes.find_one({"_id": link["cliente_id"]})
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return {
        "cliente_id": cliente["_id"],
        "cliente_nome": cliente["nome"],
        "cliente_telefone": cliente.get("telefone"),
        "token": token
    }


class AgendamentoPublicoRequest(BaseModel):
    servico_id: str
    profissional_id: str
    data_hora: str
    observacoes: Optional[str] = None


@router.post("/agendar/{token}")
async def criar_agendamento_publico(
    token: str,
    request: AgendamentoPublicoRequest
):
    """Cria um agendamento através do link público"""
    
    db = get_database()
    
    # Token é opcional para acesso público
    if token and token != 'publico':
        link = await db.links_agendamento.find_one({"token": token, "ativo": True})
        if link:
            cliente_id = link["cliente_id"]
        else:
            # Token inválido mas permite continuar sem cliente específico
            cliente_id = None
    else:
        cliente_id = None
    
    # Verificar se serviço e profissional existem
    try:
        # Tentar converter para ObjectId se necessário
        servico_oid = ObjectId(request.servico_id) if ObjectId.is_valid(request.servico_id) else request.servico_id
        profissional_oid = ObjectId(request.profissional_id) if ObjectId.is_valid(request.profissional_id) else request.profissional_id
    except:
        # Se falhar, usar como string
        servico_oid = request.servico_id
        profissional_oid = request.profissional_id
    
    servico = await db.servicos.find_one({"_id": servico_oid})
    profissional = await db.profissionais.find_one({"_id": profissional_oid})
    
    if not servico or not profissional:
        raise HTTPException(status_code=404, detail="Serviço ou profissional não encontrado")
    
    # Verificar se o horário está disponível
    conflito = await db.agendamentos.find_one({
        "profissional_id": request.profissional_id,
        "data_hora": request.data_hora,
        "status": {"$in": ["agendado", "confirmado", "em_atendimento"]}
    })
    
    if conflito:
        raise HTTPException(status_code=400, detail="Horário não disponível")
    
    # Converter data_hora string para datetime local (sem UTC)
    try:
        if isinstance(request.data_hora, str):
            data_hora_obj = parse_datetime_local(request.data_hora)
        else:
            data_hora_obj = request.data_hora
    except:
        raise HTTPException(status_code=400, detail="Formato de data inválido")
    
    # Criar agendamento
    agendamento_data = {
        "cliente_id": str(cliente_id) if cliente_id else None,
        "servico_id": request.servico_id,
        "profissional_id": request.profissional_id,
        "data_hora": data_hora_obj,  # Salvar como datetime local
        "duracao": servico["duracao"],
        "valor": servico["valor"],
        "status": "agendado",
        "observacoes": request.observacoes,
        "origem": "link_online",
        "criado_em": now_local().replace(tzinfo=None),
        "atualizado_em": now_local().replace(tzinfo=None)
    }
    
    result = await db.agendamentos.insert_one(agendamento_data)
    
    return {
        "id": str(result.inserted_id),
        "mensagem": "Agendamento criado com sucesso!",
        "data_hora": data_hora_obj.isoformat(),
        "profissional": profissional["nome"],
        "servico": servico["nome"]
    }
    
    return {
        "id": agendamento_data["_id"],
        "mensagem": "Agendamento criado com sucesso!",
        "data_hora": data_hora,
        "profissional": profissional["nome"],
        "servico": servico["nome"]
    }


@router.get("/servicos-disponiveis/{token}")
async def listar_servicos_disponiveis(token: str):
    """Lista serviços disponíveis para agendamento online (público)"""
    
    db = get_database()
    
    # Token é opcional - qualquer pessoa pode ver os serviços
    # Se tiver token, validamos (para tracking), mas não bloqueamos se inválido
    if token and token != 'publico':
        link = await db.links_agendamento.find_one({"token": token, "ativo": True})
        if link:
            # Incrementar contador de acessos se tiver link válido
            await db.links_agendamento.update_one(
                {"token": token},
                {"$inc": {"acessos": 1}}
            )
    
    # Buscar serviços ativos
    servicos = await db.servicos.find({"ativo": True}).to_list(length=100)
    
    return [
        {
            "_id": str(s["_id"]),
            "nome": s["nome"],
            "tipo": s["tipo"],
            "duracao": s["duracao"],
            "preco": s["valor"],  # Frontend espera "preco" não "valor"
            "descricao": s.get("descricao"),
            "profissionais_habilitados": s.get("profissionais_habilitados", [])
        }
        for s in servicos
    ]


@router.get("/profissionais-disponiveis/{token}")
async def listar_profissionais_disponiveis(token: str, servico_id: Optional[str] = None):
    """Lista profissionais disponíveis para agendamento online (público)"""
    
    db = get_database()
    
    # Token é opcional - qualquer pessoa pode ver os profissionais
    if token and token != 'publico':
        link = await db.links_agendamento.find_one({"token": token, "ativo": True})
        # Não bloqueamos se token inválido, apenas tracking
    
    # Se foi especificado um serviço, filtrar profissionais habilitados
    if servico_id:
        servico = await db.servicos.find_one({"_id": servico_id})
        if servico and servico.get("profissionais_habilitados"):
            profissionais = await db.profissionais.find({
                "_id": {"$in": servico["profissionais_habilitados"]},
                "ativo": True
            }).to_list(length=100)
        else:
            profissionais = await db.profissionais.find({"ativo": True}).to_list(length=100)
    else:
        profissionais = await db.profissionais.find({"ativo": True}).to_list(length=100)
    
    return [
        {
            "_id": str(p["_id"]),
            "nome": p["nome"],
            "especialidades": p.get("especialidades", []),
            "registro_profissional": p.get("registro_profissional")
        }
        for p in profissionais
    ]


@router.get("/disponibilidade/{token}")
async def obter_disponibilidade(
    token: str,
    profissional_id: str,
    data: str
):
    """Retorna horários disponíveis para um profissional em uma data (público)"""
    
    db = get_database()
    
    # Token é opcional
    if token and token != 'publico':
        link = await db.links_agendamento.find_one({"token": token, "ativo": True})
        # Não bloqueamos se token inválido
    
    # Buscar agendamentos do profissional na data
    data_inicio = f"{data}T00:00:00"
    data_fim = f"{data}T23:59:59"
    
    agendamentos = await db.agendamentos.find({
        "profissional_id": profissional_id,
        "data_hora": {"$gte": data_inicio, "$lte": data_fim},
        "status": {"$in": ["agendado", "confirmado", "em_atendimento"]}
    }).to_list(length=100)
    
    # Horários ocupados
    horarios_ocupados = [ag["data_hora"] for ag in agendamentos]
    
    # Gerar horários disponíveis (8h às 18h, intervalos de 30 min)
    horarios_disponiveis = []
    for hora in range(8, 18):
        for minuto in [0, 30]:
            horario_completo = f"{data}T{hora:02d}:{minuto:02d}:00"
            if horario_completo not in horarios_ocupados:
                # Retornar apenas HH:MM para exibição
                horarios_disponiveis.append(f"{hora:02d}:{minuto:02d}")
    
    return {
        "data": data,
        "profissional_id": profissional_id,
        "horarios_disponiveis": horarios_disponiveis
    }


@router.delete("/desativar-link/{cliente_id}")
async def desativar_link_cliente(
    cliente_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    """Desativa o link de agendamento de um cliente"""
    
    db = get_database()
    
    result = await db.links_agendamento.update_one(
        {"cliente_id": cliente_id},
        {"$set": {"ativo": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    
    return {"mensagem": "Link desativado com sucesso"}


@router.get("/estatisticas/{cliente_id}")
async def obter_estatisticas_link(
    cliente_id: str,
    current_user: Usuario = Depends(get_current_user)
):
    """Retorna estatísticas de uso do link de agendamento"""
    
    db = get_database()
    
    link = await db.links_agendamento.find_one({"cliente_id": cliente_id})
    if not link:
        raise HTTPException(status_code=404, detail="Link não encontrado")
    
    # Contar agendamentos feitos pelo link
    agendamentos_pelo_link = await db.agendamentos.count_documents({
        "cliente_id": cliente_id,
        "origem": "link_online"
    })
    
    return {
        "cliente_id": cliente_id,
        "token": link["token"],
        "ativo": link.get("ativo", False),
        "acessos": link.get("acessos", 0),
        "agendamentos_realizados": agendamentos_pelo_link,
        "criado_em": link.get("criado_em")
    }
