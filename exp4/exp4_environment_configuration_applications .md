# Scenario 4: Environment Configuration for Applications

## Real-life problem statement

A company wants the same application image to run in different environments such as development, testing, and production.  
Instead of changing the application code every time, the team wants to pass settings like:

- application mode
- database URL
- log level
- service port

inside the container.

The correct Docker-based solution is to use **environment variables** with the `ENV` instruction in the Dockerfile and `-e` options during `docker run`.

---

## What students must demonstrate

Students must be able to:

- define environment variables in a Dockerfile
- understand what `ENV` does
- run a container with custom values using `docker run -e`
- verify that the variables are available inside the running container
- understand the difference between default values and runtime overrides

---

## Learning objective

By the end of this exercise, a beginner should understand:

- what environment variables are
- why they are useful in containers
- how Docker stores default variables in an image
- how runtime variables override Dockerfile defaults
- how to inspect and verify variable values inside a container

---

## Simple conceptual explanation

An environment variable is a named value stored in the operating system environment.

Examples:

- `APP_ENV=production`
- `DB_URL=mysql://dbserver:3306/companydb`
- `LOG_LEVEL=debug`

Applications read these values at runtime and behave accordingly.

This is useful because:

- the same image can be reused in many environments
- sensitive or deployment-specific values do not need to be hardcoded in source code
- developers, testers, and admins can configure behavior without editing the application itself

---

## Why this matters in Docker

Without environment variables, teams often make mistakes like:

- writing database URLs directly inside the source code
- creating separate images for dev, test, and production
- rebuilding the image every time a configuration value changes

This is inefficient.

Using `ENV` solves that by separating:

- **application code**
- **application configuration**

This is a core DevOps and container best practice.

---

## Demo design

We will create a small Python application that prints the values of environment variables.

We will demonstrate:

1. a Dockerfile with default values using `ENV`
2. building the image
3. running the container with defaults
4. running the container with overridden values using `-e`
5. verifying the values from container output and shell commands

---

## Project folder structure

```text
env-demo/
├── app.py
├── Dockerfile
└── .dockerignore
```

---

## Step 1: Create the project folder

Open terminal or command prompt and create a new folder:

```bash
mkdir env-demo
cd env-demo
```

### Why this step is needed

We create a separate folder so that:

- all project files stay organized
- Docker gets a clean build context
- accidental unrelated files are not copied into the image

A build context means the folder content sent to Docker during `docker build`.

---

## Step 2: Create the application file

Create a file named `app.py` with this code:

```python
import os

app_env = os.getenv("APP_ENV", "not-set")
db_url = os.getenv("DB_URL", "not-set")
log_level = os.getenv("LOG_LEVEL", "not-set")

print("Application environment :", app_env)
print("Database URL            :", db_url)
print("Log level               :", log_level)
```

### Why this code is used

This code reads environment variables using `os.getenv()`.

- `APP_ENV` tells the application whether it is running in development or production
- `DB_URL` tells the application where the database is located
- `LOG_LEVEL` controls how much log output the application should produce

The second value in `os.getenv()` is a fallback default.  
If the variable is missing, Python prints `"not-set"`.

This helps beginners clearly see whether Docker passed the variables correctly or not.

---

## Step 3: Create the Dockerfile

Create a file named `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV APP_ENV=development
ENV DB_URL=mysql://localhost:3306/devdb
ENV LOG_LEVEL=info

COPY app.py .

CMD ["python", "app.py"]
```

---

## Step 4: Understand every Dockerfile line

### `FROM python:3.11-slim`

This tells Docker to start from a lightweight Python base image.

Why this is good:

- Python is already installed
- the `slim` variant is smaller than the full image
- smaller images download faster and use less storage

### `WORKDIR /app`

This sets the working directory inside the container.

Why this is useful:

- Docker commands that follow will run inside `/app`
- files remain organized
- no need to type full paths repeatedly

### `ENV APP_ENV=development`

This defines a default environment variable inside the image.

Meaning:

- unless changed later, the container will use `development`

### `ENV DB_URL=mysql://localhost:3306/devdb`

This sets a default database URL.

Meaning:

- the application will print this value unless overridden at runtime

### `ENV LOG_LEVEL=info`

This sets the default logging level.

