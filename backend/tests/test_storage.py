import pytest
from unittest.mock import MagicMock, patch
from backend.app.core.config import Settings
from backend.app.services.storage_service import StorageService

def test_storage_settings_defaults():
    s = Settings()
    assert s.STORAGE_ENDPOINT == "http://localhost:9000"
    assert s.STORAGE_BUCKET == "casetrace-documents"
    assert s.STORAGE_ACCESS_KEY == "minioadmin"

def test_storage_service_methods():
    service = StorageService()
    service.client = MagicMock()

    # Upload test
    service.upload_object("test/key.pdf", b"sample content", "application/pdf")
    service.client.put_object.assert_called_once_with(
        Bucket=service.bucket,
        Key="test/key.pdf",
        Body=b"sample content",
        ContentType="application/pdf"
    )

    # Download test
    mock_body = MagicMock()
    mock_body.read.return_value = b"sample content"
    service.client.get_object.return_value = {'Body': mock_body}

    content = service.download_object("test/key.pdf")
    assert content == b"sample content"

    # Delete test
    service.delete_object("test/key.pdf")
    service.client.delete_object.assert_called_once_with(
        Bucket=service.bucket,
        Key="test/key.pdf"
    )
