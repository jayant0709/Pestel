# Load the API keys
import os
import concurrent.futures
import pprint
import json
from dotenv import load_dotenv
load_dotenv()

# Import the required modules for LLM and Tavily
from langchain_openai import ChatOpenAI
from tavily import TavilyClient
from langchain_groq import ChatGroq

# Create tavily client
tavily_api_key = os.environ['TAVILY_SEARCH_API_KEY'] 
client = TavilyClient(api_key=tavily_api_key)

# Langraph implementation
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# Create LLM for query generation from user form
openai_api_key = os.environ['OPENAI_API_KEY']
query_llm = ChatOpenAI(
        model="o4-mini",
        reasoning_effort="medium",
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key= openai_api_key
    )

# LLM for generating the report
report_llm = ChatOpenAI(
        model="o4-mini",
        reasoning_effort="medium",
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key= openai_api_key
    )

# LLM for generating the report
# groq_llm = ChatGroq(
#     # model="qwen-2.5-32b",
#     model="deepseek-r1-distill-llama-70b",
#     temperature=0.5,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
#     api_key= os.environ["GROQ_API_KEY"]
# )

final_report_llm = ChatOpenAI(
    model="o4-mini",
    reasoning_effort="medium",
    max_tokens=None,
    timeout=None,
    max_retries=2,
    api_key= openai_api_key
)

# Schema for generated query output
query_schema = {
    "title": "SearchQueries",
    "description": "Schema for generating search queries with categorization tags",
    "type": "object",
    "properties": {
        "search_queries": {
            "type": "array",
            "description": "List of search queries with categorization tags",
            "items": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to find relevant information"
                    },
                    "tag": {
                        "type": "string",
                        "description": "Category tag for the query type",
                        "enum": ["general", "news"]
                    }
                },
                "required": ["query", "tag"]
            }
        }
    },
    "required": ["search_queries"]
}

# Fixing the schema to the LLM
query_llm = query_llm.with_structured_output(query_schema)

################################### TAVILY FUNCTIONS ############################################
# Function to return URLs
def tavily_search(queries):
    results = []
    for q in queries['search_queries']:
        query = q['query']
        topic = q['tag']
        time_range = "year" if q['tag'] == "general" else "month"
        response_search = client.search(
            query=query,
            topic=topic,
            # search_depth="advanced",
            time_range=time_range,
            max_results=5,
            chunks_per_source=3,
        )

        urls = [url['url'] for url in response_search['results']]
        title = [{'title': item['title'], 'url': item['url']} for item in response_search['results']]
        # print(title)
        response_extract = client.extract(urls=urls)
        
        for result in response_extract['results']:
            matching_title = next((item for item in title if item['url'] == result['url']), None)
            if matching_title:
                results.append({
                    'query' : q['query'],
                    'url': result['url'],
                    'title': matching_title['title'],
                    'content': result['raw_content']
                })

    successful_extractions = [{'title': item['title'], 'url': item['url']} for item in results]
    # pprint.pprint(successful_extractions)

    return results

def summarize_page(result, summarizer_agent, prompt):
    formatted_prompt = prompt.format(webpage_content=result['content'])
    summary = summarizer_agent.invoke(formatted_prompt)
    result['content'] = summary.content
    return result

def summarize_extracted_content(results):
    """
    Summarize a list of web search results in parallel.
    Handles potential errors and large content gracefully.
    """
    summarizer_agent = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key=os.environ["OPENAI_API_KEY"]
    )

    prompt = """
        Extract useful content from the webpage: 
        Webpage content = {webpage_content}

        Remember: 
        1. Focus on extracting key facts, data points, and important information.
        2. Discard boilerplate text, navigation elements, footers, headers, and ads.
        3. Preserve important numerical data and statistics.
        4. Be concise but retain all substantive information.
    """
    
    processed_results = []
    
    # Process results in smaller batches to avoid overwhelming the system
    batch_size = 3
    for i in range(0, len(results), batch_size):
        batch = results[i:i+batch_size]
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=batch_size) as executor:
            futures = [executor.submit(summarize_page, result, summarizer_agent, prompt) for result in batch]
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    processed_result = future.result()
                    processed_results.append(processed_result)
                except Exception as e:
                    print(f"Error processing search result: {e}")
    
    return processed_results



################################### LANGRAPH IMPLEMENTATION ############################################
# Define the state for langraph
class State(TypedDict):
    # Messages have the type "list". The `add_messages` function
    # in the annotation defines how this state key should be updated
    # (in this case, it appends messages to the list, rather than overwriting them)
    messages: Annotated[list, add_messages]
    scraped_data: Annotated[list, "List of dictionaries with 'query', 'title', 'url' of the webpage and 'content' from the webpage"]

    
