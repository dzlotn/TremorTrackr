from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime
import pyrebase

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html", title="Index")

if __name__ == '__main__':
    app.run(debug=True)