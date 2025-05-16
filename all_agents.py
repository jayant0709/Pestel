import os
import json
import concurrent.futures
from typing import Annotated, Dict, Any, List
from typing_extensions import TypedDict

# Import from tavily_functions.py
from tavily_functions import (
    query_llm, tavily_search, summarize_extracted_content, 
    report_llm, final_report_llm, make_serializable
)

from prompts import report_schema, final_report_schema

# Import OpenAI for final report generation
from langchain_openai import ChatOpenAI

# LangGraph imports
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

# Flask imports
from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

report_llm = report_llm.with_structured_output(report_schema)
final_report_llm = final_report_llm.with_structured_output(final_report_schema)

# Define a merge function for reports
def merge_reports(existing_reports: Dict[str, Any], new_reports: Dict[str, Any]) -> Dict[str, Any]:
    """Merge two report dictionaries together."""
    if not existing_reports:
        return new_reports
    if not new_reports:
        return existing_reports
    
    # Combine both dictionaries
    merged = existing_reports.copy()
    merged.update(new_reports)
    return merged

# Define a merge function for completed reports
def merge_completed_reports(existing: List[str], new: List[str]) -> List[str]:
    """Merge completed reports lists, removing duplicates."""
    return list(set(existing + new))

# Define the enhanced state for langraph with isolated message queues for each dimension
class State(TypedDict):
    # Main message queue for the entry point and final result
    messages: Annotated[list, add_messages]
    
    # Separate message queues for each PESTEL dimension
    political_messages: Annotated[list, add_messages]
    economic_messages: Annotated[list, add_messages]
    social_messages: Annotated[list, add_messages]
    technological_messages: Annotated[list, add_messages]
    environmental_messages: Annotated[list, add_messages]
    legal_messages: Annotated[list, add_messages]
    
    # Data from web scraping for each dimension
    political_data: Annotated[List[Dict[str, Any]], "Political web search results"]
    economic_data: Annotated[List[Dict[str, Any]], "Economic web search results"]
    social_data: Annotated[List[Dict[str, Any]], "Social web search results"]
    technological_data: Annotated[List[Dict[str, Any]], "Technological web search results"]
    environmental_data: Annotated[List[Dict[str, Any]], "Environmental web search results"]
    legal_data: Annotated[List[Dict[str, Any]], "Legal web search results"]
    
    # Dictionary to store all reports with merge annotation
    reports: Annotated[Dict[str, Any], merge_reports]
    
    # Track completed reports with merge annotation
    completed_reports: Annotated[List[str], merge_completed_reports]
    

######################## POLITICAL AGENT FUNCTIONS ########################

