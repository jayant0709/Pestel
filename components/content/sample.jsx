import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Report = () => {
  const [sections, setSections] = useState({
    political: false,
    economic: false,
    social: false,
    technological: false,
    environmental: false,
    legal: false,
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
      "• The role of government safety regulations in BMW's vehicle features.",
    ],
    "Political Stability": [
      "• How political stability in Germany affects BMW's global expansion.",
      "• The impact of Brexit on BMW's UK-based manufacturing and sales.",
      "• Political stability in China and its influence on BMW's production strategy.",
      "• How U.S. trade policies change BMW's import and export operations.",
      "• The effect of political unrest in supplier countries on BMW's supply chain.",
    ],
    Corruption: [
      "• How corruption in emerging markets affects BMW's business operations.",
      "• The impact of bribery regulations on BMW's international contracts.",
      "• How corruption perception influences BMW's investment decisions.",
      "• BMW's response to anti-corruption policies in global markets.",
      "• The role of transparency laws in BMW's corporate governance.",
    ],
    "Foreign Trade Policy": [
      "• How tariff changes affect BMW's global pricing strategy.",
      "• The impact of free trade agreements on BMW's supply chain efficiency.",
      "• BMW's strategy to navigate U.S.-China trade tensions.",
      "• How foreign trade restrictions influence BMW's component sourcing.",
      "• The role of EU trade policies in BMW's export market expansion.",
    ],
    "Tax Policy": [
      "• How corporate tax rates in different countries impact BMW's global profits.",
      "• The effect of luxury car taxes on BMW's pricing and sales strategy.",
      "• BMW's response to carbon tax policies and their impact on electric vehicle adoption.",
      "• Influence of import duties on BMW's vehicle production and supply chain.",
      "• How VAT and GST variations affect BMW's market competitiveness worldwide.",
    ],
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

  const renderSectionHeader = (title) => (
    <div className="flex items-center justify-between cursor-pointer p-5 bg-blue-400">
      <h1 className="text-2xl font-bold text-left text-white">{title}</h1>
      <div
        className={`flex items-center justify-center h-8 w-8 rounded-full bg-white/20 transition-transform duration-300 ${
          sections[title.toLowerCase()] ? "rotate-180" : ""
        }`}
      >
        <ChevronDown className="w-5 h-5 text-white" />
      </div>
    </div>
  );

  const renderTopicText = (text) => {
    const cleanText = text.startsWith("•") ? text.substring(1).trim() : text;
    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path
                className="text-blue-400"
                d="M9.4 18L8 16.6l4.6-4.6L8 7.4 9.4 6l6 6z"
              />
              <path
                className="text-blue-300"
                d="M14.6 18l-1.4-1.4 4.6-4.6-4.6-4.6L14.6 6l6 6z"
              />
            </svg>
          </div>
        </div>
        <span className="text-gray-700 font-medium tracking-wide hover:text-blue-400 transition-colors">
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
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Political Analysis Section */}
      <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
        {renderSectionHeader("Political Analysis Report")}

        <div
          className={`transition-all duration-300 overflow-hidden bg-gray-50 ${
            sections.political
              ? "max-h-[5000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap justify-center gap-4 my-6 p-4">
            {Object.keys(contentData).map((title) => (
              <div
                key={title}
                className={`w-48 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1 ${
                  selectedCard === title
                    ? "ring-2 ring-purple-500 shadow-lg"
                    : "border border-gray-100"
                }`}
                onClick={() => handleCardClick(title)}
              >
                <h3 className="text-lg font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">
                  {title}
                </h3>
              </div>
            ))}
          </div>

          {selectedCard && (
            <div className="p-4 w-full">
              <div className="grid grid-cols-1 gap-4 w-full">
                {contentData[selectedCard].map((topic, index) => (
                  <div
                    key={index}
                    className="w-full transition-all duration-200"
                  >
                    <div
                      className={`p-5 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 ${
                        selectedTopic === topic
                          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500"
                          : "hover:border-l-4 hover:border-purple-300"
                      }`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <div className="flex justify-between items-center">
                        {renderTopicText(topic)}
                        <div
                          className={`flex items-center justify-center h-6 w-6 rounded-full bg-indigo-50 transition-transform duration-300 ${
                            selectedTopic === topic ? "rotate-180" : ""
                          }`}
                        >
                          <ChevronDown className="w-4 h-4 text-indigo-600" />
                        </div>
                      </div>
                    </div>

                    {selectedTopic === topic && (
                      <div className="mt-2 mx-4 overflow-hidden transition-all duration-200">
                        <div className="p-6 bg-white rounded-lg border border-gray-100 shadow-md">
                          <div className="prose prose-indigo max-w-none">
                            <div className="space-y-4 text-gray-700">
                              <h3 className="text-xl font-semibold text-indigo-700 border-b border-indigo-100 pb-2">
                                Detailed Analysis
                              </h3>
                              <ul className="list-disc pl-5 space-y-2">
                                {topicDetails[topic]
                                  ?.split("\n")
                                  .filter((line) => line.trim().startsWith("-"))
                                  .map((point, i) => (
                                    <li key={i} className="text-gray-600">
                                      {point.replace("-", "").trim()}
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
      <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white border border-gray-200">
        {renderSectionHeader("Economic Analysis Report")}

        <div
          className={`transition-all duration-300 overflow-hidden ${
            sections.economic
              ? "max-h-[5000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-500"
              >
                <path d="M12 20V10"></path>
                <path d="M18 20V4"></path>
                <path d="M6 20v-6"></path>
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-600">
              Economic Analysis content will be added soon...
            </p>
          </div>
        </div>
      </div>

      {/* Add other PESTEL sections with the same structure */}
      {["Social", "Technological", "Environmental", "Legal"].map(
        (section, index) => (
          <div
            key={section.toLowerCase()}
            className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white border border-gray-200"
          >
            {renderSectionHeader(`${section} Analysis Report`)}

            <div
              className={`transition-all duration-300 overflow-hidden ${
                sections[section.toLowerCase()]
                  ? "max-h-[5000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  {index === 0 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-indigo-500"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  )}
                  {index === 1 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-indigo-500"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                  )}
                  {index === 2 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-indigo-500"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  )}
                  {index === 3 && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-indigo-500"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  )}
                </div>
                <p className="text-lg font-medium text-gray-600">
                  {section} Analysis content will be added soon...
                </p>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Report;
