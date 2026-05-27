import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import os

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL_S3")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION,
    endpoint_url=AWS_ENDPOINT_URL,
)


def upload_file(file_obj, key: str, content_type: str = "audio/mpeg") -> str:
    """Upload file to S3. Returns public URL."""
    s3_client.upload_fileobj(
        file_obj,
        S3_BUCKET_NAME,
        key,
        ExtraArgs={"ContentType": content_type},
    )
    url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{key}"
    return url


def delete_file(key: str) -> bool:
    """Delete file from S3. Returns True on success."""
    try:
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=key)
        return True
    except ClientError as e:
        print(f"S3 delete error: {e}")
        return False


def generate_presigned_url(key: str, expiration: int = 3600) -> str:
    """Generate presigned URL for private object access."""
    try:
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": key},
            ExpiresIn=expiration,
        )
        return url
    except ClientError as e:
        print(f"Presigned URL error: {e}")
        return None
