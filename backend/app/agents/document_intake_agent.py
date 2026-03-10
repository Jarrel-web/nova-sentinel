def document_intake(document_text: str) -> str:
    """
    Simple intake step.
    For MVP, just truncate or lightly summarize the document text.
    """
    return document_text[:6000]