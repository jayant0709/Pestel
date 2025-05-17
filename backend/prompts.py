report_schema = {
  "title": "PESTELReportSchema",
  "description": "Schema for generating structured PESTEL analysis reports",
  "type": "object",
  "properties": {
    "report_type": {
      "type": "string",
      "description": "The type of PESTEL analysis report",
      "enum": ["Political", "Economic", "Social", "Technological", "Environmental", "Legal"]
    },
    "executive_summary": {
      "type": "string",
      "description": "Concise overview of the entire analysis (250-350 words)"
    },
    "factors_analysis": {
      "type": "array",
      "description": "Detailed analysis of the specific factors selected by the user",
      "items": {
        "type": "object",
        "properties": {
          "factor_name": {
            "type": "string",
            "description": "Name of the specific factor being analyzed"
          },
          "analysis": {
            "type": "string",
            "description": "Comprehensive analysis of the factor with supporting evidence (300-500 words per factor)"
          },
          "key_indicators": {
            "type": "array",
            "description": "List of key indicators or metrics related to this factor",
            "items": {
              "type": "string"
            }
          }
        },
        "required": ["factor_name", "analysis", "key_indicators"]
      }
    },
    "risks_opportunities": {
      "type": "object",
      "description": "Analysis of major risks and opportunities",
      "properties": {
        "risks": {
          "type": "array",
          "description": "Major risks identified in the analysis",
          "items": {
            "type": "object",
            "properties": {
              "risk_title": {
                "type": "string",
                "description": "Title of the risk"
              },
              "description": {
                "type": "string",
                "description": "Detailed description of the risk"
              },
              "impact_level": {
                "type": "string",
                "description": "Assessed impact level",
                "enum": ["Low", "Medium", "High", "Critical"]
              }
            },
            "required": ["risk_title", "description", "impact_level"]
          }
        },
        "opportunities": {
          "type": "array",
          "description": "Major opportunities identified in the analysis",
          "items": {
            "type": "object",
            "properties": {
              "opportunity_title": {
                "type": "string",
                "description": "Title of the opportunity"
              },
              "description": {
                "type": "string",
                "description": "Detailed description of the opportunity"
              },
              "potential_benefit": {
                "type": "string",
                "description": "Assessed potential benefit",
                "enum": ["Low", "Medium", "High", "Transformative"]
              }
            },
            "required": ["opportunity_title", "description", "potential_benefit"]
          }
        }
      },
      "required": ["risks", "opportunities"]
    },
    "regional_dynamics": {
      "type": "array",
      "description": "Analysis of regional or international dynamics relevant to the domain",
      "items": {
        "type": "object",
        "properties": {
          "region": {
            "type": "string",
            "description": "Name of the region or international context"
          },
          "analysis": {
            "type": "string",
            "description": "Analysis of relevant dynamics in this region"
          }
        },
        "required": ["region", "analysis"]
      }
    },
    "scenario_analysis": {
      "type": "array",
      "description": "Analysis of 3-5 potential future scenarios",
      "items": {
        "type": "object",
        "properties": {
          "scenario_name": {
            "type": "string",
            "description": "Name of the scenario"
          },
          "drivers": {
            "type": "string",
            "description": "Key drivers that would lead to this scenario"
          },
          "outcome": {
            "type": "string",
            "description": "Detailed description of the scenario outcome"
          },
          "probability": {
            "type": "string",
            "description": "Assessed probability of this scenario",
            "enum": ["Low", "Medium", "High"]
          }
        },
        "required": ["scenario_name", "drivers", "outcome", "probability"]
      }
    },
    "recommendations": {
      "type": "array",
      "description": "Actionable recommendations based on the analysis",
      "items": {
        "type": "object",
        "properties": {
          "recommendation_title": {
            "type": "string",
            "description": "Title of the recommendation"
          },
          "description": {
            "type": "string",
            "description": "Detailed description of the recommendation"
          },
          "implementation_steps": {
            "type": "array",
            "description": "Specific steps to implement this recommendation",
            "items": {
              "type": "string"
            }
          },
          "priority": {
            "type": "string",
            "description": "Recommended priority level",
            "enum": ["Low", "Medium", "High", "Immediate"]
          }
        },
        "required": ["recommendation_title", "description", "implementation_steps", "priority"]
      }
    }
  },
  "required": ["report_type", "executive_summary", "factors_analysis", "risks_opportunities", "scenario_analysis", "recommendations"]
}

