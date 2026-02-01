"""
Utilitários para manipulação de datas e fuso horário
"""
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from app.core.config import get_settings


def get_timezone():
    """Retorna o objeto timezone configurado"""
    settings = get_settings()
    return ZoneInfo(settings.TIMEZONE)


def now_local():
    """Retorna a data/hora atual no fuso horário configurado"""
    tz = get_timezone()
    return datetime.now(tz)


def to_local(dt: datetime) -> datetime:
    """Converte uma datetime UTC para o fuso horário local"""
    if dt is None:
        return None
    
    tz = get_timezone()
    
    # Se não tem timezone info, assume UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    return dt.astimezone(tz)


def to_utc(dt: datetime) -> datetime:
    """Converte uma datetime local para UTC"""
    if dt is None:
        return None
    
    tz = get_timezone()
    
    # Se não tem timezone info, assume que é do fuso local
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=tz)
    
    return dt.astimezone(timezone.utc)


def parse_datetime_local(dt_string: str) -> datetime:
    """
    Parseia uma string de datetime e retorna como datetime no fuso local.
    Aceita formatos ISO 8601 com ou sem timezone.
    """
    if not dt_string:
        return None
    
    tz = get_timezone()
    
    # Tentar parsear como ISO
    try:
        # Se tem 'Z' no final, é UTC
        if dt_string.endswith('Z'):
            dt = datetime.fromisoformat(dt_string.replace('Z', '+00:00'))
            return dt.astimezone(tz).replace(tzinfo=None)
        
        # Se tem offset (+/-HH:MM), tem timezone
        if '+' in dt_string[-6:] or (dt_string[-6:].count('-') > 0 and 'T' in dt_string):
            dt = datetime.fromisoformat(dt_string)
            return dt.astimezone(tz).replace(tzinfo=None)
        
        # Sem timezone, assume que já é local
        dt = datetime.fromisoformat(dt_string)
        return dt
    except Exception:
        pass
    
    return None


def format_datetime_iso(dt: datetime, include_tz: bool = False) -> str:
    """
    Formata datetime para ISO 8601.
    Se include_tz=True, inclui o offset do timezone.
    """
    if dt is None:
        return None
    
    if include_tz:
        tz = get_timezone()
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=tz)
        return dt.isoformat()
    
    return dt.replace(tzinfo=None).isoformat()
