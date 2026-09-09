import logging
import io
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
                config=Config(signature_version='s3v4', connect_timeout=1, read_timeout=1, retries={'max_attempts': 1})
            )
        except Exception as err:
            logger.error(f"Failed to initialize S3 storage client: {err}")
            self.client = None

    def upload_object(self, storage_key: str, content: bytes, mime_type: str = "application/octet-stream") -> bool:
        if not self.client:
            raise RuntimeError("MinIO object storage is currently offline or unreachable.")
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=storage_key,
                Body=content,
                ContentType=mime_type
            )
            return True
        except Exception as e:
            logger.warning(f"S3 upload error for key {storage_key}: {e}")
            raise RuntimeError(f"Storage upload failure: {e}")

    def download_object(self, storage_key: str) -> bytes:
        if not self.client:
            raise RuntimeError("MinIO object storage is currently offline or unreachable.")
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=storage_key)
            return response['Body'].read()
        except Exception as e:
            logger.warning(f"S3 download error for key {storage_key}: {e}")
            raise RuntimeError(f"Storage download failure: {e}")

    def delete_object(self, storage_key: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.delete_object(Bucket=self.bucket, Key=storage_key)
            return True
        except Exception as e:
            logger.warning(f"S3 delete error for key {storage_key}: {e}")
            return False

    def object_exists(self, storage_key: str) -> bool:
        if not self.client:
            return False
        try:
            self.client.head_object(Bucket=self.bucket, Key=storage_key)
            return True
        except Exception:
            return False

    def generate_presigned_url(self, storage_key: str, expires_in: int = 300) -> str:
        if not self.client:
            raise RuntimeError("MinIO object storage is currently offline or unreachable.")
        try:
            return self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': storage_key},
                ExpiresIn=expires_in
            )
        except Exception as e:
            logger.error(f"Presigned URL generation error: {e}")
            raise RuntimeError(f"Presigned URL generation failed: {e}")

    def verify_storage_connection(self) -> dict:
        if not self.client:
            return {"status": "error", "error": "S3 client initialization failed."}
        try:
            # Check bucket existence or list buckets
            self.client.head_bucket(Bucket=self.bucket)
            return {"status": "connected", "bucket": self.bucket, "endpoint": self.endpoint}
        except ClientError as err:
            code = err.response['Error']['Code']
            if code == '404':
                # Attempt to auto-create bucket if missing in dev
                try:
                    self.client.create_bucket(Bucket=self.bucket)
                    return {"status": "connected", "bucket": self.bucket, "notice": "Bucket auto-created"}
                except Exception as c_err:
                    return {"status": "error", "bucket": self.bucket, "error": f"Bucket missing: {c_err}"}
            return {"status": "error", "bucket": self.bucket, "error": err.response['Error']['Message']}
        except Exception as ex:
            return {"status": "error", "endpoint": self.endpoint, "error": str(ex)}

storage_service = StorageService()