def political_format_query(state: State):
    """Generate search queries for political analysis"""
    # Parse user form to extract the specific political factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    # Check if political analysis is required
    political_factors = user_form.get("political_factors", {})
    selected_factors = [factor for factor, is_selected in political_factors.items() if is_selected == "true"]
    
    if not selected_factors:
        print("No political factors selected by user, skipping political analysis")
        # Skip the political flow and mark it as completed
        current_completed = state.get('completed_reports', [])
        current_completed.append('political_report')
        
        return {
            'political_data': [],
            'completed_reports': current_completed,
            'reports': state.get('reports', {})
        }
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a search query writer specializing in POLITICAL factors for PESTEL analysis.
    
    Write up to 5 search queries that will help retrieve articles focusing ONLY on the following POLITICAL factors 
    that the user has specifically selected as important:
    {selected_factors_text}
    
    Each query must be tagged as either "general" (for broad context) or "news" (for recent developments).
    
    User form: {user_form_str}
    
    Additional notes from user:
    {additional_notes}
    
    Include both the industry and geographical focus in each query for relevance.
    Do not include any years in your queries.
    Focus ONLY on the political factors the user has selected as important.
    """
    
    search_queries = query_llm.invoke(prompt)
    
    print("Political search queries generated!")
    return {'political_messages': [json.dumps(search_queries)]}

def political_search(state: State):
    """Perform web search for political factors"""
    queries = json.loads(state['political_messages'][-1].content)
    # results = tavily_search(queries)
    with open("final_state.json",'r') as f :
        file_content = json.loads(f.read())
        results = file_content['political_data']
    # results = ["Result 1", "Result 2", "Result 3"]
    print("Political web scraping completed!")
    return {'political_data': results}

def political_summarize(state: State):
    """Summarize political search results"""
    results = state['political_data']
    # summarized_data = summarize_extracted_content(results)
    summarized_data = results
    # summarized_data = "Summarized Data"
    print("Political results summarized!")
    return {'political_data': summarized_data}

def political_report(state: State):
    """Generate political analysis report"""
    # Parse user form to extract the specific political factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    political_factors = user_form.get("political_factors", {})
    selected_factors = [factor for factor, is_selected in political_factors.items() if is_selected == "true"]
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a POLITICAL analyst specializing in PESTEL framework analysis. Generate a comprehensive 
    Political Report (minimum 1,500 words) based on the user's industry and provided context.
    
    Focus SPECIFICALLY ONLY on the following POLITICAL factors selected by the user:
    {selected_factors_text}
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT:
    1. Executive Summary of Political Landscape
    2. Key Political Factors Analysis (focusing ONLY on the factors selected by the user)
    3. Political Risks and Opportunities
    4. Regional/International Political Dynamics
    5. Political Scenario Analysis (3-5 potential outcomes)
    6. Political Action Recommendations
    
    User Query: {user_form}
    Context: {state['political_data']}
    
    Provide actionable political intelligence with detailed examples from the provided context.
    Only analyze the political factors that the user has specifically selected as important.
    """
    
    political_report = report_llm.invoke(prompt)
    # print(political_report)
    # political_report = "Political Report"
    print("Political Report Generated")
    
    current_reports = state.get('reports', {})
    political_report = json.dumps(make_serializable(political_report))
    current_reports['political_report'] = political_report
    # current_reports['political_report'] = political_report
    
    # Mark this report as completed for synchronization
    current_completed = state.get('completed_reports', [])
    current_completed.append('political_report')
    
    return {
        'reports': current_reports,
        'completed_reports': current_completed
    }


######################## ECONOMIC AGENT FUNCTIONS ########################

def economic_format_query(state: State):
    """Generate search queries for economic analysis"""
    # Parse user form to extract the specific economic factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    # Check if economic analysis is required
    economic_factors = user_form.get("economic_factors", {})
    selected_factors = [factor for factor, is_selected in economic_factors.items() if is_selected == "true"]
    
    if not selected_factors:
        print("No economic factors selected by user, skipping economic analysis")
        # Skip the economic flow and mark it as completed
        current_completed = state.get('completed_reports', [])
        current_completed.append('economic_report')
        
        return {
            'economic_data': [],
            'completed_reports': current_completed,
            'reports': state.get('reports', {})
        }
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a search query writer specializing in ECONOMIC factors for PESTEL analysis.
    
    Write up to 5 search queries that will help retrieve articles focusing ONLY on the following ECONOMIC factors 
    that the user has specifically selected as important:
    {selected_factors_text}
    
    Each query must be tagged as either "general" (for broad context) or "news" (for recent developments).
    
    User form: {user_form_str}
    
    Additional notes from user:
    {additional_notes}
    
    Include both the industry and geographical focus in each query for relevance.
    Do not include any years in your queries.
    Focus ONLY on the economic factors the user has selected as important.
    """
    
    search_queries = query_llm.invoke(prompt)
    
    print("Economic search queries generated!")
    return {'economic_messages': [json.dumps(search_queries)]}

def economic_search(state: State):
    """Perform web search for economic factors"""
    queries = json.loads(state['economic_messages'][-1].content)
    # results = tavily_search(queries)
    with open("final_state.json",'r') as f :
        file_content = json.loads(f.read())
        results = file_content['economic_data']
    # results = ["Result 1", "Result 2", "Result 3"]
    print("Economic web scraping completed!")
    return {'economic_data': results}

def economic_summarize(state: State):
    """Summarize economic search results"""
    results = state['economic_data']
    # summarized_data = summarize_extracted_content(results)
    summarized_data = results
    # summarized_data = "Summarized Data"
    print("Economic results summarized!")
    return {'economic_data': summarized_data}

def economic_report(state: State):
    """Generate economic analysis report"""
    # Parse user form to extract the specific economic factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    economic_factors = user_form.get("economic_factors", {})
    selected_factors = [factor for factor, is_selected in economic_factors.items() if is_selected == "true"]
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are an ECONOMIC analyst specializing in PESTEL framework analysis. Generate a comprehensive 
    Economic Report (minimum 1,500 words) based on the user's industry and provided context.
    
    Focus SPECIFICALLY ONLY on the following ECONOMIC factors selected by the user:
    {selected_factors_text}
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT:
    1. Executive Summary of Economic Landscape
    2. Key Economic Indicators Analysis (focusing ONLY on the factors selected by the user)
    3. Economic Risks and Opportunities
    4. Market Dynamics and Economic Trends
    5. Economic Scenario Analysis (3-5 potential outcomes)
    6. Economic Action Recommendations
    
    User Query: {user_form}
    Context: {state['economic_data']}
    
    Provide actionable economic intelligence with detailed examples from the provided context.
    Only analyze the economic factors that the user has specifically selected as important.
    """
    
    economic_report = report_llm.invoke(prompt)
    # print(economic_report)
    # economic_report = "Economic Report"
    print("Economic Report Generated")
    
    current_reports = state.get('reports', {})
    current_reports['economic_report'] = json.dumps(make_serializable(economic_report))
    # current_reports['economic_report'] = economic_report
    
    # Mark this report as completed for synchronization
    current_completed = state.get('completed_reports', [])
    current_completed.append('economic_report')
    
    return {
        'reports': current_reports,
        'completed_reports': current_completed
    }


