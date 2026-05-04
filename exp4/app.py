import os

app_env = os.getenv("APP_ENV", "not-set")
db_url = os.getenv("DB_URL", "not-set")
log_level = os.getenv("LOG_LEVEL", "not-set")

print("Application environment :", app_env)
print("Database URL            :", db_url)
print("Log level               :", log_level)