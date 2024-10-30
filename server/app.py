from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import vision
import base64
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize Vision client with credentials from environment variable
try:
    credentials_json = os.getenv('GOOGLE_CLOUD_VISION_CREDENTIALS')
    if credentials_json:
        # Write credentials to temporary file
        with open('temp_credentials.json', 'w') as f:
            f.write(credentials_json)
        
        # Initialize client with credentials file
        client = vision.ImageAnnotatorClient.from_service_account_file('temp_credentials.json')
        
        # Clean up temporary file
        os.remove('temp_credentials.json')
    else:
        raise ValueError("Missing Google Cloud Vision credentials")

except Exception as e:
    print(f"Error initializing Vision API client: {e}")
    # Use mock client for development
    client = None

@app.route('/api/vision/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.json
        image_data = data.get('image', '').split(',')[-1]  # Remove data URL prefix if present
        
        # Decode base64 image
        content = base64.b64decode(image_data)
        
        if client:
            # Create vision image object
            image = vision.Image(content=content)
            
            # Perform text detection
            response = client.text_detection(image=image)
            texts = response.text_annotations
            
            # Process detected text
            detected_games = []
            
            # Skip the first annotation as it contains all text
            for text in texts[1:]:
                if not text.bounding_poly or not text.description:
                    continue
                
                # Calculate bounding box
                vertices = text.bounding_poly.vertices
                x = min(vertex.x for vertex in vertices)
                y = min(vertex.y for vertex in vertices)
                width = max(vertex.x for vertex in vertices) - x
                height = max(vertex.y for vertex in vertices) - y
                
                detected_games.append({
                    'title': text.description,
                    'confidence': 0.95,  # Vision API doesn't provide confidence for text detection
                    'boundingBox': {'x': x, 'y': y, 'width': width, 'height': height}
                })
        else:
            # Mock response for development
            detected_games = [{
                'title': 'Catan',
                'confidence': 0.95,
                'boundingBox': {
                    'x': 100,
                    'y': 100,
                    'width': 100,
                    'height': 50
                }
            }]
        
        return jsonify({'detectedGames': detected_games})

    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({'error': 'Failed to analyze image'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    app.run(host='0.0.0.0', port=port)