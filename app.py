from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import httpx
import os
import random
import json
from dotenv import load_dotenv
from tqdm import tqdm

# Imports for web scrapper
from bs4 import BeautifulSoup
import re
import nltk
from nltk.corpus import words, stopwords

import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator

# Imports for Langchain agent
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

app = Flask(__name__)
CORS(app)

load_dotenv()

bing_search_api_key = os.environ['BING_SEARCH_API_KEY']
openai_api_key = os.environ['OPENAI_API_KEY']

formatter_llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.0,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key= os.environ["OPENAI_API_KEY"]
    )

general_llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.5,
        max_tokens=None,
        timeout=None,
        max_retries=2,
        api_key= os.environ["OPENAI_API_KEY"]
    )

nltk.download('stopwords', quiet=True)
STOPWORDS = set(stopwords.words('english'))

###################################### WEB SURFER CODE ######################################
def get_urls(query):
    query = query.strip('"').strip("'")
    
    bing_endpoint = "https://api.bing.microsoft.com/v7.0/search"
    headers = {
        'Ocp-Apim-Subscription-Key' : bing_search_api_key
    }

    params = {
        'q' : str(query),
        'count' : 10,
        'offset' : 0,
        'freshness' : 'Month',
        'answerCount' : 5,
        'responseFilter' : ['Webpages', 'News'],
        'setLang' : 'en'
    }

    response = httpx.get(bing_endpoint, headers=headers, params=params)
    results = response.json()

    # print(results)
    
    webpages = [result['url'] for result in results['webPages']['value']]
    # try:
    # except KeyError:
    #     webpages = []  

    try:
        newspages = [result['url'] for result in results['news']['value']]
    except KeyError:
        newspages = [] 

    final_urls = webpages + newspages

    final_urls = random.sample(final_urls, 5)
    # print(final_urls)

    return final_urls

###################################### WEB SCRAPPER CODE ######################################
def remove_links(text):
    """Removes markdown and HTML links from a given text."""
    markdown_link = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
    text = markdown_link.sub(r'\1', text)
    html_link = re.compile(r'<a\s+(?:[^>]*?\s+)?href=([\'"])(.*?)\1>(.*?)<\/a>')
    text = html_link.sub(r'\3', text)
    
    text = re.sub(r'\[.*?\]\(.*?\)', '', text)
    text = BeautifulSoup(text, "html.parser").get_text()
    text = re.sub(r'http\S+|www\.\S+', '', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'!', '', text)
    text = re.sub(r'\|', '', text)
    text = re.sub(r'\*', '', text)
    text = re.sub(r'-', '', text)
    text = re.sub(r'_', '', text)

    text = " ".join([token for token in text.split(" ") if len(token) < 15])

    tokens = re.findall(r'\b\w+\b', text)
    filtered_tokens = []
    for token in tokens:
        if any(char.isdigit() for char in token):
            filtered_tokens.append(token)
        else:
            lower_token = token.lower()
            if lower_token not in STOPWORDS:
                filtered_tokens.append(token)

    return ' '.join(filtered_tokens)



async def web_crawler(url):
    md_generator = DefaultMarkdownGenerator(
        options = {
            'ignore_links' : True,
            'ignore_images ' : True,
            'escape_html' : True,
            'skip_internal_links ' : True,
            'include_sup_sub ' : True
        }
    )

    config = CrawlerRunConfig(
        markdown_generator=md_generator,
        exclude_external_links=True,
        excluded_tags=["nav", "footer", "header"],
        timeout=30000,  # Add timeout
        retry_on_error=True  # Add retry on error
    )  

    try:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(
                url=url,
                config=config
            )

            if result.success:
                markdown_output = result.markdown
                final_output = remove_links(markdown_output)
                output = text_formatter(final_output)
            else:
                print("Error:", result.error_message)
                output = {"title": "Error", "content": "Failed to fetch content"}
                
    except Exception as e:
        print(f"Crawler error: {str(e)}")
        output = {"title": "Error", "content": "Failed to fetch content"}

    return output


def text_formatter(webpage):
    schema = {
        "title": "WebPage",
        "description": "Schema for a webpage containing title and content",
        "type": "object",
        "properties": {
            "title": {
                "type": "string"
            },
            "content": {
                "type": "string"
            }
        },
        "required": ["title", "content"]
    }

    local_formatter_llm = formatter_llm.with_structured_output(schema)

    prompt_template = """
        You are a professional web scrapper assistant. Your task is to extract useful content from raw webpage code in markdown format. Please follow these instructions:
        1. Identify the title of the webpage.
        2. Extract only the main visible information present on the webpage.
        3. Omit non-essential elements such as scripts, ads, metadata, links, and navigation menus.
        4. Return the final result as without any additional commentary or formatting.

        Important Note: Do not modify, rephrase, or alter the original content. Simply extract it as is without hyperlinks.

        Below is the raw webpage code. Please extract and output according to the instructions above. 

        Webpage Text : 
        {webpage_text}
    """

    prompt_template = prompt_template.format(webpage_text = webpage)

    output = local_formatter_llm.invoke(prompt_template)

    return output

