"""remove redundant watchlist identifier index

Revision ID: e8a1c4f9b2d7
Revises: d4f2c8e6b1a0
Create Date: 2026-09-28 16:45:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'e8a1c4f9b2d7'
down_revision: Union[str, Sequence[str], None] = 'd4f2c8e6b1a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index('ix_watchlist_entries_entity_identifier', table_name='watchlist_entries')


def downgrade() -> None:
    op.create_index(
        'ix_watchlist_entries_entity_identifier',
        'watchlist_entries',
        ['entity_identifier'],
        unique=False,
    )