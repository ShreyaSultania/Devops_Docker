# Scenario 6 - Container Networking for Microservices

## Problem statement

A microservice architecture requires a **frontend** container and a **backend** container to communicate **internally**.  
The development team does **not** want to hard-code IP addresses because container IPs can change.  
The correct Docker solution is to use a **user-defined bridge network** and Docker's built-in **DNS-based service discovery**.

Students must demonstrate:

- creating a user-defined network
- running two containers on the same network
- verifying name-based connectivity
- understanding why Docker DNS is better than using container IP addresses manually

Example commands:

```bash
docker network create micro-net
docker run --network micro-net ...
```

---

## Learning goals

After completing this exercise, a beginner should understand:

1. what a Docker network is
2. what a **bridge network** does
3. why containers on the same user-defined bridge network can communicate
4. how Docker automatically provides DNS name resolution
5. how to verify connectivity using `ping`, `nslookup`, `curl`, and `docker network inspect`

---

## Core concept in very simple words

Think of a Docker network like a **private room** where selected containers can talk to each other.

- If two containers join the **same Docker network**, they can usually communicate.
- If they are on **different networks**, communication may fail unless extra setup is done.
- Docker also acts like a small internal phonebook and DNS server. If one container is named `backend-service`, another container on the same user-defined bridge network can usually reach it using that name.

That means the frontend can call:

```bash
curl http://backend-service:5000
```

instead of trying to remember an IP address like `172.18.0.5`.

---

## Why using DNS names is important

Using a container name is better than using IP addresses because:

- container IP addresses can change when containers restart
- names are easier to remember
- names make the architecture easier to understand
- real microservice systems usually use service names, not raw IPs

So this is the correct idea:

- **wrong approach:** frontend calls backend using changing IP address
- **better approach:** frontend calls backend using `backend-service`

---

## Demo architecture

We will create:

- one backend container running a small Flask app
- one frontend test container that contains tools like `curl`, `ping`, and `nslookup`
- one shared Docker bridge network named `micro-net`

Logical flow:

```text
frontend-client  --->  backend-service:5000
        \                 /
         \               /
              micro-net
```

---

## Project folder structure

Create a folder like this:

```text
scenario6-microservices/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    └── Dockerfile
```

---

## Step 1 - Create the project folder

```bash
mkdir scenario6-microservices
cd scenario6-microservices
mkdir backend frontend
```

### Why this step is needed

We create a dedicated project folder so that:

- all files stay organized
- backend files and frontend files stay separate
- Docker build context remains clean
- beginners do not get confused by mixing files from different examples

---

## Step 2 - Create the backend application

Create a file named `backend/app.py`:

```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return jsonify({
        "message": "Hello from backend service",
        "service": "backend-service",
        "status": "running"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

### Why this code is written this way

- `Flask` is used because it is simple and beginner-friendly.
- `host="0.0.0.0"` is very important. It tells the application to listen on all network interfaces inside the container.
- If we used `127.0.0.1`, the service might only listen inside the container loopback and other containers could fail to reach it.
- Port `5000` is chosen because Flask commonly uses it and it keeps the example clear.

---

## Step 3 - Create backend requirements file

Create `backend/requirements.txt`:

```text
flask==3.0.0
```

### Why this step is needed

This file lists Python dependencies separately from application code.

Benefits:

- clearer project structure
- easier Docker build process
- Docker layer caching works better when dependency files are copied earlier than source code

---

## Step 4 - Create backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 5000

CMD ["python", "app.py"]
```

### Line-by-line explanation

#### `FROM python:3.11-slim`
This selects a lightweight Python base image.

Why:
- smaller than full Python image
- faster to download
- better for labs and demos

#### `WORKDIR /app`
This sets `/app` as the working folder inside the container.

Why:
- future commands become cleaner
- files stay organized

#### `COPY requirements.txt .`
This copies dependency file first.

Why:
- helps Docker cache dependency installation layers
- avoids reinstalling packages if only app code changes later

#### `RUN pip install --no-cache-dir -r requirements.txt`
This installs Flask.

