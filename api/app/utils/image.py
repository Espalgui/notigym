from io import BytesIO

from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError

ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}


def validate_image(contents: bytes, max_bytes: int) -> tuple[Image.Image, str]:
    """Vérifie le contenu réel de l'image (pas seulement le Content-Type) et retourne (img, ext)."""
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large (max {max_bytes // (1024 * 1024)}MB)",
        )
    try:
        img = Image.open(BytesIO(contents))
        img.verify()  # Détecte les images corrompues ou malformées
    except (UnidentifiedImageError, Exception):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or corrupted image file")

    # Re-ouvrir après verify() qui ferme le fichier
    img = Image.open(BytesIO(contents))

    if img.format not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed",
        )

    return img, ALLOWED_FORMATS[img.format]