######################## SOCIAL AGENT FUNCTIONS ########################

def social_format_query(state: State):
    """Generate search queries for social analysis"""
    # Parse user form to extract the specific social factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    # Check if social analysis is required
    social_factors = user_form.get("social_factors", {})
    selected_factors = [factor for factor, is_selected in social_factors.items() if is_selected == "true"]
    
    if not selected_factors:
        print("No social factors selected by user, skipping social analysis")
        # Skip the social flow and mark it as completed
        current_completed = state.get('completed_reports', [])
        current_completed.append('social_report')
        
        return {
            'social_data': [],
            'completed_reports': current_completed,
            'reports': state.get('reports', {})
        }
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a search query writer specializing in SOCIAL factors for PESTEL analysis.
    
    Write up to 5 search queries that will help retrieve articles focusing ONLY on the following SOCIAL factors 
    that the user has specifically selected as important:
    {selected_factors_text}
    
    Each query must be tagged as either "general" (for broad context) or "news" (for recent developments).
    
    User form: {user_form_str}
    
    Additional notes from user:
    {additional_notes}
    
    Include both the industry and geographical focus in each query for relevance.
    Do not include any years in your queries.
    Focus ONLY on the social factors the user has selected as important.
    """
    
    search_queries = query_llm.invoke(prompt)
    
    print("Social search queries generated!")
    return {'social_messages': [json.dumps(search_queries)]}

def social_search(state: State):
    """Perform web search for social factors"""
    queries = json.loads(state['social_messages'][-1].content)
    # results = tavily_search(queries)
    with open("final_state.json",'r') as f :
        file_content = json.loads(f.read())
        results = file_content['social_data']
    # results = ["Result 1", "Result 2", "Result 3"]
    print("Social web scraping completed!")
    return {'social_data': results}

def social_summarize(state: State):
    """Summarize social search results"""
    results = state['social_data']
    # summarized_data = summarize_extracted_content(results)
    summarized_data = results
    # summarized_data = "Summarized Data"
    print("Social results summarized!")
    return {'social_data': summarized_data}

def social_report(state: State):
    """Generate social analysis report"""
    # Parse user form to extract the specific social factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    social_factors = user_form.get("social_factors", {})
    selected_factors = [factor for factor, is_selected in social_factors.items() if is_selected == "true"]
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a SOCIAL analyst specializing in PESTEL framework analysis. Generate a comprehensive 
    Social Report (minimum 1,500 words) based on the user's industry and provided context.
    
    Focus SPECIFICALLY ONLY on the following SOCIAL factors selected by the user:
    {selected_factors_text}
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT:
    1. Executive Summary of Social Landscape
    2. Key Social Indicators Analysis (focusing ONLY on the factors selected by the user)
    3. Social Risks and Opportunities
    4. Consumer Behavior and Social Trends
    5. Social Scenario Analysis (3-5 potential outcomes)
    6. Social Strategy Recommendations
    
    User Query: {user_form}
    Context: {state['social_data']}
    
    Provide actionable social intelligence with detailed examples from the provided context.
    Only analyze the social factors that the user has specifically selected as important.
    """
    
    social_report = report_llm.invoke(prompt)
    # print(social_report)
    # social_report = "Social Report"
    print("Social Report Generated")
    
    current_reports = state.get('reports', {})
    current_reports['social_report'] = json.dumps(make_serializable(social_report))
    # current_reports['social_report'] = social_report
    
    # Mark this report as completed for synchronization
    current_completed = state.get('completed_reports', [])
    current_completed.append('social_report')
    
    return {
        'reports': current_reports,
        'completed_reports': current_completed
    }