async def get_urls_content_async(urls):
    try:
        tasks = []
        for url in urls:
            try:
                task = web_crawler(url)
                tasks.append(task)
            except Exception as e:
                print(f"Error creating task for {url}: {str(e)}")
                tasks.append(asyncio.create_task(asyncio.sleep(0)))  # Dummy task
                
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and handle exceptions
        processed_results = []
        for result in results:
            if isinstance(result, Exception):
                processed_results.append({
                    "title": "Error",
                    "content": f"Failed to fetch content: {str(result)}"
                })
            elif isinstance(result, dict) and "title" in result and "content" in result:
                processed_results.append(result)
            else:
                processed_results.append({
                    "title": "Error",
                    "content": "Invalid response format"
                })
                
        return processed_results
        
    except Exception as e:
        print(f"Error in get_urls_content_async: {str(e)}")
        return [{"title": "Error", "content": "Failed to fetch content"}] * len(urls)

def get_urls_content(urls):
    return asyncio.run(get_urls_content_async(urls))

# def get_urls_content(urls):
#     content = [web_crawler(url) for url in tqdm(urls, desc="Fetching data from URLs", unit="url")]
#     print(content)
#     print("\n\n\n\n\n")
#     return content

###################################### LANGCHAIN AGENT CODE ######################################

class State(TypedDict):
    messages: Annotated[list, add_messages]
    urls: Annotated[list, "List of URLs returned by the search agent"]
    scraped_data: Annotated[list, "List of dictionaries with 'title' and 'content' from the webpage"]

def format_user_query(state : State):
    prompt = """
        You are an expert at writing search queries for a web search agent.
        You are a part of PESTEL analysis tool framework.
        Your job is to write a search query which is short and can reterive articles from web which will be useful for the Technical Agent to make report.
        Keep in mind that the search query should be related to technical aspect only of the user query.
        Keep it short and simple so that most relevant results can be returned.
        Do not include the word PESTEL analysis or related to PESTEL since it will fetch websites related to PESTEL analysis.

        Here is the user query :
        {user_query}
    """
    query = state['messages'][-1].content
    # print(query)
    prompt = prompt.format(user_query=query)
    result = general_llm.invoke(prompt)
    llm_output = result.content
    print(f"Search Query generated = {llm_output}")
    
    return {'messages' : [llm_output]}


def search_web(state : State):
    # Logic for searching the web and returning the most relevant 5 webpages URLs in list format in 'urls'
    query = state['messages'][-1].content
    urls = get_urls(query)
 #    urls = ['https://www.press.bmwgroup.com/global/article/detail/T0448099EN/charge-faster-drive-further:-bmw-group-reveals-revolutionary-electric-drive-concept-with-800v-technology-for-the-neue-klasse',
 # 'https://www.press.bmwgroup.com/global/article/topic/4241/x3/',
 # 'https://g80.bimmerpost.com/forums/showthread.php?t=901686',
 # 'https://www.press.bmwgroup.com/global/article/topic/4100/bmw/',
 # 'https://www.topspeed.com/bmw-gen6-ev-architecture-improves-range-charge-times-prices/']
    print(urls)
    
    return {'urls': urls}
    
    
def scrape_websites(state: State):
    data = get_urls_content(state['urls'])
    
    # Ensure all items in data are valid dictionaries
    validated_data = []
    for item in data:
        if isinstance(item, dict) and "title" in item and "content" in item:
            validated_data.append(item)
        else:
            validated_data.append({
                "title": "Error",
                "content": "Invalid scraping result"
            })
    
    # Write to debug file
    with open("dummy_scraped_data.txt", 'w') as file:
        for item in validated_data:
            title = item.get("title", "No Title")
            content = item.get("content", "No Content")
            file.write(f"Title: {title}\n")
            file.write(f"Content: {content}\n")
            file.write("\n" + "="*50 + "\n")
    
    return {'scraped_data': validated_data}


def generate_results(state: State):

    # """
    # Emerging Technologies & Digital Innovation: Analyze trends like AI, IoT, blockchain, big data, and other cutting-edge advancements, explaining their potential impact on market dynamics.
    #     R&D and Investment Trends: Evaluate how research initiatives, technological investments, and innovation ecosystems drive industry transformation.
    #     Cybersecurity & Data Privacy: Assess the challenges and regulatory measures related to cybersecurity, data breaches, and digital trust.
    #     Technological Infrastructure & Digital Transformation: Consider the evolution of digital infrastructure, automation, and how digital transformation strategies are influencing business operations.
    #     Regulatory & Compliance Factors: Highlight any technological regulations or standards that might affect innovation and market competition.
    # """
    
    prompt = """
        You are a PESTEL analysis Political agent. Based on the given user query and the context from various reputable sources, your task is to generate a comprehensive **Political Report** that provides clear, fact-based insights into how political factors are shaping the industry.  
        Your report should focus on key areas, including:  
        - **Government Policy** (laws, regulations, and government interventions)  
        - **Political Stability** (risks related to government changes, political unrest, or conflicts)  
        - **Corruption** (levels of corruption, regulatory integrity, and anti-corruption measures)  
        - **Foreign Trade Policy** (tariffs, trade agreements, and international relations affecting trade)  
        - **Tax Policy** (corporate taxation, incentives, and fiscal policies affecting businesses)  

        Do not fabricate information—if you encounter gaps in the data, note them clearly and answer strictly based on the provided query and context.  

        Here is the user query:  
        {user_query}  

        Here is the context:  
        {context}  

        Structure your analysis logically, ensuring it is actionable and fully aligned with the latest political developments and challenges. Provide both risks and opportunities within the political landscape, along with potential strategic recommendations where applicable.
    """
    user_query = state['messages'][0].content
    # print(state['scraped_data'])
    prompt = prompt.format(user_query = user_query, context = state['scraped_data'])

    political_report = general_llm.invoke(prompt)
    print(political_report.content)
    print("Technological Report Generated")

    # print(state)

    return {}


