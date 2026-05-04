from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Web application is running successfully inside the container."

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)