"""
Schemas da aplicação - Exportações centralizadas
"""
from .base import PyObjectId
from .usuario import UsuarioBase, UsuarioCreate, UsuarioUpdate, Usuario
from .cliente import ClienteBase, ClienteCreate, ClienteUpdate, Cliente
from .profissional import ProfissionalBase, ProfissionalCreate, ProfissionalUpdate, Profissional
from .servico import ServicoBase, ServicoCreate, ServicoUpdate, Servico
from .agendamento import AgendamentoBase, AgendamentoCreate, AgendamentoUpdate, Agendamento, AgendamentoExpandido
from .lista_espera import ListaEsperaBase, ListaEsperaCreate, ListaEsperaUpdate, ListaEspera, ListaEsperaExpandida
from .auth import LoginRequest, TokenResponse


__all__ = [
    # Base
    "PyObjectId",
    
    # Usuario
    "UsuarioBase",
    "UsuarioCreate",
    "UsuarioUpdate",
    "Usuario",
    
    # Cliente
    "ClienteBase",
    "ClienteCreate",
    "ClienteUpdate",
    "Cliente",
    
    # Profissional
    "ProfissionalBase",
    "ProfissionalCreate",
    "ProfissionalUpdate",
    "Profissional",
    
    # Servico
    "ServicoBase",
    "ServicoCreate",
    "ServicoUpdate",
    "Servico",
    
    # Agendamento
    "AgendamentoBase",
    "AgendamentoCreate",
    "AgendamentoUpdate",
    "Agendamento",
    "AgendamentoExpandido",
    
    # Lista de Espera
    "ListaEsperaBase",
    "ListaEsperaCreate",
    "ListaEsperaUpdate",
    "ListaEspera",
    "ListaEsperaExpandida",
    
    # Auth
    "LoginRequest",
    "TokenResponse",
]
