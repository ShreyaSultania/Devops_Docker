# Scenario 5: Application Port Exposure

## Real-world situation

A company has packaged a web application inside a Docker container. The application runs correctly inside the container, but users on the host machine cannot open it in the browser unless the correct port is exposed and mapped properly.

The goal is to design a Docker-based solution so the web application becomes reachable from the host machine.

---

## What students must demonstrate

Students must show that they can:

- define `EXPOSE` in a Dockerfile
- build the image
- run the container with port mapping
- access the application from the host machine
- understand the difference between `EXPOSE` and `-p`
- verify that the container is actually listening on the expected port

Example command:

```bash
docker run -p 8080:80 webapp:v1
```

---

## Core concept in very simple words

A container is like a small isolated room.  
The application may be running inside that room on some internal port such as port 80, but people outside the room cannot reach it automatically.

To make the application reachable from the host machine, two things are important:

1. the application must listen on a port inside the container
2. Docker must map a host port to that container port

This is where `EXPOSE` and `-p` come into the picture.

---

## Difference between `EXPOSE` and port mapping

### `EXPOSE`
`EXPOSE` is written inside the Dockerfile.

It tells readers and tools that the containerized application is expected to use a particular port, such as port 80.

Important point: `EXPOSE` by itself does **not** publish the port to the host.

### `-p`
The `-p` option is given at runtime with `docker run`.

Example:

```bash
docker run -p 8080:80 webapp:v1
```

This means:

- host machine port = `8080`
- container internal port = `80`

So if the application listens on port 80 inside the container, users can open it from the host using:

```text
http://localhost:8080
```

---

## Demonstration project structure

```text
webapp/
│
├── app.py
├── requirements.txt
└── Dockerfile
```

---

## Step 1: Create the project folder

Open terminal or command prompt:

```bash
mkdir webapp
cd webapp
```

### Why this step is needed
A dedicated folder keeps all files together. It avoids confusion and makes the Docker build context clear and clean.

---

## Step 2: Create the application file

Create a file named `app.py` and write the following code:

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Web application is running successfully inside the container."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
```

### Detailed reasoning
This is a simple Flask web application.

#### `from flask import Flask`
Imports Flask framework.

#### `app = Flask(__name__)`
Creates the application object.

#### `@app.route("/")`
Defines the home page route.

#### `return "Web application is running successfully inside the container."`
Sends a simple response to the browser.

#### `app.run(host="0.0.0.0", port=80)`
This line is extremely important.

- `host="0.0.0.0"` means the app listens on all network interfaces inside the container.
- If we use `127.0.0.1`, the app may only listen internally and may not be reachable from outside the container.
- `port=80` means the application listens on port 80 inside the container.

This matches the port we will expose in the Dockerfile.

---

## Step 3: Create `requirements.txt`

Create a file named `requirements.txt`:

```text
flask==3.0.0
```

### Why this step is needed
The container needs Flask to run the application.  
This file tells Docker which Python package should be installed.

---

## Step 4: Create the Dockerfile

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 80

CMD ["python", "app.py"]
```

---

## Step 5: Understand each Dockerfile instruction in detail

### `FROM python:3.11-slim`
This selects the base image.

#### Why this is used
- it already contains Python
- `slim` version is smaller than the full image
- smaller image means faster download and less storage usage

### `WORKDIR /app`
This sets the working directory inside the container.

#### Why this is used
It keeps the application files organized. All future commands in the Dockerfile run relative to `/app`.

### `COPY requirements.txt .`
Copies only the dependency file first.

#### Why this is used
This is a good Docker practice because dependency installation can be cached.

### `RUN pip install --no-cache-dir -r requirements.txt`
Installs Flask inside the container.

#### Why this is used
Without Flask, the Python application will fail.

`--no-cache-dir` avoids storing extra pip cache files and helps keep the image smaller.

### `COPY app.py .`
Copies the application source code.

#### Why this is used
The container needs the Python file to run the web application.

### `EXPOSE 80`
Documents that the application uses port 80 inside the container.

#### Why this is used
It improves readability and makes the intended application port clear.

Very important: `EXPOSE` does not by itself make the application reachable from the host. It only documents the port.

### `CMD ["python", "app.py"]`
Defines the default startup command.

#### Why this is used
When the container starts, it automatically runs the web application.

---

## Step 6: Build the Docker image

Run:

```bash
docker build -t webapp:v1 .
```

### Why this step is needed
This command creates the Docker image from the Dockerfile.

### Meaning of each part
- `docker build` = build an image
- `-t webapp:v1` = assign image name `webapp` and tag `v1`
- `.` = use current folder as build context

---

## Step 7: Run the container with port mapping

Run:

```bash
docker run -p 8080:80 webapp:v1
```

