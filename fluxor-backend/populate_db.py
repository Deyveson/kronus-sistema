"""
Script para popular o banco de dados com dados de exemplo
Baseado nas imagens do sistema
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from app.auth import get_password_hash

MONGODB_URL = "mongodb://admin:fluxor123@localhost:27017/fluxor?authSource=admin"

async def populate():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.fluxor
    
    print("Limpando banco de dados...")
    await db.profissionais.delete_many({})
    await db.servicos.delete_many({})
    await db.clientes.delete_many({})
    await db.usuarios.delete_many({})
    
    print("Criando usuário admin...")
    usuario_admin = {
        "nome": "Administrador",
        "email": "admin@fluxor.com",
        "senha": get_password_hash("admin123"),
        "tipo": "admin",
        "ativo": True,
        "criado_em": datetime.utcnow(),
        "atualizado_em": datetime.utcnow()
    }
    await db.usuarios.insert_one(usuario_admin)
    
    print("Criando profissionais...")
    profissionais = [
        {
            "nome": "Dr. João Silva",
            "especialidade": "Cardiologia",
            "telefone": "(11) 98765-1001",
            "email": "joao.silva@clinica.com",
            "registro_profissional": "CRM 12345",
            "acesso_sistema": True,
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Dra. Maria Santos",
            "especialidade": "Pediatria",
            "telefone": "(11) 98765-2002",
            "email": "maria.santos@clinica.com",
            "registro_profissional": "CRM 23456",
            "acesso_sistema": True,
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Dr. Pedro Oliveira",
            "especialidade": "Ortopedia",
            "telefone": "(11) 98765-3003",
            "email": "pedro.oliveira@clinica.com",
            "registro_profissional": "CRM 34567",
            "acesso_sistema": False,
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Dra. Rafaela Menezes",
            "especialidade": "Dermatologia",
            "telefone": "(11) 98765-4004",
            "email": "rafaela.menezes@clinica.com",
            "registro_profissional": "CRM 45678",
            "acesso_sistema": False,
            "ativo": False,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Dra. Juliana Pacheco",
            "especialidade": "Ginecologia",
            "telefone": "(11) 98765-5005",
            "email": "juliana.pacheco@clinica.com",
            "registro_profissional": "CRM 56789",
            "acesso_sistema": True,
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        }
    ]
    
    result_prof = await db.profissionais.insert_many(profissionais)
    prof_ids = list(result_prof.inserted_ids)
    
    print("Criando serviços...")
    servicos = [
        {
            "nome": "Consulta Cardiologia",
            "tipo": "Consulta",
            "descricao": "Consulta completa com cardiologista",
            "duracao": 60,
            "valor": 350.00,
            "profissionais_habilitados": [str(prof_ids[0])],  # Dr. João Silva
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Retorno Cardiologia",
            "tipo": "Retorno",
            "descricao": "Retorno para acompanhamento",
            "duracao": 30,
            "valor": 180.00,
            "profissionais_habilitados": [str(prof_ids[0])],  # Dr. João Silva
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Consulta Pediatria",
            "tipo": "Consulta",
            "descricao": "Consulta pediátrica completa",
            "duracao": 45,
            "valor": 280.00,
            "profissionais_habilitados": [str(prof_ids[1])],  # Dra. Maria Santos
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Avaliação Ortopédica",
            "tipo": "Avaliação",
            "descricao": "Avaliação ortopédica completa",
            "duracao": 50,
            "valor": 320.00,
            "profissionais_habilitados": [str(prof_ids[2])],  # Dr. Pedro Oliveira
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Limpeza Dental",
            "tipo": "Procedimento",
            "descricao": "Limpeza e profilaxia dental",
            "duracao": 40,
            "valor": 150.00,
            "profissionais_habilitados": [],  # Sem profissionais específicos
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Consulta Dermatologia",
            "tipo": "Consulta",
            "descricao": "Avaliação dermatológica",
            "duracao": 45,
            "valor": 300.00,
            "profissionais_habilitados": [str(prof_ids[3])],  # Dra. Rafaela Menezes
            "ativo": False,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        }
    ]
    
    await db.servicos.insert_many(servicos)
    
    print("Criando clientes de exemplo...")
    clientes = [
        {
            "nome": "João da Silva",
            "email": "joao.silva@email.com",
            "telefone": "(11) 91234-5678",
            "cpf": "123.456.789-00",
            "data_nascimento": datetime(1985, 5, 15),
            "endereco": "Rua das Flores, 123",
            "observacoes": "Cliente preferencial",
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Maria Oliveira",
            "email": "maria.oliveira@email.com",
            "telefone": "(11) 92345-6789",
            "cpf": "234.567.890-11",
            "data_nascimento": datetime(1990, 8, 20),
            "endereco": "Av. Paulista, 1000",
            "observacoes": "",
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        },
        {
            "nome": "Carlos Santos",
            "email": "carlos.santos@email.com",
            "telefone": "(11) 93456-7890",
            "cpf": "345.678.901-22",
            "data_nascimento": datetime(1978, 3, 10),
            "endereco": "Rua Augusta, 500",
            "observacoes": "Possui convênio",
            "ativo": True,
            "criado_em": datetime.utcnow(),
            "atualizado_em": datetime.utcnow()
        }
    ]
    
    await db.clientes.insert_many(clientes)
    
    print("✓ Banco de dados populado com sucesso!")
    print("\nCredenciais de acesso:")
    print("Email: admin@fluxor.com")
    print("Senha: admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(populate())
