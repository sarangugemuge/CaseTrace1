import os
import logging
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from backend.app.core.config import settings

logger = logging.getLogger("casetrace.storage")

class StorageService:
    def __init__(self):
        self.bucket = settings.STORAGE_BUCKET
        self.endpoint = settings.STORAGE_ENDPOINT
        self.client = None
        self.fallback_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "storage_data",
            self.bucket
        )
        os.makedirs(self.fallback_dir, exist_ok=True)
        self._init_client()

    def _init_client(self):
        try:
            self.client = boto3.client(
                's3',
                endpoint_url=self.endpoint,
                aws_access_key_id=settings.STORAGE_ACCESS_KEY,
                aws_secret_access_key=settings.STORAGE_SECRET_KEY,
                region_name=settings.STORAGE_REGION,
                use_ssl=settings.STORAGE_SECURE,
                config=Config(
                    signature_version='s3v4',
                    connect_timeout=1,
                    read_timeout=1,
                    retries={'max_attempts': 1}
                )
            )
        except Exception as err:
            logger.warning(f"S3 client initialization notice: {err}")
            self.client = None

    def _get_fallback_filepath(self, storage_key: str) -> str:
        # Prevent unsafe path traversal
        clean_key = storage_key.lstrip("/\\").replace("\\", "/")
        target_path = os.path.abspath(os.path.join(self.fallback_dir, clean_key))
        if not target_path.startswith(os.path.abspath(self.fallback_dir)):
            raise ValueError("Unsafe storage key path traversal detected.")
        return target_path

    def upload_object(self, storage_key: str, content: bytes, mime_type: str = "application/octet-stream") -> bool:
        # 1. Try MinIO S3 object storage first
        if self.client:
            try:
                self.client.put_object(
                    Bucket=self.bucket,
                    Key=storage_key,
                    Body=content,
                    ContentType=mime_type
                )
                logger.info(f"Stored object to MinIO S3: {storage_key}")
                return True
            except Exception as e:
                logger.warning(f"MinIO S3 unavailable ({e}). Storing to designated local fallback.")

        # 2. Designated local fallback storage for dev resilience
        try:
            filepath = self._get_fallback_filepath(storage_key)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(content)
            logger.info(f"Stored object to local fallback storage: {filepath}")
            return True
        except Exception as fs_err:
            logger.error(f"Local fallback storage write failure for {storage_key}: {fs_err}")
            raise RuntimeError(f"Storage upload failure: {fs_err}")

    def download_object(self, storage_key: str) -> bytes:
        # 1. Try MinIO S3 object storage
        if self.client:
            try:
                response = self.client.get_object(Bucket=self.bucket, Key=storage_key)
                return response['Body'].read()
            except Exception as e:
                logger.warning(f"MinIO S3 download attempt for {storage_key}: {e}")

        # 2. Try local fallback storage
        try:
            filepath = self._get_fallback_filepath(storage_key)
            if os.path.exists(filepath):
                with open(filepath, "rb") as f:
                    return f.read()
        except Exception as fs_err:
            logger.warning(f"Fallback storage read error for {storage_key}: {fs_err}")

        raise RuntimeError(f"Storage object '{storage_key}' not found in MinIO or local fallback storage.")

    def delete_object(self, storage_key: str) -> bool:
        deleted = False
        if self.client:
            try:
                self.client.delete_object(Bucket=self.bucket, Key=storage_key)
                deleted = True
            except Exception as e:
                logger.warning(f"S3 delete error: {e}")

        try:
            filepath = self._get_fallback_filepath(storage_key)
            if os.path.exists(filepath):
                os.remove(filepath)
                deleted = True
        except Exception as fs_err:
            logger.warning(f"Fallback delete error: {fs_err}")

        return deleted

    def object_exists(self, storage_key: str) -> bool:
        if self.client:
            try:
                self.client.head_object(Bucket=self.bucket, Key=storage_key)
                return True
            except Exception:
                pass

        try:
            filepath = self._get_fallback_filepath(storage_key)
            return os.path.exists(filepath)
        except Exception:
            return False

    def generate_presigned_url(self, storage_key: str, expires_in: int = 300) -> str:
        if self.client:
            try:
                return self.client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket, 'Key': storage_key},
                    ExpiresIn=expires_in
                )
            except Exception:
                pass
        return f"/api/documents/preview-fallback/{storage_key}"

    def verify_storage_connection(self) -> dict:
        if self.client:
            try:
                self.client.head_bucket(Bucket=self.bucket)
                return {
                    "status": "connected",
                    "provider": "MINIO_S3",
                    "bucket": self.bucket,
                    "endpoint": self.endpoint
                }
            except ClientError as err:
                code = err.response.get('Error', {}).get('Code')
                if code == '404':
                    try:
                        self.client.create_bucket(Bucket=self.bucket)
                        return {
                            "status": "connected",
                            "provider": "MINIO_S3",
                            "bucket": self.bucket,
                            "notice": "Bucket auto-created"
                        }
                    except Exception:
                        pass
            except Exception:
                pass

        return {
            "status": "active_fallback",
            "provider": "LOCAL_FALLBACK",
            "fallback_dir": self.fallback_dir,
            "bucket": self.bucket
        }

storage_service = StorageService()
