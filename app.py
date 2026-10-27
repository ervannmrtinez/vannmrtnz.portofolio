"""Optional Flask API companion for VannMrtnz portfolio.
The portfolio's secure project CRUD uses Supabase Auth + Row Level Security directly.
This small API is suitable for a separate Python host (e.g. Render), not required by Vercel static hosting.
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
allowed_origins = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "*").split(",") if origin.strip()]
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "VannMrtnz API", "note": "Portfolio CRUD uses Supabase Auth and RLS."})

@app.get("/")
def index():
    return jsonify({"service": "VannMrtnz API", "health": "/api/health"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
