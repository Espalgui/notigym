import bcrypt


def hash_backup_codes(codes: list[str]) -> list[str]:
    """Hache chaque code de secours avec bcrypt avant stockage en BDD."""
    return [bcrypt.hashpw(code.upper().encode(), bcrypt.gensalt()).decode() for code in codes]


def verify_and_consume_backup_code(code: str, stored_codes: list[str]) -> tuple[bool, list[str]]:
    """
    Vérifie si le code correspond à un code stocké et le consomme.
    Supporte les codes hachés (nouveaux) et plain text (migration).
    Retourne (valide, liste_restante).
    """
    code_upper = code.upper()
    for i, stored in enumerate(stored_codes):
        matched = False
        if stored.startswith("$2b$") or stored.startswith("$2a$"):
            # Format haché (nouveau)
            matched = bcrypt.checkpw(code_upper.encode(), stored.encode())
        else:
            # Format plain text (anciens comptes — période de migration)
            matched = code_upper == stored

        if matched:
            remaining = stored_codes[:i] + stored_codes[i + 1:]
            return True, remaining

    return False, stored_codes
