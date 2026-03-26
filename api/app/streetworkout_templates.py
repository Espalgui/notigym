"""
Street Workout templates (Madbarz-style circuits).
Each template is a single-day circuit workout with image reference.
"""

from typing import Any

STREET_WORKOUT_TEMPLATES: list[dict[str, Any]] = [
    # ─────────────────────────────────────────────────────────────
    # 1. Chest Routine — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_chest_routine_beginner",
        "name_fr": "Routine Pectoraux",
        "name_en": "Chest Routine",
        "description_fr": "Circuit 4 cycles. Repos 30s entre exercices, 3min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest 30s between exercises, 3min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/chest-routine-beginners.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.diamond_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "mains rapprochées"},
                    {"name_key": "exercise.decline_push_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.incline_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.push_up_hold", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 2. Abs in Park — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_abs_in_park_beginner",
        "name_fr": "Abdos au Parc",
        "name_en": "Abs in Park",
        "description_fr": "Circuit 5 cycles. Repos 30s entre exercices, 2min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 5 cycles. Rest 30s between exercises, 2min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/abs-in-park-routine-beginner.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_knee_raise", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 5, "reps_min": 3, "reps_max": 3, "rest_seconds": 30, "notes": "descente contrôlée et lente"},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 5, "reps_min": 6, "reps_max": 6, "rest_seconds": 30, "notes": "à la barre"},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "obliques, chaque côté"},
                    {"name_key": "exercise.half_burpee", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 3. Full Body 7R — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_full_body_7r",
        "name_fr": "Full Body 7R",
        "name_en": "Full Body 7R",
        "description_fr": "Circuit 4 cycles. Repos 45s entre exercices, 2min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest 45s between exercises, 2min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/full-body-routine-7r.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 45},
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 25, "reps_max": 25, "rest_seconds": 45},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 45},
                    {"name_key": "exercise.pike_push_up", "sets": 4, "reps_min": 17, "reps_max": 17, "rest_seconds": 45, "notes": "pieds surélevés"},
                    {"name_key": "exercise.hanging_knee_raise", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 45},
                    {"name_key": "exercise.standing_calf_raise", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 45},
                    {"name_key": "exercise.close_grip_chin_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 45},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 45},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 4. 30.000 — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_30000_hard",
        "name_fr": "30.000",
        "name_en": "30.000",
        "description_fr": "Circuit 3 cycles. PAS de repos entre exercices, 3min entre cycles. Niveau : difficile.",
        "description_en": "Circuit 3 cycles. NO rest between exercises, 3min between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/hard-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 0, "notes": "une main, chaque main"},
                    {"name_key": "exercise.plank", "sets": 3, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 0},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 0},
                    {"name_key": "exercise.diamond_push_up", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 0},
                    {"name_key": "exercise.squat_jump", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 0},
                    {"name_key": "exercise.chin_up", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 0},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 5. Push Up Routine — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_pushup_routine_hard",
        "name_fr": "Routine Pompes",
        "name_en": "Push Up Routine",
        "description_fr": "Circuit 3 cycles. Repos 30s entre exercices, 3min entre cycles. Niveau : difficile.",
        "description_en": "Circuit 3 cycles. Rest 30s between exercises, 3min between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/pushup-routine-hard.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up_hold", "sets": 3, "reps_min": 35, "reps_max": 35, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.clap_push_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.decline_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.pseudo_planche_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.diamond_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.incline_push_up", "sets": 3, "reps_min": 50, "reps_max": 50, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 6. Leg Routine — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_leg_routine_beginner",
        "name_fr": "Routine Jambes",
        "name_en": "Leg Routine",
        "description_fr": "Circuit 4 cycles. Repos entre exercices et entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest between exercises and between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/leg-routine-beginners.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.lateral_lunge", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "en marchant"},
                    {"name_key": "exercise.lunges", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.squat_jump", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.standing_calf_raise", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.duck_walk", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 7. Shoulder Routine — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_shoulder_routine_beginner",
        "name_fr": "Routine Épaules",
        "name_en": "Shoulder Routine",
        "description_fr": "Circuit 5 cycles. Repos entre exercices, 2min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 5 cycles. Rest between exercises, 2min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/shoulder-routine-beginner.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 5, "reps_min": 6, "reps_max": 6, "rest_seconds": 30},
                    {"name_key": "exercise.decline_push_up", "sets": 5, "reps_min": 4, "reps_max": 4, "rest_seconds": 30},
                    {"name_key": "exercise.tricep_dips", "sets": 5, "reps_min": 4, "reps_max": 4, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.pike_push_up", "sets": 5, "reps_min": 6, "reps_max": 6, "rest_seconds": 30},
                    {"name_key": "exercise.hindu_push_up", "sets": 5, "reps_min": 6, "reps_max": 6, "rest_seconds": 30},
                    {"name_key": "exercise.side_plank", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien, chaque côté"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 8. Biceps Triceps — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_biceps_triceps_medium",
        "name_fr": "Biceps Triceps",
        "name_en": "Biceps Triceps",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 4min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 4min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "bulk"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/biceps-triceps-routine-by-madbarz.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.diamond_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "prise supination (Australian)"},
                    {"name_key": "exercise.korean_dips", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.negative_chin_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 9. Trapezius Routine — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_trapezius_routine_medium",
        "name_fr": "Routine Trapèzes",
        "name_en": "Trapezius Routine",
        "description_fr": "Circuit 5 cycles. Repos entre exercices, 4min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest between exercises, 4min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/trapezius-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hindu_push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.pull_up", "sets": 5, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.superman_hold", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "bras et jambes opposés alternés"},
                    {"name_key": "exercise.decline_push_up", "sets": 5, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.wall_assisted_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.pike_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 10. Killer Kiwi — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_killer_kiwi_medium",
        "name_fr": "Killer Kiwi",
        "name_en": "Killer Kiwi",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 4min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 4min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/killer-kiwi-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 4, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.bulgarian_split_squat", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "dips + relevés de genoux"},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.muscle_up", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 11. Muscle Up Boost — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_muscle_up_boost_hard",
        "name_fr": "Muscle Up Boost",
        "name_en": "Muscle Up Boost",
        "description_fr": "Circuit 5 cycles. Repos minimum entre exercices et cycles. Niveau : difficile.",
        "description_en": "Circuit 5 cycles. Minimum rest between exercises and cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "bulk"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/muscle-up-boost-hard.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 15},
                    {"name_key": "exercise.muscle_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 15},
                    {"name_key": "exercise.explosive_pull_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 15, "notes": "tractions hautes"},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 15},
                    {"name_key": "exercise.superman_hold", "sets": 5, "reps_min": 30, "reps_max": 30, "rest_seconds": 15, "notes": "secondes de maintien"},
                    {"name_key": "exercise.tricep_dips", "sets": 5, "reps_min": 40, "reps_max": 40, "rest_seconds": 15},
                    {"name_key": "exercise.l_sit_chin_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 12. Diamond Pull — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_diamond_pull_medium",
        "name_fr": "Diamond Pull",
        "name_en": "Diamond Pull",
        "description_fr": "Circuit 5 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/diamond-pull-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.negative_chin_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.diamond_push_up", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "prise serrée"},
                    {"name_key": "exercise.chin_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "prise large"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 13. Body Shock — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_body_shock_medium",
        "name_fr": "Body Shock",
        "name_en": "Body Shock",
        "description_fr": "Circuit 3-5 cycles. Repos entre exercices, 3min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3-5 cycles. Rest between exercises, 3min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/body-shock-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.sprints", "sets": 4, "reps_min": 150, "reps_max": 150, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.negative_chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.wall_sit", "sets": 4, "reps_min": 45, "reps_max": 45, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.explosive_pull_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "Head Bangerz"},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.korean_dips", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.l_sit_chin_up", "sets": 4, "reps_min": 4, "reps_max": 4, "rest_seconds": 30, "notes": "L-Sit Pull Ups"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 14. Can't Walk — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_cant_walk_hard",
        "name_fr": "Can't Walk",
        "name_en": "Can't Walk",
        "description_fr": "Circuit 4 cycles. Repos entre exercices et entre cycles. Niveau : difficile.",
        "description_en": "Circuit 4 cycles. Rest between exercises and between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/cant-walk-routine-hard.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.lunges", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 35, "reps_max": 35, "rest_seconds": 30},
                    {"name_key": "exercise.bulgarian_split_squat", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.pistol_squat", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.squat_jump", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.box_jump", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.standing_calf_raise", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "chaque jambe"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 15. Dip and Push — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_dip_and_push_medium",
        "name_fr": "Dip and Push",
        "name_en": "Dip and Push",
        "description_fr": "Circuit 4 cycles. Repos 30s entre exercices, 3min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest 30s between exercises, 3min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/dip-and-push-medium-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "mains serrées"},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.decline_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.korean_dips", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.incline_push_up", "sets": 4, "reps_min": 35, "reps_max": 35, "rest_seconds": 30},
                    {"name_key": "exercise.push_up_hold", "sets": 4, "reps_min": 35, "reps_max": 35, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 16. Fat Removal — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_fat_removal_beginner",
        "name_fr": "Brûleur de Graisse",
        "name_en": "Fat Removal",
        "description_fr": "Circuit 4 cycles. Repos entre exercices et entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest between exercises and between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/fat-removal-beginner-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.running", "sets": 4, "reps_min": 100, "reps_max": 100, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.jumping_jacks", "sets": 4, "reps_min": 45, "reps_max": 45, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.high_knees", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes, en alternance"},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 17. Flying Superman — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_flying_superman_hard",
        "name_fr": "Flying Superman",
        "name_en": "Flying Superman",
        "description_fr": "Circuit 5-7 cycles. Repos 1-5min entre cycles, repos entre exercices. Niveau : difficile.",
        "description_en": "Circuit 5-7 cycles. Rest 1-5min between cycles, rest between exercises. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/flying-pushup-routine-hard.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.clap_push_up", "sets": 6, "reps_min": 50, "reps_max": 50, "rest_seconds": 30},
                    {"name_key": "exercise.clap_push_up", "sets": 6, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "clap dans le dos"},
                    {"name_key": "exercise.clap_push_up", "sets": 6, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "explosif toucher orteils"},
                    {"name_key": "exercise.superman_push_up", "sets": 6, "reps_min": 25, "reps_max": 25, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 18. Fresh Air — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_fresh_air_beginner",
        "name_fr": "Air Frais",
        "name_en": "Fresh Air",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 3min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 3min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/fresh-air-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.running", "sets": 4, "reps_min": 100, "reps_max": 100, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.military_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.running", "sets": 4, "reps_min": 100, "reps_max": 100, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.push_up_hold", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.running", "sets": 4, "reps_min": 100, "reps_max": 100, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.jumping_jacks", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.military_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 19. Full Body Shock Workout — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_full_body_shock_workout_medium",
        "name_fr": "Full Body Shock Workout",
        "name_en": "Full Body Shock Workout",
        "description_fr": "Circuit 4 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/full-body-shock-workout-routine-by-antoniette-pacheco.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.sprints", "sets": 4, "reps_min": 100, "reps_max": 100, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "shuttle push ups"},
                    {"name_key": "exercise.burpees", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "une jambe"},
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "maintien statique"},
                    {"name_key": "exercise.lateral_lunge", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "en marchant"},
                    {"name_key": "exercise.squat_jump", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "sprawl jumps"},
                    {"name_key": "exercise.v_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "jambes écartées"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 20. Home Abs — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_home_abs_beginner",
        "name_fr": "Abdos Maison",
        "name_en": "Home Abs",
        "description_fr": "Circuit 4 cycles. Repos 1min entre exercices, 3min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest 1min between exercises, 3min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/home-abs-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_knee_raise", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 60},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 60, "notes": "secondes"},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 25, "reps_max": 25, "rest_seconds": 60, "notes": "secondes de maintien"},
                    {"name_key": "exercise.side_plank", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 60, "notes": "secondes de maintien"},
                    {"name_key": "exercise.half_burpee", "sets": 4, "reps_min": 7, "reps_max": 7, "rest_seconds": 60},
                    {"name_key": "exercise.crunch", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 60},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 21. Home Full Body — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_home_full_body_medium",
        "name_fr": "Full Body Maison",
        "name_en": "Home Full Body",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 2min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 2min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/home-full-body.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.bench_dip", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "sur chaise"},
                    {"name_key": "exercise.v_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.pseudo_planche_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.sit_up", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 45, "reps_max": 45, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.decline_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 22. Leg Burner — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_leg_burner_medium",
        "name_fr": "Leg Burner",
        "name_en": "Leg Burner",
        "description_fr": "Circuit 6 cycles. Repos entre exercices, 3min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 6 cycles. Rest between exercises, 3min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/leg-burner-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 6, "reps_min": 90, "reps_max": 90, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.sprints", "sets": 6, "reps_min": 150, "reps_max": 150, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.squat_jump", "sets": 6, "reps_min": 25, "reps_max": 25, "rest_seconds": 30},
                    {"name_key": "exercise.mountain_climber", "sets": 6, "reps_min": 45, "reps_max": 45, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.duck_walk", "sets": 6, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.running", "sets": 6, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes, en montée"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 23. Madbarz Explode — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_madbarz_explode_hard",
        "name_fr": "Madbarz Explode",
        "name_en": "Madbarz Explode",
        "description_fr": "Circuit 5 cycles. Repos entre exercices, 3min entre cycles. Niveau : difficile.",
        "description_en": "Circuit 5 cycles. Rest between exercises, 3min between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/madbarz-explode-hard-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.explosive_pull_up", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "tractions hautes explosives poitrine"},
                    {"name_key": "exercise.incline_push_up", "sets": 5, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "rapide"},
                    {"name_key": "exercise.tricep_dips", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "explosif"},
                    {"name_key": "exercise.clap_push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "clap dans le dos"},
                    {"name_key": "exercise.squat_jump", "sets": 5, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.clap_push_up", "sets": 5, "reps_min": 18, "reps_max": 18, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 24. Max Rep Hell — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_max_rep_hell_hard",
        "name_fr": "Max Rep Hell",
        "name_en": "Max Rep Hell",
        "description_fr": "Circuit 5 cycles. Repos 1min entre cycles, PAS de repos entre exercices. Niveau : difficile.",
        "description_en": "Circuit 5 cycles. Rest 1min between cycles, NO rest between exercises. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/max-reps-hell.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_leg_raise", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                    {"name_key": "exercise.diamond_push_up", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                    {"name_key": "exercise.windshield_wiper", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                    {"name_key": "exercise.tricep_dips", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                    {"name_key": "exercise.reverse_t_bar_dip", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                    {"name_key": "exercise.plank", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 0, "notes": "max reps"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 25. No Barz No Glory — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_no_barz_no_glory_medium",
        "name_fr": "No Barz No Glory",
        "name_en": "No Barz No Glory",
        "description_fr": "Circuit 3 cycles. Repos entre exercices, 4-5min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest between exercises, 4-5min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/no-barz-no-glory-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.front_lever_hold", "sets": 3, "reps_min": 1, "reps_max": 1, "rest_seconds": 30, "notes": "swing"},
                    {"name_key": "exercise.inverted_row", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.typewriter_pull_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.bicycle_crunch", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "L-Sit bicycles"},
                    {"name_key": "exercise.box_jump", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 26. No Equipment 8 — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_no_equipment_8_beginner",
        "name_fr": "Sans Équipement 8",
        "name_en": "No Equipment 8",
        "description_fr": "Circuit 4 cycles. Repos 45s entre exercices, 3min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest 45s between exercises, 3min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/no-equipment-8-beginner-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 45},
                    {"name_key": "exercise.lunges", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 45, "notes": "chaque jambe"},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 45},
                    {"name_key": "exercise.leg_raise", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 45},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 0, "reps_max": 0, "rest_seconds": 45, "notes": "max reps"},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 0, "reps_max": 0, "rest_seconds": 45, "notes": "max reps"},
                    {"name_key": "exercise.pike_push_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 45},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 27. Park Abs — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_park_abs_medium",
        "name_fr": "Abdos au Parc",
        "name_en": "Park Abs",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 3min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 3min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/park-abs-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.windshield_wiper", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.crunch", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "obliques"},
                    {"name_key": "exercise.hanging_knee_raise", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.crunch", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 28. Piece of Cake — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_piece_of_cake_hard",
        "name_fr": "Piece of Cake",
        "name_en": "Piece of Cake",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 4min entre cycles. Niveau : difficile.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 4min between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/piece-of-cage-routine-hard.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.diamond_push_up", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.clapping_pull_up", "sets": 4, "reps_min": 18, "reps_max": 18, "rest_seconds": 30},
                    {"name_key": "exercise.squat_jump", "sets": 4, "reps_min": 45, "reps_max": 45, "rest_seconds": 30},
                    {"name_key": "exercise.wall_sit", "sets": 4, "reps_min": 120, "reps_max": 120, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.clap_push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 29. Pull It — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_pull_it_medium",
        "name_fr": "Pull It",
        "name_en": "Pull It",
        "description_fr": "Circuit 4 cycles. Repos 30s entre exercices, 2min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest 30s between exercises, 2min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/pull-it-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.typewriter_pull_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.explosive_pull_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.clapping_pull_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 25, "reps_max": 25, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.negative_chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.close_grip_chin_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 30. Push Dose — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_push_dose_medium",
        "name_fr": "Push Dose",
        "name_en": "Push Dose",
        "description_fr": "Circuit 5 cycles. Repos 20s entre exercices, 2min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest 20s between exercises, 2min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/push-dose-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.decline_push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 20, "notes": "pliométrique"},
                    {"name_key": "exercise.pike_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 20},
                    {"name_key": "exercise.diamond_push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 20},
                    {"name_key": "exercise.clap_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 20},
                    {"name_key": "exercise.push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 20, "notes": "mains serrées"},
                    {"name_key": "exercise.incline_push_up", "sets": 5, "reps_min": 35, "reps_max": 35, "rest_seconds": 20},
                    {"name_key": "exercise.push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 20},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 31. Push-Up Hell (Girls) — Medium — FEMALE
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_pushup_hell_girls_medium",
        "name_fr": "Push-Up Hell",
        "name_en": "Push-Up Hell",
        "description_fr": "Circuit 3 cycles. Repos entre exercices, 4min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest between exercises, 4min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": ["female"],
        "image_url": "/streetworkout/pushup-hell-routine-for-girls.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.diamond_push_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.military_push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.decline_push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.wide_push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.hindu_push_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.incline_push_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 32. Routine 4 Girls — Beginner — FEMALE
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_routine_4_girls_beginner",
        "name_fr": "Routine 4 Girls",
        "name_en": "Routine 4 Girls",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 3min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 3min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["cut", "endurance", "maintain"],
        "training_types": ["poids_corps"],
        "genders": ["female"],
        "image_url": "/streetworkout/routine-for-girls.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.lunges", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "obliques"},
                    {"name_key": "exercise.jumping_jacks", "sets": 4, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes + course 100m"},
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 33. Back Lever Hunt — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_back_lever_hunt_medium",
        "name_fr": "Back Lever Hunt",
        "name_en": "Back Lever Hunt",
        "description_fr": "Circuit 6 cycles. Repos 1min entre cycles, repos entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 6 cycles. Rest 1min between cycles, rest between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/routines1.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.l_sit_chin_up", "sets": 6, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "L-Sit Pull Ups"},
                    {"name_key": "exercise.handstand_hold", "sets": 6, "reps_min": 12, "reps_max": 12, "rest_seconds": 30, "notes": "press to handstand, mur assisté"},
                    {"name_key": "exercise.windshield_wiper", "sets": 6, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.dragon_flag", "sets": 6, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.back_lever_hold", "sets": 6, "reps_min": 25, "reps_max": 25, "rest_seconds": 30, "notes": "secondes de maintien, tucked"},
                    {"name_key": "exercise.skin_the_cat", "sets": 6, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 34. Shoulder Demolition — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_shoulder_demolition_hard",
        "name_fr": "Shoulder Demolition",
        "name_en": "Shoulder Demolition",
        "description_fr": "Circuit 5 cycles. Repos entre exercices, 5min entre cycles. Niveau : difficile.",
        "description_en": "Circuit 5 cycles. Rest between exercises, 5min between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "bulk"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/shoulder-demolition-hard-routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hindu_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.pike_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "pieds surélevés"},
                    {"name_key": "exercise.handstand_hold", "sets": 5, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.decline_push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "pliométrique"},
                    {"name_key": "exercise.handstand_push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 35. Six-Mix — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_six_mix_beginner",
        "name_fr": "Six-Mix",
        "name_en": "Six-Mix",
        "description_fr": "Circuit 6 cycles. Repos 30s entre exercices, 2min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 6 cycles. Rest 30s between exercises, 2min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/six-mix-beginner--routine.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 6, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.incline_push_up", "sets": 6, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.plank", "sets": 6, "reps_min": 0, "reps_max": 0, "rest_seconds": 30, "notes": "max reps"},
                    {"name_key": "exercise.tricep_dips", "sets": 6, "reps_min": 6, "reps_max": 6, "rest_seconds": 30},
                    {"name_key": "exercise.squat", "sets": 6, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 6, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.close_grip_chin_up", "sets": 6, "reps_min": 6, "reps_max": 6, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 36. Strength Control — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_strength_control_hard",
        "name_fr": "Strength Control",
        "name_en": "Strength Control",
        "description_fr": "Circuit 3 cycles. Repos entre exercices et entre cycles. Niveau : difficile.",
        "description_en": "Circuit 3 cycles. Rest between exercises and between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "bulk"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/strength-control-routine-hard-by-jordan-hill.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.front_lever_hold", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 30, "notes": "secondes de maintien, human flag"},
                    {"name_key": "exercise.front_lever_hold", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.back_lever_hold", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.tuck_planche_hold", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien, bent arm"},
                    {"name_key": "exercise.handstand_hold", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "très lent"},
                    {"name_key": "exercise.tricep_dips", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "lent"},
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "maintien isométrique"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 37. The Burner — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_the_burner_medium",
        "name_fr": "The Burner",
        "name_en": "The Burner",
        "description_fr": "Circuit 5 cycles. Repos 20s entre exercices, 4min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest 20s between exercises, 4min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/the-burner-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 5, "reps_min": 120, "reps_max": 120, "rest_seconds": 20, "notes": "secondes"},
                    {"name_key": "exercise.burpees", "sets": 5, "reps_min": 25, "reps_max": 25, "rest_seconds": 20},
                    {"name_key": "exercise.plank", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 20, "notes": "max reps"},
                    {"name_key": "exercise.jumping_jacks", "sets": 5, "reps_min": 120, "reps_max": 120, "rest_seconds": 20, "notes": "secondes"},
                    {"name_key": "exercise.running", "sets": 5, "reps_min": 100, "reps_max": 100, "rest_seconds": 20, "notes": "mètres"},
                    {"name_key": "exercise.mountain_climber", "sets": 5, "reps_min": 30, "reps_max": 30, "rest_seconds": 20, "notes": "secondes"},
                    {"name_key": "exercise.running", "sets": 5, "reps_min": 50, "reps_max": 50, "rest_seconds": 20, "notes": "mètres, en montée"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 38. Triceps Limit — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_triceps_limit_beginner",
        "name_fr": "Triceps Limit",
        "name_en": "Triceps Limit",
        "description_fr": "Circuit 4 cycles. Repos 30s entre exercices, 4min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest 30s between exercises, 4min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/triceps-limit.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 6, "reps_max": 6, "rest_seconds": 30},
                    {"name_key": "exercise.dip_hold", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.incline_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.push_up_hold", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.reverse_t_bar_dip", "sets": 4, "reps_min": 3, "reps_max": 3, "rest_seconds": 30},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 39. Upper Back, Biceps, Abs — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_upper_back_biceps_abs_medium",
        "name_fr": "Haut du Dos, Biceps, Abdos",
        "name_en": "Upper Back, Biceps, Abs",
        "description_fr": "Circuit 3-6 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3-6 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/upper-back-biceps-abs-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.close_grip_chin_up", "sets": 4, "reps_min": 7, "reps_max": 7, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "prise serrée"},
                    {"name_key": "exercise.muscle_up", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.l_sit_chin_up", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "prise neutre"},
                    {"name_key": "exercise.windshield_wiper", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 40. Upper Body Routine — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_upper_body_medium",
        "name_fr": "Routine Haut du Corps",
        "name_en": "Upper Body Routine",
        "description_fr": "Circuit 3-5 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3-5 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/upper-body-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.l_sit", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.korean_dips", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 41. Upper Body Routine (Calisthenics) — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_upper_body_calisthenics_medium",
        "name_fr": "Routine Haut du Corps (Callisthénie)",
        "name_en": "Upper Body Routine (Calisthenics)",
        "description_fr": "Séance unique. Repos 4min entre exercices. Niveau : intermédiaire.",
        "description_en": "Single session. Rest 4min between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "bulk"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/upper-body-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 5, "reps_min": 20, "reps_max": 30, "rest_seconds": 240},
                    {"name_key": "exercise.sit_up", "sets": 5, "reps_min": 20, "reps_max": 30, "rest_seconds": 240},
                    {"name_key": "exercise.push_up", "sets": 5, "reps_min": 20, "reps_max": 30, "rest_seconds": 240, "notes": "sur barre à dips"},
                    {"name_key": "exercise.pull_up", "sets": 5, "reps_min": 20, "reps_max": 30, "rest_seconds": 240, "notes": "prises variées alternées"},
                    {"name_key": "exercise.muscle_up", "sets": 1, "reps_min": 0, "reps_max": 0, "rest_seconds": 240, "notes": "max reps"},
                    {"name_key": "exercise.bench_dip", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 240, "notes": "reverse bench dips"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 42. Back - Biceps — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_back_biceps_beginner",
        "name_fr": "Dos - Biceps",
        "name_en": "Back - Biceps",
        "description_fr": "Circuit 4 cycles. Repos 1min entre exercices, 3min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest 1min between exercises, 3min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/biceps-back-routine-beginners.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 3, "reps_max": 3, "rest_seconds": 60},
                    {"name_key": "exercise.negative_chin_up", "sets": 4, "reps_min": 4, "reps_max": 4, "rest_seconds": 60},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 7, "reps_max": 7, "rest_seconds": 60, "notes": "prise supination (Australian)"},
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 4, "reps_min": 3, "reps_max": 3, "rest_seconds": 60},
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 4, "reps_max": 4, "rest_seconds": 60, "notes": "prise largeur épaules"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 43. Insane Cardio — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_insane_cardio_hard",
        "name_fr": "Cardio Extrême",
        "name_en": "Insane Cardio",
        "description_fr": "Circuit 10 cycles. Repos 30s entre cycles, repos entre exercices. Niveau : difficile.",
        "description_en": "Circuit 10 cycles. Rest 30s between cycles, rest between exercises. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/1.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 10, "reps_min": 60, "reps_max": 60, "rest_seconds": 15, "notes": "secondes"},
                    {"name_key": "exercise.vertical_jump", "sets": 10, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.forward_jump", "sets": 10, "reps_min": 15, "reps_max": 15, "rest_seconds": 15, "notes": "sauts horizontaux"},
                    {"name_key": "exercise.burpees", "sets": 10, "reps_min": 45, "reps_max": 45, "rest_seconds": 15},
                    {"name_key": "exercise.mountain_climber", "sets": 10, "reps_min": 60, "reps_max": 60, "rest_seconds": 15, "notes": "secondes"},
                    {"name_key": "exercise.jump_rope", "sets": 10, "reps_min": 60, "reps_max": 60, "rest_seconds": 15, "notes": "secondes"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 44. Warm Up Circuit — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_warm_up_circuit_beginner",
        "name_fr": "Circuit Échauffement",
        "name_en": "Warm Up Circuit",
        "description_fr": "3 sets de MAX. Échauffement complet. Niveau : débutant.",
        "description_en": "3 sets of MAX. Full warm-up. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a112.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 1, "reps_min": 300, "reps_max": 300, "rest_seconds": 30, "notes": "secondes, étirements 5min puis jumping jacks 5min"},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 0, "reps_max": 0, "rest_seconds": 30, "notes": "max reps"},
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 3, "reps_min": 0, "reps_max": 0, "rest_seconds": 30, "notes": "max reps"},
                    {"name_key": "exercise.jumping_jacks", "sets": 1, "reps_min": 180, "reps_max": 180, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.chin_up", "sets": 3, "reps_min": 0, "reps_max": 0, "rest_seconds": 30, "notes": "max reps, prise serrée"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 45. Back Routine — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_back_routine_medium",
        "name_fr": "Routine Dos",
        "name_en": "Back Routine",
        "description_fr": "Circuit 3 cycles. Repos 30s entre exercices. Total 90 reps + 30s de maintien. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest 30s between exercises. Total 90 reps + 30s hold. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a113.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "prise large derrière la nuque"},
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "mains très serrées"},
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "largeur épaules derrière nuque"},
                    {"name_key": "exercise.front_lever_hold", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "secondes de maintien, tuck"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 46. Arm Routine — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_arm_routine_medium",
        "name_fr": "Routine Bras",
        "name_en": "Arm Routine",
        "description_fr": "Circuit 5 cycles. Repos 30s entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest 30s between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a114.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.tricep_dips", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.bench_dip", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.close_grip_chin_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "prise large supination"},
                    {"name_key": "exercise.chin_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "largeur épaules"},
                    {"name_key": "exercise.inverted_row", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "prise serrée supination"},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.bench_dip", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 47. Full Body Explosive — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_full_body_explosive_medium",
        "name_fr": "Full Body Explosif",
        "name_en": "Full Body Explosive",
        "description_fr": "Circuit 3 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a115.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.handstand_hold", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien, mur assisté"},
                    {"name_key": "exercise.tricep_dips", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.pistol_squat", "sets": 3, "reps_min": 3, "reps_max": 3, "rest_seconds": 30, "notes": "chaque jambe + 5 squat jumps explosifs"},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 3, "reps_min": 6, "reps_max": 6, "rest_seconds": 30, "notes": "jambes tendues"},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30, "notes": "skull crushers poids du corps"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 48. Turtle Back — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_turtle_back_hard",
        "name_fr": "Turtle Back",
        "name_en": "Turtle Back",
        "description_fr": "Circuit 2-3 cycles. Repos minimum entre exercices, repos après chaque cycle. Niveau : difficile.",
        "description_en": "Circuit 2-3 cycles. Minimum rest between exercises, rest after each cycle. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "bulk"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a116.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 2, "reps_min": 50, "reps_max": 50, "rest_seconds": 15},
                    {"name_key": "exercise.diamond_push_up", "sets": 2, "reps_min": 100, "reps_max": 100, "rest_seconds": 15},
                    {"name_key": "exercise.chin_up", "sets": 2, "reps_min": 10, "reps_max": 10, "rest_seconds": 15, "notes": "prise large"},
                    {"name_key": "exercise.pull_up", "sets": 2, "reps_min": 50, "reps_max": 50, "rest_seconds": 15},
                    {"name_key": "exercise.tricep_dips", "sets": 2, "reps_min": 100, "reps_max": 100, "rest_seconds": 15, "notes": "inversés"},
                    {"name_key": "exercise.pull_up", "sets": 2, "reps_min": 50, "reps_max": 50, "rest_seconds": 15, "notes": "prise serrée"},
                    {"name_key": "exercise.tricep_dips", "sets": 2, "reps_min": 100, "reps_max": 100, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 49. Let's Go — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_lets_go_beginner",
        "name_fr": "Let's Go",
        "name_en": "Let's Go",
        "description_fr": "Circuit 3+ cycles. Repos minimum entre exercices, 4min après chaque cycle. Niveau : débutant.",
        "description_en": "Circuit 3+ cycles. Minimum rest between exercises, 4min after each cycle. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a117.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 15},
                    {"name_key": "exercise.chin_up", "sets": 3, "reps_min": 6, "reps_max": 6, "rest_seconds": 15, "notes": "largeur épaules"},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 3, "reps_min": 3, "reps_max": 3, "rest_seconds": 15},
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 6, "reps_max": 6, "rest_seconds": 15},
                    {"name_key": "exercise.tricep_dips", "sets": 3, "reps_min": 6, "reps_max": 6, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 50. Human Flag Path — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_human_flag_path_medium",
        "name_fr": "Human Flag Path",
        "name_en": "Human Flag Path",
        "description_fr": "Circuit 3+ cycles. Repos minimum entre exercices, repos après chaque cycle. Niveau : intermédiaire.",
        "description_en": "Circuit 3+ cycles. Minimum rest between exercises, rest after each cycle. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a118.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_leg_raise", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 15},
                    {"name_key": "exercise.pseudo_planche_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 15},
                    {"name_key": "exercise.superman_hold", "sets": 3, "reps_min": 45, "reps_max": 45, "rest_seconds": 15, "notes": "secondes de maintien"},
                    {"name_key": "exercise.plank", "sets": 3, "reps_min": 0, "reps_max": 0, "rest_seconds": 15, "notes": "max reps"},
                    {"name_key": "exercise.tricep_dips", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 15},
                    {"name_key": "exercise.crunch", "sets": 3, "reps_min": 50, "reps_max": 50, "rest_seconds": 15},
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 51. Chest Addict — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_chest_addict_medium",
        "name_fr": "Chest Addict",
        "name_en": "Chest Addict",
        "description_fr": "Circuit 4+ cycles. Repos minimum entre exercices, 3min après chaque cycle. Niveau : intermédiaire.",
        "description_en": "Circuit 4+ cycles. Minimum rest between exercises, 3min after each cycle. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a119.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 16, "reps_max": 16, "rest_seconds": 15},
                    {"name_key": "exercise.pseudo_planche_push_up", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 15},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 9, "reps_max": 9, "rest_seconds": 15},
                    {"name_key": "exercise.diamond_push_up", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 15},
                    {"name_key": "exercise.decline_push_up", "sets": 4, "reps_min": 9, "reps_max": 9, "rest_seconds": 15},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 4, "reps_min": 6, "reps_max": 6, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 52. Frank's Killer Abs — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_franks_killer_abs_medium",
        "name_fr": "Frank's Killer Abs",
        "name_en": "Frank's Killer Abs",
        "description_fr": "Circuit 3+ cycles. Repos minimum entre exercices, repos après chaque cycle. Niveau : intermédiaire.",
        "description_en": "Circuit 3+ cycles. Minimum rest between exercises, rest after each cycle. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a120.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.leg_raise", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15, "notes": "jambes croisées"},
                    {"name_key": "exercise.half_burpee", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.leg_raise", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15, "notes": "jambes surélevées, toucher pieds"},
                    {"name_key": "exercise.half_burpee", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.crunch", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15, "notes": "obliques côté droit"},
                    {"name_key": "exercise.crunch", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15, "notes": "obliques côté gauche"},
                    {"name_key": "exercise.half_burpee", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 53. Maniac Routine — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_maniac_routine_medium",
        "name_fr": "Maniac Routine",
        "name_en": "Maniac Routine",
        "description_fr": "Circuit 2 cycles. Repos 5s entre exercices, repos après chaque cycle. Niveau : intermédiaire.",
        "description_en": "Circuit 2 cycles. Rest 5s between exercises, rest after each cycle. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a121.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.squat_jump", "sets": 2, "reps_min": 15, "reps_max": 15, "rest_seconds": 5},
                    {"name_key": "exercise.push_up", "sets": 2, "reps_min": 50, "reps_max": 50, "rest_seconds": 5},
                    {"name_key": "exercise.burpees", "sets": 2, "reps_min": 15, "reps_max": 15, "rest_seconds": 5, "notes": "up downs"},
                    {"name_key": "exercise.pull_up", "sets": 2, "reps_min": 5, "reps_max": 5, "rest_seconds": 5},
                    {"name_key": "exercise.muscle_up", "sets": 2, "reps_min": 5, "reps_max": 5, "rest_seconds": 5},
                    {"name_key": "exercise.pull_up", "sets": 2, "reps_min": 5, "reps_max": 5, "rest_seconds": 5},
                    {"name_key": "exercise.leg_raise", "sets": 2, "reps_min": 60, "reps_max": 60, "rest_seconds": 5, "notes": "secondes, leg flutters"},
                    {"name_key": "exercise.sprints", "sets": 2, "reps_min": 30, "reps_max": 30, "rest_seconds": 5, "notes": "secondes"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 54. Leg Routine (Medium)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_leg_routine_medium",
        "name_fr": "Routine Jambes",
        "name_en": "Leg Routine",
        "description_fr": "Circuit 2 cycles. Repos minimum entre exercices, 5min après chaque cycle. Niveau : intermédiaire.",
        "description_en": "Circuit 2 cycles. Minimum rest between exercises, 5min after each cycle. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a122.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.squat_jump", "sets": 2, "reps_min": 10, "reps_max": 10, "rest_seconds": 15, "notes": "avec rotation 180"},
                    {"name_key": "exercise.jumping_jacks", "sets": 2, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.walking_lunges", "sets": 2, "reps_min": 25, "reps_max": 25, "rest_seconds": 15},
                    {"name_key": "exercise.vertical_jump", "sets": 2, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.duck_walk", "sets": 2, "reps_min": 20, "reps_max": 20, "rest_seconds": 15},
                    {"name_key": "exercise.forward_jump", "sets": 2, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.backward_jump", "sets": 2, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 55. Shoulder Routine (Medium)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_shoulder_routine_medium",
        "name_fr": "Routine Épaules",
        "name_en": "Shoulder Routine",
        "description_fr": "Circuit 4 cycles. Repos minimum entre exercices, repos après chaque cycle. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Minimum rest between exercises, rest after each cycle. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a123.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.typewriter_pull_up", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 15},
                    {"name_key": "exercise.decline_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 15},
                    {"name_key": "exercise.korean_dips", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 15},
                    {"name_key": "exercise.l_sit", "sets": 4, "reps_min": 25, "reps_max": 25, "rest_seconds": 15, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 56. Meckanimal Leg — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_meckanimal_leg_medium",
        "name_fr": "Meckanimal Leg",
        "name_en": "Meckanimal Leg",
        "description_fr": "Circuit 5 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a124.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.leg_raise", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "hamstring levers"},
                    {"name_key": "exercise.standing_calf_raise", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "pyramide"},
                    {"name_key": "exercise.squat_jump", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.pistol_squat", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "chaque jambe"},
                    {"name_key": "exercise.walking_lunges", "sets": 5, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.wall_sit", "sets": 5, "reps_min": 0, "reps_max": 0, "rest_seconds": 30, "notes": "max reps"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 57. Killer Abs — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_killer_abs_medium",
        "name_fr": "Killer Abs",
        "name_en": "Killer Abs",
        "description_fr": "Circuit 5 cycles. Repos 2-3min entre cycles, repos entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest 2-3min between cycles, rest between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a125.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_knee_raise", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "chaque côté, knee hugs"},
                    {"name_key": "exercise.bicycle_crunch", "sets": 5, "reps_min": 50, "reps_max": 50, "rest_seconds": 30},
                    {"name_key": "exercise.v_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.toe_touch_crunch", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "star toe-touch sit-ups"},
                    {"name_key": "exercise.crunch", "sets": 5, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.leg_raise", "sets": 5, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.jump_rope", "sets": 5, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 58. Lucky Number 7 — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_lucky_number_7_medium",
        "name_fr": "Lucky Number 7",
        "name_en": "Lucky Number 7",
        "description_fr": "Circuit 2-3 cycles. Repos 1.5min entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 2-3 cycles. Rest 1.5min between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a126.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.tricep_dips", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.sit_up", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.squat_jump", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 59. Basic Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_basic_beginner",
        "name_fr": "Basic Beginner",
        "name_en": "Basic Beginner",
        "description_fr": "Circuit 4 cycles. Repos 1.5min entre exercices. Niveau : débutant.",
        "description_en": "Circuit 4 cycles. Rest 1.5min between exercises. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a127.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 6, "reps_max": 6, "rest_seconds": 90},
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 5, "reps_max": 5, "rest_seconds": 90},
                    {"name_key": "exercise.close_grip_chin_up", "sets": 4, "reps_min": 7, "reps_max": 7, "rest_seconds": 90},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 90},
                    {"name_key": "exercise.squat_jump", "sets": 4, "reps_min": 9, "reps_max": 9, "rest_seconds": 90},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 90},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 60. Abs 8 Pack — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_abs_8_pack_hard",
        "name_fr": "Abs 8 Pack",
        "name_en": "Abs 8 Pack",
        "description_fr": "Circuit 2 cycles. Repos entre exercices, 3min entre cycles. Niveau : difficile.",
        "description_en": "Circuit 2 cycles. Rest between exercises, 3min between cycles. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a128.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.v_up", "sets": 2, "reps_min": 50, "reps_max": 50, "rest_seconds": 30},
                    {"name_key": "exercise.l_sit_chin_up", "sets": 2, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "L-Sit leg raises"},
                    {"name_key": "exercise.leg_raise", "sets": 2, "reps_min": 300, "reps_max": 300, "rest_seconds": 30, "notes": "secondes de maintien, jambes surélevées"},
                    {"name_key": "exercise.side_plank", "sets": 2, "reps_min": 50, "reps_max": 50, "rest_seconds": 30, "notes": "hip raises"},
                    {"name_key": "exercise.crunch", "sets": 2, "reps_min": 35, "reps_max": 35, "rest_seconds": 30},
                    {"name_key": "exercise.leg_raise", "sets": 2, "reps_min": 75, "reps_max": 75, "rest_seconds": 30, "notes": "une jambe à la fois"},
                    {"name_key": "exercise.dragon_flag", "sets": 2, "reps_min": 25, "reps_max": 25, "rest_seconds": 30},
                    {"name_key": "exercise.sit_up", "sets": 2, "reps_min": 250, "reps_max": 250, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 61. Full Body Girls — Beginner — FEMALE
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_full_body_girls_beginner",
        "name_fr": "Full Body Girls",
        "name_en": "Full Body Girls",
        "description_fr": "Circuit 3 cycles. Repos entre exercices, 3-5min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 3 cycles. Rest between exercises, 3-5min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": ["female"],
        "image_url": "/streetworkout/a129.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.jumping_jacks", "sets": 3, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.standing_calf_raise", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "sur la pointe des pieds"},
                    {"name_key": "exercise.sit_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 30},
                    {"name_key": "exercise.squat", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.bench_dip", "sets": 3, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 3, "reps_min": 2, "reps_max": 2, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 62. Full Body Fat Burner — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_full_body_fat_burner_medium",
        "name_fr": "Full Body Brûle-Graisse",
        "name_en": "Full Body Fat Burner",
        "description_fr": "Circuit 3 cycles. Repos variable. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest varies. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["cut", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a130.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.chin_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "prise serrée"},
                    {"name_key": "exercise.jumping_jacks", "sets": 3, "reps_min": 90, "reps_max": 90, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.running", "sets": 3, "reps_min": 150, "reps_max": 150, "rest_seconds": 30, "notes": "mètres"},
                    {"name_key": "exercise.clap_push_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.squat_jump", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 63. Upper Body (Lada) — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_upper_body_lada_medium",
        "name_fr": "Upper Body (Lada)",
        "name_en": "Upper Body (Lada)",
        "description_fr": "Circuit 3-5 cycles. Repos entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 3-5 cycles. Rest between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a131.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "sur poignées"},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.incline_push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.reverse_t_bar_dip", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 64. Muscle Up Hunt — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_muscle_up_hunt_medium",
        "name_fr": "Muscle Up Hunt",
        "name_en": "Muscle Up Hunt",
        "description_fr": "Circuit 3 cycles. Repos entre exercices, 2min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest between exercises, 2min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a132.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.explosive_pull_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "tractions hautes poitrine"},
                    {"name_key": "exercise.clap_push_up", "sets": 3, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.explosive_pull_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "Head Bangerz"},
                    {"name_key": "exercise.typewriter_pull_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "jump muscle ups"},
                    {"name_key": "exercise.clapping_pull_up", "sets": 3, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 65. Aztec Push Up — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_aztec_push_up_hard",
        "name_fr": "Aztec Push Up",
        "name_en": "Aztec Push Up",
        "description_fr": "Circuit 3 cycles. Repos 1.5-3min entre cycles, repos entre exercices. Niveau : difficile.",
        "description_en": "Circuit 3 cycles. Rest 1.5-3min between cycles, rest between exercises. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a133.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.diamond_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.decline_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.handstand_push_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.crunch", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.tricep_dips", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.reverse_t_bar_dip", "sets": 3, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.superman_push_up", "sets": 3, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.clap_push_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 66. Triceps Routine — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_triceps_routine_medium",
        "name_fr": "Routine Triceps",
        "name_en": "Triceps Routine",
        "description_fr": "Circuit 3-4 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3-4 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a134.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.diamond_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.dips_on_straight_bar", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "mains serrées"},
                    {"name_key": "exercise.reverse_t_bar_dip", "sets": 4, "reps_min": 9, "reps_max": 9, "rest_seconds": 30},
                    {"name_key": "exercise.clap_push_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.korean_dips", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 67. Biceps - Back — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_biceps_back_medium",
        "name_fr": "Biceps - Dos",
        "name_en": "Biceps - Back",
        "description_fr": "Circuit 3-4 cycles. Repos variable. Niveau : intermédiaire.",
        "description_en": "Circuit 3-4 cycles. Rest varies. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a135.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.chin_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.l_sit_chin_up", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 4, "reps_min": 25, "reps_max": 25, "rest_seconds": 30, "notes": "prise supination (Australian)"},
                    {"name_key": "exercise.pull_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "prise serrée"},
                    {"name_key": "exercise.wide_grip_pull_up", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 30},
                    {"name_key": "exercise.negative_chin_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 68. Front Lever Hunt — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_front_lever_hunt_medium",
        "name_fr": "Front Lever Hunt",
        "name_en": "Front Lever Hunt",
        "description_fr": "Circuit 4 cycles. Repos 2min entre cycles, repos minimum entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest 2min between cycles, minimum rest between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a136.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 12, "reps_max": 12, "rest_seconds": 15},
                    {"name_key": "exercise.superman_hold", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 15, "notes": "secondes de maintien"},
                    {"name_key": "exercise.elbow_lever", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 15, "notes": "secondes de maintien"},
                    {"name_key": "exercise.dragon_flag", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 15},
                    {"name_key": "exercise.windshield_wiper", "sets": 4, "reps_min": 16, "reps_max": 16, "rest_seconds": 15},
                    {"name_key": "exercise.back_lever_hold", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 15, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 69. Parallel Bar — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_parallel_bar_medium",
        "name_fr": "Barres Parallèles",
        "name_en": "Parallel Bar",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 3min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 3min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a137.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.tricep_dips", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.tuck_planche_hold", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "tucked planche presses"},
                    {"name_key": "exercise.l_sit", "sets": 4, "reps_min": 15, "reps_max": 20, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.archer_row", "sets": 4, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "chaque main"},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "jambes tendues"},
                    {"name_key": "exercise.push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30, "notes": "sur barres parallèles"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 70. Home Full Body (Beginner)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_home_full_body_beginner",
        "name_fr": "Full Body Maison (Débutant)",
        "name_en": "Home Full Body (Beginner)",
        "description_fr": "Circuit 3 cycles. Repos 4min entre exercices. Niveau : débutant.",
        "description_en": "Circuit 3 cycles. Rest 4min between exercises. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a138.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.bench_dip", "sets": 3, "reps_min": 3, "reps_max": 3, "rest_seconds": 240, "notes": "sur chaise"},
                    {"name_key": "exercise.squat", "sets": 3, "reps_min": 8, "reps_max": 8, "rest_seconds": 240},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 6, "reps_max": 6, "rest_seconds": 240},
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 2, "reps_max": 2, "rest_seconds": 240},
                    {"name_key": "exercise.leg_raise", "sets": 3, "reps_min": 3, "reps_max": 3, "rest_seconds": 240},
                    {"name_key": "exercise.decline_push_up", "sets": 3, "reps_min": 7, "reps_max": 7, "rest_seconds": 240},
                    {"name_key": "exercise.wall_sit", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 240, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 71. Home Abs (Medium)
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_home_abs_medium",
        "name_fr": "Abdos Maison",
        "name_en": "Home Abs",
        "description_fr": "Circuit 4 cycles. Repos entre exercices, 3min entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises, 3min between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a139.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.toe_touch_crunch", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.crunch", "sets": 4, "reps_min": 35, "reps_max": 35, "rest_seconds": 30},
                    {"name_key": "exercise.crunch", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "croisés"},
                    {"name_key": "exercise.scissor_crunch", "sets": 4, "reps_min": 40, "reps_max": 40, "rest_seconds": 30, "notes": "secondes"},
                    {"name_key": "exercise.half_burpee", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.windshield_wiper", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "si barre disponible"},
                    {"name_key": "exercise.leg_raise", "sets": 4, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.v_up", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien, V hold"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 72. Planche Hunt — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_planche_hunt_medium",
        "name_fr": "Planche Hunt",
        "name_en": "Planche Hunt",
        "description_fr": "Circuit 5 cycles. Repos 1.5min entre cycles, repos entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest 1.5min between cycles, rest between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a140.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.windshield_wiper", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.tuck_planche_hold", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.pseudo_planche_push_up", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.frog_stand", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.dragon_flag", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                    {"name_key": "exercise.handstand_push_up", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30, "notes": "mur assisté"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 73. Pull - Push — Beginner
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_pull_push_beginner",
        "name_fr": "Pull - Push",
        "name_en": "Pull - Push",
        "description_fr": "Circuit 5 cycles. Repos 30s entre exercices, 4min entre cycles. Niveau : débutant.",
        "description_en": "Circuit 5 cycles. Rest 30s between exercises, 4min between cycles. Level: beginner.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "beginner",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a141.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.incline_push_up", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.pull_up", "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.push_up", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.inverted_row", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "prise supination (Australian)"},
                    {"name_key": "exercise.negative_chin_up", "sets": 5, "reps_min": 5, "reps_max": 5, "rest_seconds": 30},
                    {"name_key": "exercise.hindu_push_up", "sets": 5, "reps_min": 8, "reps_max": 8, "rest_seconds": 30},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 74. Hard Body — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_hard_body_medium",
        "name_fr": "Hard Body",
        "name_en": "Hard Body",
        "description_fr": "Circuit 3 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 3 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a142.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.muscle_up", "sets": 3, "reps_min": 6, "reps_max": 6, "rest_seconds": 30, "notes": "séquentiels"},
                    {"name_key": "exercise.push_up", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.l_sit_chin_up", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "L-Pull Ups"},
                    {"name_key": "exercise.diamond_push_up", "sets": 3, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.windshield_wiper", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30},
                    {"name_key": "exercise.pull_up", "sets": 3, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.squat", "sets": 3, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 3, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "obliques"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 75. On the Go — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_on_the_go_medium",
        "name_fr": "On the Go",
        "name_en": "On the Go",
        "description_fr": "Circuit 4 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a144.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.wide_push_up", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.clap_push_up", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.wall_sit", "sets": 4, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.squat", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.superman_hold", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 60, "reps_max": 60, "rest_seconds": 30, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 76. Abs Routine (Bar) — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_abs_routine_bar_medium",
        "name_fr": "Routine Abdos (Barre)",
        "name_en": "Abs Routine (Bar)",
        "description_fr": "Circuit 5 cycles. Repos 1min entre cycles, repos entre exercices. Niveau : intermédiaire.",
        "description_en": "Circuit 5 cycles. Rest 1min between cycles, rest between exercises. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/a145.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.hanging_leg_raise", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "jambes à la barre"},
                    {"name_key": "exercise.front_lever_hold", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "front lever raises"},
                    {"name_key": "exercise.hanging_leg_raise", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "jambes tendues in and outs"},
                    {"name_key": "exercise.hanging_knee_raise", "sets": 5, "reps_min": 30, "reps_max": 30, "rest_seconds": 30},
                    {"name_key": "exercise.leg_raise", "sets": 5, "reps_min": 10, "reps_max": 10, "rest_seconds": 30, "notes": "sur un rebord/bureau"},
                    {"name_key": "exercise.leg_raise", "sets": 5, "reps_min": 15, "reps_max": 15, "rest_seconds": 30, "notes": "secondes de maintien, jambes à 90 degrés"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 77. Upper Body (Dusan) — Hard
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_upper_body_dusan_hard",
        "name_fr": "Upper Body (Dusan)",
        "name_en": "Upper Body (Dusan)",
        "description_fr": "Circuit 10 cycles. Repos 1min entre cycles, repos minimum entre exercices. Niveau : difficile.",
        "description_en": "Circuit 10 cycles. Rest 1min between cycles, minimum rest between exercises. Level: hard.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "hard",
        "goals": ["maintain", "recomp", "endurance"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/dusan.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.muscle_up", "sets": 10, "reps_min": 7, "reps_max": 7, "rest_seconds": 15},
                    {"name_key": "exercise.tricep_dips", "sets": 10, "reps_min": 15, "reps_max": 15, "rest_seconds": 15},
                    {"name_key": "exercise.diamond_push_up", "sets": 10, "reps_min": 20, "reps_max": 20, "rest_seconds": 15},
                    {"name_key": "exercise.sit_up", "sets": 10, "reps_min": 25, "reps_max": 25, "rest_seconds": 15},
                    {"name_key": "exercise.plank", "sets": 10, "reps_min": 30, "reps_max": 30, "rest_seconds": 15, "notes": "secondes de maintien"},
                ],
            }
        ],
    },

    # ─────────────────────────────────────────────────────────────
    # 78. Abs and Core — Medium
    # ─────────────────────────────────────────────────────────────
    {
        "id": "sw_abs_and_core_medium",
        "name_fr": "Abdos et Core",
        "name_en": "Abs and Core",
        "description_fr": "Circuit 4 cycles. Repos entre exercices et entre cycles. Niveau : intermédiaire.",
        "description_en": "Circuit 4 cycles. Rest between exercises and between cycles. Level: medium.",
        "program_type": "street_workout",
        "days_per_week": 1,
        "difficulty": "medium",
        "goals": ["maintain", "recomp", "cut"],
        "training_types": ["poids_corps"],
        "genders": [],
        "image_url": "/streetworkout/abs-and-core-routine-medium.jpg",
        "days": [
            {
                "name_fr": "Circuit",
                "name_en": "Circuit",
                "exercises": [
                    {"name_key": "exercise.plank", "sets": 4, "reps_min": 45, "reps_max": 45, "rest_seconds": 30, "notes": "secondes de maintien"},
                    {"name_key": "exercise.mountain_climber", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.crunch", "sets": 4, "reps_min": 25, "reps_max": 25, "rest_seconds": 30},
                    {"name_key": "exercise.leg_raise", "sets": 4, "reps_min": 15, "reps_max": 15, "rest_seconds": 30},
                    {"name_key": "exercise.russian_twist", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.bicycle_crunch", "sets": 4, "reps_min": 20, "reps_max": 20, "rest_seconds": 30},
                    {"name_key": "exercise.side_plank", "sets": 4, "reps_min": 30, "reps_max": 30, "rest_seconds": 30, "notes": "secondes de maintien, chaque côté"},
                ],
            }
        ],
    },
]