######################## TECHNOLOGICAL AGENT FUNCTIONS ########################

def technological_format_query(state: State):
    """Generate search queries for technological analysis"""
    # Parse user form to extract the specific technological factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    # Check if technological analysis is required
    technological_factors = user_form.get("technological_factors", {})
    selected_factors = [factor for factor, is_selected in technological_factors.items() if is_selected == "true"]
    
    if not selected_factors:
        print("No technological factors selected by user, skipping technological analysis")
        # Skip the technological flow and mark it as completed
        current_completed = state.get('completed_reports', [])
        current_completed.append('technological_report')
        
        return {
            'technological_data': [],
            'completed_reports': current_completed,
            'reports': state.get('reports', {})
        }
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a search query writer specializing in TECHNOLOGICAL factors for PESTEL analysis.
    
    Write up to 5 search queries that will help retrieve articles focusing ONLY on the following TECHNOLOGICAL factors 
    that the user has specifically selected as important:
    {selected_factors_text}
    
    Each query must be tagged as either "general" (for broad context) or "news" (for recent developments).
    
    User form: {user_form_str}
    
    Additional notes from user:
    {additional_notes}
    
    Include both the industry and geographical focus in each query for relevance.
    Do not include any years in your queries.
    Focus ONLY on the technological factors the user has selected as important.
    """
    
    search_queries = query_llm.invoke(prompt)
    
    print("Technological search queries generated!")
    return {'technological_messages': [json.dumps(search_queries)]}

def technological_search(state: State):
    """Perform web search for technological factors"""
    queries = json.loads(state['technological_messages'][-1].content)
    # results = tavily_search(queries)
    with open("final_state.json",'r') as f :
        file_content = json.loads(f.read())
        results = file_content['technological_data']
    # results = ["Result 1", "Result 2", "Result 3"]
    print("Technological web scraping completed!")
    return {'technological_data': results}

def technological_summarize(state: State):
    """Summarize technological search results"""
    results = state['technological_data']
    # summarized_data = summarize_extracted_content(results)
    summarized_data = results
    # summarized_data = "Summarized Data"
    print("Technological results summarized!")
    return {'technological_data': summarized_data}

def technological_report(state: State):
    """Generate technological analysis report"""
    # Parse user form to extract the specific technological factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    technological_factors = user_form.get("technological_factors", {})
    selected_factors = [factor for factor, is_selected in technological_factors.items() if is_selected == "true"]
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a TECHNOLOGICAL analyst specializing in PESTEL framework analysis. Generate a comprehensive 
    Technological Report (minimum 1,500 words) based on the user's industry and provided context.
    
    Focus SPECIFICALLY ONLY on the following TECHNOLOGICAL factors selected by the user:
    {selected_factors_text}
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT:
    1. Executive Summary of Technological Landscape
    2. Key Technological Developments Analysis (focusing ONLY on the factors selected by the user)
    3. Technological Risks and Opportunities
    4. Innovation Trends and Technological Disruption
    5. Technological Scenario Analysis (3-5 potential outcomes)
    6. Technological Strategy Recommendations
    
    User Query: {user_form}
    Context: {state['technological_data']}
    
    Provide actionable technological intelligence with detailed examples from the provided context.
    Only analyze the technological factors that the user has specifically selected as important.
    """
    
    technological_report = report_llm.invoke(prompt)
    # print(technological_report)
    # technological_report = "Technological Report"
    print("Technological Report Generated")
    
    current_reports = state.get('reports', {})
    current_reports['technological_report'] = json.dumps(make_serializable(technological_report))
    # current_reports['technological_report'] = technological_report
    
    # Mark this report as completed for synchronization
    current_completed = state.get('completed_reports', [])
    current_completed.append('technological_report')
    
    return {
        'reports': current_reports,
        'completed_reports': current_completed
    }

