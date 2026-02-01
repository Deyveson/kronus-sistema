"""
Conexão e gerenciamento do MongoDB
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import get_settings

settings = get_settings()


class MongoDB:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None


mongodb = MongoDB()


async def connect_to_mongo():
    """Conecta ao MongoDB"""
    mongodb.client = AsyncIOMotorClient(settings.MONGODB_URL)
    mongodb.database = mongodb.client[settings.DATABASE_NAME]
    print(f"✓ Conectado ao MongoDB: {settings.DATABASE_NAME}")


async def close_mongo_connection():
    """Fecha conexão com MongoDB"""
    if mongodb.client:
        mongodb.client.close()
        print("✓ Conexão MongoDB fechada")


def get_database() -> AsyncIOMotorDatabase:
    """Retorna instância do database"""
    return mongodb.database


def get_collection(collection_name: str):
    """Retorna uma collection do MongoDB"""
    return mongodb.database[collection_name]
