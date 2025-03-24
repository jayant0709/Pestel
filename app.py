from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/submit-analysis', methods=['POST'])
def submit_analysis():
    try:
        data = request.json
        
        # Remove email field
        if 'email' in data:
            del data['email']
        
        # Filter out false political factors
        if 'political_factors' in data:
            political_factors = data['political_factors']
            filtered_factors = {
                k: v for k, v in political_factors.items()
                if k == 'notes' or v is True
            }
            data['political_factors'] = filtered_factors
        
        # Print the filtered data
        print("\nReceived Form Data (Filtered):")
        print(json.dumps(data, indent=2))
        return jsonify({"message": "Data received successfully"})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
