# app.py
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
import PyPDF2
import uuid
from werkzeug.utils import secure_filename
import traceback
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Get the absolute path of the current directory
base_dir = os.path.abspath(os.path.dirname(__file__))

# Configure folders
UPLOAD_FOLDER = os.path.join(base_dir, 'uploads')
FLASHCARDS_FOLDER = os.path.join(base_dir, 'flashcards_generated')
ALLOWED_EXTENSIONS = {'pdf'}

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FLASHCARDS_FOLDER, exist_ok=True)

# Create Flask app
app = Flask(__name__,
            template_folder=os.path.join(base_dir, 'templates'),
            static_folder=os.path.join(base_dir, 'static'))
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['FLASHCARDS_FOLDER'] = FLASHCARDS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_flashcards(flashcards, file_id):
    """Save generated flashcards to a JSON file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"flashcards_{file_id}_{timestamp}.json"
    filepath = os.path.join(app.config['FLASHCARDS_FOLDER'], filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(flashcards, f, ensure_ascii=False, indent=2)
    
    return filename

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF and return a dictionary with page numbers."""
    text_by_page = {}
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text_by_page[page_num + 1] = page.extract_text()
    return text_by_page

def get_document_context(file_id=None):
    """Get the content of all uploaded PDFs or a specific PDF."""
    context = []
    
    if file_id:
        # Get specific PDF content
        pdf_files = [f for f in os.listdir(UPLOAD_FOLDER) if f'{file_id}' in f]
        if pdf_files:
            pdf_path = os.path.join(UPLOAD_FOLDER, pdf_files[0])
            # Uses extract_text_from_pdf here
            text_by_page = extract_text_from_pdf(pdf_path)
            context.append("\n".join([f"[Page {page}] {text}" for page, text in text_by_page.items()]))
    else:
        # Get all PDF contents
        for pdf_file in os.listdir(UPLOAD_FOLDER):
            if pdf_file.endswith('.pdf'):
                pdf_path = os.path.join(UPLOAD_FOLDER, pdf_file)
                # Uses extract_text_from_pdf here too
                text_by_page = extract_text_from_pdf(pdf_path)
                context.append("\n".join([f"[Page {page}] {text}" for page, text in text_by_page.items()]))
    
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
        
        # Extract text with error handling
        try:
            text_by_page = extract_text_from_pdf(pdf_path)
        except Exception as e:
            print(f"Error extracting PDF text: {str(e)}")
            return jsonify({"error": "Failed to extract text from PDF"}), 500

        # Combine pages with clear separation
        full_text = "\n\nPAGE BREAK\n\n".join([f"[Page {page}]\n{text}" for page, text in text_by_page.items()])

        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": """You are a helpful assistant that creates educational flashcards. 
                    Focus on extracting key information from the provided content.
                    Always return the response in the exact JSON format specified."""},
                    {"role": "user", "content": generate_flashcard_prompt(full_text, file_id)}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            flashcards_text = response.choices[0].message.content.strip()
            
            try:
                flashcards_data = json.loads(flashcards_text)
                
                formatted_flashcards = []
                for card in flashcards_data.get('flashcards', []):
                    formatted_card = {
                        'question': card['question'],
                        'answer': card['correct_answer'],
                        'wrong_answers': [
                            {'text': wrong_answer, 'explanation': 'Incorrect option'}
                            for wrong_answer in card['wrong_answers']
                        ],
                        'page': card['page'],
                        'quote': card.get('quote', ''),
                        'file_id': file_id
                    }
                    formatted_flashcards.append(formatted_card)
                
                # Save flashcards to file
                saved_filename = save_flashcards({"flashcards": formatted_flashcards}, file_id)
                
                return jsonify({
                    "flashcards": formatted_flashcards,
                    "saved_file": saved_filename
                })
                
            except json.JSONDecodeError as e:
                print(f"JSON Parse Error: {str(e)}")
                print(f"Problematic JSON: {flashcards_text}")
                return jsonify({"error": "Failed to parse flashcards response"}), 500
                
        except Exception as e:
            print(f"OpenAI API Error: {str(e)}")
            traceback.print_exc()
            return jsonify({"error": "Failed to generate flashcards"}), 500

    except Exception as e:
        print(f"General Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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
    
@app.route('/api/explain-answer', methods=['POST'])
def explain_answer():
    try:
        data = request.json
        question = data.get('question')
        correct_answer = data.get('correct_answer')
        wrong_answer = data.get('wrong_answer')

        prompt = f"""
        The question was: "{question}"
        The correct answer is: "{correct_answer}"
        The student chose: "{wrong_answer}"
        
        Provide a brief (1-2 sentences) explanation of why the chosen answer is incorrect.
        Focus on helping the student understand the key difference between their answer
        and the correct answer. Be educational in your explanation.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant providing brief, clear explanations for incorrect answers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=100
        )

        return jsonify({
            "explanation": response.choices[0].message.content.strip()
        })

    except Exception as e:
        print("Error generating explanation:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        message = request.json.get('message')
        file_id = request.json.get('file_id')
        
        if not message:
            return jsonify({"error": "No message provided"}), 400

        # Get document context
        context = get_document_context(file_id)

        messages = [
            {"role": "system", "content": """You are a helpful study assistant. 
            Prioritize using information from the provided document content when answering questions.
            If the answer can be found in the documents, cite the specific page number.
            If the question cannot be answered using the document content, clearly state that and provide a general response."""},
            {"role": "user", "content": f"Document content:\n{context}\n\nQuestion: {message}"}
        ]

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