# Function which will return the search queries
def format_user_query(state : State):
    # prompt_template = """
    #     1. You are a query writer who writes search queries such that the results returned will be as relevant and useful for the next agent who will analyze the articles returned from those search query results.
    #     2. You need to write search queries keeping in mind that the results should be relevant for politically analyzing the given scenario. Also do not mention year in any of your query.
    #     3. You need to return at max 5 search queries along with a tag. For tags you have choice between "general" and "news".
    #     4. Use "general" tag whenever the query should return general articles from the web search.
    #     5. Use "news" tag whenever the query should return news articles from the web search.
    #     6. Keep in mind you are a part of a big workflow. So what output you give matters the most for the upcoming agents.
    #     7. Generate queries giving importance to the appropriate fields in the form filled by the user requiring the political analysis : 
    #     {user_form}
    #     8. Make sure to include the industry and geographical focused area in your generated search queries so that relevant results are returned.
    # """

    prompt = """
        You are a search query writer responsible for crafting precise and effective search queries. 
    These queries will be used by subsequent agents to analyze articles in a PESTEL political context. 
    Your goal is to ensure that the search results are highly relevant and informative for a detailed political analysis.
    Guidelines:
    1. Objective:
    * Write up to 5 search queries that will retrieve highly relevant articles for political analysis.
    * Focus on generating queries that provide both general context and specific news items, as needed.
    2. Tagging:
    * Each query must be accompanied by a tag: either "general" (for broad, general articles) or "news" (for current, time-sensitive news pieces).
    3. Context Awareness:
    * Base your queries on the provided user input form.
    * Include both the industry and the geographical focus area in each query to narrow down the results.
    4. User Form Template: {user_form}
    5. Content Emphasis:
    * Emphasize the relevant political factors such as government policies, political stability, regulatory environments, and trade agreements.
    * Factor in both opportunities and risks mentioned, along with any time-sensitive political updates or industry-specific regulatory actions.
    
    Output Format:
    * Return each search query along with its tag in a clear list format.
    * Ensure that no more than 5 queries are returned.
    
    Remember:
    * You are an essential part of a larger workflow; the quality and precision of your queries are critical for the success of the subsequent analysis.
    * Focus on being forward-thinking, clear, and direct. No fluff, just the right amount of detail to guide the political analysis effectively.
    * Do not mention any year in any of your search query.
    """
    query = state['messages'][-1].content
    prompt = prompt.format(user_form=query)
    # search_queries = query_llm.invoke(prompt)
    
    # print(f"Search Query generated = {search_queries}")
    # search_queries = {
    #     'search_queries': [
    #         {'query': 'Electric Vehicles government policies Europe', 'tag': 'general'},
    #         # {'query': 'EU regulations on Electric Vehicles 2023', 'tag': 'news'},
    #         # {'query': 'Political stability impact on Electric Vehicles market Europe', 'tag': 'general'},
    #         # {'query': 'Trade agreements affecting Electric Vehicles in Europe', 'tag': 'general'},
    #         # {'query': 'Electric Vehicles subsidies and tax regulations in Europe', 'tag': 'news'}
    #     ]
    # }
    print("User query formatted !")
    # return {'messages' : [json.dumps(search_queries)]}
    return {'messages' : []}

# Function to return the search results with extracted content from the webpage
def get_search_results(state : State):
    queries = state['messages'][-1].content
    queries = json.loads(queries)
    # results = tavily_search(queries)
    # print(results)
    print("Web Scraping Done !")
    # return {'scraped_data' : results}
    return {'scraped_data' : ""}

# Function to summarize the websearch content
def summarize_search_results(state : State):
    results = state['scraped_data']
    # summarized_data = summarize_extracted_content(results)
    print("Result Summarization Done !")
    # print(summarized_data)
    
    # Save the summarized_data to a JSON file
    # with open("web_results.json", "w", encoding="utf-8") as json_file:
    #     json.dump(summarized_data, json_file, indent=4)
    
    summarized_data = ""
    with open('web_results.json', 'r') as file:
        summarized_data = json.load(file)
        
    return {'scraped_data' : summarized_data}

