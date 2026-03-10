import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME', '')
NOVA_MODEL_ID = os.getenv('NOVA_MODEL_ID', "amazon.nova-lite-v1:8")
KNOWLEDGE_BASE_ID = os.getenv('KNOWLEDGE_BASE_ID', '')