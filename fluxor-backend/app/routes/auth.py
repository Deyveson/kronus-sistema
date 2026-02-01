from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta, datetime
from bson import ObjectId

from app.schemas import LoginRequest, TokenResponse, UsuarioCreate, Usuario, UsuarioUpdate
from app.core.security import verify_password, get_password_hash, create_access_token, decode_token
from app.database.mongodb import get_database
from app.core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Autenticação"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    
    db = get_database()
    user_id = payload.get("sub")
    user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado"
        )
    
    user["_id"] = str(user["_id"])
    return Usuario(**user)

@router.post("/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    db = get_database()
    user = await db.usuarios.find_one({"email": login_data.email})
    
    if not user or not verify_password(login_data.senha, user["senha"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )
    
    if not user.get("ativo", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    user["_id"] = str(user["_id"])
    del user["senha"]
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        usuario=Usuario(**user)
    )

@router.post("/register", response_model=Usuario, status_code=status.HTTP_201_CREATED)
async def register(user_data: UsuarioCreate):
    try:
        db = get_database()
        
        # Verificar se o email já existe
        existing_user = await db.usuarios.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        user_dict = user_data.model_dump()
        user_dict["senha"] = get_password_hash(user_data.senha)
        user_dict["criado_em"] = datetime.utcnow()
        user_dict["atualizado_em"] = datetime.utcnow()
        
        result = await db.usuarios.insert_one(user_dict)
        created_user = await db.usuarios.find_one({"_id": result.inserted_id})
        created_user["_id"] = str(created_user["_id"])
        del created_user["senha"]
        
        return Usuario(**created_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao registrar usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar usuário: {str(e)}"
        )

@router.get("/me", response_model=Usuario)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=Usuario)
async def update_me(
    user_update: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_user)
):
    db = get_database()
    
    update_data = {k: v for k, v in user_update.model_dump().items() if v is not None}
    
    if "senha" in update_data:
        update_data["senha"] = get_password_hash(update_data["senha"])
    
    update_data["atualizado_em"] = datetime.utcnow()
    
    await db.usuarios.update_one(
        {"_id": ObjectId(current_user.id)},
        {"$set": update_data}
    )
    
    updated_user = await db.usuarios.find_one({"_id": ObjectId(current_user.id)})
    updated_user["_id"] = str(updated_user["_id"])
    del updated_user["senha"]
    
    return Usuario(**updated_user)
