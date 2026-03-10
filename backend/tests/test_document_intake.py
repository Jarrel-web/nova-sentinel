import pytest
from app.agents.document_intake_agent import clean_text, chunk_text, document_intake


def test_clean_text_removes_extra_spaces_and_tabs():
    text = "Hello     world\t\tthis is   a test"
    result = clean_text(text)

    assert result == "Hello world this is a test"


def test_clean_text_normalizes_linebreaks_and_preserves_content():
    text = "Hello\r\n\r\nworld\rtest"
    result = clean_text(text)

    assert result == "Hello\n\nworld\ntest"


def test_clean_text_empty_input_returns_empty_string():
    assert clean_text("") == ""


def test_chunk_text_returns_multiple_chunks_for_long_text():
    text = "A" * 5000
    chunks = chunk_text(text, chunk_size=1000, overlap=100)

    assert len(chunks) > 1
    assert chunks[0]["chunk_id"] == 0
    assert chunks[0]["start_char"] == 0
    assert chunks[0]["end_char"] == 1000
    assert len(chunks[0]["text"]) == 1000


def test_chunk_text_preserves_overlap_between_chunks():
    text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    chunks = chunk_text(text, chunk_size=10, overlap=2)

    first_chunk = chunks[0]["text"]
    second_chunk = chunks[1]["text"]

    assert first_chunk[-2:] == second_chunk[:2]


def test_chunk_text_returns_empty_list_for_empty_text():
    assert chunk_text("") == []


def test_chunk_text_raises_error_for_invalid_overlap():
    with pytest.raises(ValueError, match="overlap must be smaller than chunk_size"):
        chunk_text("sample text", chunk_size=100, overlap=100)


def test_chunk_text_raises_error_for_negative_overlap():
    with pytest.raises(ValueError, match="overlap must be >= 0"):
        chunk_text("sample text", chunk_size=100, overlap=-1)


def test_chunk_text_raises_error_for_non_positive_chunk_size():
    with pytest.raises(ValueError, match="chunk_size must be > 0"):
        chunk_text("sample text", chunk_size=0, overlap=0)


def test_document_intake_returns_expected_structure():
    text = "Sample document text."
    result = document_intake(text)

    assert result["status"] == "success"
    assert result["original_length"] == len(text)
    assert result["cleaned_length"] == len(clean_text(text))
    assert result["num_chunks"] == len(result["chunks"])
    assert isinstance(result["chunks"], list)


def test_document_intake_creates_multiple_chunks_for_large_document():
    text = "Hello world " * 500
    result = document_intake(text, chunk_size=100, overlap=10)

    assert result["num_chunks"] > 1
    assert result["chunks"][0]["chunk_id"] == 0
    assert "text" in result["chunks"][0]
    assert "start_char" in result["chunks"][0]
    assert "end_char" in result["chunks"][0]


def test_document_intake_preserves_important_content_near_end():
    text = ("Intro section " * 400) + "CRITICAL POLICY VIOLATION"
    result = document_intake(text, chunk_size=500, overlap=50)

    assert any("CRITICAL POLICY VIOLATION" in chunk["text"] for chunk in result["chunks"])


def test_document_intake_empty_input_returns_success_with_no_chunks():
    result = document_intake("")

    assert result["status"] == "success"
    assert result["original_length"] == 0
    assert result["cleaned_length"] == 0
    assert result["num_chunks"] == 0
    assert result["chunks"] == []