######################## ENVIRONMENTAL AGENT FUNCTIONS ########################

def environmental_format_query(state: State):
    """Generate search queries for environmental analysis"""
    # Parse user form to extract the specific environmental factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    # Check if environmental analysis is required
    environmental_factors = user_form.get("environmental_factors", {})
    selected_factors = [factor for factor, is_selected in environmental_factors.items() if is_selected == "true"]
    
    if not selected_factors:
        print("No environmental factors selected by user, skipping environmental analysis")
        # Skip the environmental flow and mark it as completed
        current_completed = state.get('completed_reports', [])
        current_completed.append('environmental_report')
        
        return {
            'environmental_data': [],
            'completed_reports': current_completed,
            'reports': state.get('reports', {})
        }
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a search query writer specializing in ENVIRONMENTAL factors for PESTEL analysis.
    
    Write up to 5 search queries that will help retrieve articles focusing ONLY on the following ENVIRONMENTAL factors 
    that the user has specifically selected as important:
    {selected_factors_text}
    
    Each query must be tagged as either "general" (for broad context) or "news" (for recent developments).
    
    User form: {user_form_str}
    
    Additional notes from user:
    {additional_notes}
    
    Include both the industry and geographical focus in each query for relevance.
    Do not include any years in your queries.
    Focus ONLY on the environmental factors the user has selected as important.
    """
    
    search_queries = query_llm.invoke(prompt)
    
    print("Environmental search queries generated!")
    return {'environmental_messages': [json.dumps(search_queries)]}


def environmental_search(state: State):
    """Perform web search for environmental factors"""
    queries = json.loads(state['environmental_messages'][-1].content)
    # results = tavily_search(queries)
    with open("final_state.json",'r') as f :
        file_content = json.loads(f.read())
        results = file_content['environmental_data']
    # results = ["Result 1", "Result 2", "Result 3"]
    print("Environmental web scraping completed!")
    return {'environmental_data': results}

def environmental_summarize(state: State):
    """Summarize environmental search results"""
    results = state['environmental_data']
    # summarized_data = summarize_extracted_content(results)
    summarized_data = results
    # summarized_data = "Summarized Data"
    print("Environmental results summarized!")
    return {'environmental_data': summarized_data}

def environmental_report(state: State):
    """Generate environmental analysis report"""
    # Parse user form to extract the specific environmental factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    environmental_factors = user_form.get("environmental_factors", {})
    selected_factors = [factor for factor, is_selected in environmental_factors.items() if is_selected == "true"]
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are an ENVIRONMENTAL analyst specializing in PESTEL framework analysis. Generate a comprehensive 
    Environmental Report (minimum 1,500 words) based on the user's industry and provided context.
    
    Focus SPECIFICALLY ONLY on the following ENVIRONMENTAL factors selected by the user:
    {selected_factors_text}
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT:
    1. Executive Summary of Environmental Landscape
    2. Key Environmental Regulations Analysis (focusing ONLY on the factors selected by the user)
    3. Environmental Risks and Opportunities
    4. Sustainability Trends and Green Initiatives
    5. Environmental Scenario Analysis (3-5 potential outcomes)
    6. Environmental Strategy Recommendations
    
    User Query: {user_form}
    Context: {state['environmental_data']}
    
    Provide actionable environmental intelligence with detailed examples from the provided context.
    Only analyze the environmental factors that the user has specifically selected as important.
    """
    
    environmental_report = report_llm.invoke(prompt)
    # print(environmental_report)
    # environmental_report = "Environmental Report"
    print("Environmental Report Generated")
    
    current_reports = state.get('reports', {})
    current_reports['environmental_report'] = json.dumps(make_serializable(environmental_report))
    # current_reports['environmental_report'] = environmental_report
    
    # Mark this report as completed for synchronization
    current_completed = state.get('completed_reports', [])
    current_completed.append('environmental_report')
    
    return {
        'reports': current_reports,
        'completed_reports': current_completed
    }


######################## LEGAL AGENT FUNCTIONS ########################