Why:
- application cannot run without Flask
- `--no-cache-dir` avoids keeping unnecessary pip cache, reducing image size

#### `COPY app.py .`
This copies the backend source code.

Why:
- the app file is placed after dependency installation for better caching

#### `EXPOSE 5000`
This documents that the container listens on port 5000.

Why:
- it helps humans understand intended application port
- it does not publish the port to the host by itself

#### `CMD ["python", "app.py"]`
This starts the backend automatically when the container runs.

Why:
- no need to manually enter the container and start the app
- makes the container self-starting and predictable

---

## Step 5 - Create frontend helper Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM alpine:3.20

RUN apk add --no-cache curl iputils bind-tools

CMD ["sh", "-c", "sleep infinity"]
```

### Why this container exists

This is not a real user interface container. It is a **test client container**.

We use it because it gives us tools to verify networking:

- `curl` tests HTTP connectivity
- `ping` tests basic reachability
- `nslookup` checks DNS resolution

### Why `sleep infinity` is used

If a container finishes its main command, it stops.

We want the frontend test container to remain running so that we can execute commands inside it later using `docker exec`.

So `sleep infinity` keeps it alive in a simple way.

---

## Step 6 - Build the backend image

From the project root, run:

```bash
docker build -t backend:v1 ./backend
```

### Why this command works

- `docker build` creates an image
- `-t backend:v1` gives it a readable name and version tag
- `./backend` tells Docker to use the `backend` folder as the build context

### What students should observe

Docker will:

1. download the base image if not already present
2. copy `requirements.txt`
3. install Flask
4. copy `app.py`
5. create the final backend image

---

## Step 7 - Build the frontend test image

```bash
docker build -t frontend:v1 ./frontend
```

### Why this step is needed

We need a second container to simulate another microservice or client.

This image gives us a controlled place from which we can test internal communication.

---

## Step 8 - Create the user-defined bridge network

```bash
docker network create micro-net
```

### Why this is the most important step

This network is the communication layer between the services.

Why a **user-defined bridge network** instead of the default bridge?

- user-defined bridge networks provide automatic DNS resolution between containers
- containers can reach each other by name
- isolation is cleaner and easier to manage
- it is more suitable for microservice-style communication

If both containers join `micro-net`, Docker will allow them to communicate internally and resolve each other by container name.

---

## Step 9 - Run the backend container on the network

```bash
docker run -d --name backend-service --network micro-net backend:v1
```

### Explanation of each part

- `docker run` starts a container from an image
- `-d` means detached mode, so it runs in background
- `--name backend-service` gives the container a stable, readable name
- `--network micro-net` connects the container to the network we created
- `backend:v1` is the image name

### Why the name matters

The name `backend-service` becomes the DNS name other containers can use on the same user-defined network.

So the frontend container can reach the backend with:

```bash
curl http://backend-service:5000
```

---

## Step 10 - Run the frontend test container on the same network

```bash
docker run -d --name frontend-client --network micro-net frontend:v1
```

### Why this step matters

Now both containers are on the same network:

- `backend-service`
- `frontend-client`

Because both are attached to `micro-net`, Docker networking and DNS can connect them internally.

---

## Step 11 - Verify that both containers are running

```bash
docker ps
```

### What to check

You should see both containers in the output:

- `backend-service`
- `frontend-client`

This confirms the services are alive before testing connectivity.

---

## Step 12 - Verify network membership

```bash
docker network inspect micro-net
```

### Why this step is useful

This command shows detailed information about the network, including:

- network driver
- subnet and gateway
- attached containers
- container IP addresses on that network

### What students should learn here

Even though IP addresses are shown, we still prefer **DNS names** for communication because names are more stable than IPs.

---

## Step 13 - Test DNS resolution from frontend to backend

```bash
docker exec frontend-client nslookup backend-service
```

### Why this step is very important

This proves Docker's built-in DNS is working.

If name resolution works, the frontend container can find the backend container by name without manually knowing its IP address.

This is the heart of microservice-friendly communication.

---

## Step 14 - Test basic reachability with ping

```bash
docker exec frontend-client ping -c 4 backend-service
```

### Why this step helps

`ping` checks whether the frontend can reach the backend container over the network.

If ping works, then:

- both containers are on the same network
- DNS name resolution is likely working
- basic network communication exists

Note: some production containers may not include `ping`, but for learning this is a helpful tool.

---

## Step 15 - Test actual application communication using curl

```bash
docker exec frontend-client curl http://backend-service:5000
```

### Why this is the most meaningful test

This tests the real application-level communication, not just raw network access.

If this command works, it proves:

- frontend container resolved backend name through Docker DNS
- frontend container reached backend container over the bridge network
- backend application is actually listening and serving requests on port 5000

Expected output:

```json
{"message":"Hello from backend service","service":"backend-service","status":"running"}
```

---

## Step 16 - Optional host-side verification

If you also want the host machine browser to reach the backend, you can publish the port:

```bash
docker rm -f backend-service
docker run -d --name backend-service --network micro-net -p 5000:5000 backend:v1
```

Then test from host:

```bash
curl http://localhost:5000
```

### Important understanding

- `--network micro-net` is for **container-to-container** communication
- `-p 5000:5000` is for **host-to-container** communication

These are related but different concepts.

---

## What exactly is Docker DNS doing here?

When `frontend-client` tries to contact `backend-service`, Docker's internal DNS service translates that container name into the correct container IP on `micro-net`.

So conceptually this happens:

```text
frontend-client asks: "Where is backend-service?"
Docker DNS replies: "backend-service is at this IP on micro-net."
frontend-client then sends request to that address.
```

This is why DNS-based communication is preferred over hard-coded IPs.

---

## Common mistakes and why they happen

### Mistake 1 - Containers are not on the same network

If one container is on `micro-net` and the other is on the default bridge network, communication may fail.

### Mistake 2 - Using `localhost` instead of container name

Inside the frontend container, `localhost` means the frontend container itself, not the backend.

Wrong:

```bash
curl http://localhost:5000
```

Correct:

```bash
curl http://backend-service:5000
```

### Mistake 3 - Backend app listens only on `127.0.0.1`

If Flask binds only to loopback, other containers cannot reach it.

That is why we used:

```python
app.run(host="0.0.0.0", port=5000)
```

### Mistake 4 - Forgetting DNS tools

If the frontend image does not include `curl`, `ping`, or `nslookup`, verification becomes harder.

### Mistake 5 - Confusing `EXPOSE` with `-p`

`EXPOSE` documents the internal application port. It does **not** publish it to the host.

---

## Full command sequence in one place

```bash
mkdir scenario6-microservices
cd scenario6-microservices
mkdir backend frontend

