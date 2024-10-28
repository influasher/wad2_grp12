from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
import PyPDF2
import uuid
from werkzeug.utils import secure_filename
import re

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Get the absolute path of the current directory
base_dir = os.path.abspath(os.path.dirname(__file__))

# Configure upload folder
UPLOAD_FOLDER = os.path.join(base_dir, 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create Flask app
app = Flask(__name__,
            template_folder=os.path.join(base_dir, 'templates'),
            static_folder=os.path.join(base_dir, 'static'))
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF and return a dictionary with page numbers."""
    text_by_page = {}
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_by_page[page_num + 1] = page.extract_text()
    return text_by_page

def generate_flashcard_prompt(content, file_id):
    return f"""
    Create flashcards from the following content. Each flashcard should include:
    1. A clear question
    2. A comprehensive answer
    3. The page number where the information was found
    4. A direct quote or reference from the text (if relevant)

    Content: {content}
    
    Generate the flashcards in this exact JSON format:
    [
        {{
            "question": "...",
            "answer": "...",
            "page": page_number,
            "quote": "relevant quote from text",
            "file_id": "{file_id}"
        }}
    ]
    
    Make questions clear and concise. Include page numbers where the information was found.
    """

@app.route('/')
def home():
    try:
        return render_template('index.html')
    except Exception as e:
        print("Error rendering template:", str(e))
        return str(e), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        if file and allowed_file(file.filename):
            # Generate unique filename
            file_id = str(uuid.uuid4())
            filename = secure_filename(file.filename)
            base_name, extension = os.path.splitext(filename)
            unique_filename = f"{base_name}_{file_id}{extension}"
            
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Extract text from PDF
            text_by_page = extract_text_from_pdf(file_path)
            
            return jsonify({
                "message": "File uploaded successfully",
                "file_id": file_id,
                "filename": unique_filename,
                "num_pages": len(text_by_page)
            })
        else:
            return jsonify({"error": "File type not allowed"}), 400
            
    except Exception as e:
        print("Error uploading file:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-flashcards', methods=['POST'])
def generate_flashcards():
    try:
        file_id = request.json.get('file_id')
        if not file_id:
            return jsonify({"error": "No file ID provided"}), 400

        # Find the PDF file
        pdf_files = [f for f in os.listdir(UPLOAD_FOLDER) if f'{file_id}' in f]
        if not pdf_files:
            return jsonify({"error": "PDF file not found"}), 404

        pdf_path = os.path.join(UPLOAD_FOLDER, pdf_files[0])
        text_by_page = extract_text_from_pdf(pdf_path)

        # Combine all pages into one text, but keep track of page numbers
        full_text = "\n".join([f"[Page {page}] {text}" for page, text in text_by_page.items()])

        # Generate flashcards using GPT-4
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates educational flashcards with source references."},
                {"role": "user", "content": generate_flashcard_prompt(full_text, file_id)}
            ],
            temperature=0.7,
            max_tokens=2000
        )

        # Extract and parse the flashcards from the response
        flashcards_text = response.choices[0].message.content
        try:
            flashcards = json.loads(flashcards_text)
            # Add PDF filename to each flashcard
            for card in flashcards:
                card['pdf_filename'] = pdf_files[0]
        except json.JSONDecodeError:
            print("Error parsing JSON response:", flashcards_text)
            return jsonify({"error": "Failed to parse flashcards"}), 500

        return jsonify({"flashcards": flashcards})

    except Exception as e:
        print("Error generating flashcards:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        message = request.json.get('message')
        file_id = request.json.get('file_id')  # Optional: to reference specific PDF
        
        if not message:
            return jsonify({"error": "No message provided"}), 400

        # If file_id is provided, include PDF content in the context
        context = ""
        if file_id:
            pdf_files = [f for f in os.listdir(UPLOAD_FOLDER) if f'{file_id}' in f]
            if pdf_files:
                pdf_path = os.path.join(UPLOAD_FOLDER, pdf_files[0])
                text_by_page = extract_text_from_pdf(pdf_path)
                context = "\n".join([f"[Page {page}] {text}" for page, text in text_by_page.items()])

        # Prepare messages for the chat
        messages = [
            {"role": "system", "content": """You are a helpful study assistant. 
            Answer questions clearly and concisely, using examples when appropriate. 
            If referencing the PDF content, include page numbers in your response."""}
        ]

        if context:
            messages.append({"role": "user", "content": f"Context from PDF:\n{context}"})

        messages.append({"role": "user", "content": message})

        # Get response from GPT-4
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=1000
        )

        return jsonify({
            "response": response.choices[0].message.content
        })

    except Exception as e:
        print("Error in chat:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: OPENAI_API_KEY not found in environment variables!")
    app.run(debug=True)