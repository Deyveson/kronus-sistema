from fastapi import APIRouter, Depends, Query
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from bson import ObjectId

from app.schemas import Usuario
from app.database.mongodb import get_database
from app.routes.auth import get_current_user

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])

@router.get("/dashboard", response_model=Dict)
async def obter_dados_dashboard(
    periodo: str = Query("ultimos-7-dias", description="Período: ultimos-7-dias, ultimos-30-dias, este-mes"),
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    # Calcular datas baseado no período
    hoje = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    amanha = hoje + timedelta(days=1)
    
    if periodo == "ultimos-7-dias":
        data_inicio = hoje - timedelta(days=7)
    elif periodo == "ultimos-30-dias":
        data_inicio = hoje - timedelta(days=30)
    elif periodo == "este-mes":
        data_inicio = hoje.replace(day=1)
    else:
        data_inicio = hoje - timedelta(days=7)
    
    # Total de clientes ativos
    total_clientes = await db.clientes.count_documents({"ativo": True})
    
    # Total de profissionais ativos
    total_profissionais = await db.profissionais.count_documents({"ativo": True})
    
    # Total de serviços ativos
    total_servicos = await db.servicos.count_documents({"ativo": True})
    
    # Agendamentos de hoje
    agendamentos_hoje = await db.agendamentos.count_documents({
        "data_hora": {"$gte": hoje, "$lt": amanha}
    })
    
    # Agendamentos por status
    agendamentos_agendados = await db.agendamentos.count_documents({"status": "agendado"})
    agendamentos_confirmados = await db.agendamentos.count_documents({"status": "confirmado"})
    agendamentos_finalizados = await db.agendamentos.count_documents({"status": "finalizado"})
    agendamentos_cancelados = await db.agendamentos.count_documents({"status": "cancelado"})
    
    # Lista de espera
    total_lista_espera = await db.lista_espera.count_documents({"status": "aguardando"})
    
    # ====== ESTATÍSTICAS ADICIONAIS ======
    
    # Receita mensal (soma dos valores dos SERVIÇOS dos agendamentos finalizados no período)
    receita_pipeline = [
        {
            "$match": {
                "status": "finalizado",
                "data_hora": {"$gte": data_inicio, "$lt": amanha}
            }
        },
        {
            "$addFields": {
                "servico_object_id": {"$toObjectId": "$servico_id"}
            }
        },
        {
            "$lookup": {
                "from": "servicos",
                "localField": "servico_object_id",
                "foreignField": "_id",
                "as": "servico_info"
            }
        },
        {
            "$unwind": {"path": "$servico_info", "preserveNullAndEmptyArrays": True}
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": {"$ifNull": ["$servico_info.valor", 0]}}
            }
        }
    ]
    receita_result = await db.agendamentos.aggregate(receita_pipeline).to_list(1)
    receita_mensal = receita_result[0]["total"] if receita_result else 0
    
    # Tempo médio das consultas (duração do serviço vinculado)
    tempo_pipeline = [
        {
            "$match": {
                "status": "finalizado",
                "data_hora": {"$gte": data_inicio, "$lt": amanha}
            }
        },
        {
            "$addFields": {
                "servico_object_id": {"$toObjectId": "$servico_id"}
            }
        },
        {
            "$lookup": {
                "from": "servicos",
                "localField": "servico_object_id",
                "foreignField": "_id",
                "as": "servico_info"
            }
        },
        {
            "$unwind": {"path": "$servico_info", "preserveNullAndEmptyArrays": True}
        },
        {
            "$group": {
                "_id": None,
                "media": {"$avg": {"$ifNull": ["$servico_info.duracao", 0]}}
            }
        }
    ]
    tempo_result = await db.agendamentos.aggregate(tempo_pipeline).to_list(1)
    tempo_medio = int(tempo_result[0]["media"]) if tempo_result and tempo_result[0]["media"] else None
    
    # Taxa de comparecimento no período
    total_no_periodo = await db.agendamentos.count_documents({
        "data_hora": {"$gte": data_inicio, "$lt": amanha},
        "status": {"$in": ["finalizado", "cancelado"]}
    })
    finalizados_no_periodo = await db.agendamentos.count_documents({
        "data_hora": {"$gte": data_inicio, "$lt": amanha},
        "status": "finalizado"
    })
    
    taxa_comparecimento = (finalizados_no_periodo / total_no_periodo * 100) if total_no_periodo > 0 else 0
    
    # Taxa de No-Show (cancelados / total)
    cancelados_no_periodo = await db.agendamentos.count_documents({
        "data_hora": {"$gte": data_inicio, "$lt": amanha},
        "status": "cancelado"
    })
    no_show = (cancelados_no_periodo / total_no_periodo * 100) if total_no_periodo > 0 else 0
    
    # Satisfação (simulada por enquanto - 4.5 de 5)
    satisfacao = 4.5  # TODO: Implementar sistema de avaliação
    
    return {
        "total_clientes": total_clientes,
        "total_profissionais": total_profissionais,
        "total_servicos": total_servicos,
        "agendamentos_hoje": agendamentos_hoje,
        "agendamentos_por_status": {
            "agendado": agendamentos_agendados,
            "confirmado": agendamentos_confirmados,
            "finalizado": agendamentos_finalizados,
            "cancelado": agendamentos_cancelados
        },
        "total_lista_espera": total_lista_espera,
        # Estatísticas adicionais
        "receita_mensal": receita_mensal,
        "tempo_medio": tempo_medio,
        "taxa_comparecimento": round(taxa_comparecimento, 1),
        "no_show": round(no_show, 1),
        "satisfacao": satisfacao
    }

