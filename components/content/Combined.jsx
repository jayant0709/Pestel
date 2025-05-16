import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import finalStateData from '../../final_state.json';

const Combined = () => {
  const [sections, setSections] = useState({
    executiveSummary: true,
    introduction: false,
    pestelAnalysis: false,
    political: false,
    economic: false,
    social: false,
    technological: false,
    environmental: false,
    legal: false,
    strategicImplications: false,
    opportunitiesThreats: false,
    recommendations: false,
    conclusion: false
  });

  // State for dynamically generated content
  const [analysisContent, setAnalysisContent] = useState({
    executiveSummary: null,
    introduction: null,
    political: [],
    economic: [],
    social: [],
    technological: [],
    environmental: [],
    legal: [],
    strategicImplications: [],
    opportunitiesByDimension: {},
    threatsByDimension: {},
    recommendations: [],
    conclusion: null
  });

  // Get data from JSON file
  const {
    political_data: politicalData = [],
    economic_data: economicData = [],
    social_data: socialData = [],
    technological_data: technologicalData = [],
    environmental_data: environmentalData = [],
    legal_data: legalData = []
  } = finalStateData || {};

  // Check if a category has data
  const hasData = (dataArray) => {
    return dataArray && dataArray.length > 0;
  };

  // Process the data from JSON on component mount
  useEffect(() => {
    // Check what data is available
    const hasPolitical = hasData(politicalData);
    const hasEconomic = hasData(economicData);
    const hasSocial = hasData(socialData);
    const hasTechnological = hasData(technologicalData);
    const hasEnvironmental = hasData(environmentalData);
    const hasLegal = hasData(legalData);
    
    // Only generate content if we have data
    const hasAnyPestelData = hasPolitical || hasEconomic || hasSocial || 
                            hasTechnological || hasEnvironmental || hasLegal;

    // Extract summary and introduction from data if available
    let executiveSummary = null;
    let introduction = null;
    let conclusion = null;

    // Try to extract executive summary from the first few entries
    const allData = [
      ...politicalData, 
      ...economicData, 
      ...socialData, 
      ...technologicalData, 
      ...environmentalData, 
      ...legalData
    ];

    if (hasAnyPestelData) {
      // Try to find content that looks like a summary
      const potentialSummaries = allData.filter(item => 
        item.content && (
          item.content.toLowerCase().includes('summary') ||
          item.content.toLowerCase().includes('overview') ||
          item.content.toLowerCase().includes('key findings')
        )
      );
      
      if (potentialSummaries.length > 0) {
        // Take the first paragraph of the first potential summary
        const summaryText = potentialSummaries[0].content.split('\n\n')[0];
        executiveSummary = summaryText;
      } else if (allData.length > 0) {
        // If no dedicated summary, use the first paragraph of the first item
        executiveSummary = allData[0].content.split('\n\n')[0];
      }

      // Try to find content that looks like an introduction
      const potentialIntros = allData.filter(item => 
        item.content && (
          item.content.toLowerCase().includes('introduction') ||
          item.content.toLowerCase().includes('background') ||
          item.content.toLowerCase().includes('context')
        )
      );
      
      if (potentialIntros.length > 0) {
        // Take the first few paragraphs
        introduction = potentialIntros[0].content.split('\n\n').slice(0, 2).join('\n\n');
      } else if (allData.length > 1) {
        // If no dedicated intro, use the first paragraph of the second item
        introduction = allData[1].content.split('\n\n')[0];
      }

      // Try to find content that looks like a conclusion
      const potentialConclusions = allData.filter(item => 
        item.content && (
          item.content.toLowerCase().includes('conclusion') ||
          item.content.toLowerCase().includes('future outlook') ||
          item.content.toLowerCase().includes('final') ||
          item.content.toLowerCase().includes('summary')
        )
      );
      
      if (potentialConclusions.length > 0) {
        conclusion = potentialConclusions[0].content.split('\n\n').slice(-2).join('\n\n');
      } else if (allData.length > 0) {
        // If no dedicated conclusion, use the last paragraph of the last item
        const lastItem = allData[allData.length - 1].content;
        const paragraphs = lastItem.split('\n\n');
        conclusion = paragraphs[paragraphs.length - 1];
      }
    }

    // Process and extract data for each section
    const processedContent = {
      executiveSummary,
      introduction,
      political: hasPolitical ? extractKeyPoints(politicalData) : [],
      economic: hasEconomic ? extractKeyPoints(economicData) : [],
      social: hasSocial ? extractKeyPoints(socialData) : [],
      technological: hasTechnological ? extractKeyPoints(technologicalData) : [],
      environmental: hasEnvironmental ? extractKeyPoints(environmentalData) : [],
      legal: hasLegal ? extractKeyPoints(legalData) : [],
      strategicImplications: hasAnyPestelData ? generateStrategicImplications(allData) : [],
      opportunitiesByDimension: hasAnyPestelData ? extractOpportunitiesThreats(allData).opportunities : {},
      threatsByDimension: hasAnyPestelData ? extractOpportunitiesThreats(allData).threats : {},
      recommendations: hasAnyPestelData ? generateRecommendations(allData) : [],
      conclusion
    };

    setAnalysisContent(processedContent);
  }, [politicalData, economicData, socialData, technologicalData, environmentalData, legalData]);

  // Helper function to preprocess text content - removes markdown-style formatting
  const preprocessText = (text) => {
    if (!text) return '';
    
    // Remove markdown-style bold markers (**)
    let processed = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // Remove special formatting characters if any
    processed = processed.replace(/\[|\]/g, '');
    
    // Clean up excessive whitespace
    processed = processed.replace(/\s+/g, ' ').trim();
    
    return processed;
  };

  // Function to render content with proper formatting
  const renderContent = (content) => {
    if (!content) return null;
    
    // Replace markdown-style formatting
    let processedContent = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle different sections more elegantly
    processedContent = processedContent.replace(
      /^(##+\s+(.+))$/gm, 
      '<h3 class="text-lg font-semibold text-indigo-700 mt-4 mb-2">$2</h3>'
    );
    
    // Convert bullet points
    processedContent = processedContent.replace(
      /^(\s*[-•*]\s+)(.+)$/gm,
      '<li class="ml-5">$2</li>'
    );
    
    // Format numbered lists
    processedContent = processedContent.replace(
      /^(\s*\d+\.\s+)(.+)$/gm,
      '<li class="ml-5">$2</li>'
    );
    
    // Split by paragraphs for better spacing
    const paragraphs = processedContent.split('\n\n');
    
    return paragraphs.map((paragraph, idx) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return null;
      
      // Check if paragraph contains list items
      if (paragraph.includes('<li')) {
        return (
          <ul key={idx} className="list-disc my-3">
            <div dangerouslySetInnerHTML={{ __html: paragraph }} />
          </ul>
        );
      }
      
      // Regular paragraph
      return (
        <div 
          key={idx} 
          className="my-3"
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      );
    });
  };

  // Helper function to extract key points from data entries
  const extractKeyPoints = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return [];
    
    // Extract key sentences and bullet points from the content
    const keyPoints = [];
    
    dataArray.forEach(item => {
      if (item.content) {
        // Look for bullet points or numbered lists
        const bulletRegex = /(?:\*\*([^:]+):\*\*|\n[-•*]\s+([^\n]+)|\n\d+\.\s+([^\n]+))/g;
        let match;
        
        while ((match = bulletRegex.exec(item.content)) !== null) {
          const point = match[1] || match[2] || match[3];
          if (point && point.trim().length > 10) { // Ensure it's substantial
            keyPoints.push(point.trim());
          }
        }
        
        // If no bullet points found, extract sentences with keywords
        if (keyPoints.length === 0 || keyPoints.length < 3) {
          const sentences = item.content.split(/[.!?](?:\s|$)/);
          sentences.forEach(sentence => {
            const keywords = ['key', 'important', 'significant', 'critical', 'major', 'crucial', 'essential'];
            if (keywords.some(keyword => sentence.toLowerCase().includes(keyword)) && 
                sentence.trim().length > 20 && 
                !keyPoints.includes(sentence.trim())) {
              keyPoints.push(sentence.trim());
            }
          });
        }
      }
    });
    
    // Return only unique points to avoid duplication
    return [...new Set(keyPoints)].slice(0, 5).map(point => preprocessText(point)); // Limit to 5 key points
  };

  // Generate strategic implications from data
  const generateStrategicImplications = (allData) => {
    // Extract potential implications from data
    const implications = [];
    const keywords = ['impact', 'implication', 'effect', 'consequence', 'result', 'outcome'];
    
    allData.forEach(item => {
      if (item.content) {
        const sentences = item.content.split(/[.!?](?:\s|$)/);
        sentences.forEach(sentence => {
          if (keywords.some(keyword => sentence.toLowerCase().includes(keyword)) && 
              sentence.trim().length > 30) {
            implications.push({
              title: sentence.trim().split(' ').slice(0, 3).join(' '),
              content: sentence.trim()
            });
          }
        });
      }
    });
    
    // If we found enough implications, return them
    if (implications.length >= 3) {
      return implications.slice(0, 5);
    }
    
    // Otherwise generate some based on the available data
    const categories = [
      { key: 'political', label: 'Policy', data: politicalData },
      { key: 'technological', label: 'Technology', data: technologicalData },
      { key: 'economic', label: 'Economic', data: economicData },
      { key: 'social', label: 'Social', data: socialData },
      { key: 'environmental', label: 'Environmental', data: environmentalData },
      { key: 'legal', label: 'Legal', data: legalData },
    ];
    
    const generatedImplications = [];
    
    // Look at interactions between categories that have data
    categories.forEach((category1, i) => {
      if (category1.data && category1.data.length > 0) {
        categories.forEach((category2, j) => {
          if (i !== j && category2.data && category2.data.length > 0) {
            generatedImplications.push({
              title: `${category1.label}-${category2.label} Interaction`,
              content: `The interaction between ${category1.label.toLowerCase()} and ${category2.label.toLowerCase()} factors creates both challenges and opportunities for stakeholders.`
            });
          }
        });
      }
    });
    
    return generatedImplications.slice(0, 5);
  };

  // Extract opportunities and threats from data
  const extractOpportunitiesThreats = (allData) => {
    const dimensionData = {
      'Political': politicalData,
      'Economic': economicData,
      'Social': socialData, 
      'Technological': technologicalData,
      'Environmental': environmentalData,
      'Legal': legalData
    };
    
    const opportunities = {};
    const threats = {};
    
    // Only include dimensions that have data
    Object.keys(dimensionData).forEach(dimension => {
      if (hasData(dimensionData[dimension])) {
        opportunities[dimension] = [];
        threats[dimension] = [];
        
        // Extract opportunities and threats from content
        dimensionData[dimension].forEach(item => {
          if (!item.content) return;
          
          const content = item.content.toLowerCase();
          const sentences = item.content.split(/[.!?](?:\s|$)/);
          
          // Look for opportunities
          sentences.forEach(sentence => {
            const oppKeywords = ['opportunity', 'benefit', 'advantage', 'potential', 'growth', 'improve', 'gain', 'positive'];
            if (oppKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) && 
                sentence.trim().length > 20 && 
                !sentence.toLowerCase().includes('threat') && 
                !sentence.toLowerCase().includes('challenge') &&
                !sentence.toLowerCase().includes('risk')) {
              opportunities[dimension].push(sentence.trim());
            }
          });
          
          // Look for threats
          sentences.forEach(sentence => {
            const threatKeywords = ['threat', 'challenge', 'risk', 'concern', 'issue', 'problem', 'barrier', 'hurdle', 'obstacle', 'negative'];
            if (threatKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) && 
                sentence.trim().length > 20 && 
                !sentence.toLowerCase().includes('opportunity') && 
                !sentence.toLowerCase().includes('benefit') &&
                !sentence.toLowerCase().includes('advantage')) {
              threats[dimension].push(sentence.trim());
            }
          });
          
          // If we couldn't find enough, try to generate some
          if (opportunities[dimension].length < 3) {
            if (dimension === 'Political' && content.includes('policy')) 
              opportunities[dimension].push('Supportive government policies for EV adoption');
            
            if (dimension === 'Economic' && content.includes('market')) 
              opportunities[dimension].push('Growing market demand for electric vehicles');
            
            if (dimension === 'Social' && content.includes('consumer')) 
              opportunities[dimension].push('Increasing consumer awareness and acceptance of EVs');
            
            if (dimension === 'Technological' && content.includes('battery')) 
              opportunities[dimension].push('Advancements in battery technology improving range and performance');
            
            if (dimension === 'Environmental' && content.includes('emission')) 
              opportunities[dimension].push('Reduced carbon emissions through EV adoption');
            
            if (dimension === 'Legal' && content.includes('regulation')) 
              opportunities[dimension].push('Favorable regulatory framework for EV development');
          }
          
          if (threats[dimension].length < 3) {
            if (dimension === 'Political' && content.includes('tariff')) 
              threats[dimension].push('Trade tensions and tariff uncertainties affecting global supply chains');
            
            if (dimension === 'Economic' && content.includes('cost')) 
              threats[dimension].push('High production costs compared to traditional vehicles');
            
            if (dimension === 'Social' && content.includes('range')) 
              threats[dimension].push('Persistent consumer concerns about range and charging infrastructure');
            
            if (dimension === 'Technological' && content.includes('obsolescence')) 
              threats[dimension].push('Rapid technological obsolescence risks for current models');
            
            if (dimension === 'Environmental' && content.includes('mining')) 
              threats[dimension].push('Environmental impact of battery material extraction');
            
            if (dimension === 'Legal' && content.includes('compliance')) 
              threats[dimension].push('Complex regulatory compliance requirements across different markets');
          }
        });
        
        // Ensure unique entries and limit to 3
        opportunities[dimension] = [...new Set(opportunities[dimension])].slice(0, 3);
        threats[dimension] = [...new Set(threats[dimension])].slice(0, 3);
      }
    });
    
    return { opportunities, threats };
  };

  // Generate recommendations based on all data
  const generateRecommendations = (allData) => {
    const recommendations = [];
    
    // Look for sentences that contain recommendation-like language
    allData.forEach(item => {
      if (!item.content) return;
      
      const sentences = item.content.split(/[.!?](?:\s|$)/);
      sentences.forEach(sentence => {
        const recKeywords = ['should', 'recommend', 'need to', 'must', 'imperative', 'essential to', 'important to', 'critical to', 'necessary'];
        if (recKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) && 
            sentence.trim().length > 30) {
          
          // Clean up the sentence to make it more recommendation-like
          let clean = sentence.trim();
          if (clean.toLowerCase().startsWith('it is recommended')) {
            clean = clean.substring(19);
          } else if (clean.toLowerCase().startsWith('we recommend')) {
            clean = clean.substring(13);
          }
          
          // Create a title from the first few words
          const words = clean.split(' ');
          const title = words.slice(0, 3).join(' ');
          
          recommendations.push({
            title: title,
            content: clean
          });
        }
      });
    });
    
    // Return the found recommendations, or default ones if not enough were found
    return recommendations.length >= 3 ? recommendations.slice(0, 6) : [];
  };

  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderSectionHeader = (title, sectionKey) => (
    <div 
      className="flex items-center justify-between cursor-pointer p-5 bg-blue-400 rounded-t-xl"
      onClick={() => toggleSection(sectionKey)}
    >
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/20 transition-transform duration-300 ${
        sections[sectionKey] ? 'rotate-180' : ''
      }`}>
        <ChevronDown className="w-5 h-5 text-white" />
      </div>
    </div>
  );

  // Check if there is any PESTEL data available
  const hasPestelData = hasData(politicalData) || hasData(economicData) || 
                       hasData(socialData) || hasData(technologicalData) || 
                       hasData(environmentalData) || hasData(legalData);

  // Dynamically determine which sections to display based on available data
  const showExecutiveSummary = analysisContent.executiveSummary !== null;
  const showIntroduction = analysisContent.introduction !== null;
  const showPolitical = hasData(politicalData);
  const showEconomic = hasData(economicData);
  const showSocial = hasData(socialData);
  const showTechnological = hasData(technologicalData);
  const showEnvironmental = hasData(environmentalData);
  const showLegal = hasData(legalData);
  const showStrategicImplications = analysisContent.strategicImplications.length > 0;
  const showOpportunitiesThreats = Object.keys(analysisContent.opportunitiesByDimension).length > 0;
  const showRecommendations = analysisContent.recommendations.length > 0;
  const showConclusion = analysisContent.conclusion !== null;

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Title */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
          <h1 className="text-3xl font-bold text-white text-center">COMPREHENSIVE PESTEL ANALYSIS</h1>
        </div>
      </div>

      {/* Executive Summary */}
      {showExecutiveSummary && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("Executive Summary", "executiveSummary")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.executiveSummary ? 'max-h-[2000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                {preprocessText(analysisContent.executiveSummary)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Introduction */}
      {showIntroduction && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("Introduction", "introduction")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.introduction ? 'max-h-[2000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                {preprocessText(analysisContent.introduction)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PESTEL Analysis */}
      {hasPestelData && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("PESTEL Analysis", "pestelAnalysis")}
        </div>
      )}

      {/* Political Factors */}
      {showPolitical && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Political Factors", "political")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.political ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="space-y-6">
                {politicalData.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    {item.content && (
                      <div className="text-gray-700">
                        {renderContent(item.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {analysisContent.political.length > 0 && (
                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-3">Key Political Factors</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {analysisContent.political.map((point, idx) => (
                      <li key={idx}>{preprocessText(point)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Economic Factors */}
      {showEconomic && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Economic Factors", "economic")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.economic ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="space-y-6">
                {economicData.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-purple-50 p-4 rounded-lg shadow-sm">
                    {item.content && (
                      <div className="text-gray-700">
                        {renderContent(item.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {analysisContent.economic.length > 0 && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-3">Key Economic Factors</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {analysisContent.economic.map((point, idx) => (
                      <li key={idx}>{preprocessText(point)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Social Factors */}
      {showSocial && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Social Factors", "social")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.social ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="space-y-6">
                {socialData.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-pink-50 p-4 rounded-lg shadow-sm">
                    {item.content && (
                      <div className="text-gray-700">
                        {renderContent(item.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {analysisContent.social.length > 0 && (
                <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-pink-800 mb-3">Key Social Factors</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {analysisContent.social.map((point, idx) => (
                      <li key={idx}>{preprocessText(point)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Technological Factors */}
      {showTechnological && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Technological Factors", "technological")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.technological ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="space-y-6">
                {technologicalData.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-emerald-50 p-4 rounded-lg shadow-sm">
                    {item.content && (
                      <div className="text-gray-700">
                        {renderContent(item.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {analysisContent.technological.length > 0 && (
                <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-emerald-800 mb-3">Key Technological Factors</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {analysisContent.technological.map((point, idx) => (
                      <li key={idx}>{preprocessText(point)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Environmental Factors */}
      {showEnvironmental && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Environmental Factors", "environmental")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.environmental ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="space-y-6">
                {environmentalData.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-green-50 p-4 rounded-lg shadow-sm">
                    {item.content && (
                      <div className="text-gray-700">
                        {renderContent(item.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {analysisContent.environmental.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">Key Environmental Factors</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {analysisContent.environmental.map((point, idx) => (
                      <li key={idx}>{preprocessText(point)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legal Factors */}
      {showLegal && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ml-8">
          {renderSectionHeader("Legal Factors", "legal")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.legal ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6">
              <div className="space-y-6">
                {legalData.slice(0, 3).map((item, index) => (
                  <div key={index} className="bg-amber-50 p-4 rounded-lg shadow-sm">
                    {item.content && (
                      <div className="text-gray-700">
                        {renderContent(item.content)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {analysisContent.legal.length > 0 && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-amber-800 mb-3">Key Legal Factors</h3>
                  <ul className="list-disc pl-5 space-y-3 text-gray-700">
                    {analysisContent.legal.map((point, idx) => (
                      <li key={idx}>{preprocessText(point)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategic Implications */}
      {showStrategicImplications && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("Strategic Implications", "strategicImplications")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.strategicImplications ? 'max-h-[3000px]' : 'max-h-0'
          }`}>
            <div className="p-6 bg-gradient-to-b from-white to-indigo-50">
              <p className="text-gray-700 leading-relaxed mb-4">
                The interplay of PESTEL factors creates a complex landscape for stakeholders in the market:
              </p>
              <ul className="list-disc pl-5 space-y-4 text-gray-700">
                {analysisContent.strategicImplications.map((implication, idx) => (
                  <li key={idx}>
                    <strong className="text-indigo-700">{preprocessText(implication.title)}:</strong> {preprocessText(implication.content)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Opportunities & Threats Matrix */}
      {showOpportunitiesThreats && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("Opportunities & Threats Matrix", "opportunitiesThreats")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.opportunitiesThreats ? 'max-h-[3000px]' : 'max-h-0'
          }`}>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 shadow-sm">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider w-1/4 border-b-2 border-gray-200">
                      Dimension
                    </th>
                    <th className="px-6 py-3 bg-green-100 text-left text-sm font-medium text-green-800 uppercase tracking-wider border-b-2 border-gray-200">
                      Opportunities
                    </th>
                    <th className="px-6 py-3 bg-red-100 text-left text-sm font-medium text-red-800 uppercase tracking-wider border-b-2 border-gray-200">
                      Threats
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(analysisContent.opportunitiesByDimension).map((dimension, idx) => (
                    <tr key={dimension} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200">
                        {dimension}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 bg-green-50 border-b border-gray-200">
                        <ul className="list-disc pl-4 space-y-2">
                          {analysisContent.opportunitiesByDimension[dimension].map((opportunity, idx) => (
                            <li key={idx}>{preprocessText(opportunity)}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 bg-red-50 border-b border-gray-200">
                        <ul className="list-disc pl-4 space-y-2">
                          {analysisContent.threatsByDimension[dimension].map((threat, idx) => (
                            <li key={idx}>{preprocessText(threat)}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Recommendations */}
      {showRecommendations && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("Strategic Recommendations", "recommendations")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.recommendations ? 'max-h-[5000px]' : 'max-h-0'
          }`}>
            <div className="p-6 bg-gradient-to-b from-white to-cyan-50">
              <ol className="list-decimal pl-5 space-y-5 text-gray-700">
                {analysisContent.recommendations.map((rec, idx) => (
                  <li key={idx} className="p-4 bg-white rounded-lg shadow-sm">
                    <strong className="text-cyan-700 block mb-2">{preprocessText(rec.title)}</strong> 
                    <p>{preprocessText(rec.content)}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Conclusion */}
      {showConclusion && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {renderSectionHeader("Conclusion", "conclusion")}
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections.conclusion ? 'max-h-[2000px]' : 'max-h-0'
          }`}>
            <div className="p-6 bg-gradient-to-b from-white to-purple-50">
              <p className="text-gray-700 leading-relaxed">
                {preprocessText(analysisContent.conclusion)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Combined;
