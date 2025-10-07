
from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")


HAZARD_KEYWORDS = ["wave", "tsunami", "flood", "spill", "drown", "boat", "sink", "debris", "oil"]
CANDIDATE_LABELS = ["ocean hazard", "spam", "weather report", "not relevant"]

# 3. Create the API endpoint that your Node.js backend will call
@app.route('/verify-hazard', methods=['POST'])
def verify_hazard():
    data = request.get_json()
    if not data or 'description' not in data:
        return jsonify({"error": "Description is required"}), 400

    description = data['description'].lower()
    
    

    # A. Check for keywords
    keyword_score = 1.0 if any(keyword in description for keyword in HAZARD_KEYWORDS) else 0.0
            
    # B. Use the powerful NLP model to get its score for "ocean hazard"
    classification_results = classifier(description, CANDIDATE_LABELS)
    nlp_score = 0.0
    for i, label in enumerate(classification_results['labels']):
        if label == 'ocean hazard':
            nlp_score = classification_results['scores'][i]
            break
            
    # C. Combine the scores (60% weight for AI, 40% for keywords)
    final_confidence = (nlp_score * 0.6) + (keyword_score * 0.4)
    
    # D. Decide if it's a hazard based on a threshold (e.g., 70%)
    is_hazard = final_confidence > 0.70
    
    # 4. Send the final decision back to your Node.js backend
    return jsonify({
        "isHazard": is_hazard,
        "confidence": round(final_confidence, 3)
    })

# 5. Run the server
if __name__ == '__main__':
    print("Starting AI verification server on http://localhost:8000")
    app.run(port=8000, debug=True)
    