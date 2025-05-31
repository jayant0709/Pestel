# Flask imports
from flask import Flask, request, jsonify
from flask_cors import CORS

from all_agents import build_pestel_graph
from tavily_functions import make_serializable
from score import calculate_scores_direct  # Import the new scoring function

import json
import datetime
import os

# Flask application setup
app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

@app.route('/submit-analysis', methods=['POST'])
def submit_analysis():
    """
    Endpoint to receive form data from the frontend and process through PESTEL analysis
    """
    try:
        # Get form data from request
        form_data = request.json
        # print("Received form data:", form_data)
        
        if not form_data:
            return jsonify({
                'success': False,
                'error': "No form data received"
            }), 400
        
        # General preprocessing: convert all boolean values in PESTEL factor categories to "true"/"false" strings
        processed_form_data = form_data.copy()
        factor_categories = [
            "political_factors",
            "economic_factors",
            "social_factors",
            "technological_factors",
            "environmental_factors",
            "legal_factors"
        ]
        for category in factor_categories:
            if category in processed_form_data and isinstance(processed_form_data[category], dict):
                for key, value in processed_form_data[category].items():
                    if isinstance(value, bool):
                        processed_form_data[category][key] = str(value).lower()

        # print("\n\n\n")
        # print(processed_form_data)
        
        # Build the PESTEL analysis graph
        pestel_graph = build_pestel_graph()
        
        # Initialize the state with the form data and empty message queues
        initial_state = {
            'messages': [json.dumps(processed_form_data)],
            'political_messages': [],
            'economic_messages': [],
            'social_messages': [],
            'technological_messages': [],
            'environmental_messages': [],
            'legal_messages': [],
            'political_data': [],
            'economic_data': [],
            'social_data': [],
            'technological_data': [],
            'environmental_data': [],
            'legal_data': [],
            'reports': {},
            'completed_reports': []
        }
        
        # Run the PESTEL analysis workflow
        print("Starting PESTEL analysis workflow for submitted form data...")
        # result = pestel_graph.invoke(initial_state)

        ### TESTING ###
        output_filename = "../test/output_20250516_161305.json"
        with open(output_filename, 'r', encoding='utf-8') as f:
            result = json.loads(f.read())
        
        # Prepare serializable result
        serializable_result = make_serializable(result)

        ### TESTING ###
        # with open("submit_analysis_response.json", 'r', encoding='utf-8') as f:
        #     file_content = json.loads(f.read())
        #     response_data = file_content
        
        # Save the results to output.json for debugging/record keeping
        output_filename = f"../test/output_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(serializable_result, f, indent=4)
        
        # Parse all reports from JSON strings to Python dictionaries
        parsed_reports = {}
        reports = serializable_result.get('reports', {})
        
        # Process individual reports
        for report_key, report_value in reports.items():
            if report_key != 'final_report' and report_value:
                try:
                    # Parse the JSON string into a Python dictionary
                    if isinstance(report_value, str):
                        parsed_reports[report_key] = json.loads(report_value)
                    else:
                        parsed_reports[report_key] = report_value
                except json.JSONDecodeError:
                    print(f"Error parsing {report_key} as JSON")
                    parsed_reports[report_key] = report_value
        
        # Parse the final report separately
        final_report = reports.get('final_report', '')
        if final_report and isinstance(final_report, str):
            try:
                parsed_final_report = json.loads(final_report)
            except json.JSONDecodeError:
                print("Error parsing final_report as JSON")
                parsed_final_report = final_report
        else:
            parsed_final_report = final_report
        
        # Calculate PESTEL similarity and impact scores
        print("Starting PESTEL scoring calculation...")
        try:
            pestel_scores = calculate_scores_direct(processed_form_data, parsed_reports)
            print(f"PESTEL scoring completed successfully. Calculated scores for {len(pestel_scores)} factors.")
        except Exception as e:
            print(f"Error calculating PESTEL scores: {str(e)}")
            pestel_scores = {}
        
        # Extract news data from each factor's data arrays
        news_data = {}
        factor_data_keys = [
            'political_data', 'economic_data', 'social_data', 
            'technological_data', 'environmental_data', 'legal_data'
        ]
        
        for data_key in factor_data_keys:
            news_key = data_key.replace('_data', '_news')
            news_data[news_key] = []
            
            data_array = serializable_result.get(data_key, [])
            for item in data_array:
                if isinstance(item, dict) and 'title' in item and 'url' in item:
                    news_data[news_key].append({
                        'title': item['title'],
                        'url': item['url']
                    })
        
        # Structure the response according to the expected format
        response_data = {
            'success': True,
            'individual_reports': parsed_reports,
            'report': parsed_final_report,
            'news': news_data,
            'pestel_scores': pestel_scores,  # Add the calculated scores
            'timestamp': datetime.datetime.now().isoformat()
        }
        
        print(f"PESTEL analysis complete!")
        
        # print(response_data)

        return jsonify(response_data)
        
    except Exception as e:
        import traceback
        print(f"Error processing analysis: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Replace the if __name__ == "__main__" block with this simplified version
if __name__ == "__main__":
    import sys
    
    # Set default port
    port = int(os.environ.get('PORT', 8080))
    
    # Run the Flask server by default when script is executed
    app.run(host='0.0.0.0', port=port, debug=True)