def legal_format_query(state: State):
    """Generate search queries for legal analysis"""
    # Parse user form to extract the specific legal factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    # Check if legal analysis is required
    legal_factors = user_form.get("legal_factors", {})
    selected_factors = [factor for factor, is_selected in legal_factors.items() if is_selected == "true"]
    
    if not selected_factors:
        print("No legal factors selected by user, skipping legal analysis")
        # Skip the legal flow and mark it as completed
        current_completed = state.get('completed_reports', [])
        current_completed.append('legal_report')
        
        return {
            'legal_data': [],
            'completed_reports': current_completed,
            'reports': state.get('reports', {})
        }
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a search query writer specializing in LEGAL factors for PESTEL analysis.
    
    Write up to 5 search queries that will help retrieve articles focusing ONLY on the following LEGAL factors 
    that the user has specifically selected as important:
    {selected_factors_text}
    
    Each query must be tagged as either "general" (for broad context) or "news" (for recent developments).
    
    User form: {user_form_str}
    
    Additional notes from user:
    {additional_notes}
    
    Include both the industry and geographical focus in each query for relevance.
    Do not include any years in your queries.
    Focus ONLY on the legal factors the user has selected as important.
    """
    
    search_queries = query_llm.invoke(prompt)
    
    print("Legal search queries generated!")
    return {'legal_messages': [json.dumps(search_queries)]}

def legal_search(state: State):
    """Perform web search for legal factors"""
    queries = json.loads(state['legal_messages'][-1].content)
    # results = tavily_search(queries)
    with open("final_state.json",'r') as f :
        file_content = json.loads(f.read())
        results = file_content['legal_data']
    # results = ["Result 1", "Result 2", "Result 3"]
    print("Legal web scraping completed!")
    return {'legal_data': results}

def legal_summarize(state: State):
    """Summarize legal search results"""
    results = state['legal_data']
    # summarized_data = summarize_extracted_content(results)
    summarized_data = results
    # summarized_data = "Summarized Data"
    print("Legal results summarized!")
    return {'legal_data': summarized_data}

def legal_report(state: State):
    """Generate legal analysis report"""
    # Parse user form to extract the specific legal factors selected by the user
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    
    legal_factors = user_form.get("legal_factors", {})
    selected_factors = [factor for factor, is_selected in legal_factors.items() if is_selected == "true"]
    
    # Format the selected factors for the prompt
    selected_factors_text = "\n".join([f"- {factor.replace('_', ' ').title()}" for factor in selected_factors])
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a LEGAL analyst specializing in PESTEL framework analysis. Generate a comprehensive 
    Legal Report (minimum 1,500 words) based on the user's industry and provided context.
    
    Focus SPECIFICALLY ONLY on the following LEGAL factors selected by the user:
    {selected_factors_text}
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT:
    1. Executive Summary of Legal Landscape
    2. Key Legal Frameworks Analysis (focusing ONLY on the factors selected by the user)
    3. Legal Risks and Compliance Opportunities
    4. Regulatory Trends and Legal Developments
    5. Legal Scenario Analysis (3-5 potential outcomes)
    6. Legal Strategy Recommendations
    
    User Query: {user_form}
    Context: {state['legal_data']}
    
    Provide actionable legal intelligence with detailed examples from the provided context.
    Only analyze the legal factors that the user has specifically selected as important.
    """
    
    legal_report = report_llm.invoke(prompt)
    # print(legal_report)
    # legal_report = "Legal Report"
    print("Legal Report Generated")
    
    current_reports = state.get('reports', {})
    current_reports['legal_report'] = json.dumps(make_serializable(legal_report))
    # current_reports['legal_report'] = legal_report
    
    # Mark this report as completed for synchronization
    current_completed = state.get('completed_reports', [])
    current_completed.append('legal_report')
    
    return {
        'reports': current_reports,
        'completed_reports': current_completed
    }

######################## FINAL REPORT GENERATION ########################

