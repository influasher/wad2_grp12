from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
import PyPDF2
from io import BytesIO
from supabase import create_client, Client
import traceback
from datetime import datetime
import pypdfium2 as pdfium
from PIL import Image

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Create Flask app
app = Flask(__name__)

# Configure CORS with specific origins and options
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://elementalheroes.vercel.app",
                "http://localhost:3000",  # For local development
            ],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"],
            "supports_credentials": True,
            "max_age": 120,
        }
    },
)


# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add(
        "Access-Control-Allow-Origin", "https://elementalheroes.vercel.app"
    )
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response


# Init Supabase Client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def extract_text_from_pdf_bytes(pdf_bytes):
    """Extract text from PDF bytes and return a dictionary with page numbers."""
    text_by_page = {}
    try:
        pdf_file = BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_by_page[page_num + 1] = page.extract_text()
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        raise
    return text_by_page


def get_document_context_supabase(file_id):
    """Get the content of a PDF from Supabase storage."""
    context = []
    try:
        pdf_path = f"user_pdfs/{file_id}.pdf"
        pdf_content = supabase.storage.from_("files_wad2").download(pdf_path)

        if not pdf_content:
            return None

        text_by_page = extract_text_from_pdf_bytes(pdf_content)
        context.append(
            "\n".join([f"[Page {page}] {text}" for page, text in text_by_page.items()])
        )

    except Exception as e:
        print(f"Error fetching PDF from Supabase: {str(e)}")
        traceback.print_exc()
        return None

    return "\n\nNEW DOCUMENT\n\n".join(context)


def generate_flashcard_prompt(content, file_id):
    return f"""
    Create 5 multiple-choice flashcards from the following content. Each flashcard should follow this exact format:
    1. A clear, specific question
    2. One correct answer
    3. Three plausible but incorrect answers
    4. The page number where the information was found
    5. A relevant quote from the text (if applicable)

    Content: {content}
    
    Return the flashcards in this exact JSON format, with no additional text or explanation:
    {{
        "flashcards": [
            {{
                "question": "Question text here",
                "correct_answer": "Correct answer text here",
                "wrong_answers": [
                    "First wrong answer here",
                    "Second wrong answer here",
                    "Third wrong answer here"
                ],
                "page": page_number,
                "quote": "relevant quote from text (optional)",
                "file_id": "{file_id}"
            }}
        ]
    }}
    """


@app.route("/api/supabase/upload-pdf", methods=["POST", "OPTIONS"])
def upload_pdf_supabase():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files["file"]
        if file.filename == "" or not file.filename.endswith(".pdf"):
            return jsonify({"error": "Invalid file"}), 400

        file_id, _ = os.path.splitext(file.filename)
        file_content = file.read()

        # Extract text from PDF bytes
        text_by_page = extract_text_from_pdf_bytes(file_content)

        # Upload to Supabase storage
        upload_path = f"user_pdfs/{file.filename}"
        supabase.storage.from_("files_wad2").upload(
            path=upload_path,
            file=file_content,
            file_options={"content-type": "application/pdf"},
        )

        # Generate and upload preview
        try:
            pdf = pdfium.PdfDocument(BytesIO(file_content))
            page = pdf[0]
            preview_image = page.render(scale=4).to_pil()
            preview_bytes = BytesIO()
            preview_image.save(preview_bytes, format="PNG")
            preview_bytes.seek(0)

            preview_name = f"{file_id}.png"
            supabase.storage.from_("files_wad2").upload(
                f"previews/{preview_name}", preview_bytes.getvalue()
            )
        except Exception as e:
            print(f"Preview generation error: {str(e)}")
            # Continue even if preview fails

        return jsonify(
            {
                "message": "File uploaded successfully to Supabase storage",
                "file_id": file_id,
                "upload_path": upload_path,
                "num_pages": len(text_by_page),
            }
        )

    except Exception as e:
        print("Error uploading file:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/supabase/generate-flashcards", methods=["POST", "OPTIONS"])