# Function to generate the final report
def generate_results(state: State):

    prompt = """
    You are a PESTEL analysis political expert specializing in comprehensive geopolitical assessments. Your task is to generate an exceptionally detailed Political Report (minimum 3,000 words) based on the user query and provided context from reputable sources. Make good use of the numbers which are present in the article data.

    REPORT REQUIREMENTS:
    1. COMPREHENSIVE COVERAGE: Thoroughly analyze all political factors mentioned in the context, leaving no significant points unaddressed. Your report should systematically incorporate at least 90% of the political insights from the provided context.
    
    2. DEPTH OF ANALYSIS: For each political factor identified:
       - Provide detailed explanation of its current state
       - Analyze historical development and trajectory
       - Examine causal relationships and interdependencies
       - Assess potential future implications (short-term and long-term)
       - Connect to broader regional/global political trends
    
    3. DATA INTEGRATION: Incorporate ALL quantitative data from the context, including:
       - Statistical trends and numerical evidence
       - Poll results and public opinion metrics
       - Economic indicators with political implications
       - Demographic data relevant to political analysis
       - Historical numerical comparisons where available
    
    4. STRUCTURED FORMAT: Organize your analysis into these mandatory sections:
       - Executive Summary (comprehensive overview)
       - Current Political Landscape (detailed assessment)
       - Key Political Risk Factors (thorough analysis)
       - Stakeholder Analysis (government, opposition, interest groups)
       - Regional/International Political Dynamics
       - Scenario Analysis (3-5 potential political outcomes)
       - Detailed Actionable Recommendations
       - Appendix: Additional Political Considerations
    
    5. ACTIONABLE INTELLIGENCE: Conclude with at least 7-10 specific, detailed actionable recommendations directly responding to the user query, each with:
       - Concrete implementation steps
       - Timeline considerations
       - Potential challenges and mitigation strategies
       - Expected outcomes and success metrics
    
    CRITICAL GUIDELINES:
    - Never summarize or abbreviate your analysis - provide exhaustive detail for each point
    - Do not fabricate information - clearly indicate any information gaps
    - Present multiple perspectives on controversial political issues
    - Base all conclusions on evidence from the provided context
    - Use professional political analysis terminology throughout
    
    Here is the user query:
    {user_query}
    
    Here is the context from web:
    {context}
    
    Your final report must be exhaustive, nuanced, and provide actionable political intelligence that addresses all dimensions of the user query while fully leveraging the provided context.
    """
    user_query = state['messages'][0].content
    print(state['scraped_data'])
    prompt = prompt.format(user_query = user_query, context = state['scraped_data'])

    print("Generating Report...")

    # political_report = groq_llm.invoke(prompt)
    # political_report = report_llm.invoke(prompt)
    political_report = ""
    with open('political_report.txt', 'r') as file:
        political_report = file.read()
    
    # print(political_report.content)
    print("Political Report Generated")

    # return {'messages' : [political_report.content]}
    return {'messages' : [political_report]}

def build_graph():
    graph_builder = StateGraph(State)
    graph_builder.add_node("format_user_query", format_user_query)
    graph_builder.add_node("get_search_results", get_search_results)
    graph_builder.add_node("summarize_search_results", summarize_search_results)
    graph_builder.add_node("generate_results", generate_results)

    graph_builder.add_edge(START, "format_user_query")
    graph_builder.add_edge("format_user_query", "get_search_results")
    graph_builder.add_edge("get_search_results", "summarize_search_results")
    graph_builder.add_edge("summarize_search_results", "generate_results")
    graph_builder.add_edge("generate_results", END)

    graph = graph_builder.compile()

    return graph

def make_serializable(obj):
    # If the object has a dict() method, use it.
    if hasattr(obj, "dict"):
        try:
            return obj.model_dump()
        except Exception:
            return str(obj)
    # Recursively convert lists and dicts.
    elif isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(item) for item in obj]
    else:
        return obj  # Fallback: leave as-is (or convert to string)

if __name__ == "__main__":
    user_form = {
          "industry": "Electric Vehicles",
          "geographical_focus": "Europe",
          "market_analysis": {
            "target_market": [
              "Environmentally conscious consumers",
              "Urban professionals",
              "Government fleets",
              "Businesses transitioning to sustainable transport"
            ],
            "key_competitors": [
              "Tesla",
              "Volkswagen (ID series)",
              "BMW (i Series)",
              "Renault (Zoe)",
              "Nissan (Leaf)",
              "Polestar"
            ],
            "analysis_time_frame": "Short-term (1-2 years)"
          },
          "political_factors": {
            "government_policies": "true",
            "political_stability": "true",
            "tax_regulations": "true",
            "industry_regulations": "true",
            "global_trade_agreements": "true"
          },
          "additional_notes": "Opportunities: Leverage EU/national subsidies to reduce consumer prices. Partner with governments for charging infrastructure projects. Risks: Geopolitical tensions disrupting supply chains (e.g., battery materials from Russia/China). Regulatory fragmentation (e.g., differing subsidy rules across EU member states). Action Steps: Monitor EU policy updates (e.g., Critical Raw Materials Act, 2023). Engage with industry groups (e.g., ACEA) to shape favorable regulations."
        }

    graph = build_graph()
    
    result = graph.invoke({
    'messages': [json.dumps(user_form)],
    'scraped_data' : []
             })

    report = result['messages'][-1].content
    
    # with open('political_report.txt', 'w', encoding='utf-8') as file:
    #     file.write(report)
    
    # print("Report saved to political_report.txt")

    serializable_state = make_serializable(result)
    with open('tavily_state.json', 'w', encoding='utf-8') as f:
        json.dump(serializable_state, f, indent=4)

    print("State saved to tavily_state.json")
















