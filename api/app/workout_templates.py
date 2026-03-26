"""
Programmes d'entraînement prédéfinis.
Filtrés par goal, training_type et gender de l'utilisateur.
"""

from typing import Any

TEMPLATES: list[dict[str, Any]] = [
    # ─────────────────────────────────────────────────────────────
    # UNIVERSEL (tous genres)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "ppl_bulk",
        "name_fr": "Push Pull Legs – Prise de masse",
        "name_en": "Push Pull Legs – Mass Gain",
        "description_fr": "Programme classique 6j réparti en poussé / tiré / jambes. Idéal pour l'hypertrophie avec poids libres.",
        "description_en": "Classic 6-day split: push / pull / legs. Ideal for hypertrophy with free weights.",
        "program_type": "push_pull_legs",
        "days_per_week": 6,
        "goals": ["bulk", "recomp"],
        "training_types": ["musculation", "machines", "mixed"],
        "genders": [],
        "days": [
            {
                "name_fr": "Push A – Poitrine / Épaules / Triceps",
                "name_en": "Push A – Chest / Shoulders / Triceps",
                "exercises": [
                    {"name_key": "exercise.bench_press",          "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.incline_dumbbell_press","sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.cable_fly",             "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.overhead_press",        "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.lateral_raise",         "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.tricep_pushdown",       "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.skull_crusher",         "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 75},
                ],
            },
            {
                "name_fr": "Pull A – Dos / Biceps",
                "name_en": "Pull A – Back / Biceps",
                "exercises": [
                    {"name_key": "exercise.deadlift",              "sets": 4, "reps_min": 6,  "reps_max": 8,  "rest_seconds": 180},
                    {"name_key": "exercise.barbell_row",           "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.lat_pulldown",          "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.cable_row",             "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.face_pull",             "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.barbell_curl",          "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 60},
                    {"name_key": "exercise.hammer_curl",           "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Legs A – Quadriceps focus",
                "name_en": "Legs A – Quad focus",
                "exercises": [
                    {"name_key": "exercise.squat",                 "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 180},
                    {"name_key": "exercise.leg_press",             "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 120},
                    {"name_key": "exercise.leg_extension",         "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.romanian_deadlift",     "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.lying_leg_curl",        "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.standing_calf_raise",   "sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Push B – Poitrine / Épaules / Triceps",
                "name_en": "Push B – Chest / Shoulders / Triceps",
                "exercises": [
                    {"name_key": "exercise.incline_bench_press",   "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.dumbbell_bench_press",  "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.pec_deck",              "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.dumbbell_shoulder_press","sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.cable_lateral_raise",   "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.overhead_tricep_extension","sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.bench_dip",             "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Pull B – Dos / Biceps",
                "name_en": "Pull B – Back / Biceps",
                "exercises": [
                    {"name_key": "exercise.pull_up",               "sets": 4, "reps_min": 6,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.dumbbell_row",          "sets": 4, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.close_grip_lat_pulldown","sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.straight_arm_pulldown", "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.reverse_fly",           "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.preacher_curl",         "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 60},
                    {"name_key": "exercise.concentration_curl",    "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Legs B – Ischio / Fessiers",
                "name_en": "Legs B – Hamstrings / Glutes",
                "exercises": [
                    {"name_key": "exercise.romanian_deadlift",     "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.bulgarian_split_squat", "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.hip_thrust",            "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.seated_leg_curl",       "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.walking_lunges",        "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.seated_calf_raise",     "sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                ],
            },
        ],
    },

    {
        "id": "strength_5x5",
        "name_fr": "Force 5×5 – Powerlifting",
        "name_en": "Strength 5×5 – Powerlifting",
        "description_fr": "Programme force basé sur les mouvements de base (squat, développé couché, soulevé de terre). Progressions linéaires.",
        "description_en": "Strength program focused on compound lifts. Linear progression.",
        "program_type": "custom",
        "days_per_week": 3,
        "goals": ["strength"],
        "training_types": ["musculation", "mixed"],
        "genders": [],
        "days": [
            {
                "name_fr": "Séance A",
                "name_en": "Session A",
                "exercises": [
                    {"name_key": "exercise.squat",       "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 240},
                    {"name_key": "exercise.bench_press", "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 180},
                    {"name_key": "exercise.barbell_row", "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 180},
                ],
            },
            {
                "name_fr": "Séance B",
                "name_en": "Session B",
                "exercises": [
                    {"name_key": "exercise.squat",          "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 240},
                    {"name_key": "exercise.overhead_press", "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 180},
                    {"name_key": "exercise.deadlift",       "sets": 1, "reps_min": 5, "reps_max": 5, "rest_seconds": 300},
                ],
            },
        ],
    },

    {
        "id": "fullbody_calisthenics",
        "name_fr": "Full Body – Poids de corps",
        "name_en": "Full Body – Calisthenics",
        "description_fr": "Programme complet sans équipement, 3 jours par semaine. Idéal à la maison ou en voyage.",
        "description_en": "3-day full body program with no equipment. Perfect for home or travel.",
        "program_type": "full_body",
        "days_per_week": 3,
        "goals": ["bulk", "maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "days": [
            {
                "name_fr": "Jour 1 – Poussée / Jambes",
                "name_en": "Day 1 – Push / Legs",
                "exercises": [
                    {"name_key": "exercise.push_up",           "sets": 4, "reps_min": 10, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.squat",             "sets": 4, "reps_min": 15, "reps_max": 25, "rest_seconds": 60},
                    {"name_key": "exercise.tricep_dips",       "sets": 3, "reps_min": 8,  "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.walking_lunges",    "sets": 3, "reps_min": 12, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.plank",             "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 45},
                ],
            },
            {
                "name_fr": "Jour 2 – Traction / Gainage",
                "name_en": "Day 2 – Pull / Core",
                "exercises": [
                    {"name_key": "exercise.pull_up",           "sets": 4, "reps_min": 5,  "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.inverted_row",      "sets": 3, "reps_min": 8,  "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.chin_up",           "sets": 3, "reps_min": 5,  "reps_max": 10, "rest_seconds": 90},
                    {"name_key": "exercise.hanging_knee_raise","sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.ab_wheel_rollout",  "sets": 3, "reps_min": 8,  "reps_max": 12, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Jour 3 – Full body",
                "name_en": "Day 3 – Full body",
                "exercises": [
                    {"name_key": "exercise.wide_push_up",          "sets": 4, "reps_min": 10, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.bulgarian_split_squat", "sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.diamond_push_up",       "sets": 3, "reps_min": 8,  "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.pistol_squat",          "sets": 3, "reps_min": 5,  "reps_max": 10, "rest_seconds": 75},
                    {"name_key": "exercise.dead_bug",              "sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 45},
                ],
            },
        ],
    },

    {
        "id": "hiit_fatburner",
        "name_fr": "HIIT – Brûle-graisses",
        "name_en": "HIIT – Fat Burner",
        "description_fr": "3 circuits HIIT intenses par semaine pour maximiser la dépense calorique et améliorer l'endurance cardiovasculaire.",
        "description_en": "3 intense HIIT circuits per week to maximize calorie burn and improve cardiovascular endurance.",
        "program_type": "custom",
        "days_per_week": 3,
        "goals": ["cut", "endurance"],
        "training_types": ["hiit"],
        "genders": [],
        "days": [
            {
                "name_fr": "Circuit 1 – Cardio explosif",
                "name_en": "Circuit 1 – Explosive Cardio",
                "exercises": [
                    {"name_key": "exercise.burpees",          "sets": 5, "reps_min": 10, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.jump_rope",        "sets": 5, "reps_min": 30, "reps_max": 60, "rest_seconds": 20},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 20, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.high_knees",       "sets": 4, "reps_min": 20, "reps_max": 30, "rest_seconds": 20},
                ],
            },
            {
                "name_fr": "Circuit 2 – Puissance",
                "name_en": "Circuit 2 – Power",
                "exercises": [
                    {"name_key": "exercise.box_jump",         "sets": 5, "reps_min": 8,  "reps_max": 10, "rest_seconds": 45},
                    {"name_key": "exercise.battle_ropes",     "sets": 4, "reps_min": 20, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.kettlebell_swing", "sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.sprints",          "sets": 6, "reps_min": 1,  "reps_max": 1,  "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Circuit 3 – Endurance",
                "name_en": "Circuit 3 – Endurance",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks",    "sets": 4, "reps_min": 30, "reps_max": 50, "rest_seconds": 20},
                    {"name_key": "exercise.burpees",          "sets": 4, "reps_min": 10, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.assault_bike",     "sets": 5, "reps_min": 30, "reps_max": 60, "rest_seconds": 30},
                    {"name_key": "exercise.thruster",         "sets": 4, "reps_min": 10, "reps_max": 15, "rest_seconds": 45},
                ],
            },
        ],
    },

    {
        "id": "upper_lower_recomp",
        "name_fr": "Upper / Lower – Recomposition",
        "name_en": "Upper / Lower – Body Recomposition",
        "description_fr": "Programme 4 jours alterné haut / bas du corps. Combine force et hypertrophie pour perdre du gras tout en gagnant du muscle.",
        "description_en": "4-day alternating upper/lower split. Combines strength and hypertrophy for recomposition.",
        "program_type": "upper_lower",
        "days_per_week": 4,
        "goals": ["recomp", "maintain"],
        "training_types": ["musculation", "machines", "mixed"],
        "genders": [],
        "days": [
            {
                "name_fr": "Haut du corps A",
                "name_en": "Upper Body A",
                "exercises": [
                    {"name_key": "exercise.bench_press",     "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.barbell_row",     "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 120},
                    {"name_key": "exercise.overhead_press",  "sets": 3, "reps_min": 8,  "reps_max": 10, "rest_seconds": 90},
                    {"name_key": "exercise.lat_pulldown",    "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.barbell_curl",    "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 60},
                    {"name_key": "exercise.tricep_pushdown", "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Bas du corps A",
                "name_en": "Lower Body A",
                "exercises": [
                    {"name_key": "exercise.squat",               "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 180},
                    {"name_key": "exercise.romanian_deadlift",   "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 120},
                    {"name_key": "exercise.leg_press",           "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.leg_extension",       "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.lying_leg_curl",      "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.standing_calf_raise", "sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Haut du corps B",
                "name_en": "Upper Body B",
                "exercises": [
                    {"name_key": "exercise.incline_dumbbell_press", "sets": 4, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.cable_row",              "sets": 4, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.dumbbell_shoulder_press","sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.pull_up",                "sets": 3, "reps_min": 6,  "reps_max": 10, "rest_seconds": 90},
                    {"name_key": "exercise.hammer_curl",            "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.skull_crusher",          "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 60},
                ],
            },
            {
                "name_fr": "Bas du corps B",
                "name_en": "Lower Body B",
                "exercises": [
                    {"name_key": "exercise.front_squat",           "sets": 4, "reps_min": 8,  "reps_max": 10, "rest_seconds": 180},
                    {"name_key": "exercise.stiff_leg_deadlift",    "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 120},
                    {"name_key": "exercise.hack_squat",            "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.bulgarian_split_squat", "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.seated_leg_curl",       "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.seated_calf_raise",     "sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                ],
            },
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # PROGRAMMES FEMME
    # ─────────────────────────────────────────────────────────────
    {
        "id": "glutes_lower_female",
        "name_fr": "Fessiers & Jambes – Galbe féminin",
        "name_en": "Glutes & Legs – Female Sculpting",
        "description_fr": "Programme 3 jours axé fessiers, ischio-jambiers et gainage. Conçu pour sculpter et tonifier le bas du corps.",
        "description_en": "3-day program focused on glutes, hamstrings and core. Designed to sculpt and tone the lower body.",
        "program_type": "full_body",
        "days_per_week": 3,
        "goals": ["bulk", "recomp", "maintain"],
        "training_types": ["musculation", "machines", "mixed"],
        "genders": ["female"],
        "days": [
            {
                "name_fr": "Jour 1 – Fessiers / Ischio",
                "name_en": "Day 1 – Glutes / Hamstrings",
                "exercises": [
                    {"name_key": "exercise.hip_thrust",            "sets": 4, "reps_min": 12, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.romanian_deadlift",     "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 90},
                    {"name_key": "exercise.cable_glute_kickback",  "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.lying_leg_curl",        "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.donkey_kick",           "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 45},
                    {"name_key": "exercise.fire_hydrant",          "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 45},
                ],
            },
            {
                "name_fr": "Jour 2 – Quadriceps / Fessiers",
                "name_en": "Day 2 – Quads / Glutes",
                "exercises": [
                    {"name_key": "exercise.squat",          "sets": 4, "reps_min": 10, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.leg_press",      "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.walking_lunges", "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.hip_abduction",  "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.leg_extension",  "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.frog_pump",      "sets": 3, "reps_min": 20, "reps_max": 30, "rest_seconds": 45},
                ],
            },
            {
                "name_fr": "Jour 3 – Haut du corps / Gainage",
                "name_en": "Day 3 – Upper Body / Core",
                "exercises": [
                    {"name_key": "exercise.lat_pulldown",    "sets": 3, "reps_min": 10, "reps_max": 12, "rest_seconds": 75},
                    {"name_key": "exercise.cable_row",       "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.lateral_raise",   "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.push_up",         "sets": 3, "reps_min": 10, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.plank",           "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 45},
                    {"name_key": "exercise.dead_bug",        "sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 45},
                ],
            },
        ],
    },

    {
        "id": "bodyweight_female",
        "name_fr": "Poids de corps – Femme",
        "name_en": "Bodyweight – Women",
        "description_fr": "Programme sans équipement axé tonification, fessiers et gainage. Peut se faire à la maison.",
        "description_en": "Equipment-free program focused on toning, glutes and core. Can be done at home.",
        "program_type": "full_body",
        "days_per_week": 3,
        "goals": ["cut", "recomp", "maintain"],
        "training_types": ["poids_corps"],
        "genders": ["female"],
        "days": [
            {
                "name_fr": "Jour 1 – Bas du corps",
                "name_en": "Day 1 – Lower Body",
                "exercises": [
                    {"name_key": "exercise.squat",              "sets": 4, "reps_min": 15, "reps_max": 25, "rest_seconds": 60},
                    {"name_key": "exercise.walking_lunges",     "sets": 3, "reps_min": 12, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.barbell_glute_bridge","sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.donkey_kick",        "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 45},
                    {"name_key": "exercise.banded_clamshell",   "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 45},
                ],
            },
            {
                "name_fr": "Jour 2 – Haut du corps / Gainage",
                "name_en": "Day 2 – Upper Body / Core",
                "exercises": [
                    {"name_key": "exercise.push_up",        "sets": 4, "reps_min": 8,  "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.inverted_row",   "sets": 3, "reps_min": 8,  "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.plank",          "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 45},
                    {"name_key": "exercise.mountain_climber","sets": 3, "reps_min": 15, "reps_max": 25, "rest_seconds": 45},
                    {"name_key": "exercise.dead_bug",       "sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 45},
                ],
            },
            {
                "name_fr": "Jour 3 – Full body",
                "name_en": "Day 3 – Full Body",
                "exercises": [
                    {"name_key": "exercise.bulgarian_split_squat","sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.step_up",              "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 60},
                    {"name_key": "exercise.fire_hydrant",         "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 45},
                    {"name_key": "exercise.wide_push_up",         "sets": 3, "reps_min": 8,  "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.ab_wheel_rollout",     "sets": 3, "reps_min": 6,  "reps_max": 12, "rest_seconds": 60},
                ],
            },
        ],
    },

    {
        "id": "hiit_female",
        "name_fr": "HIIT – Cardio Sculpté Femme",
        "name_en": "HIIT – Women's Sculpting Cardio",
        "description_fr": "3 circuits HIIT pensés pour les femmes : cardio, fessiers et gainage. Brûle les graisses tout en tonifiant.",
        "description_en": "3 HIIT circuits designed for women: cardio, glutes and core. Burns fat while toning.",
        "program_type": "custom",
        "days_per_week": 3,
        "goals": ["cut", "endurance"],
        "training_types": ["hiit"],
        "genders": ["female"],
        "days": [
            {
                "name_fr": "Circuit 1 – Cardio",
                "name_en": "Circuit 1 – Cardio",
                "exercises": [
                    {"name_key": "exercise.jump_rope",        "sets": 4, "reps_min": 30, "reps_max": 60, "rest_seconds": 20},
                    {"name_key": "exercise.jumping_jacks",    "sets": 4, "reps_min": 30, "reps_max": 50, "rest_seconds": 20},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 20, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.high_knees",       "sets": 4, "reps_min": 20, "reps_max": 30, "rest_seconds": 20},
                ],
            },
            {
                "name_fr": "Circuit 2 – Fessiers / Jambes",
                "name_en": "Circuit 2 – Glutes / Legs",
                "exercises": [
                    {"name_key": "exercise.squat",              "sets": 4, "reps_min": 15, "reps_max": 25, "rest_seconds": 30},
                    {"name_key": "exercise.walking_lunges",     "sets": 4, "reps_min": 12, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.barbell_glute_bridge","sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.step_up",            "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 30},
                ],
            },
            {
                "name_fr": "Circuit 3 – Full body",
                "name_en": "Circuit 3 – Full Body",
                "exercises": [
                    {"name_key": "exercise.burpees",        "sets": 4, "reps_min": 8,  "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.push_up",        "sets": 3, "reps_min": 10, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.donkey_kick",    "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.plank",          "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 30},
                ],
            },
        ],
    },

    {
        "id": "fullbody_cut_female",
        "name_fr": "Full Body Machines – Sèche Femme",
        "name_en": "Full Body Machines – Women's Cut",
        "description_fr": "Programme 3 jours en salle, sur machines. Idéal pour une sèche douce avec maintien musculaire.",
        "description_en": "3-day gym machine program. Ideal for a lean cut while maintaining muscle.",
        "program_type": "full_body",
        "days_per_week": 3,
        "goals": ["cut", "maintain"],
        "training_types": ["machines", "mixed"],
        "genders": ["female"],
        "days": [
            {
                "name_fr": "Jour 1",
                "name_en": "Day 1",
                "exercises": [
                    {"name_key": "exercise.leg_press",          "sets": 4, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.hip_thrust",         "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.machine_chest_press", "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.machine_row",        "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.plank",              "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 45},
                ],
            },
            {
                "name_fr": "Jour 2",
                "name_en": "Day 2",
                "exercises": [
                    {"name_key": "exercise.lat_pulldown",       "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.romanian_deadlift",  "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.hip_abduction",      "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.cable_crunch",       "sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 45},
                    {"name_key": "exercise.mountain_climber",   "sets": 3, "reps_min": 20, "reps_max": 30, "rest_seconds": 30},
                ],
            },
            {
                "name_fr": "Jour 3",
                "name_en": "Day 3",
                "exercises": [
                    {"name_key": "exercise.hack_squat",          "sets": 4, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.cable_row",           "sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.machine_shoulder_press","sets": 3, "reps_min": 12, "reps_max": 15, "rest_seconds": 75},
                    {"name_key": "exercise.cable_glute_kickback","sets": 3, "reps_min": 15, "reps_max": 20, "rest_seconds": 60},
                    {"name_key": "exercise.dead_bug",            "sets": 3, "reps_min": 10, "reps_max": 15, "rest_seconds": 45},
                ],
            },
        ],
    },
    # ─────────────────────────────────────────────────────────────
    # ISOMÉTRIE
    # ─────────────────────────────────────────────────────────────
    {
        "id": "isometric_fullbody",
        "name_fr": "Isométrie – Full Body",
        "name_en": "Isometric – Full Body",
        "description_fr": "Programme isométrique 3 jours. Maintiens statiques pour renforcer tendons, stabilité et gainage profond. Reps = secondes de maintien.",
        "description_en": "3-day isometric program. Static holds to strengthen tendons, stability and deep core. Reps = hold seconds.",
        "program_type": "full_body",
        "days_per_week": 3,
        "goals": ["maintain", "recomp", "strength"],
        "training_types": ["isometrie", "poids_corps"],
        "genders": [],
        "days": [
            {
                "name_fr": "Jour 1 – Gainage & Abdos",
                "name_en": "Day 1 – Core & Abs",
                "exercises": [
                    {"name_key": "exercise.plank",             "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 60, "notes": "secondes de maintien"},
                    {"name_key": "exercise.side_plank",        "sets": 3, "reps_min": 20, "reps_max": 45, "rest_seconds": 60, "notes": "secondes par côté"},
                    {"name_key": "exercise.hollow_hold",       "sets": 3, "reps_min": 20, "reps_max": 45, "rest_seconds": 60, "notes": "secondes de maintien"},
                    {"name_key": "exercise.copenhagen_plank",  "sets": 3, "reps_min": 15, "reps_max": 30, "rest_seconds": 60, "notes": "secondes par côté"},
                    {"name_key": "exercise.superman_hold",     "sets": 3, "reps_min": 20, "reps_max": 40, "rest_seconds": 60, "notes": "secondes de maintien"},
                ],
            },
            {
                "name_fr": "Jour 2 – Bas du corps",
                "name_en": "Day 2 – Lower Body",
                "exercises": [
                    {"name_key": "exercise.wall_sit",          "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 90, "notes": "secondes de maintien"},
                    {"name_key": "exercise.horse_stance",      "sets": 3, "reps_min": 20, "reps_max": 45, "rest_seconds": 90, "notes": "secondes de maintien"},
                    {"name_key": "exercise.glute_bridge_hold", "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 60, "notes": "secondes de maintien"},
                    {"name_key": "exercise.l_sit",             "sets": 3, "reps_min": 10, "reps_max": 30, "rest_seconds": 90, "notes": "secondes de maintien"},
                    {"name_key": "exercise.plank",             "sets": 3, "reps_min": 30, "reps_max": 60, "rest_seconds": 60, "notes": "secondes de maintien"},
                ],
            },
            {
                "name_fr": "Jour 3 – Haut du corps & Grip",
                "name_en": "Day 3 – Upper Body & Grip",
                "exercises": [
                    {"name_key": "exercise.dead_hang",         "sets": 3, "reps_min": 20, "reps_max": 60, "rest_seconds": 90, "notes": "secondes de maintien"},
                    {"name_key": "exercise.push_up",           "sets": 3, "reps_min": 15, "reps_max": 30, "rest_seconds": 60, "notes": "secondes en position basse (isométrique)"},
                    {"name_key": "exercise.plank",             "sets": 3, "reps_min": 45, "reps_max": 90, "rest_seconds": 60, "notes": "secondes de maintien"},
                    {"name_key": "exercise.side_plank",        "sets": 3, "reps_min": 20, "reps_max": 45, "rest_seconds": 60, "notes": "secondes par côté"},
                    {"name_key": "exercise.hollow_hold",       "sets": 3, "reps_min": 20, "reps_max": 45, "rest_seconds": 60, "notes": "secondes de maintien"},
                ],
            },
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # ISOMÉTRIE ADAPTÉ (handicap / SEP / récupération)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "isometric_adapted",
        "name_fr": "Isométrie Adaptée – Minimaliste",
        "name_en": "Adapted Isometric – Minimalist",
        "description_fr": "Programme isométrique adapté pour personnes à mobilité réduite ou pathologies neurologiques (SEP, etc.). 3 séances courtes (15-20 min), 1 seule série longue par exercice. Priorité récupération et stabilité nerveuse. Compatible régime cétogène.",
        "description_en": "Adapted isometric program for people with reduced mobility or neurological conditions (MS, etc.). 3 short sessions (15-20 min), 1 long set per exercise. Recovery and nervous stability first. Keto-compatible.",
        "program_type": "full_body",
        "days_per_week": 3,
        "goals": ["maintain", "recomp"],
        "training_types": ["isometrie", "poids_corps"],
        "genders": [],
        "days": [
            {
                "name_fr": "Séance 1 – Standard",
                "name_en": "Session 1 – Standard",
                "exercises": [
                    {"name_key": "exercise.plank",          "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – RPE 6-7, jamais à l'échec"},
                    {"name_key": "exercise.wall_sit",       "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – respiration contrôlée"},
                    {"name_key": "exercise.prayer_hold",    "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – paumes pressées devant la poitrine"},
                    {"name_key": "exercise.superman_hold",  "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – pas de tremblement excessif"},
                    {"name_key": "exercise.iso_curl_hold",  "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – bras à 90°"},
                ],
            },
            {
                "name_fr": "Séance 2 – Standard",
                "name_en": "Session 2 – Standard",
                "exercises": [
                    {"name_key": "exercise.plank",          "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – RPE 6-7, jamais à l'échec"},
                    {"name_key": "exercise.wall_sit",       "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – respiration contrôlée"},
                    {"name_key": "exercise.prayer_hold",    "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – paumes pressées devant la poitrine"},
                    {"name_key": "exercise.superman_hold",  "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – pas de tremblement excessif"},
                    {"name_key": "exercise.iso_curl_hold",  "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – bras à 90°"},
                ],
            },
            {
                "name_fr": "Séance 3 – Variation (samedi)",
                "name_en": "Session 3 – Variation (Saturday)",
                "exercises": [
                    {"name_key": "exercise.forearm_plank",  "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes – planche sur avant-bras, focus stabilité"},
                    {"name_key": "exercise.wall_sit",       "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – respiration contrôlée"},
                    {"name_key": "exercise.prayer_hold",    "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – paumes pressées devant la poitrine"},
                    {"name_key": "exercise.superman_hold",  "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes de maintien – contrôle maximal"},
                    {"name_key": "exercise.hang_hold",      "sets": 1, "reps_min": 30, "reps_max": 120, "rest_seconds": 60, "notes": "secondes – traction hold, remplace iso curl, focus grip et dos"},
                ],
            },
        ],
    },
]


def get_templates_for_user(goal: str | None, training_type: str | None, gender: str | None) -> list[dict]:
    """Retourne les templates adaptés au profil de l'utilisateur, du plus pertinent au moins."""
    from app.streetworkout_templates import STREET_WORKOUT_TEMPLATES
    all_templates = TEMPLATES + STREET_WORKOUT_TEMPLATES
    results = []

    for t in all_templates:
        # Filtre genre : si le template est réservé à un genre spécifique, l'exclure si ça ne correspond pas
        if t["genders"] and gender not in t["genders"]:
            continue

        score = 0
        if goal and goal in t["goals"]:
            score += 2
        if training_type and training_type in t["training_types"]:
            score += 1

        results.append((score, t))

    results.sort(key=lambda x: x[0], reverse=True)
    return [t for _, t in results]
