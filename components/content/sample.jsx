import React, { useState } from 'react';

const Report = () => {
  const [sections, setSections] = useState({
    political: false,
    economic: false,
    social: false,
    technological: false,
    environmental: false,
    legal: false
  });

  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const contentData = {
    "Government Policy": [
      "• Impact of government incentives on BMW's electric vehicle (EV) production.",
      "• How emissions regulations influence BMW's car design and innovation.",
      "• Government subsidies and their effect on BMW's manufacturing costs.",
      "• Influence of fuel taxation policies on BMW's market demand.",
      "• The role of government safety regulations in BMW's vehicle features."
    ],
    "Political Stability": [
      "• How political stability in Germany affects BMW's global expansion.",
      "• The impact of Brexit on BMW's UK-based manufacturing and sales.",
      "• Political stability in China and its influence on BMW's production strategy.",
      "• How U.S. trade policies change BMW's import and export operations.",
      "• The effect of political unrest in supplier countries on BMW's supply chain."
    ],
    "Corruption": [
      "• How corruption in emerging markets affects BMW's business operations.",
      "• The impact of bribery regulations on BMW's international contracts.",
      "• How corruption perception influences BMW's investment decisions.",
      "• BMW's response to anti-corruption policies in global markets.",
      "• The role of transparency laws in BMW's corporate governance."
    ],
    "Foreign Trade Policy": [
      "• How tariff changes affect BMW's global pricing strategy.",
      "• The impact of free trade agreements on BMW's supply chain efficiency.",
      "• BMW's strategy to navigate U.S.-China trade tensions.",
      "• How foreign trade restrictions influence BMW's component sourcing.",
      "• The role of EU trade policies in BMW's export market expansion."
    ],
    "Tax Policy": [
      "• How corporate tax rates in different countries impact BMW's global profits.",
      "• The effect of luxury car taxes on BMW's pricing and sales strategy.",
      "• BMW's response to carbon tax policies and their impact on electric vehicle adoption.",
      "• Influence of import duties on BMW's vehicle production and supply chain.",
      "• How VAT and GST variations affect BMW's market competitiveness worldwide."
    ]
  };

  const topicDetails = {
    "• Impact of government incentives on BMW's electric vehicle (EV) production.": `
### Impact Analysis
- Government incentives have led to 30% increase in EV production
- Tax benefits in key markets
- Subsidies for manufacturing facilities
- Consumer purchase incentives
- Infrastructure development support
    `,
    // Add similar markdown content for other topics
  };

  const handleCardClick = (title) => {
    setSelectedCard(title);
    setSelectedTopic(null);
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(selectedTopic === topic ? null : topic);
  };

  const renderTopicText = (text) => {
    const cleanText = text.replace('•', '').trim();
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4 fill-current"
            >
              <path 
                className="text-blue-500" 
                d="M9.4 18L8 16.6l4.6-4.6L8 7.4 9.4 6l6 6z"
              />
              <path 
                className="text-blue-300" 
                d="M14.6 18l-1.4-1.4 4.6-4.6-4.6-4.6L14.6 6l6 6z"
              />
            </svg>
          </div>
        </div>
        <span className="text-gray-700 font-medium tracking-wide hover:text-blue-600 transition-colors">
          {cleanText}
        </span>
      </div>
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      setSelectedCard(null);
      setSelectedTopic(null);
    }
  };

  const toggleSection = (section) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Political Analysis Section */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-8"
          onClick={() => toggleSection('political')}
        >
          <h1 className="text-3xl font-bold text-left text-blue-600">Political Analysis Report</h1>
          <span className={`transform transition-transform duration-200 text-blue-600 text-2xl ${
            sections.political ? 'rotate-180' : ''
          }`}>▼</span>
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.political ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="flex justify-center gap-4 mb-12 pt-2">
            {Object.keys(contentData).map((title) => (
              <div
                key={title}
                className={`w-48 p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${
                  selectedCard === title ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleCardClick(title)}
              >
                <h3 className="text-lg font-semibold text-center text-blue-700">{title}</h3>
              </div>
            ))}
          </div>

          {selectedCard && (
            <div className="mt-8 w-full">
              <div className="grid grid-cols-1 gap-4 w-full">
                {contentData[selectedCard].map((topic, index) => (
                  <div key={index} className="w-full transition-all duration-200">
                    <div
                      className={`p-5 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 ${
                        selectedTopic === topic 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500' 
                          : 'hover:border-l-4 hover:border-blue-300'
                      }`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="flex justify-between items-center">
                        {renderTopicText(topic)}
                        <span className={`transform transition-transform duration-200 text-black text-lg font-bold ${
                          selectedTopic === topic ? 'rotate-180' : ''
                        }`}>
                          ▼
                        </span>
                      </div>
                    </div>
                    
                    {selectedTopic === topic && (
                      <div className="mt-2 mx-4 overflow-hidden transition-all duration-200">
                        <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-inner">
                          <div className="prose prose-blue max-w-none">
                            <div className="space-y-4 text-gray-700">
                              <h3 className="text-xl font-semibold text-blue-700 border-b pb-2">
                                Detailed Analysis
                              </h3>
                              <ul className="list-disc pl-5 space-y-2">
                                {topicDetails[topic]?.split('\n')
                                  .filter(line => line.trim().startsWith('-'))
                                  .map((point, i) => (
                                    <li key={i} className="text-gray-600">
                                      {point.replace('-', '').trim()}
                                    </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Economic Analysis Section */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-8"
          onClick={() => toggleSection('economic')}
        >
          <h1 className="text-3xl font-bold text-left text-blue-600">Economic Analysis Report</h1>
          <span className={`transform transition-transform duration-200 text-blue-600 text-2xl ${
            sections.economic ? 'rotate-180' : ''
          }`}>▼</span>
        </div>
        
        <div className={`transition-all duration-300 overflow-hidden ${
          sections.economic ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="text-gray-500 text-center py-8">Economic Analysis content will be added soon...</div>
        </div>
      </div>

      {/* Add other PESTEL sections with the same structure */}
      {['Social', 'Technological', 'Environmental', 'Legal'].map(section => (
        <div key={section.toLowerCase()}>
          <div 
            className="flex items-center justify-between cursor-pointer mb-8"
            onClick={() => toggleSection(section.toLowerCase())}
          >
            <h1 className="text-3xl font-bold text-left text-blue-600">{section} Analysis Report</h1>
            <span className={`transform transition-transform duration-200 text-blue-600 text-2xl ${
              sections[section.toLowerCase()] ? 'rotate-180' : ''
            }`}>▼</span>
          </div>
          
          <div className={`transition-all duration-300 overflow-hidden ${
            sections[section.toLowerCase()] ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="text-gray-500 text-center py-8">{section} Analysis content will be added soon...</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Report;
