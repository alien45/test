from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import time
import os
from typing import AsyncGenerator
import uvicorn
# from pydantic import BaseModel

from app.router import router
from app import stream

app = FastAPI(title='LLM Simulator')

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == '__main__':
    uvicorn.run(app)