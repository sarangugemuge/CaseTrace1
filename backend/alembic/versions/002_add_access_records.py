"""add access_records table and indexes

Revision ID: 002_add_access_records
Revises: 001_initial_schema
Create Date: 2026-09-03 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_add_access_records'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'access_records',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('user_role', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('document_id', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('purpose', sa.String(), nullable=True),
        sa.Column('decision', sa.String(), nullable=False),
        sa.Column('policy_id', sa.String(), nullable=False),
        sa.Column('risk_level', sa.String(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
    )
    
    op.create_index('idx_access_records_user_id', 'access_records', ['user_id'])
    op.create_index('idx_access_records_case_id', 'access_records', ['case_id'])
    op.create_index('idx_access_records_timestamp', 'access_records', ['timestamp'])
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_cases_case_number', 'cases', ['case_number'])
    op.create_index('idx_documents_case_id', 'documents', ['case_id'])
    op.create_index('idx_documents_sha256_hash', 'documents', ['sha256_hash'])

def downgrade() -> None:
    op.drop_index('idx_documents_sha256_hash', table_name='documents')
    op.drop_index('idx_documents_case_id', table_name='documents')
    op.drop_index('idx_cases_case_number', table_name='cases')
    op.drop_index('idx_users_email', table_name='users')
    op.drop_index('idx_access_records_timestamp', table_name='access_records')
    op.drop_index('idx_access_records_case_id', table_name='access_records')
    op.drop_index('idx_access_records_user_id', table_name='access_records')
    op.drop_table('access_records')