docker build -t backend:v1 ./backend
docker build -t frontend:v1 ./frontend

docker network create micro-net

docker run -d --name backend-service --network micro-net backend:v1
docker run -d --name frontend-client --network micro-net frontend:v1

docker ps
docker network inspect micro-net
docker exec frontend-client nslookup backend-service
docker exec frontend-client ping -c 4 backend-service
docker exec frontend-client curl http://backend-service:5000
```

---

## Expected learning outcome

After completing this lab, students should be able to explain that:

- a user-defined bridge network allows internal container communication
- Docker DNS lets containers discover each other by name
- microservices should communicate using service names rather than changing IP addresses
- connectivity can be validated using `docker network inspect`, `nslookup`, `ping`, and `curl`

---

## Viva questions

1. Why is a user-defined bridge network better than the default bridge for microservices?
2. Why should the frontend call `backend-service` instead of a container IP?
3. What is the role of Docker DNS in this setup?
4. Why do we use `0.0.0.0` in the Flask app?
5. What is the difference between internal network communication and host port publishing?
6. Why does `localhost` inside a container not mean another container?
7. What does `docker network inspect` show?
8. What is the purpose of `sleep infinity` in the frontend container?

---

## Final conclusion

The correct networking solution for this microservice scenario is to create a **user-defined bridge network**, attach both containers to it, and let them communicate using **Docker DNS names** such as `backend-service`. This approach is cleaner, more stable, and more realistic than hard-coding IP addresses. It also matches how many real containerized microservice systems are designed.
