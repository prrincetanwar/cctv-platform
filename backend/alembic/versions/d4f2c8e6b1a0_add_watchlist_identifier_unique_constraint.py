"""add unique constraint for watchlist identifiers

Revision ID: d4f2c8e6b1a0
Revises: 91cdb6076be9
Create Date: 2026-09-28 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'd4f2c8e6b1a0'
down_revision: Union[str, Sequence[str], None] = '91cdb6076be9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        'uq_watchlist_entries_entity_identifier',
        'watchlist_entries',
        ['entity_identifier'],
    )


def downgrade() -> None:
    op.drop_constraint(
        'uq_watchlist_entries_entity_identifier',
        'watchlist_entries',
        type_='unique',
    )