def generate_final_report(state: State):
    """Generate the final comprehensive PESTEL report"""
    user_form_str = state['messages'][0].content
    user_form = json.loads(user_form_str) if isinstance(user_form_str, str) else user_form_str
    additional_notes = user_form.get("additional_notes", "No additional notes provided.")
    
    prompt = f"""
    You are a strategic business consultant specializing in comprehensive PESTEL analysis. 
    Your task is to synthesize the individual PESTEL reports into one cohesive, 
    strategic final report (minimum 3,000 words).
    
    You have been provided with specialized reports covering each dimension of PESTEL.
    
    IMPORTANT: Focus only on the dimensions for which reports are available. Some dimensions 
    might not have reports if the user did not select any factors for those dimensions.
    
    Additional notes from user:
    {additional_notes}
    
    FORMAT YOUR ANALYSIS AS FOLLOWS:
    
    # COMPREHENSIVE PESTEL ANALYSIS
    
    ## Executive Summary
    [Provide a concise overview of all key findings across all dimensions]
    
    ## Introduction
    [Brief context about the industry and geographical focus]
    
    ## PESTEL Analysis
    
    ### Political Factors
    [Synthesize key points from the political report - include ONLY if political report is available]
    
    ### Economic Factors
    [Synthesize key points from the economic report - include ONLY if economic report is available]
    
    ### Social Factors
    [Synthesize key points from the social report - include ONLY if social report is available]
    
    ### Technological Factors
    [Synthesize key points from the technological report - include ONLY if technological report is available]
    
    ### Environmental Factors
    [Synthesize key points from the environmental report - include ONLY if environmental report is available]
    
    ### Legal Factors
    [Synthesize key points from the legal report - include ONLY if legal report is available]
    
    ## Strategic Implications
    [Analyze how these factors interact and their collective impact]
    
    ## Opportunities & Threats Matrix
    [Present a structured matrix of opportunities and threats across all dimensions]
    
    ## Strategic Recommendations
    [Provide 10-15 specific, actionable recommendations based on the complete analysis]
    
    ## Conclusion
    [Final observations on the overall business environment]
    
    INDIVIDUAL REPORTS:
    - Political Report: {state['reports'].get('political_report', 'Not available - User did not select any political factors for analysis')}
    - Economic Report: {state['reports'].get('economic_report', 'Not available - User did not select any economic factors for analysis')}
    - Social Report: {state['reports'].get('social_report', 'Not available - User did not select any social factors for analysis')}
    - Technological Report: {state['reports'].get('technological_report', 'Not available - User did not select any technological factors for analysis')}
    - Environmental Report: {state['reports'].get('environmental_report', 'Not available - User did not select any environmental factors for analysis')}
    - Legal Report: {state['reports'].get('legal_report', 'Not available - User did not select any legal factors for analysis')}
    
    Create a seamless, non-repetitive report that efficiently synthesizes insights 
    from all dimensions while maintaining coherence and strategic focus.
    Only include sections for dimensions where the user selected factors for analysis.
    """
    
    final_report = final_report_llm.invoke(prompt)
    # final_report = "Final Report"
    print("Final Comprehensive PESTEL Report Generated")
    final_report = json.dumps(make_serializable(final_report))
    # Return a dictionary with the final report
    return {
        'reports': {'final_report': final_report},
        'messages': [final_report]
    }

######################## GRAPH CONSTRUCTION ########################

