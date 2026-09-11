"""add evidence verification and session tracking

Revision ID: 005_add_evidence_verification
Revises: 004_add_role_management
Create Date: 2026-09-11 18:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_add_evidence_verification'
down_revision: Union[str, None] = '004_add_role_management'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)

    # 1. Create sessions table if it doesn't already exist
    existing_tables = inspector.get_table_names()
    if 'sessions' not in existing_tables:
        op.create_table(
            'sessions',
            sa.Column('id', sa.String(), primary_key=True, nullable=False),
            sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('refresh_token_hash', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('last_active_at', sa.DateTime(), nullable=False),
            sa.Column('is_revoked', sa.Boolean(), nullable=False, default=False),
            sa.Column('ip_address', sa.String(), nullable=True),
            sa.Column('user_agent', sa.String(), nullable=True),
        )
        op.create_index('ix_sessions_id', 'sessions', ['id'])
        op.create_index('ix_sessions_user_id', 'sessions', ['user_id'])
        op.create_index('ix_sessions_refresh_token_hash', 'sessions', ['refresh_token_hash'])

    # 2. Add 2FA columns to users table if missing
    user_columns = [col['name'] for col in inspector.get_columns('users')]
    with op.batch_alter_table('users') as batch_op:
        if 'totp_secret' not in user_columns:
            batch_op.add_column(sa.Column('totp_secret', sa.String(), nullable=True))
        if 'totp_pending_secret' not in user_columns:
            batch_op.add_column(sa.Column('totp_pending_secret', sa.String(), nullable=True))
        if 'is_totp_enabled' not in user_columns:
            batch_op.add_column(sa.Column('is_totp_enabled', sa.Boolean(), nullable=True, default=False))
        if 'recovery_codes' not in user_columns:
            batch_op.add_column(sa.Column('recovery_codes', sa.JSON(), nullable=True))
        if 'last_authenticated_at' not in user_columns:
            batch_op.add_column(sa.Column('last_authenticated_at', sa.DateTime(), nullable=True))

    # 3. Add verification, approval, and custody columns to documents table
    doc_columns = [col['name'] for col in inspector.get_columns('documents')]
    with op.batch_alter_table('documents') as batch_op:
        if 'uploader_id' not in doc_columns:
            batch_op.add_column(sa.Column('uploader_id', sa.String(), nullable=True))
        if 'uploader_role' not in doc_columns:
            batch_op.add_column(sa.Column('uploader_role', sa.String(), nullable=True))
        if 'verification_status' not in doc_columns:
            batch_op.add_column(sa.Column('verification_status', sa.String(), nullable=True, default='PENDING_VERIFICATION'))
        if 'verified_by' not in doc_columns:
            batch_op.add_column(sa.Column('verified_by', sa.String(), nullable=True))
        if 'verifier_id' not in doc_columns:
            batch_op.add_column(sa.Column('verifier_id', sa.String(), nullable=True))
        if 'verifier_role' not in doc_columns:
            batch_op.add_column(sa.Column('verifier_role', sa.String(), nullable=True))
        if 'verified_at' not in doc_columns:
            batch_op.add_column(sa.Column('verified_at', sa.DateTime(), nullable=True))
        if 'approval_justification' not in doc_columns:
            batch_op.add_column(sa.Column('approval_justification', sa.String(), nullable=True))
        if 'rejection_reason' not in doc_columns:
            batch_op.add_column(sa.Column('rejection_reason', sa.String(), nullable=True))
        if 'approved_hash' not in doc_columns:
            batch_op.add_column(sa.Column('approved_hash', sa.String(), nullable=True))
        if 'approved_version' not in doc_columns:
            batch_op.add_column(sa.Column('approved_version', sa.Integer(), nullable=True))
        if 'chain_of_custody' not in doc_columns:
            batch_op.add_column(sa.Column('chain_of_custody', sa.JSON(), nullable=True))

def downgrade() -> None:
    with op.batch_alter_table('documents') as batch_op:
        batch_op.drop_column('chain_of_custody')
        batch_op.drop_column('approved_version')
        batch_op.drop_column('approved_hash')
        batch_op.drop_column('rejection_reason')
        batch_op.drop_column('approval_justification')
        batch_op.drop_column('verified_at')
        batch_op.drop_column('verifier_role')
        batch_op.drop_column('verifier_id')
        batch_op.drop_column('verified_by')
        batch_op.drop_column('verification_status')
        batch_op.drop_column('uploader_role')
        batch_op.drop_column('uploader_id')

    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('last_authenticated_at')
        batch_op.drop_column('recovery_codes')
        batch_op.drop_column('is_totp_enabled')
        batch_op.drop_column('totp_pending_secret')
        batch_op.drop_column('totp_secret')

    op.drop_table('sessions')