Meaning:

- normal informational logs are expected by default

### `COPY app.py .`

This copies the Python application file from the host machine into the image.

Why we need it:

- without copying the application file, the container would not have anything to run

### `CMD ["python", "app.py"]`

This tells Docker what command to run automatically when the container starts.

This means:

- when the user runs `docker run myapp:v1`
- Docker automatically executes `python app.py`

---

## Step 5: Create `.dockerignore`

Create a file named `.dockerignore`:

```text
__pycache__
*.pyc
*.pyo
*.pyd
.git
.gitignore
.env
credentials.txt
```

### Why this step matters

This scenario is about environment configuration, but `.dockerignore` is still useful.

It helps avoid copying:

- Python cache files
- Git metadata
- accidental secret files like `.env`
- other unnecessary files

This keeps the image cleaner and safer.

---

## Step 6: Build the Docker image

Run:

```bash
docker build -t myapp:v1 .
```

### What this command means

- `docker build` creates an image
- `-t myapp:v1` gives the image a name and tag
- `.` means current folder is the build context

### Why this step matters

Until you build the image, Docker only has text files.  
After build, Docker creates a runnable container image containing:

- Python runtime
- your application file
- default environment variables
- startup command

---

## Step 7: Run the container with default values

Run:

```bash
docker run --rm myapp:v1
```

### Expected output

```text
Application environment : development
Database URL            : mysql://localhost:3306/devdb
Log level               : info
```

### Why this happens

The container uses the values defined with `ENV` in the Dockerfile because no runtime override was provided.

### Why `--rm` is used

`--rm` tells Docker to remove the container automatically after it exits.

This is helpful for beginners because:

- it keeps the system clean
- no stopped containers accumulate unnecessarily

---

## Step 8: Run the container with a custom application mode

Run:

```bash
docker run --rm -e APP_ENV=production myapp:v1
```

### Expected output

```text
Application environment : production
Database URL            : mysql://localhost:3306/devdb
Log level               : info
```

### What changed

Only `APP_ENV` changed.

### Why this is important

This proves that runtime configuration can override Dockerfile defaults without changing the image itself.

That means:

- one image can be reused across many environments
- configuration becomes flexible and portable

---

## Step 9: Run the container with multiple custom values

Run:

```bash
docker run --rm -e APP_ENV=production -e DB_URL=mysql://prod-db:3306/companydb -e LOG_LEVEL=warning myapp:v1
```

### Expected output

```text
Application environment : production
Database URL            : mysql://prod-db:3306/companydb
Log level               : warning
```

### Why this step matters

This demonstrates the practical real-world use case:

- same image
- different runtime settings
- no code changes
- no rebuild needed

This is exactly how applications are configured in many production container environments.

---

## Step 10: Verify variables from inside the container

Sometimes students should verify configuration directly from the container shell.

Run:

```bash
docker run --rm -it -e APP_ENV=production -e DB_URL=mysql://prod-db:3306/companydb -e LOG_LEVEL=warning myapp:v1 env
```

### What this does

Here, `env` is used as the command instead of the default `CMD`.

It prints all environment variables visible to the container.

### What students should look for

They should confirm that lines similar to these are visible:

```text
APP_ENV=production
DB_URL=mysql://prod-db:3306/companydb
LOG_LEVEL=warning
```

### Why this is useful

This verifies configuration from the operating-system level, not just from application output.

That is valuable for troubleshooting.

---

## Step 11: Alternative verification using Python directly

Run:

```bash
docker run --rm -e APP_ENV=testing myapp:v1 python -c "import os; print(os.getenv('APP_ENV'))"
```

### Expected output

```text
testing
```

### Why this is helpful

This shows that:

- the container received the variable correctly
- Python can read it successfully
- runtime override is functioning properly

---

## Step 12: Understand the priority of values

Docker configuration usually works in this order:

1. application fallback value inside code
2. Dockerfile `ENV` default
3. runtime `docker run -e` override

### Example from this demo

In code:

```python
os.getenv("APP_ENV", "not-set")
```

In Dockerfile:

```dockerfile
ENV APP_ENV=development
```

At runtime:

```bash
docker run -e APP_ENV=production myapp:v1
```

Final value seen by the app:

```text
production
```

### Why

Because runtime `-e` overrides the Dockerfile `ENV` value.

This is a very important exam and viva concept.

---

## Step 13: Full implementation summary

### `app.py`

```python
import os

app_env = os.getenv("APP_ENV", "not-set")
db_url = os.getenv("DB_URL", "not-set")
log_level = os.getenv("LOG_LEVEL", "not-set")

print("Application environment :", app_env)
print("Database URL            :", db_url)
print("Log level               :", log_level)
```

### `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV APP_ENV=development
ENV DB_URL=mysql://localhost:3306/devdb
ENV LOG_LEVEL=info

COPY app.py .

CMD ["python", "app.py"]
```

### `.dockerignore`

```text
__pycache__
*.pyc
*.pyo
*.pyd
.git
.gitignore
.env
credentials.txt
```

---

## Step 14: Complete command sequence

```bash
mkdir env-demo
cd env-demo

docker build -t myapp:v1 .

docker run --rm myapp:v1

docker run --rm -e APP_ENV=production myapp:v1

docker run --rm -e APP_ENV=production -e DB_URL=mysql://prod-db:3306/companydb -e LOG_LEVEL=warning myapp:v1

docker run --rm -it -e APP_ENV=production -e DB_URL=mysql://prod-db:3306/companydb -e LOG_LEVEL=warning myapp:v1 env

docker run --rm -e APP_ENV=testing myapp:v1 python -c "import os; print(os.getenv('APP_ENV'))"
```

---

## Step 15: Beginner-friendly explanation of `ENV` versus `-e`

### `ENV` in Dockerfile

Use `ENV` when you want a **default value inside the image**.

Example:

```dockerfile
ENV APP_ENV=development
```

This means every container created from the image gets that default unless changed later.

### `-e` in `docker run`

Use `-e` when you want to **change the value at runtime**.

Example:

```bash
docker run -e APP_ENV=production myapp:v1
```

This means the specific container will use `production` instead of the Dockerfile default.

### Easy way to remember

- `ENV` = baked into the image as default
- `-e` = passed during container start as override

---

## Step 16: Real-world business reasoning

A company may use:

- `APP_ENV=development` for local testing
- `APP_ENV=staging` for pre-production validation
- `APP_ENV=production` for live deployment

The image remains the same.  
Only the configuration changes.

This brings major benefits:

- no repeated rebuilds for simple config changes
- fewer human errors
- consistent deployment process
- easier automation in CI/CD pipelines
- cleaner separation between code and environment-specific settings

---

## Step 17: Common mistakes students make

### Mistake 1: Hardcoding configuration in source code

Bad idea because:

- changing configuration requires code edits
- testing and production become harder to manage

### Mistake 2: Forgetting to use `-e` at runtime

Then the container uses the Dockerfile defaults, which may not be what production needs.

### Mistake 3: Storing secrets directly in Dockerfile

Do not put real passwords, tokens, or secret credentials directly in Dockerfile `ENV` instructions for production systems.

Why not:

- image history may expose them
- anyone with the image may read them

For real production, secrets should be managed with safer tools such as secret managers, orchestrator secrets, or secure runtime injection.

### Mistake 4: Forgetting to verify values

Students often assume configuration worked.  
They should verify using:

- application output
- `env`
- one-line Python checks

---

## Step 18: Viva questions with answers

### Q1. What is the purpose of `ENV` in Dockerfile?

`ENV` defines default environment variables inside the image.

### Q2. Can runtime values override Dockerfile `ENV` values?

Yes. Values passed with `docker run -e` override Dockerfile defaults.

### Q3. Why are environment variables useful?

They separate application configuration from application code.

### Q4. Why should real secrets not be stored in Dockerfile?

Because Docker images and image history can expose them.

### Q5. How can you verify environment variables inside a container?

By checking application output, using the `env` command, or running a small script inside the container.

---

## Step 19: Final conclusion

The correct Docker solution for environment configuration is to define sensible default values using `ENV` in the Dockerfile and override them at runtime with `docker run -e` when needed. This allows the same image to be reused across development, testing, and production while keeping configuration flexible, maintainable, and easy to verify.

---

## One-line conclusion

Using `ENV` for defaults and `docker run -e` for overrides makes containerized applications configurable, reusable, and deployment-friendly.