"""add is_favorite to workout_programs

Revision ID: c3d4e5f6g7h8
Revises: b2c3d4e5f6a7
Create Date: 2026-03-26

"""
from alembic import op
import sqlalchemy as sa

revision = "c3d4e5f6g7h8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "workout_programs",
        sa.Column("is_favorite", sa.Boolean(), server_default="false", nullable=False),
    )


def downgrade():
    op.drop_column("workout_programs", "is_favorite")