@router.get("/resumo")
async def obter_resumo(
    data_inicio: datetime,
    data_fim: datetime,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    # Agendamentos no período
    total_agendamentos = await db.agendamentos.count_documents({
        "data_hora": {"$gte": data_inicio, "$lte": data_fim}
    })
    
    # Agendamentos confirmados
    agendamentos_confirmados = await db.agendamentos.count_documents({
        "data_hora": {"$gte": data_inicio, "$lte": data_fim},
        "status": {"$in": ["confirmado", "finalizado"]}
    })
    
    # Calcular receita total
    agendamentos_finalizados = await db.agendamentos.find({
        "data_hora": {"$gte": data_inicio, "$lte": data_fim},
        "status": "finalizado"
    }).to_list(length=None)
    
    receita_total = 0
    for agendamento in agendamentos_finalizados:
        servico = await db.servicos.find_one({"_id": agendamento["servico_id"]})
        if servico:
            receita_total += servico.get("valor", 0)
    
    ticket_medio = receita_total / len(agendamentos_finalizados) if agendamentos_finalizados else 0
    
    return {
        "total_agendamentos": total_agendamentos,
        "agendamentos_confirmados": agendamentos_confirmados,
        "receita_total": receita_total,
        "ticket_medio": ticket_medio
    }

@router.get("/agendamentos-por-periodo")
async def obter_agendamentos_por_periodo(
    data_inicio: datetime,
    data_fim: datetime,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    agendamentos = await db.agendamentos.find({
        "data_hora": {"$gte": data_inicio, "$lte": data_fim}
    }).to_list(length=1000)
    
    # Agrupar por status
    por_status = {}
    for agendamento in agendamentos:
        status = agendamento.get("status", "agendado")
        por_status[status] = por_status.get(status, 0) + 1
    
    return {
        "total": len(agendamentos),
        "por_status": por_status,
        "periodo": {
            "inicio": data_inicio,
            "fim": data_fim
        }
    }

@router.get("/receita-por-periodo")
async def obter_receita_por_periodo(
    data_inicio: datetime,
    data_fim: datetime,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    agendamentos = await db.agendamentos.find({
        "data_hora": {"$gte": data_inicio, "$lte": data_fim},
        "status": "finalizado"
    }).to_list(length=1000)
    
    receita_total = 0
    for agendamento in agendamentos:
        servico = await db.servicos.find_one({"_id": agendamento.get("servico_id")})
        if servico:
            receita_total += servico.get("valor", 0)
    
    return {
        "receita_total": receita_total,
        "total_atendimentos": len(agendamentos),
        "periodo": {
            "inicio": data_inicio,
            "fim": data_fim
        }
    }

@router.get("/atividades-recentes", response_model=List[Dict])
async def obter_atividades_recentes(
    limit: int = Query(10, le=50),
    current_user: Usuario = Depends(get_current_user)
):
    """Retorna as atividades recentes do sistema"""
    db = get_database()
    atividades = []
    
    # Buscar últimos clientes criados
    clientes_recentes = await db.clientes.find().sort("criado_em", -1).limit(3).to_list(length=3)
    for cliente in clientes_recentes:
        tempo_diff = datetime.utcnow() - cliente.get("criado_em", datetime.utcnow())
        atividades.append({
            "id": str(cliente["_id"]),
            "tipo": "novo_cliente",
            "titulo": "Novo paciente cadastrado",
            "subtitulo": cliente.get("nome", "Sem nome"),
            "tempo": formatar_tempo_relativo(tempo_diff),
            "icone": "event",
            "cor": "blue"
        })
    
    # Buscar últimos agendamentos confirmados
    agendamentos_confirmados = await db.agendamentos.find(
        {"status": "confirmado"}
    ).sort("atualizado_em", -1).limit(2).to_list(length=2)
    
    for agendamento in agendamentos_confirmados:
        cliente_id = agendamento.get("cliente_id")
        cliente = None
        if cliente_id:
            try:
                cliente_oid = ObjectId(cliente_id) if ObjectId.is_valid(cliente_id) else cliente_id
                cliente = await db.clientes.find_one({"_id": cliente_oid})
            except:
                pass
        
        profissional_id = agendamento.get("profissional_id")
        profissional = None
        if profissional_id:
            try:
                prof_oid = ObjectId(profissional_id) if ObjectId.is_valid(profissional_id) else profissional_id
                profissional = await db.profissionais.find_one({"_id": prof_oid})
            except:
                pass
        
        tempo_diff = datetime.utcnow() - agendamento.get("atualizado_em", datetime.utcnow())
        
        cliente_nome = cliente.get('nome', 'Cliente') if cliente else 'Cliente não informado'
        profissional_nome = profissional.get('nome', 'Profissional') if profissional else 'Profissional'
        
        atividades.append({
            "id": str(agendamento["_id"]),
            "tipo": "agendamento_confirmado",
            "titulo": "Agendamento confirmado",
            "subtitulo": f"{cliente_nome} - {profissional_nome}",
            "tempo": formatar_tempo_relativo(tempo_diff),
            "icone": "check_circle",
            "cor": "green"
        })
    
    # Buscar últimos agendamentos cancelados
    agendamentos_cancelados = await db.agendamentos.find(
        {"status": "cancelado"}
    ).sort("atualizado_em", -1).limit(2).to_list(length=2)
    
    for agendamento in agendamentos_cancelados:
        cliente_id = agendamento.get("cliente_id")
        cliente = None
        if cliente_id:
            try:
                cliente_oid = ObjectId(cliente_id) if ObjectId.is_valid(cliente_id) else cliente_id
                cliente = await db.clientes.find_one({"_id": cliente_oid})
            except:
                pass
        
        tempo_diff = datetime.utcnow() - agendamento.get("atualizado_em", datetime.utcnow())
        data_hora = agendamento.get("data_hora")
        hora_texto = data_hora.strftime("%H:%M") if data_hora else "Sem horário"
        
        cliente_nome = cliente.get('nome', 'Cliente') if cliente else 'Cliente não informado'
        
        atividades.append({
            "id": str(agendamento["_id"]),
            "tipo": "agendamento_cancelado",
            "titulo": "Cancelamento",
            "subtitulo": f"{cliente_nome} - {hora_texto}",
            "tempo": formatar_tempo_relativo(tempo_diff),
            "icone": "event_busy",
            "cor": "orange"
        })
    
    # Ordenar por tempo (mais recente primeiro)
    atividades.sort(key=lambda x: parse_tempo_relativo(x["tempo"]))
    
    return atividades[:limit]

@router.get("/proximos-agendamentos", response_model=List[Dict])
async def obter_proximos_agendamentos(
    limit: int = Query(5, le=20),
    profissional_id: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user)
):
    """Retorna os próximos agendamentos"""
    db = get_database()
    
    # Filtro base: agendamentos futuros
    agora = datetime.utcnow()
    filtro = {
        "data_hora": {"$gte": agora},
        "status": {"$in": ["agendado", "confirmado"]}
    }
    
    # Filtro opcional por profissional
    if profissional_id and profissional_id != "todos":
        try:
            prof_oid = ObjectId(profissional_id) if ObjectId.is_valid(profissional_id) else profissional_id
            filtro["profissional_id"] = prof_oid
        except:
            pass
    
    agendamentos = await db.agendamentos.find(filtro).sort("data_hora", 1).limit(limit).to_list(length=limit)
    
    resultado = []
    for agendamento in agendamentos:
        # Buscar cliente (pode ser None para agendamentos públicos)
        cliente_id = agendamento.get("cliente_id")
        cliente = None
        if cliente_id:
            try:
                cliente_oid = ObjectId(cliente_id) if ObjectId.is_valid(cliente_id) else cliente_id
                cliente = await db.clientes.find_one({"_id": cliente_oid})
            except:
                pass
        
        # Buscar serviço (obrigatório)
        servico_id = agendamento.get("servico_id")
        servico = None
        if servico_id:
            try:
                servico_oid = ObjectId(servico_id) if ObjectId.is_valid(servico_id) else servico_id
                servico = await db.servicos.find_one({"_id": servico_oid})
            except:
                pass
        
        # Pular apenas se não tem serviço
        if not servico:
            continue
        
        data_hora = agendamento.get("data_hora")
        hoje = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        amanha = hoje + timedelta(days=1)
        
        if data_hora >= hoje and data_hora < amanha:
            data_texto = "Hoje"
        elif data_hora >= amanha and data_hora < amanha + timedelta(days=1):
            data_texto = "Amanhã"
        else:
            data_texto = data_hora.strftime("%d/%m")
        
        # Gerar nome e iniciais do cliente
        if cliente:
            cliente_nome = cliente.get("nome", "Cliente não informado")
            nome_partes = cliente_nome.split()
            if len(nome_partes) > 1:
                iniciais = nome_partes[0][0] + nome_partes[-1][0]
            else:
                iniciais = nome_partes[0][:2]
        else:
            cliente_nome = "Cliente não informado"
            iniciais = "??"
        
        resultado.append({
            "id": str(agendamento["_id"]),
            "cliente_nome": cliente_nome,
            "cliente_iniciais": iniciais.upper(),
            "servico_nome": servico.get("nome", "Sem serviço"),
            "data_hora": data_hora.isoformat(),
            "hora": data_hora.strftime("%H:%M"),
            "data_texto": data_texto,
            "status": agendamento.get("status", "agendado")
        })
    
    return resultado

@router.get("/dados-grafico", response_model=Dict)
async def obter_dados_grafico(
    periodo: str = Query("ultimos-7-dias", regex="^(ultimos-7-dias|ultimos-30-dias|este-mes)$"),
    profissional_id: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user)
):
    """Retorna dados para o gráfico de receita vs consultas"""
    db = get_database()
    
    # Calcular datas
    hoje = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if periodo == "ultimos-7-dias":
        data_inicio = hoje - timedelta(days=6)
        data_fim = hoje + timedelta(days=1)
        num_pontos = 7
    elif periodo == "ultimos-30-dias":
        data_inicio = hoje - timedelta(days=29)
        data_fim = hoje + timedelta(days=1)
        num_pontos = 30
    else:  # este-mes
        data_inicio = hoje.replace(day=1)
        data_fim = hoje + timedelta(days=1)
        num_pontos = hoje.day
    
    # Filtro base
    filtro = {
        "data_hora": {"$gte": data_inicio, "$lt": data_fim}
    }
    
    # Filtro opcional por profissional
    if profissional_id and profissional_id != "todos":
        try:
            filtro["profissional_id"] = ObjectId(profissional_id)
        except:
            pass
    
    agendamentos = await db.agendamentos.find(filtro).to_list(length=None)
    
    # Inicializar arrays de dados
    labels = []
    receitas = [0.0] * num_pontos
    consultas = [0] * num_pontos
    
    # Gerar labels (weekday(): 0=Segunda, 1=Terça, ... 6=Domingo)
    dias_semana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    for i in range(num_pontos):
        data = data_inicio + timedelta(days=i)
        if periodo == "ultimos-7-dias":
            labels.append(dias_semana[data.weekday()])
        else:
            labels.append(data.strftime("%d/%m"))
    
    # Processar agendamentos
    for agendamento in agendamentos:
        data_hora = agendamento.get("data_hora")
        if not data_hora:
            continue
        
        # Calcular índice do dia
        dias_diff = (data_hora.replace(hour=0, minute=0, second=0, microsecond=0) - data_inicio).days
        if 0 <= dias_diff < num_pontos:
            consultas[dias_diff] += 1
            
            # Somar receita se finalizado
            if agendamento.get("status") == "finalizado":
                servico_id = agendamento.get("servico_id")
                # Tentar converter para ObjectId se for string
                try:
                    if isinstance(servico_id, str):
                        servico_id = ObjectId(servico_id)
                except:
                    pass
                servico = await db.servicos.find_one({"_id": servico_id})
                if servico:
                    receitas[dias_diff] += servico.get("valor", 0)
    
    return {
        "labels": labels,
        "receitas": receitas,
        "consultas": consultas
    }

def formatar_tempo_relativo(tempo_diff: timedelta) -> str:
    """Formata timedelta em texto relativo"""
    segundos = int(tempo_diff.total_seconds())
    
    if segundos < 60:
        return "há poucos segundos"
    elif segundos < 3600:
        minutos = segundos // 60
        return f"há {minutos} min"
    elif segundos < 86400:
        horas = segundos // 3600
        return f"há {horas}h"
    else:
        dias = segundos // 86400
        return f"há {dias}d"

def parse_tempo_relativo(tempo_str: str) -> int:
    """Converte texto de tempo relativo em segundos para ordenação"""
    import re
    # Extrair números da string
    numeros = re.findall(r'\d+', tempo_str)
    if not numeros:
        return 0
    valor = int(numeros[0])
    
    if "segundo" in tempo_str:
        return valor
    elif "min" in tempo_str:
        return valor * 60
    elif "h" in tempo_str:
        return valor * 3600
    elif "d" in tempo_str:
        return valor * 86400
    return 0

