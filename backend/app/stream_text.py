from asyncio import sleep
from typing import AsyncGenerator

async def stream_text(text: str, duration: float = 5.0) -> AsyncGenerator[str, None]:
    words_arr = text.split()
    words_len = len(words_arr)

    if words_len == 0: return
    
    delay_seconds = duration / words_len

    for i, word in enumerate(words_arr):
        space = '' if i == 0 else ' '
        yield space + word

        await sleep(delay_seconds)