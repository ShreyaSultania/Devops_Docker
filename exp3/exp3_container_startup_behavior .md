
# Scenario 3: Container Startup Behavior

## 1. Problem Statement

A startup or development team wants a container to **always start a specific application automatically** whenever the container runs. Instead of opening a shell manually and typing the command each time, the image should already know what program to start.

This is a very common requirement in Docker because containers are usually created to perform **one main job**. For example:

- a Python container should start a Python app
- a Node.js container should start a web server
- an Nginx container should start Nginx
- a MySQL container should start MySQL automatically

The solution is designed using two Dockerfile instructions:

- `CMD`
- `ENTRYPOINT`

Understanding the difference between them is very important because both control what happens **when a container starts**.

---

## 2. What Students Must Demonstrate

Students should be able to:

- write a Dockerfile
- use `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`, and `ENTRYPOINT`
- build the image
- run the container
- observe that the application starts automatically
- understand when to use `CMD` and when to use `ENTRYPOINT`
- compare their behavior with simple practical examples

Example command:

```bash
docker run myapp:v1
```

If the Dockerfile is designed correctly, the application should start on its own.

---

## 3. Conceptual Foundation: What Happens When a Container Starts?

A Docker image is like a packaged blueprint.
A Docker container is the running instance created from that blueprint.

When you run:

```bash
docker run myapp:v1
```

Docker creates a container from the image and then starts its **main process**.

That main process is extremely important because:

- it is the first process inside the container
- it keeps the container alive
- if it stops, the container usually stops

So the key question is:

**Which command should Docker run as the main process?**

That is where `CMD` and `ENTRYPOINT` are used.

---

## 4. Understanding `CMD`

`CMD` provides a **default command** for the container.

Example:

```dockerfile
CMD ["python", "app.py"]
```

Meaning:
- when the container starts, Docker runs `python app.py`
- but the user can replace this command at runtime

For example:

```bash
docker run myapp:v1 python --version
```

In this case, the original `CMD` is replaced by `python --version`.

### Why this matters

`CMD` is useful when:
- the container has a sensible default behavior
- but the user may sometimes want to run something else

So `CMD` is flexible.

---

## 5. Understanding `ENTRYPOINT`

`ENTRYPOINT` defines the **fixed main executable** of the container.

Example:

```dockerfile
ENTRYPOINT ["python", "app.py"]
```

Meaning:
- Docker will always start with `python app.py`
- extra arguments provided in `docker run` are appended to this command instead of replacing it

For example:

```bash
docker run myapp:v1 --help
```

This becomes similar to:

```bash
python app.py --help
```

### Why this matters

`ENTRYPOINT` is useful when:
- the container should always behave like one specific application
- you want to enforce a fixed startup executable
- users may pass options, but not replace the app itself easily

So `ENTRYPOINT` is stricter than `CMD`.

---

## 6. Relationship Between `CMD` and `ENTRYPOINT`

Both can be used together.

Example:

```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```

Docker combines them as:

```bash
python app.py
```

If the user runs:

```bash
docker run myapp:v1 --version
```

Docker keeps the `ENTRYPOINT` (`python`) and replaces `CMD` (`app.py`) with `--version`.

Result:

```bash
python --version
```

### Simple rule to remember

- `ENTRYPOINT` = the fixed main tool
- `CMD` = the default arguments or fallback command

---

## 7. Real-Life Analogy

Think of a music player.

- `ENTRYPOINT` is like the player app itself: it always opens the music player
- `CMD` is like the default song or playlist

If no new choice is given, the default song plays.
If a different song is specified, the player still opens, but with the new song.

This analogy helps beginners understand why Docker separates fixed executable behavior from default arguments.

---

## 8. Demonstration Plan

We will create a very simple Python application that prints a message when the container starts.

Then we will create:

1. a Dockerfile using `CMD`
2. a Dockerfile using `ENTRYPOINT`
3. build images
4. run containers
5. compare behavior

---

## 9. Project Folder Structure

Create a project folder like this:

```text
startup-behavior/
│
├── app.py
├── Dockerfile.cmd
└── Dockerfile.entrypoint
```

### Why this structure is useful

- `app.py` contains the application
- `Dockerfile.cmd` demonstrates startup using `CMD`
- `Dockerfile.entrypoint` demonstrates startup using `ENTRYPOINT`

Keeping separate Dockerfiles makes comparison easier for beginners.

---

## 10. Step 1: Create the Working Folder

Open terminal or command prompt and run:

```bash
mkdir startup-behavior
cd startup-behavior
```

### Reasoning

- `mkdir startup-behavior` creates a dedicated project folder
- `cd startup-behavior` moves into that folder so all files are created in one place

This avoids confusion and keeps the demonstration organized.

---

## 11. Step 2: Create the Application Code

Create a file named `app.py` with the following content:

```python
import sys

print("Application started automatically inside the container.")
print("Arguments received:", sys.argv)
```

### What this code does

