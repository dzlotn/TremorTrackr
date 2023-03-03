from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime
import pyrebase

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/interpretation")
def interpretation():
    return render_template("interpretation.html")

@app.route("/procedure")
def procedure():
    return render_template("procedure.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/signIn")
def signIn():
    return render_template("signIn.html")

if __name__ == '__main__':
    app.run(debug=True)