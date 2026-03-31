from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import Achievement

ACHIEVEMENTS = [
    # Sessions
    {"key": "first_session", "name_fr": "Premier pas", "name_en": "First Step", "description_fr": "Complétez votre première séance", "description_en": "Complete your first session", "icon": "🏋️", "category": "sessions", "threshold": 1},
    {"key": "sessions_10", "name_fr": "Régulier", "name_en": "Regular", "description_fr": "Complétez 10 séances", "description_en": "Complete 10 sessions", "icon": "💪", "category": "sessions", "threshold": 10},
    {"key": "sessions_50", "name_fr": "Dévoué", "name_en": "Dedicated", "description_fr": "Complétez 50 séances", "description_en": "Complete 50 sessions", "icon": "🔥", "category": "sessions", "threshold": 50},
    {"key": "sessions_100", "name_fr": "Centurion", "name_en": "Centurion", "description_fr": "Complétez 100 séances", "description_en": "Complete 100 sessions", "icon": "⚡", "category": "sessions", "threshold": 100},
    {"key": "sessions_500", "name_fr": "Légende", "name_en": "Legend", "description_fr": "Complétez 500 séances", "description_en": "Complete 500 sessions", "icon": "👑", "category": "sessions", "threshold": 500},
    # Streaks
    {"key": "streak_7", "name_fr": "Semaine parfaite", "name_en": "Perfect Week", "description_fr": "7 jours d'entraînement consécutifs", "description_en": "7 consecutive training days", "icon": "📅", "category": "streaks", "threshold": 7},
    {"key": "streak_30", "name_fr": "Mois de fer", "name_en": "Iron Month", "description_fr": "30 jours d'entraînement consécutifs", "description_en": "30 consecutive training days", "icon": "🗓️", "category": "streaks", "threshold": 30},
    {"key": "streak_100", "name_fr": "Inarrêtable", "name_en": "Unstoppable", "description_fr": "100 jours d'entraînement consécutifs", "description_en": "100 consecutive training days", "icon": "🏆", "category": "streaks", "threshold": 100},
    # PRs
    {"key": "first_pr", "name_fr": "Record battu", "name_en": "Record Breaker", "description_fr": "Battez votre premier record personnel", "description_en": "Beat your first personal record", "icon": "🥇", "category": "prs", "threshold": 1},
    {"key": "prs_10", "name_fr": "Collectionneur", "name_en": "Collector", "description_fr": "Battez 10 records personnels", "description_en": "Beat 10 personal records", "icon": "🥈", "category": "prs", "threshold": 10},
    {"key": "prs_50", "name_fr": "Machine à records", "name_en": "Record Machine", "description_fr": "Battez 50 records personnels", "description_en": "Beat 50 personal records", "icon": "🥉", "category": "prs", "threshold": 50},
    # Volume
    {"key": "volume_1000", "name_fr": "Une tonne", "name_en": "One Ton", "description_fr": "Soulevez 1 000 kg de volume total", "description_en": "Lift 1,000 kg total volume", "icon": "🪨", "category": "volume", "threshold": 1000},
    {"key": "volume_10000", "name_fr": "Dix tonnes", "name_en": "Ten Tons", "description_fr": "Soulevez 10 000 kg de volume total", "description_en": "Lift 10,000 kg total volume", "icon": "🏗️", "category": "volume", "threshold": 10000},
    {"key": "volume_100000", "name_fr": "Titan", "name_en": "Titan", "description_fr": "Soulevez 100 000 kg de volume total", "description_en": "Lift 100,000 kg total volume", "icon": "🌋", "category": "volume", "threshold": 100000},
    # Fun
    {"key": "early_bird", "name_fr": "Lève-tôt", "name_en": "Early Bird", "description_fr": "Commencez une séance avant 7h", "description_en": "Start a session before 7am", "icon": "🌅", "category": "fun", "threshold": 1},
    {"key": "night_owl", "name_fr": "Noctambule", "name_en": "Night Owl", "description_fr": "Commencez une séance après 21h", "description_en": "Start a session after 9pm", "icon": "🌙", "category": "fun", "threshold": 1},
    # Community
    {"key": "first_post", "name_fr": "Social", "name_en": "Social", "description_fr": "Publiez votre premier post", "description_en": "Publish your first post", "icon": "💬", "category": "community", "threshold": 1},
    {"key": "first_recipe", "name_fr": "Chef cuisinier", "name_en": "Master Chef", "description_fr": "Partagez votre première recette", "description_en": "Share your first recipe", "icon": "👨‍🍳", "category": "community", "threshold": 1},
]


async def seed_achievements(db: AsyncSession) -> None:
    result = await db.execute(select(func.count()).select_from(Achievement))
    count = result.scalar() or 0
    if count > 0:
        return

    for data in ACHIEVEMENTS:
        db.add(Achievement(**data))
    await db.commit()
    print(f"[seed] {len(ACHIEVEMENTS)} achievements seeded ✓")
