"""add storage metadata fields to documents

Revision ID: 003_add_storage_metadata
Revises: 002_add_access_records
Create Date: 2026-09-03 13:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_add_storage_metadata'
down_revision: Union[str, None] = '002_add_access_records'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('documents', sa.Column('storage_key', sa.String(), nullable=True))
    op.add_column('documents', sa.Column('storage_bucket', sa.String(), nullable=True))
    op.add_column('documents', sa.Column('file_size', sa.Integer(), nullable=True))
    op.add_column('documents', sa.Column('mime_type', sa.String(), nullable=True))
    op.add_column('documents', sa.Column('original_filename', sa.String(), nullable=True))
    op.create_index('idx_documents_storage_key', 'documents', ['storage_key'])

def downgrade() -> None:
    op.drop_index('idx_documents_storage_key', table_name='documents')
    op.drop_column('documents', 'original_filename')
    op.drop_column('documents', 'mime_type')
    op.drop_column('documents', 'file_size')
    op.drop_column('documents', 'storage_bucket')
    op.drop_column('documents', 'storage_key')