def build_pestel_graph():
    """Build the complete PESTEL analysis workflow graph"""
    graph_builder = StateGraph(State)
    
    # Add nodes for each PESTEL dimension
    # Political dimension
    graph_builder.add_node("political_format_query", political_format_query)
    graph_builder.add_node("political_search", political_search)
    graph_builder.add_node("political_summarize", political_summarize)
    graph_builder.add_node("political_report", political_report)

    # Economic dimension
    graph_builder.add_node("economic_format_query", economic_format_query)
    graph_builder.add_node("economic_search", economic_search)
    graph_builder.add_node("economic_summarize", economic_summarize)
    graph_builder.add_node("economic_report", economic_report)

    # Social dimension
    graph_builder.add_node("social_format_query", social_format_query)
    graph_builder.add_node("social_search", social_search)
    graph_builder.add_node("social_summarize", social_summarize)
    graph_builder.add_node("social_report", social_report)

    # Technological dimension
    graph_builder.add_node("technological_format_query", technological_format_query)
    graph_builder.add_node("technological_search", technological_search)
    graph_builder.add_node("technological_summarize", technological_summarize)
    graph_builder.add_node("technological_report", technological_report)

    # Environmental dimension
    graph_builder.add_node("environmental_format_query", environmental_format_query)
    graph_builder.add_node("environmental_search", environmental_search)
    graph_builder.add_node("environmental_summarize", environmental_summarize)
    graph_builder.add_node("environmental_report", environmental_report)

    # Legal dimension
    graph_builder.add_node("legal_format_query", legal_format_query)
    graph_builder.add_node("legal_search", legal_search)
    graph_builder.add_node("legal_summarize", legal_summarize)
    graph_builder.add_node("legal_report", legal_report)

    # Final report generation
    graph_builder.add_node("generate_final_report", generate_final_report)

    # Add edges from START to each dimension's query formatter
    graph_builder.add_edge(START, "political_format_query")
    graph_builder.add_edge(START, "economic_format_query")
    graph_builder.add_edge(START, "social_format_query")
    graph_builder.add_edge(START, "technological_format_query")
    graph_builder.add_edge(START, "environmental_format_query")
    graph_builder.add_edge(START, "legal_format_query")

    # Add edges for political flow with isolated message queue
    graph_builder.add_edge("political_format_query", "political_search")
    graph_builder.add_edge("political_search", "political_summarize")
    graph_builder.add_edge("political_summarize", "political_report")

    # Add edges for economic flow with isolated message queue
    graph_builder.add_edge("economic_format_query", "economic_search")
    graph_builder.add_edge("economic_search", "economic_summarize")
    graph_builder.add_edge("economic_summarize", "economic_report")

    # Add edges for social flow with isolated message queue
    graph_builder.add_edge("social_format_query", "social_search")
    graph_builder.add_edge("social_search", "social_summarize")
    graph_builder.add_edge("social_summarize", "social_report")

    # Add edges for technological flow with isolated message queue
    graph_builder.add_edge("technological_format_query", "technological_search")
    graph_builder.add_edge("technological_search", "technological_summarize")
    graph_builder.add_edge("technological_summarize", "technological_report")

    # Add edges for environmental flow with isolated message queue
    graph_builder.add_edge("environmental_format_query", "environmental_search")
    graph_builder.add_edge("environmental_search", "environmental_summarize")
    graph_builder.add_edge("environmental_summarize", "environmental_report")

    # Add edges for legal flow with isolated message queue
    graph_builder.add_edge("legal_format_query", "legal_search")
    graph_builder.add_edge("legal_search", "legal_summarize")
    graph_builder.add_edge("legal_summarize", "legal_report")

    # Add synchronization pattern using report completion checks
    graph_builder.add_edge("political_report", "generate_final_report")
    graph_builder.add_edge("economic_report", "generate_final_report")
    graph_builder.add_edge("social_report", "generate_final_report")
    graph_builder.add_edge("technological_report", "generate_final_report")
    graph_builder.add_edge("environmental_report", "generate_final_report")
    graph_builder.add_edge("legal_report", "generate_final_report")

    # Add edge from final report to END
    graph_builder.add_edge("generate_final_report", END)

    graph = graph_builder.compile()
    
    return graph

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
        print("Received form data:", form_data)
        
        if not form_data:
            return jsonify({
                'success': False,
                'error': "No form data received"
            }), 400
        
        # Convert boolean values to strings for processing
        processed_form_data = form_data.copy()
        
        # Process political factors
        if "political_factors" in processed_form_data:
            for key in processed_form_data["political_factors"]:
                if key != "notes" and isinstance(processed_form_data["political_factors"][key], bool):
                    processed_form_data["political_factors"][key] = str(processed_form_data["political_factors"][key]).lower()
        
        # Process other PESTEL factors if they exist
        factor_categories = ["economic_factors", "social_factors", "technological_factors", 
                           "environmental_factors", "legal_factors"]
        
        for category in factor_categories:
            if category in processed_form_data:
                for key in processed_form_data[category]:
                    if key != "notes" and isinstance(processed_form_data[category][key], bool):
                        processed_form_data[category][key] = str(processed_form_data[category][key]).lower()
        
        # Additional notes from political factors
        if "political_factors" in processed_form_data and "notes" in processed_form_data["political_factors"]:
            processed_form_data["additional_notes"] = processed_form_data["political_factors"]["notes"]
        
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
        result = pestel_graph.invoke(initial_state)
        
        # Prepare serializable result
        serializable_result = make_serializable(result)
        
        # Save the results to output.json for debugging/record keeping
        output_filename = f"test/output_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(serializable_result, f, indent=4)
        
        print(f"PESTEL analysis complete! Results saved to {output_filename}")
        
        # Return the final report data to the client
        response_data = {
            'success': True,
            'report': serializable_result.get('reports', {}).get('final_report', ''),
            'individual_reports': serializable_result.get('reports', {}),
            'timestamp': datetime.datetime.now().isoformat()
        }
        
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
    app.run(host='0.0.0.0', port=port, debug=False)