def build_graph():
    graph_builder = StateGraph(State)
    graph_builder.add_node("format_user_query", format_user_query)
    graph_builder.add_node("search_web", search_web)
    graph_builder.add_node("scrape_websites", scrape_websites)
    graph_builder.add_node("generate_results", generate_results)

    graph_builder.add_edge(START, "format_user_query")
    graph_builder.add_edge("format_user_query", "search_web")
    graph_builder.add_edge("search_web", "scrape_websites")
    graph_builder.add_edge("scrape_websites", "generate_results")
    graph_builder.add_edge("generate_results", END)

    graph = graph_builder.compile()

    return graph


@app.route('/submit-analysis', methods=['POST'])
def submit_analysis():
    try:
        data = request.json
        
        # Remove email field and filter political factors
        if 'email' in data:
            del data['email']
        
        if 'political_factors' in data:
            political_factors = data['political_factors']
            filtered_factors = {
                k: v for k, v in political_factors.items()
                if k == 'notes' or v is True
            }
            data['political_factors'] = filtered_factors
        
        # Generate PESTEL query from form data
        query = create_pestel_query(data)
        
        # Generate the political analysis report
        prompt = """
        Generate a comprehensive political analysis report for {business_name} in the {industry} industry. 
        Focus on their operations in {geographical_focus} over a {time_frame} period.

        Structure the report as follows:
        1. Introduction
        2. Regulatory Environment and Emission Standards
        3. Government Incentives for Electric Vehicles
        4. Trade Agreements and Tariffs
        5. Geopolitical Stability
        6. Labor Relations and Workforce Policies
        7. Sustainability Policies
        8. Conclusion

        Make it detailed and actionable.
        """
        
        formatted_prompt = prompt.format(
            business_name=data.get('business_name', 'the company'),
            industry=data.get('industry', 'automotive'),
            geographical_focus=data.get('geographical_focus', 'global'),
            time_frame=data.get('time_frame', 'short-term')
        )
        
        political_report = general_llm.invoke(formatted_prompt)
        
        return jsonify({
            "message": political_report.content,
            "success": True
        })

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

def create_pestel_query(data):
    """Convert form data into a PESTEL analysis query using OpenAI"""
    prompt = """
    You are an expert at creating PESTEL analysis queries. Given the following JSON data containing industry information and selected factors,
    create a clear and focused query for Political analysis. The query should be comprehensive but concise.
    
    Form Data:
    {json_data}
    
    Create a single query that captures all the essential elements from this data. Focus on technological aspects and avoid using the term 'PESTEL analysis' in the query.
    """
    
    # Convert data to formatted JSON string
    json_formatted = json.dumps(data, indent=2)
    prompt = prompt.format(json_data=json_formatted)
    
    # Get query from OpenAI
    response = general_llm.invoke(prompt)
    return response.content

@app.route('/chat', methods=['POST'])
def handle_chat():
    try:
        data = request.json
        user_message = data.get('message')
        report_context = data.get('reportContext')
        
        chat_prompt = """
        You are a professional AI assistant trained to assist users in understanding their PESTEL analysis report.  
        You have exclusive access to the full report and will only provide responses based on the given information.  

        ### Guidelines for Response:  
        - Answer queries strictly within the scope of the report context.  
        - If a user asks about information not covered in the report, politely inform them that the requested details are unavailable.  
        - Maintain a professional, concise, and informative tone.
        - When user says hello greet him and tell him who you are.
        - Try to provide precise and short to make user feel like a chatbot.  

        ### Report Context:  
        {report_context}  

        ### User Query:  
        {user_message}  

        Please provide a precise and well-structured response, focusing on the political analysis aspects covered in the report. Avoid speculation or external information.
        """
        
        formatted_prompt = chat_prompt.format(
            report_context=report_context,
            user_message=user_message
        )
        
        response = general_llm.invoke(formatted_prompt)
        
        return jsonify({
            "message": response.content,
            "success": True
        })

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))  # Cloud Run requires PORT=8080
    app.run(host="0.0.0.0", port=port)
