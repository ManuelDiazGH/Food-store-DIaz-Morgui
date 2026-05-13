"""Validadores reutilizables para schemas Pydantic.

Provee validadores de formato que se comparten entre módulos.
"""
import re
from typing import Optional

# Teléfono argentino: +54911XXXXXXXX, +54XXXXXXXXXX, o formato local
# Acepta: +54 9 11 1234-5678, +5491112345678, 01112345678, 12345678
# Requisito US-062: validación de formato de teléfono
PHONE_REGEX = re.compile(
    r'^(\+54[9]?\d{10}|\+54\s9\s\d{2,4}\s\d{4,8}|\d{6,15})$'
)


def validate_phone(phone: Optional[str]) -> Optional[str]:
    """Valida formato de teléfono argentino.

    Acepta formatos:
    - Internacional: +5491112345678
    - Con espacios: +54 9 11 1234 5678
    - Local: 01112345678, 12345678

    Args:
        phone: Número de teléfono a validar. None es válido (campo opcional).

    Returns:
        El teléfono sanitizado (sin espacios extra) o None.

    Raises:
        ValueError: Si el formato no es válido.
    """
    if phone is None:
        return None

    # Sanitizar: eliminar espacios al inicio/final y espacios internos excesivos
    sanitized = phone.strip()

    if not sanitized:
        return None

    # Eliminar espacios internos para validar el patrón base
    compact = re.sub(r'\s+', '', sanitized)

    if not PHONE_REGEX.match(compact):
        raise ValueError(
            'Formato de teléfono inválido. '
            'Usá formato internacional (+5491112345678) o local (12345678).'
        )

    return sanitized