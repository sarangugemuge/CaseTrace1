"""add role management table and document metadata fields

Revision ID: 004_add_role_management
Revises: 003_add_storage_metadata
Create Date: 2026-09-11 16:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004_add_role_management'
down_revision: Union[str, None] = '003_add_storage_metadata'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Create roles table for dynamic role & permission governance
    op.create_table(
        'roles',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(), nullable=False, unique=True),
        sa.Column('role_key', sa.String(), nullable=False, unique=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('permissions', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_system', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
    )
    op.create_index('idx_roles_key', 'roles', ['role_key'])

    # 2. Add metadata fields to documents table
    op.add_column('documents', sa.Column('description', sa.String(), nullable=True))
    op.add_column('documents', sa.Column('notes', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('documents', 'notes')
    op.drop_column('documents', 'description')
    op.drop_index('idx_roles_key', table_name='roles')
    op.drop_table('roles')
