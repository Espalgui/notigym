"""add training_type and water_goal_ml

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-03-20

"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("training_type", sa.String(20), nullable=True))
    op.add_column(
        "nutrition_goals",
        sa.Column("water_goal_ml", sa.Integer(), nullable=True, server_default="2000"),
    )


def downgrade():
    op.drop_column("users", "training_type")
    op.drop_column("nutrition_goals", "water_goal_ml")
