import json
import os
from openai import OpenAI
import time
from dotenv import load_dotenv

# Load .env into os.environ
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# PESTEL factors list
PESTEL_FACTORS = [
    "political", "economic", "social",
    "technological", "environmental", "legal"
]


def build_prompt(factor, user_factor_data, report_text):
    """
    Builds a detailed and structured PESTEL scoring prompt for similarity and impact using custom logic.
    """

    # Format sub-factors for readable display
    subfactor_list = "\n".join(
        f"- {subfactor}: {'IMPORTANT' if value.lower() == 'true' else 'NOT IMPORTANT'}"
        for subfactor, value in user_factor_data.items()
    )

    return f"""
You are an expert in business analysis and PESTEL evaluation.

You will receive:
1. A user-defined configuration of sub-factors under the **{factor.upper()}** category. Each sub-factor is marked as either IMPORTANT (true) or NOT IMPORTANT (false).
2. A detailed report for the same **{factor.upper()}** category, generated from real-world, web-sourced content.

---

### Sub-Factor Importance:
{subfactor_list}

---

### STEP 1: SIMILARITY SCORING (raw –50 to +50)

Evaluate how well the report content **aligns** with the user's marked sub-factors:

- If the sub-factor is **IMPORTANT (true)**:
  - **+10** points → if the report provides clear, detailed, and explicit information on the sub-factor.
  - **+5** points → if the report briefly or partially addresses it.
  - **–5** points → if the report does not mention it at all.

- If the sub-factor is **NOT IMPORTANT (false)**:
  - **–10** points → if the report provides clear, detailed coverage on it.
  - **–5** points → if the report briefly or partially addresses it.
  - **+10** points → if the report completely omits it.



---

### STEP 2: IMPACT SCORING (raw –50 to +50)

Now evaluate the **real-world significance** of the covered sub-factors for the user's context (industry, geography, etc):

- If the sub-factor is **IMPORTANT (true)**:
  - **+10** points → if the insight has strong, actionable, short-term strategic implications.
  - **+5** points → if it's moderately relevant or may influence mid/long-term decisions.
  - **–10** points → if the insight is weak, speculative, or irrelevant.

- If the sub-factor is **NOT IMPORTANT (false)**:
  - **–10** points → if the insight is highly impactful.
  - **–5** points → if it is moderately relevant.
  - **+10** points → if it is clearly low-impact, speculative, or a distraction.

 Total raw score will range from –50 to +50.

Convert to 0–100 scale using:
impact_score = round(((raw_impact + 50) / 100) * 100)

---

 ### IMPORTANT INSTRUCTIONS:
    - Carefully calculate the raw similarity and impact points based on the sub-factor scoring criteria.
    -Total raw score will range from –50 to +50.
    -Convert to 0–100 scale using:
    -similarity_score = round(((raw_similarity + 50) / 100) * 100)
    -impact_score = round(((raw_impact + 50) / 100) * 100)
    - Provide a clear, concise breakdown of your scoring rationale in the "justification" section.
    - Ensure the final "similarity_score" and "impact_score" values in your JSON output **exactly match** the explanation you provide in the "justification" section.
    - Return only the JSON object as the final output—no additional commentary, no partial outputs, and no unrelated text.
    - The JSON should be well-formed and parseable.
    
    - Do not include any markdown formatting or extra text in your output.
    
---
### STEP 3: Return Output as JSON
After scoring, return your result in the following JSON structure:
{{
  "similarity_score": {{integer between 0 and 100}},
  "impact_score": {{integer between 0 and 100}},
  "justification": "{{2–4 sentence breakdown: raw points summary and rationale}}"
}}
Output ONLY the raw JSON structure. Do not include markdown formatting, bullet points, or any extra text.

```

### User Input for {factor.upper()}:
{json.dumps(user_factor_data, indent=2)}

### {factor.upper()} Report:
{report_text.strip()}
""".strip()


def calculate_scores_direct(form_data, reports):
    """
    Calculate similarity and impact scores for PESTEL factors using direct data inputs.
    
    Args:
        form_data (dict): The processed form data containing PESTEL factor preferences
        reports (dict): Dictionary containing individual PESTEL reports
    
    Returns:
        dict: Dictionary containing scores for each PESTEL factor
        Format: {
            'political': {
                'similarity_score': int,
                'impact_score': int, 
                'justification': str
            },
            ...
        }
    """
    print(f"[INFO] Starting direct PESTEL scoring calculation...")
    
    # Prepare dictionary for scores
    scores = {}

    for factor in PESTEL_FACTORS:
        print(f"[INFO] Processing {factor} factor...")

        # Extract user subfactor data
        user_factor_key = f"{factor}_factors"
        user_factor_data = form_data.get(user_factor_key, {})
        
        if not user_factor_data:
            print(f"[WARNING] No user factor data found for {factor}")
            continue

        # Extract report text
        report_key = f"{factor}_report"
        report_data = reports.get(report_key, "")
        
        # Handle both string and dict report formats
        if isinstance(report_data, dict):
            # If report is a dictionary, extract the relevant text content
            # This handles parsed JSON reports
            report_text = report_data.get('content', '') or report_data.get('analysis', '') or str(report_data)
        else:
            # If report is already a string
            report_text = str(report_data)
            
        if not report_text or report_text.strip() == "":
            print(f"[WARNING] No report content found for {factor}")
            continue

        print(f"[DEBUG] User factors for {factor}: {user_factor_data}")
        print(f"[DEBUG] Report length for {factor}: {len(report_text)} characters")

        # Build the prompt
        prompt = build_prompt(factor, user_factor_data, report_text)

        # Call OpenAI GPT-4
        try:
            start_time = time.time()
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert in PESTEL analysis and scoring."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2
            )
            duration = time.time() - start_time
            print(f"[INFO] OpenAI API call for {factor} completed in {duration:.2f}s")
        except Exception as e:
            print(f"[ERROR] OpenAI API call failed for {factor}: {e}")
            continue

        # Parse the assistant response
        assistant_msg = response.choices[0].message.content.strip()

        try:
            result = json.loads(assistant_msg)
            similarity = result.get('similarity_score')
            impact = result.get('impact_score')
            justification = result.get('justification')
            
            # Validate scores are integers between 0-100
            if not (isinstance(similarity, int) and 0 <= similarity <= 100):
                print(f"[WARNING] Invalid similarity score for {factor}: {similarity}")
                continue
            if not (isinstance(impact, int) and 0 <= impact <= 100):
                print(f"[WARNING] Invalid impact score for {factor}: {impact}")
                continue
                
        except json.JSONDecodeError as e:
            print(f"[ERROR] Failed to parse JSON from GPT-4 for {factor}: {e}")
            print(f"[DEBUG] Raw response: {assistant_msg}")
            continue

        # Store scores
        scores[factor] = {
            'similarity_score': similarity,
            'impact_score': impact,
            'justification': justification
        }
        print(f"[SUCCESS] Scored {factor}: similarity={similarity}, impact={impact}")

    print(f"[INFO] Scoring completed. Processed {len(scores)} out of {len(PESTEL_FACTORS)} factors.")
    return scores