- `import sys` allows the program to read command-line arguments
- the first `print` confirms the app started
- the second `print` shows arguments passed to the app

### Why this is a good teaching example

This tiny program is simple, but it clearly demonstrates:
- automatic startup
- how arguments behave
- how `CMD` and `ENTRYPOINT` affect runtime behavior

---

## 12. Step 3: Create a Dockerfile Using `CMD`

Create a file named `Dockerfile.cmd`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY app.py .

CMD ["python", "app.py"]
```

---

## 13. Detailed Reasoning for Every Line in `Dockerfile.cmd`

### `FROM python:3.11-slim`

This selects the base image.

Why it is needed:
- Docker images are built on top of another image
- our application needs Python
- `python:3.11-slim` already contains Python and is smaller than the full Python image

Why `slim` is preferred:
- less storage space
- smaller download size
- faster image transfer
- reduced unnecessary packages

---

### `WORKDIR /app`

This sets the working directory inside the container.

Why it is needed:
- commands that follow will run relative to `/app`
- files copied into the image can be organized in one known location
- improves clarity and maintainability

Without `WORKDIR`, paths become harder to manage.

---

### `COPY app.py .`

This copies the local file `app.py` from the host system into the current working directory inside the container.

Why it is needed:
- the container needs the application file to run it
- the dot (`.`) means “copy into the current container working directory,” which is `/app`

Why `COPY` is preferred over manually creating the file inside the container:
- repeatable
- automatic
- version-controlled with the project

---

### `CMD ["python", "app.py"]`

This defines the default startup command.

Why it is needed:
- when the container starts, Docker needs to know what to run
- this tells Docker to run the Python interpreter with `app.py`

Why JSON/exec form is preferred:
- better signal handling
- safer argument parsing
- avoids shell-related surprises

---

## 14. Step 4: Build the Image That Uses `CMD`

Run:

```bash
docker build -f Dockerfile.cmd -t myapp:cmd .
```

### Detailed reasoning

- `docker build` tells Docker to create an image
- `-f Dockerfile.cmd` specifies which Dockerfile to use
- `-t myapp:cmd` gives the image a name (`myapp`) and tag (`cmd`)
- `.` means current folder is the build context

The build context includes files Docker may need, such as `app.py`.

---

## 15. Step 5: Run the Image That Uses `CMD`

Run:

```bash
docker run --rm myapp:cmd
```

### Expected output

```text
Application started automatically inside the container.
Arguments received: ['app.py']
```

### Detailed reasoning

- `docker run` starts a container from the image
- `--rm` removes the container automatically after it exits
- `myapp:cmd` is the image to run

Why the app starts automatically:
- because `CMD ["python", "app.py"]` is defined in the image

---

## 16. Step 6: Override the `CMD` at Runtime

Run:

```bash
docker run --rm myapp:cmd python --version
```

### What happens

This replaces the default `CMD`.

So instead of running:

```bash
python app.py
```

Docker runs:

```bash
python --version
```

### Why this demonstrates `CMD`

This proves that `CMD` is only a default command, not a locked command.
It can be overridden by the user when starting the container.

---

## 17. Step 7: Create a Dockerfile Using `ENTRYPOINT`

Create a file named `Dockerfile.entrypoint`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY app.py .

ENTRYPOINT ["python", "app.py"]
```

---

## 18. Detailed Reasoning for Every Line in `Dockerfile.entrypoint`

The first three lines have the same purpose as before:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY app.py .

```

Now the key change is:

```dockerfile
ENTRYPOINT ["python", "app.py"]
```

### Why this is important

This tells Docker that the container should always start by running:

```bash
python app.py
```

Unlike `CMD`, users do not easily replace the main executable just by writing another command after `docker run`.

Instead, extra values are treated as arguments to `app.py`.

---

## 19. Step 8: Build the Image That Uses `ENTRYPOINT`

Run:

```bash
docker build -f Dockerfile.entrypoint -t myapp:entry .
```

### Reasoning

- `docker build` creates the image
- `-f Dockerfile.entrypoint` selects the second Dockerfile
- `-t myapp:entry` names the image so we can test it separately

---

## 20. Step 9: Run the Image That Uses `ENTRYPOINT`

Run:

```bash
docker run --rm myapp:entry
```

### Expected output

```text
Application started automatically inside the container.
Arguments received: ['app.py']
```

Again, the container starts the app automatically.

---

## 21. Step 10: Pass Extra Arguments to the `ENTRYPOINT`

Run:

```bash
docker run --rm myapp:entry hello world
```

### Expected behavior

Docker keeps the entrypoint command:

```bash
python app.py
```

and appends the extra arguments:

```bash
hello world
```

So the effective command becomes:

```bash
python app.py hello world
```

### Expected output

```text
Application started automatically inside the container.
Arguments received: ['app.py', 'hello', 'world']
```

### Why this is important

This demonstrates that `ENTRYPOINT` stays fixed and extra runtime values become arguments.

---

## 22. Step 11: Use `ENTRYPOINT` and `CMD` Together

A very practical pattern is to combine both.

Create another Dockerfile if you want to demonstrate the combined approach:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY app.py .

ENTRYPOINT ["python"]
CMD ["app.py"]
```

