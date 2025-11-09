"""
MIT License (c) Aleksei N. Andreev
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Anime Timer")
app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
