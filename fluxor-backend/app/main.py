from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import get_settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.routes import auth, clientes, profissionais, servicos, agendamentos, lista_espera, relatorios, agendamento_online

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciador de contexto para inicialização e encerramento"""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    description="API para sistema de gestão de agendamentos e clientes",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota raiz
@app.get("/")
async def root():
    return {
        "message": f"Bem-vindo à {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}

# Incluir rotas
app.include_router(auth.router)
app.include_router(clientes.router)
app.include_router(profissionais.router)
app.include_router(servicos.router)
app.include_router(agendamentos.router)
app.include_router(lista_espera.router)
app.include_router(relatorios.router)
app.include_router(agendamento_online.router)
