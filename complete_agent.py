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
    )  

    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(
            url=url,
            config=config
        )

        if result.success:
            markdown_output = result.markdown
            final_output = remove_links(markdown_output)
            # print(final_output)
            # print("\n\n\n\n")
            # print("########################################################################################################")
            # print(result.markdown)

            output = text_formatter(final_output)
            # print(output)

        else:
            print("Error:", result.error_message)

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
    tasks = [web_crawler(url) for url in urls]
    return await asyncio.gather(*tasks)

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
    # Logic to scrape the URLs present in the state['urls'] as list it returns a list of dictionary where the dictionary has two keys 'title' and 'content'
    data = get_urls_content(state['urls'])
    # data = ""
    with open("dummy_scraped_data.txt", 'w') as file:
        for item in data:
            title = item.get('title', 'No Title')  
            content = item.get('content', 'No Content')  
            
            file.write(f"Title: {title}\n")
            file.write(f"Content: {content}\n")
            file.write("\n" + "="*50 + "\n")
    
    return {'scraped_data' : data}


def generate_results(state: State):

    # """
    # Emerging Technologies & Digital Innovation: Analyze trends like AI, IoT, blockchain, big data, and other cutting-edge advancements, explaining their potential impact on market dynamics.
    #     R&D and Investment Trends: Evaluate how research initiatives, technological investments, and innovation ecosystems drive industry transformation.
    #     Cybersecurity & Data Privacy: Assess the challenges and regulatory measures related to cybersecurity, data breaches, and digital trust.
    #     Technological Infrastructure & Digital Transformation: Consider the evolution of digital infrastructure, automation, and how digital transformation strategies are influencing business operations.
    #     Regulatory & Compliance Factors: Highlight any technological regulations or standards that might affect innovation and market competition.
    # """
    
    prompt = """
        You are a PESTEL analysis technological agent. Based on the given user query and the context from various reputable sources, your task is to generate a comprehensive Technological Report that provides clear, fact-based insights into how technology is shaping the industry. 
        Do not fabricate information—if you encounter gaps in the data, note them clearly and answer strictly based on the provided query and context.
        
        Here is the user query:
        {user_query}
        
        Here is the context:
        {context}
        
        Feel free to structure your analysis in a clear, logical manner that is both insightful and forward-thinking. Your creativity and depth of analysis are key—make sure the report is actionable and fully aligned with the latest technological developments and challenges.
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

def main():
    graph = build_graph()

    graph.invoke({
        'messages': ["I need a comprehensive PESTEL analysis report on the European electric vehicle industry. Please evaluate the political factors such as government incentives and policies on clean energy, and the economic trends including market growth and consumer spending. Also, assess social shifts towards sustainability, technological advancements in battery and autonomous driving, environmental challenges, and the evolving legal frameworks. Provide detailed insights and future forecasts to help shape strategic decisions for market entry over the next five years"],
        'urls' : [],
        'scraped_data' : []
    })

if __name__ == "__main__":
    main()
    





