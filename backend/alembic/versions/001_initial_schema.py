"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-03 10:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('department', sa.String(), nullable=False),
        sa.Column('designation', sa.String(), nullable=False),
        sa.Column('avatar', sa.String(), nullable=False),
        sa.Column('assigned_case_ids', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )
    
    op.create_table(
        'cases',
        sa.Column('case_id', sa.String(), nullable=False, primary_key=True),
        sa.Column('case_number', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('priority', sa.String(), nullable=True),
        sa.Column('classification', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=False),
        sa.Column('lead_investigator', sa.String(), nullable=False),
        sa.Column('assigned_users', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('incident_date', sa.String(), nullable=False),
        sa.Column('case_stage', sa.String(), nullable=False),
        sa.Column('victims', sa.JSON(), nullable=True),
        sa.Column('suspects', sa.JSON(), nullable=True),
        sa.Column('evidence_count', sa.Integer(), nullable=True),
        sa.Column('document_count', sa.Integer(), nullable=True),
        sa.Column('blockchain_anchor_id', sa.String(), nullable=False),
    )

    op.create_table(
        'documents',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('case_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('sensitivity', sa.String(), nullable=False),
        sa.Column('version', sa.Integer(), nullable=True),
        sa.Column('version_history', sa.JSON(), nullable=True),
        sa.Column('uploaded_by', sa.String(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(), nullable=True),
        sa.Column('sha256_hash', sa.String(), nullable=False),
        sa.Column('blockchain_record_id', sa.String(), nullable=False),
        sa.Column('allowed_roles', sa.JSON(), nullable=True),
        sa.Column('allowed_purposes', sa.JSON(), nullable=True),
        sa.Column('integrity_status', sa.String(), nullable=True),
    )

    op.create_table(
        'audit_logs',
        sa.Column('event_id', sa.String(), nullable=False, primary_key=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('user_name', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('case_id', sa.String(), nullable=True),
        sa.Column('document_id', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('purpose', sa.String(), nullable=True),
        sa.Column('result', sa.String(), nullable=False),
        sa.Column('risk_level', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('ip_address', sa.String(), nullable=True),
    )

def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('documents')
    op.drop_table('cases')
    op.drop_table('users')
