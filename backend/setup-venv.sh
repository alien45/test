#!/bin/sh
# Create a new virtual environment
python -m venv .venv

# Activate the new virtual environment
. .venv/bin/activate

# Install pip and other dependencies
pip install --upgrade pip
pip install fastapi
pip install pydantic
pip install uvicorn

# pip install --no-cache-dir -r requirements.txt