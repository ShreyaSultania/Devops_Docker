FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY server.js .

EXPOSE 80

CMD ["node", "server.js"]

# FROM python:3.11-slim

# WORKDIR /app

# COPY requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt

# COPY app.py .

# EXPOSE 80

# CMD ["python", "app.py"]

