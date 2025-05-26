from flask import Flask, jsonify, request, send_from_directory
import json
import os
from tavily_functions import tavily_search
import time

app = Flask(__name__, static_folder="static")  # adjust if your frontend is in a different folder

FACTOR_KEYS = {
    "political": "political_messages",
    "economic": "economic_messages",
    "social": "social_messages",
    "technological": "technological_messages",
    "environmental": "environmental_messages",
    "legal": "legal_messages"
}

def extract_news_queries_by_factor(state):
    news_queries = {}

    for factor, key in FACTOR_KEYS.items():
        if key not in state or not state[key]:
            continue

        entry = state[key][0]

        # 1) Normalize entry → a dict with search_queries
        if isinstance(entry, str):
            try:
                queries_obj = json.loads(entry)
            except json.JSONDecodeError as e:
                print(f"[ERROR] parsing string for {factor}: {e}")
                continue

        elif isinstance(entry, dict):
            inner = entry.get("content")
            if not isinstance(inner, str):
                print(f"[ERROR] unexpected content type for {factor}: {type(inner)}")
                continue
            try:
                queries_obj = json.loads(inner)
            except json.JSONDecodeError as e:
                print(f"[ERROR] parsing entry['content'] for {factor}: {e}")
                continue

        else:
            print(f"[ERROR] Unsupported format for {factor}: {type(entry)}")
            continue

        # 2) Now correctly grab the list of queries
        raw_queries = queries_obj.get("search_queries", [])
        tagged_news = [q for q in raw_queries if q.get("tag") == "news"][:2]

        print(f"[INFO] Extracted {len(tagged_news)} news queries for '{factor}': {tagged_news}")
        if tagged_news:
            news_queries[factor] = tagged_news

    return news_queries


@app.route("/refresh-news", methods=["GET"])
def refresh_news():
    print("\n[INFO] --- /refresh-news called ---")

    try:
        with open('final_state.json', 'r') as f:
            state = json.load(f)
        print("[INFO] Loaded final_state.json")
    except Exception as e:
        print(f"[ERROR] Failed to load final_state.json: {e}")
        return jsonify({"error": "Could not read final_state.json"}), 500

    news_queries_by_factor = extract_news_queries_by_factor(state)
    bulletin = {}

    for factor, queries in news_queries_by_factor.items():
        if not queries:
            continue

        combined_queries = {"search_queries": queries}
        print(f"\n[INFO] Sending queries to Tavily for factor '{factor}': {combined_queries}")

        try:
            start = time.time()
            results = tavily_search(combined_queries)
            duration = time.time() - start
            print(f"[INFO] Tavily returned {len(results)} articles for '{factor}' in {duration:.2f} seconds")
        except Exception as e:
            print(f"[ERROR] Tavily API failed for '{factor}': {e}")
            bulletin[factor] = [{"title": "Tavily error", "url": ""}]
            continue

        top_articles = results[:2]
        bulletin[factor] = [
            {"title": r.get("title", "No Title"), "url": r.get("url", "#")}
            for r in top_articles
        ]

    print("\n[INFO] Final Bulletin:")
    for factor, articles in bulletin.items():
        print(f"  {factor.upper()}:")
        for art in articles:
            print(f"    - {art['title']} → {art['url']}")

    return jsonify(bulletin)

@app.route("/")
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
