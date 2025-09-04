import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from PIL import Image
import io

# --- Initialization ---
load_dotenv()

app = Flask(__name__)
CORS(app) # Enables Cross-Origin Resource Sharing

# --- Configure Gemini API ---
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    text_generation_model = genai.GenerativeModel('gemini-pro')
    vision_generation_model = genai.GenerativeModel('gemini-pro-vision')
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    # You might want to exit or handle this more gracefully
    text_generation_model = None
    vision_generation_model = None


# --- API Endpoints ---

@app.route('/api/generate-from-text', methods=['POST'])
def generate_from_text():
    """Generates questions from a user-provided text prompt."""
    if not text_generation_model:
        return jsonify({"error": "Gemini API not configured"}), 500

    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "Prompt is missing"}), 400

    try:
        response = text_generation_model.generate_content(prompt)
        return jsonify({"generated_text": response.text})
    except Exception as e:
        print(f"Error during text generation: {e}")
        return jsonify({"error": "Failed to generate content from text"}), 500


@app.route('/api/generate-from-image', methods=['POST'])
def generate_from_image():
    """Extracts questions from an uploaded handwritten paper image."""
    if not vision_generation_model:
        return jsonify({"error": "Gemini Vision API not configured"}), 500

    if 'paperImage' not in request.files:
        return jsonify({"error": "No image file found in the request"}), 400

    file = request.files['paperImage']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Open the image using Pillow
        img = Image.open(file.stream)

        # The prompt for the vision model
        prompt = [
            "You are an expert OCR assistant. Extract all the questions from this image of a handwritten exam paper. Format the output clearly and number the questions correctly. Ignore any drawings or irrelevant marks.",
            img
        ]

        response = vision_generation_model.generate_content(prompt)
        return jsonify({"generated_text": response.text})

    except Exception as e:
        print(f"Error during image processing or generation: {e}")
        return jsonify({"error": "Failed to process image and generate content"}), 500


# --- Server Start ---
@app.route('/')
if __name__ == '__main__':
    # Use a specific port, e.g., 5001 to avoid conflicts
    app.run(debug=True, port=5001)