### Detailed reasoning
This is the most important step.

It creates a bridge between:

- host port `8080`
- container port `80`

So:

- application listens on `80` inside the container
- user opens `8080` on the host machine
- Docker forwards traffic from host port `8080` to container port `80`

---

## Step 8: Test the application from the host machine

Open a browser and visit:

```text
http://localhost:8080
```

You should see:

```text
Web application is running successfully inside the container.
```

### Why this works
Because Docker mapped host port 8080 to container port 80.

---

## Step 9: Verify using terminal instead of browser

If browser is not available, use:

```bash
curl http://localhost:8080
```

Expected output:

```text
Web application is running successfully inside the container.
```

### Why this verification matters
It proves that the application is not only running inside the container, but is also reachable from the host.

---

## Step 10: Check running containers

```bash
docker ps
```

### What students should observe
They should see port mapping information like:

```text
0.0.0.0:8080->80/tcp
```

### Meaning
Traffic sent to port 8080 on the host is being forwarded to port 80 inside the container.

---

## Step 11: Verify image instructions

To inspect the image history:

```bash
docker history webapp:v1
```

### Why this step is useful
It helps students verify that the Dockerfile instructions were translated into image layers.

They can also confirm that `EXPOSE 80` appears in the image history metadata.

---

## Step 12: Stop the running container

If the container is running in the foreground, press:

```text
Ctrl + C
```

Or if running in detached mode, first find the container ID:

```bash
docker ps
```

Then stop it:

```bash
docker stop <container_id>
```

---

## Step 13: Optional detached mode

Run the container in background:

```bash
docker run -d -p 8080:80 webapp:v1
```

### Why this is useful
- `-d` means detached mode
- terminal remains free for other commands
- useful during testing

Then verify:

```bash
docker ps
curl http://localhost:8080
```

---

## Step 14: Common mistakes and why they happen

### Mistake 1: Using `EXPOSE` but forgetting `-p`
If students only write:

```dockerfile
EXPOSE 80
```

but run:

```bash
docker run webapp:v1
```

the application may still not be reachable from the host.

#### Why
Because `EXPOSE` does not publish the port.

---

### Mistake 2: Application listens on wrong port
Suppose app listens on port 5000 but Docker maps `8080:80`.

Then the mapping is wrong.

#### Why
Docker forwards traffic to container port 80, but the app is not listening there.

---

### Mistake 3: Using `127.0.0.1` inside the app
If the Flask app is started like this:

```python
app.run(host="127.0.0.1", port=80)
```

it may not be accessible correctly from outside the container.

#### Why
Inside a container, `127.0.0.1` refers to the container’s own loopback interface.  
Using `0.0.0.0` is the correct approach when you want incoming network traffic from outside the container.

---

### Mistake 4: Host port already in use
If port 8080 is already occupied on the host, Docker may throw an error.

#### Solution
Use another host port, for example:

```bash
docker run -p 9090:80 webapp:v1
```

Then access:

```text
http://localhost:9090
```

---

## Step 15: Full implementation summary

### `app.py`
```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Web application is running successfully inside the container."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)
```

### `requirements.txt`
```text
flask==3.0.0
```

### `Dockerfile`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

EXPOSE 80

CMD ["python", "app.py"]
```

### Build command
```bash
docker build -t webapp:v1 .
```

### Run command
```bash
docker run -p 8080:80 webapp:v1
```

### Test command
```bash
curl http://localhost:8080
```

### Inspect layers
```bash
docker history webapp:v1
```

---

## Step 16: Command sequence for beginners

```bash
mkdir webapp
cd webapp
docker build -t webapp:v1 .
docker run -p 8080:80 webapp:v1
```

In another terminal:

```bash
curl http://localhost:8080
docker ps
docker history webapp:v1
```

---

## Step 17: Viva-style answers

### Q1. What is the purpose of `EXPOSE`?
It documents the port used by the application inside the container.

### Q2. Does `EXPOSE` make the app accessible from the host automatically?
No. Port publishing still requires `docker run -p`.

### Q3. What does `-p 8080:80` mean?
It maps host port 8080 to container port 80.

### Q4. Why is `0.0.0.0` used in Flask?
It allows the application to listen on all interfaces inside the container.

### Q5. How do you verify port mapping?
By using `docker ps`, browser access, or `curl`.

---

## Final conclusion

To make a containerized web application accessible from the host machine, the Dockerfile should clearly document the application port using `EXPOSE`, and the container must be started with runtime port mapping using `docker run -p host_port:container_port`. The application itself must listen on the correct port and bind to `0.0.0.0` so it can accept incoming traffic properly.

## One-line conclusion

`EXPOSE` describes the application port, while `-p` actually connects that container port to the host machine.