final_report_schema = {
  "title": "ComprehensivePESTELAnalysisSchema",
  "description": "Schema for generating a comprehensive synthesis report integrating all available PESTEL dimension analyses",
  "type": "object",
  "properties": {
    "executive_summary": {
      "type": "string",
      "description": "Concise overview of all key findings across all available dimensions (350-500 words)"
    },
    "introduction": {
      "type": "string",
      "description": "Brief context about the industry, geographical focus, and scope of the analysis (200-300 words)"
    },
    "pestel_analysis": {
      "type": "object",
      "description": "Detailed synthesis of findings from each available PESTEL dimension",
      "properties": {
        "political_factors": {
          "type": "string",
          "description": "Synthesis of key political insights from the political report (if available)"
        },
        "economic_factors": {
          "type": "string",
          "description": "Synthesis of key economic insights from the economic report (if available)"
        },
        "social_factors": {
          "type": "string",
          "description": "Synthesis of key social insights from the social report (if available)"
        },
        "technological_factors": {
          "type": "string",
          "description": "Synthesis of key technological insights from the technological report (if available)"
        },
        "environmental_factors": {
          "type": "string",
          "description": "Synthesis of key environmental insights from the environmental report (if available)"
        },
        "legal_factors": {
          "type": "string",
          "description": "Synthesis of key legal insights from the legal report (if available)"
        }
      }
    },
    "strategic_implications": {
      "type": "array",
      "description": "Analysis of cross-dimensional interactions and their collective impact on strategy",
      "items": {
        "type": "object",
        "properties": {
          "implication_title": {
            "type": "string",
            "description": "Title of the strategic implication"
          },
          "analysis": {
            "type": "string",
            "description": "Detailed explanation of how multiple PESTEL factors interact to create this strategic implication"
          },
          "affected_dimensions": {
            "type": "array",
            "description": "PESTEL dimensions that contribute to this strategic implication",
            "items": {
              "type": "string",
              "enum": ["Political", "Economic", "Social", "Technological", "Environmental", "Legal"]
            }
          }
        },
        "required": ["implication_title", "analysis", "affected_dimensions"]
      }
    },
    "opportunities_threats_matrix": {
      "type": "object",
      "description": "Structured matrix of opportunities and threats across all available dimensions",
      "properties": {
        "dimensions": {
          "type": "array",
          "description": "Array of dimension-specific opportunities and threats",
          "items": {
            "type": "object",
            "properties": {
              "dimension": {
                "type": "string",
                "description": "The PESTEL dimension",
                "enum": ["Political", "Economic", "Social", "Technological", "Environmental", "Legal"]
              },
              "opportunities": {
                "type": "array",
                "description": "Key opportunities identified in this dimension",
                "items": {
                  "type": "string"
                }
              },
              "threats": {
                "type": "array",
                "description": "Key threats identified in this dimension",
                "items": {
                  "type": "string"
                }
              }
            },
            "required": ["dimension", "opportunities", "threats"]
          }
        }
      },
      "required": ["dimensions"]
    },
    "strategic_recommendations": {
      "type": "array",
      "description": "10-15 specific, actionable recommendations based on the complete analysis",
      "items": {
        "type": "object",
        "properties": {
          "recommendation_number": {
            "type": "integer",
            "description": "Sequential number of the recommendation"
          },
          "recommendation": {
            "type": "string",
            "description": "Detailed description of the strategic recommendation"
          },
          "related_dimensions": {
            "type": "array",
            "description": "PESTEL dimensions that this recommendation addresses",
            "items": {
              "type": "string",
              "enum": ["Political", "Economic", "Social", "Technological", "Environmental", "Legal"]
            }
          },
          "implementation_priority": {
            "type": "string",
            "description": "Suggested implementation priority",
            "enum": ["Immediate", "Short-term", "Medium-term", "Long-term"]
          }
        },
        "required": ["recommendation_number", "recommendation", "related_dimensions", "implementation_priority"]
      }
    },
    "conclusion": {
      "type": "string",
      "description": "Final observations on the overall business environment and strategic outlook (200-300 words)"
    }
  },
  "required": ["executive_summary", "introduction", "pestel_analysis", "strategic_implications", "opportunities_threats_matrix", "strategic_recommendations", "conclusion"]
}