### Why this is useful

- `ENTRYPOINT ["python"]` fixes the main executable
- `CMD ["app.py"]` provides the default file or argument

Now:

```bash
docker run myapp:v1
```

becomes:

```bash
python app.py
```

But:

```bash
docker run myapp:v1 --version
```

becomes:

```bash
python --version
```

This pattern is excellent when you want a fixed tool but flexible default arguments.

---

## 23. Recommended Final Dockerfile for This Scenario

For a beginner-friendly container that always runs the application automatically, a strong solution is:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY app.py .

ENTRYPOINT ["python", "app.py"]
```

### Why this is recommended

Because the scenario says:

> A container must always run a specific application when started.

That means the startup behavior should be strongly enforced.
`ENTRYPOINT` is usually the better fit for that requirement.

---

## 24. Full Command Sequence for Classroom Demonstration

### Using `CMD`

```bash
mkdir startup-behavior
cd startup-behavior

docker build -f Dockerfile.cmd -t myapp:cmd .
docker run --rm myapp:cmd
docker run --rm myapp:cmd python --version
```

### Using `ENTRYPOINT`

```bash
docker build -f Dockerfile.entrypoint -t myapp:entry .
docker run --rm myapp:entry
docker run --rm myapp:entry hello world
```

---

## 25. Comparison Table: `CMD` vs `ENTRYPOINT`

| Feature | CMD | ENTRYPOINT |
|---|---|---|
| Purpose | Default command | Fixed startup executable |
| Can be replaced easily at runtime? | Yes | No, not by ordinary trailing command |
| Extra runtime arguments | Replace the command | Append to the entrypoint |
| Best used when | Default behavior is flexible | Container must always act like one app |

---

## 26. Common Mistakes Students Make

### Mistake 1: Using shell form unnecessarily

Example:

```dockerfile
CMD python app.py
```

This works, but exec form is better:

```dockerfile
CMD ["python", "app.py"]
```

Why exec form is better:
- cleaner signal handling
- more predictable behavior
- recommended for Docker

---

### Mistake 2: Confusing `CMD` and `ENTRYPOINT`

Students often think both do exactly the same thing.
They do not.

- `CMD` gives a default command
- `ENTRYPOINT` fixes the command and treats extra values as arguments

---

### Mistake 3: Forgetting to copy the app file

If `COPY app.py .` is missing, the container may start but fail because `app.py` does not exist in the image.

---

### Mistake 4: Running the wrong image tag

If students build `myapp:entry` but run `myapp:v1`, Docker may fail or run an older image.

---

## 27. Troubleshooting Tips

### Problem: `python: can't open file 'app.py'`

Cause:
- file not copied correctly
- wrong working directory

Fix:
- confirm `COPY app.py .`
- confirm `WORKDIR /app`

---

### Problem: container exits immediately

Cause:
- the application finished quickly

Explanation:
- this is normal for a short Python script that prints and exits
- when the main process ends, the container also ends

---

### Problem: command does not behave as expected

Cause:
- misunderstanding whether the Dockerfile uses `CMD` or `ENTRYPOINT`

Fix:
- inspect the Dockerfile
- remember how runtime arguments interact with each one

---

## 28. Viva Questions and Sample Answers

### Q1. What is the purpose of `CMD` in Docker?

**Answer:** `CMD` specifies the default command the container runs when it starts. It can be replaced by another command during `docker run`.

### Q2. What is the purpose of `ENTRYPOINT`?

**Answer:** `ENTRYPOINT` defines the fixed executable that always starts when the container runs. Extra arguments are appended to it.

### Q3. Which is better when a container must always run one application?

**Answer:** `ENTRYPOINT` is usually better because it enforces a fixed startup behavior.

### Q4. Why did we use `python:3.11-slim`?

**Answer:** It provides Python in a smaller image, reducing image size and improving efficiency.

### Q5. Why do we use exec form like `["python", "app.py"]`?

**Answer:** Exec form gives better signal handling and more predictable behavior than shell form.

---

## 29. Final Answer for the Scenario

To ensure a container always starts a specific application automatically, the Dockerfile should define the application startup using either `CMD` or `ENTRYPOINT`. If the requirement is strict and the container must always behave like one application, `ENTRYPOINT` is the preferred choice. If a default command is enough and the user may replace it, `CMD` is appropriate. In both cases, the Dockerfile should also use a suitable base image, set a working directory, and copy the application file into the image.

---

## 30. Final Recommended Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY app.py .

ENTRYPOINT ["python", "app.py"]
```

## Run Command

```bash
docker run --rm myapp:entry
```

This starts the application automatically every time the container runs.

---

## 31. One-Line Conclusion

A container’s startup behavior is controlled by `CMD` and `ENTRYPOINT`, and `ENTRYPOINT` is the best choice when the container must always run one specific application automatically.
