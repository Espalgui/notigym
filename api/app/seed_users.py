"""
Seed script: programmes d'entraînement, objectifs nutrition et mesures corporelles
pour Espalgui (Guillaume) et Eve.
"""
import uuid
from datetime import datetime, date, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.exercise import Exercise
from app.models.workout import WorkoutProgram, ProgramDay, ProgramExercise
from app.models.nutrition import NutritionGoal
from app.models.body import BodyMeasurement


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

async def _get_user(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def _get_exercise(db: AsyncSession, name_en: str) -> Exercise | None:
    result = await db.execute(select(Exercise).where(Exercise.name_en == name_en))
    return result.scalar_one_or_none()


async def _user_has_program_named(db: AsyncSession, user_id: uuid.UUID, name: str) -> bool:
    result = await db.execute(
        select(WorkoutProgram.id).where(
            WorkoutProgram.user_id == user_id,
            WorkoutProgram.name == name,
        ).limit(1)
    )
    return result.scalar_one_or_none() is not None


def _rest(s: str) -> int:
    """Parse rest string like '2\\'30' or '1\\'30' or '1\\'' into seconds."""
    s = s.strip().replace("'", "").replace("'", "").replace("′", "")
    if len(s) <= 2 and s.isdigit():
        return int(s) * 60
    # Try parsing as M:SS or M'SS
    parts = s.replace(":", "").replace("min", "")
    if len(parts) >= 3:
        return int(parts[0]) * 60 + int(parts[1:])
    return int(s) * 60 if s.isdigit() else 90


# ──────────────────────────────────────────────────────────────
# ESPALGUI — Programme Recomposition Corporelle (5 jours)
# ──────────────────────────────────────────────────────────────

ESPALGUI_PROGRAM = {
    "name": "Recomposition Corporelle — PPL/Upper/Lower",
    "description": "Programme 5 jours Push/Pull/Legs/Upper Body/Lower Body+Core. "
                   "Surcharge progressive, tempo contrôlé 3-1-1, poids de corps avancé. "
                   "16-20 séries par groupe/semaine.",
    "program_type": "push_pull_legs",
    "days": [
        {
            "name": "Jour 1 — PUSH (Pectoraux / Épaules / Triceps)",
            "exercises": [
                # Exercice name_en, sets, reps_min, reps_max, rest_seconds, notes
                ("Bench Press", 4, 6, 8, 150, "Surcharge progressive"),
                ("Dips (Chest)", 4, 8, 10, 120, "Ajouter poids progressivement (lestés)"),
                ("Incline Dumbbell Press", 3, 10, 12, 90, "Contrôler la descente"),
                ("Cable Fly", 3, 12, 15, 60, "Squeeze en haut"),
                ("Lateral Raise", 4, 12, 15, 60, "Léger, contrôlé"),
                ("Diamond Push-Up", 3, 15, 25, 90, "Finisher, tempo lent"),
                ("Tricep Pushdown", 3, 12, 15, 60, "Corde, serrer en bas"),
            ],
        },
        {
            "name": "Jour 2 — PULL (Dos / Biceps / Arrière épaule)",
            "exercises": [
                ("Pull-Up", 4, 6, 8, 150, "Lestées, surcharge progressive (pronation)"),
                ("Barbell Row", 4, 8, 10, 120, "Buste 45°, tirer vers nombril"),
                ("Inverted Row", 3, 6, 10, 120, "Progression front lever rows"),
                ("Dumbbell Row", 3, 10, 12, 90, "Stretch en bas"),
                ("Face Pull", 4, 15, 20, 60, "Rotation externe en haut"),
                ("EZ Bar Curl", 3, 10, 12, 90, "Strict, pas de triche"),
                ("Incline Dumbbell Curl", 3, 12, 15, 60, "Stretch max en bas"),
            ],
        },
        {
            "name": "Jour 3 — LEGS (Quadriceps / Ischio / Mollets)",
            "exercises": [
                ("Squat", 4, 6, 8, 180, "Surcharge progressive, full ROM"),
                ("Leg Press", 4, 10, 12, 120, "Pieds hauts = + ischio"),
                ("Bulgarian Split Squat", 3, 10, 10, 90, "Haltères, contrôler"),
                ("Lying Leg Curl", 4, 10, 12, 90, "Squeeze en haut"),
                ("Pistol Squat", 3, 6, 8, 120, "Poids de corps, progresser"),
                ("Standing Calf Raise", 4, 12, 15, 60, "Full ROM, pause en bas"),
                ("Seated Calf Raise", 3, 15, 20, 60, "Soléaire, tempo lent"),
            ],
        },
        {
            "name": "Jour 4 — UPPER BODY (Haut du corps complet)",
            "exercises": [
                ("Muscle Up", 4, 3, 6, 150, "Explosif, qualité du mouvement"),
                ("Dumbbell Shoulder Press", 4, 8, 10, 120, "Core engagé, debout"),
                ("Chin-Up", 3, 8, 12, 120, "Contrôlé, full ROM"),
                ("Dips (Chest)", 3, 15, 25, 90, "Parallèles PDC, tempo 3-1-1"),
                ("Lateral Raise", 3, 10, 10, 90, "Superset avec Front Raise 10+10"),
                ("Hammer Curl", 3, 10, 12, 60, "Brachial, important pour bras"),
                ("Bench Dip", 3, 12, 15, 60, "Finisher triceps, lesté"),
            ],
        },
        {
            "name": "Jour 5 — LOWER BODY + CORE",
            "exercises": [
                ("Romanian Deadlift", 4, 8, 10, 150, "Stretch ischio, dos neutre"),
                ("Hack Squat", 4, 10, 12, 120, "Volume quadriceps (ou goblet squat)"),
                ("Hip Thrust", 4, 10, 12, 120, "Barre, squeeze fessiers en haut"),
                ("Walking Lunges", 3, 12, 12, 90, "Haltères, dynamique"),
                ("Ab Wheel Rollout", 3, 10, 15, 90, "Core profond"),
                ("Hanging Leg Raise", 4, 12, 15, 60, "Poids de corps, contrôler"),
                ("Dragon Flag", 3, 6, 10, 90, "Core avancé street workout"),
            ],
        },
    ],
}


# ──────────────────────────────────────────────────────────────
# EVE — Programme Transformation & Perte de Poids (5 jours)
# ──────────────────────────────────────────────────────────────

EVE_PROGRAM = {
    "name": "Transformation & Perte de Poids",
    "description": "Programme 5 jours — 2x bas du corps + 1x haut du corps + 1x cardio circuit + 1x full body. "
                   "Charges légères à modérées, reps moyennes à hautes. Objectif : -20 kg, tonification.",
    "program_type": "custom",
    "days": [
        {
            "name": "Jour 1 — Lundi : BAS DU CORPS (Fessiers & Cuisses)",
            "exercises": [
                ("Goblet Squat", 4, 15, 15, 60, "Descendre cuisses parallèles, genoux vers l'extérieur"),
                ("Lunges", 3, 12, 12, 60, "Fentes avant alternées, grand pas, genou arrière frôle le sol"),
                ("Hip Thrust", 4, 15, 15, 60, "Banc + barre, serrer fort les fessiers en haut, pause 2s"),
                ("Leg Press", 3, 15, 15, 60, "Pieds hauts sur la plateforme pour cibler les fessiers"),
                ("Hip Abduction Machine", 3, 20, 20, 45, "Contrôler le mouvement, excentrique lent"),
                ("Standing Calf Raise", 3, 20, 20, 45, "Amplitude complète, pause en haut"),
                ("Treadmill", 1, 1, 1, 0, "15 min marche rapide inclinée 8-12%, 5-6 km/h"),
            ],
        },
        {
            "name": "Jour 2 — Mardi : HAUT DU CORPS & CORE",
            "exercises": [
                ("Cable Row", 3, 15, 15, 60, "Tirage horizontal, serrer les omoplates, dos droit"),
                ("Lat Pulldown", 3, 12, 12, 60, "Tirer vers la poitrine, coudes vers le bas"),
                ("Seated Dumbbell Press", 3, 12, 12, 60, "Charges légères, mouvement contrôlé"),
                ("Lateral Raise", 3, 15, 15, 45, "Petits haltères, ne pas monter au-dessus des épaules"),
                ("Push-Up", 3, 10, 12, 60, "Sur genoux ou inclinées, descendre lentement"),
                ("Dumbbell Curl", 3, 15, 15, 45, "Charges légères, contrôle total"),
                ("Tricep Pushdown", 3, 15, 15, 45, "Coudes fixés le long du corps"),
                ("Plank", 3, 1, 1, 45, "30-45s, corps aligné, serrer abdos et fessiers"),
                ("Crunch", 3, 20, 20, 30, "Mouvement court, ne pas tirer sur la nuque"),
            ],
        },
        {
            "name": "Jour 3 — Mercredi : CARDIO ACTIF & CIRCUIT",
            "exercises": [
                ("Squat", 3, 15, 15, 30, "Circuit 1 : enchaîner avec pompes genoux sans pause"),
                ("Push-Up", 3, 10, 10, 30, "Circuit 1 : sur genoux, après squats"),
                ("Lateral Lunge", 3, 12, 12, 30, "Circuit 2 : alterner droite/gauche"),
                ("Dumbbell Row", 3, 12, 12, 30, "Circuit 2 : après fentes latérales"),
                ("Jumping Jacks", 3, 20, 20, 30, "Circuit 3 : adapter sans saut si besoin"),
                ("Plank", 3, 1, 1, 30, "Circuit 3 : 30s après jumping jacks"),
                ("Elliptical", 1, 1, 1, 0, "20 min intensité modérée, résistance progressive"),
                ("Side Plank", 3, 1, 1, 30, "20-30s chaque côté, hanches alignées"),
                ("Mountain Climber", 3, 12, 12, 30, "Version lente, abdos engagés"),
            ],
        },
        {
            "name": "Jour 4 — Jeudi : BAS DU CORPS V2 (Fessiers & Ischio)",
            "exercises": [
                ("Sumo Deadlift", 4, 15, 15, 60, "Sumo squat haltère, pieds très écartés, pointes vers l'extérieur"),
                ("Dumbbell Romanian Deadlift", 4, 12, 12, 60, "Dos plat, sentir l'étirement ischio-jambiers"),
                ("Step Up", 3, 12, 12, 60, "Avec haltères, pousser avec le talon, serrer le fessier en haut"),
                ("Lying Leg Curl", 3, 15, 15, 45, "Mouvement lent et contrôlé"),
                ("Glute Bridge Hold", 3, 12, 12, 45, "Une jambe, pause 2s en haut, serrer le fessier"),
                ("Hip Abduction Machine", 3, 20, 20, 45, "Adducteur machine, contrôle total, pas d'élan"),
                ("Treadmill", 1, 1, 1, 0, "15 min marche rapide inclinée 10-12%, 5.5-6 km/h"),
            ],
        },
        {
            "name": "Jour 5 — Vendredi : FULL BODY & CARDIO",
            "exercises": [
                ("Thruster", 3, 12, 12, 60, "Squat + press épaules, un seul mouvement fluide"),
                ("Reverse Lunges", 3, 12, 12, 60, "Grand pas en arrière, buste droit"),
                ("Dumbbell Row", 3, 12, 12, 45, "Un bras, dos plat, serrer l'omoplate"),
                ("Hip Thrust", 3, 15, 15, 60, "Machine ou banc, squeeze fessier en haut"),
                ("Incline Push Up", 3, 10, 12, 60, "Poitrine vers le support"),
                ("V-Up", 3, 15, 15, 30, "Modifié jambes pliées, abdos engagés"),
                ("Russian Twist", 3, 20, 20, 30, "Avec médecine ball, pieds au sol pour débuter"),
                ("Rowing Machine", 1, 1, 1, 0, "15 min intensité modérée à soutenue"),
            ],
        },
    ],
}


# ──────────────────────────────────────────────────────────────
# Main seed function
# ──────────────────────────────────────────────────────────────

async def seed_user_data(db: AsyncSession) -> None:
    """Seed programmes, nutrition goals et mesures corporelles pour Espalgui et Eve."""

    # ── Espalgui ──────────────────────────────────────────────
    espalgui = await _get_user(db, "Espalgui")
    if espalgui and not await _user_has_program_named(db, espalgui.id, ESPALGUI_PROGRAM["name"]):
        print("[seed] Creating program for Espalgui...")
        await _create_program(db, espalgui.id, ESPALGUI_PROGRAM)

        # Nutrition goal — jours d'entraînement (principal)
        goal = NutritionGoal(
            id=uuid.uuid4(),
            user_id=espalgui.id,
            calories=2700,
            protein_g=175.0,
            carbs_g=310.0,
            fat_g=70.0,
            water_goal_ml=3000,
            is_active=True,
        )
        db.add(goal)

        # Body measurement — bilan Visbody 28 mars 2026
        measurement = BodyMeasurement(
            id=uuid.uuid4(),
            user_id=espalgui.id,
            measured_at=datetime(2026, 3, 28, 10, 0, tzinfo=timezone.utc),
            weight_kg=69.7,
            body_fat_pct=22.0,
            notes="Bilan Visbody — Masse musculaire: 49.8 kg | MGC: 15.4 kg | "
                  "IMC: 22.8 | RTH: 1.04 | Graisse viscérale: 5.0 | "
                  "Métabolisme de base: 1503 kcal/j",
        )
        db.add(measurement)

        # Update user profile
        espalgui.height_cm = 175.0
        espalgui.gender = "male"
        espalgui.goal = "recomposition"
        espalgui.training_type = "mixed"

        await db.commit()
        print("[seed] Espalgui: program + nutrition + body ✓")

    # ── Eve (ivy) ────────────────────────────────────────────
    eve = await _get_user(db, "ivy")
    if eve and not await _user_has_program_named(db, eve.id, EVE_PROGRAM["name"]):
        print("[seed] Creating program for Eve...")
        await _create_program(db, eve.id, EVE_PROGRAM)

        # Nutrition goal — déficit 1650 kcal
        goal = NutritionGoal(
            id=uuid.uuid4(),
            user_id=eve.id,
            calories=1650,
            protein_g=140.0,
            carbs_g=140.0,
            fat_g=55.0,
            water_goal_ml=2500,
            is_active=True,
        )
        db.add(goal)

        # Body measurement — bilan Visbody 28 mars 2026
        measurement = BodyMeasurement(
            id=uuid.uuid4(),
            user_id=eve.id,
            measured_at=datetime(2026, 3, 28, 10, 0, tzinfo=timezone.utc),
            weight_kg=97.4,
            body_fat_pct=52.4,
            notes="Bilan Visbody — Masse musculaire: 44.2 kg | MGC: 51.0 kg | "
                  "IMC: 35.8 | RTH: 1.09 | Graisse viscérale: 20.0 | "
                  "Métabolisme de base: 1406 kcal/j | Âge métabolique: 44 ans",
        )
        db.add(measurement)

        # Update user profile
        eve.height_cm = 165.0
        eve.gender = "female"
        eve.goal = "weight_loss"
        eve.training_type = "mixed"

        await db.commit()
        print("[seed] Eve: program + nutrition + body ✓")


async def _create_program(
    db: AsyncSession, user_id: uuid.UUID, prog_data: dict
) -> None:
    program = WorkoutProgram(
        id=uuid.uuid4(),
        user_id=user_id,
        name=prog_data["name"],
        description=prog_data["description"],
        program_type=prog_data["program_type"],
        is_active=True,
        is_public=False,
        is_favorite=True,
    )
    db.add(program)
    await db.flush()

    for day_idx, day_data in enumerate(prog_data["days"]):
        day = ProgramDay(
            id=uuid.uuid4(),
            program_id=program.id,
            name=day_data["name"],
            day_order=day_idx + 1,
        )
        db.add(day)
        await db.flush()

        for ex_idx, (name_en, sets, reps_min, reps_max, rest, notes) in enumerate(
            day_data["exercises"]
        ):
            exercise = await _get_exercise(db, name_en)
            if not exercise:
                print(f"  [warn] Exercise not found: {name_en}")
                continue

            pe = ProgramExercise(
                id=uuid.uuid4(),
                program_day_id=day.id,
                exercise_id=exercise.id,
                exercise_order=ex_idx + 1,
                sets=sets,
                reps_min=reps_min,
                reps_max=reps_max,
                rest_seconds=rest,
                notes=notes,
            )
            db.add(pe)

    await db.flush()
