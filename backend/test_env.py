import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
dotenv_path = os.path.join(BASE_DIR, '.env')
print(f"Loading from: {dotenv_path}")
print(f"Exists: {os.path.exists(dotenv_path)}")

success = load_dotenv(dotenv_path, override=True)
print(f"Load success: {success}")

print(f"DB_NAME: {os.getenv('DB_NAME')}")
print(f"DB_USER: {os.getenv('DB_USER')}")
print(f"DB_HOST: {os.getenv('DB_HOST')}")
