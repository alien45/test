from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from .stream_text import stream_text
from .router import router
from .sample_text import HELLO, LOREM_IPSUM

class StreamQuery (BaseModel):
    duration: float = 5.0
    query: str

@router.post("/stream")
async def post_stream(request: StreamQuery):
    """Stream LLM response chunk by chunk"""
    print("/stream", request.query)

    query = request.query.lower()
    isHello = 'hi' in query or 'hello' in query
    text = HELLO if isHello else LOREM_IPSUM
    return StreamingResponse(
        stream_text(text, request.duration),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )