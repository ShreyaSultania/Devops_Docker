FROM python:3.11-slim

WORKDIR /app

ENV APP_ENV=development
ENV DB_URL=mysql://localhost:3306/devdb
ENV LOG_LEVEL=info

COPY app.py .

CMD ["python", "app.py"]