def generate_flashcards_supabase():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    if not request.is_json:
        return jsonify({"error": "Invalid input: JSON data expected."}), 400

    data = request.get_json()
    file_id = data.get("file_id")

    if not file_id:
        return jsonify({"error": "No file ID provided."}), 400

    try:
        # Get document context
        context = get_document_context_supabase(file_id)
        if not context:
            return jsonify({"error": "Failed to retrieve document content."}), 500

        # Generate flashcards using OpenAI
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Updated from gpt-4o-mini
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful assistant that creates educational flashcards. 
                    Focus on extracting key information from the provided content.
                    Always return the response in the exact JSON format specified.""",
                },
                {
                    "role": "user",
                    "content": generate_flashcard_prompt(context, file_id),
                },
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        flashcards_text = response.choices[0].message.content.strip()
        flashcards_data = json.loads(flashcards_text)

        # Format flashcards
        formatted_flashcards = []
        for card in flashcards_data.get("flashcards", []):
            formatted_card = {
                "question": card.get("question", "").strip(),
                "answer": card.get("correct_answer", "").strip(),
                "wrong_answers": [
                    {"text": wrong_answer.strip(), "explanation": "Incorrect option"}
                    for wrong_answer in card.get("wrong_answers", [])
                ],
                "page": card.get("page", 0),
                "quote": card.get("quote", "").strip(),
                "file_id": file_id,
            }
            formatted_flashcards.append(formatted_card)

        # Upload flashcards to Supabase
        flashcards_json = json.dumps({"flashcards": formatted_flashcards})
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        upload_path = f"flashcards/{file_id}/{timestamp}.json"

        supabase.storage.from_("files_wad2").upload(
            path=upload_path,
            file=flashcards_json.encode(),
            file_options={"content-type": "application/json"},
        )

        return jsonify(
            {
                "message": "Flashcards generated and uploaded successfully",
                "flashcards": formatted_flashcards,
                "upload_path": upload_path,
            }
        )

    except Exception as e:
        print(f"Error generating flashcards: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        message = request.json.get("message")
        file_id = request.json.get("file_id")

        if not message:
            return jsonify({"error": "No message provided"}), 400

        # Get document context
        context = get_document_context_supabase(file_id)
        if not context:
            return jsonify({"error": "Failed to retrieve document content"}), 500

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Updated from gpt-4o-mini
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful study assistant. 
                    Prioritize using information from the provided document content when answering questions.
                    If the answer can be found in the documents, cite the specific page number.
                    If the question cannot be answered using the document content, provide a general educational response.""",
                },
                {
                    "role": "user",
                    "content": f"Document content:\n{context}\n\nQuestion: {message}",
                },
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        return jsonify({"response": response.choices[0].message.content})

    except Exception as e:
        print("Error in chat:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/explain-answer", methods=["POST", "OPTIONS"])
def explain_answer():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.json
        question = data.get("question")
        correct_answer = data.get("correct_answer")
        wrong_answer = data.get("wrong_answer")

        prompt = f"""
        The question was: "{question}"
        The correct answer is: "{correct_answer}"
        The student chose: "{wrong_answer}"
        
        Provide a brief (1-2 sentences) explanation of why the chosen answer is incorrect.
        Focus on helping the student understand the key difference between their answer
        and the correct answer, without revealing the correct answer. Be educational in your explanation.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Updated from gpt-4o-mini
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful study assistant providing brief, clear explanations for incorrect answers.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=100,
        )

        return jsonify({"explanation": response.choices[0].message.content.strip()})

    except Exception as e:
        print("Error generating explanation:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route("/api/test", methods=["GET", "OPTIONS"])
def test():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200
    return jsonify({"message": "Hello World"})


if __name__ == "__main__":
    if not os.getenv("OPENAI_API_KEY"):
        print("Warning: OPENAI_API_KEY not found in environment variables!")
    app.run(debug=True)
