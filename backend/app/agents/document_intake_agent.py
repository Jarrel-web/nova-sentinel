import re
from typing import List, Dict, Any


def clean_text(document_text: str) -> str:
    """
    Basic text cleaning for MVP:
    - normalize line breaks
    - remove excessive whitespace
    - keep paragraph boundaries where possible
    """
    if not document_text:
        return ""

    # Normalize line endings
    text = document_text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove excessive spaces/tabs
    text = re.sub(r"[ \t]+", " ", text)

    # Remove excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 200) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks.
    Returns chunk metadata for easier downstream debugging and tracing.
    """
    if not text:
        return []

    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0:
        raise ValueError("overlap must be >= 0")
    if overlap >= chunk_size:
        raise ValueError("overlap must be smaller than chunk_size")

    chunks = []
    start = 0
    chunk_id = 0
    step = chunk_size - overlap

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk_text_value = text[start:end]

        chunks.append({
            "chunk_id": chunk_id,
            "start_char": start,
            "end_char": end,
            "text": chunk_text_value
        })

        if end == len(text):
            break

        start += step
        chunk_id += 1

    return chunks


def document_intake(document_text: str, chunk_size: int = 2000, overlap: int = 200) -> Dict[str, Any]:
    """
    Document intake agent for MVP.

    Steps:
    1. Clean raw text
    2. Split into overlapping chunks
    3. Return structured output for downstream agents
    """
    cleaned_text = clean_text(document_text)
    chunks = chunk_text(cleaned_text, chunk_size=chunk_size, overlap=overlap)

    return {
        "status": "success",
        "original_length": len(document_text) if document_text else 0,
        "cleaned_length": len(cleaned_text),
        "cleaned_text": cleaned_text,
        "num_chunks": len(chunks),
        "chunks": chunks
    }