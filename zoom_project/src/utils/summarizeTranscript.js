// Utility function for summarizing meeting transcripts using OpenAI GPT-3.5
import axios from 'axios';

/**
 * Summarizes a meeting transcript using OpenAI's GPT-3.5 model
 * @param {string} transcript - The meeting transcript text
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} - The summarized meeting data
 */
export const summarizeTranscript = async (transcript, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error('OpenAI API key is required for summarization');
    }

    if (!transcript || transcript.trim() === '') {
      throw new Error('Transcript is empty or invalid');
    }

    // Create the prompt for summarization
    const summaryPrompt = `
    Summarize this meeting transcript into:
    - Meeting Overview
    - Key Points
    - Action Items
    - Decisions Made
    
    Transcript:
    ${transcript}
    `;

    // Make API call to OpenAI GPT-3.5
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: summaryPrompt }],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the summary text from the response
    const summaryText = response.data.choices[0].message.content;
    
    // Parse the summary into structured data
    const summaryData = parseStructuredSummary(summaryText);
    
    return summaryData;
  } catch (error) {
    console.error('Error summarizing transcript:', error);
    throw error;
  }
};

/**
 * Parses the summary text into a structured object
 * @param {string} summaryText - The raw summary text from GPT-3.5
 * @returns {Object} - Structured summary data
 */
const parseStructuredSummary = (summaryText) => {
  // Initialize the structure
  const summaryData = {
    overview: '',
    keyPoints: [],
    actionItems: [],
    decisions: []
  };

  // Split the text by sections
  const sections = summaryText.split(/\n\s*-\s*|\n\s*\*\s*|\n\n/);
  
  // Process each section
  let currentSection = null;
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    
    if (!trimmedSection) continue;
    
    // Identify the section type
    if (trimmedSection.toLowerCase().includes('meeting overview')) {
      currentSection = 'overview';
      continue;
    } else if (trimmedSection.toLowerCase().includes('key points')) {
      currentSection = 'keyPoints';
      continue;
    } else if (trimmedSection.toLowerCase().includes('action items')) {
      currentSection = 'actionItems';
      continue;
    } else if (trimmedSection.toLowerCase().includes('decisions made')) {
      currentSection = 'decisions';
      continue;
    }
    
    // Add content to the appropriate section
    if (currentSection === 'overview') {
      summaryData.overview += trimmedSection;
    } else if (currentSection === 'keyPoints' && !trimmedSection.toLowerCase().includes('key points')) {
      summaryData.keyPoints.push(trimmedSection);
    } else if (currentSection === 'actionItems' && !trimmedSection.toLowerCase().includes('action items')) {
      summaryData.actionItems.push(trimmedSection);
    } else if (currentSection === 'decisions' && !trimmedSection.toLowerCase().includes('decisions made')) {
      summaryData.decisions.push(trimmedSection);
    }
  }
  
  // Clean up the data
  summaryData.keyPoints = summaryData.keyPoints
    .map(point => point.replace(/^[\s-•*]+|[\s-•*]+$/g, ''))
    .filter(point => point.length > 0);
    
  summaryData.actionItems = summaryData.actionItems
    .map(item => item.replace(/^[\s-•*]+|[\s-•*]+$/g, ''))
    .filter(item => item.length > 0);
    
  summaryData.decisions = summaryData.decisions
    .map(decision => decision.replace(/^[\s-•*]+|[\s-•*]+$/g, ''))
    .filter(decision => decision.length > 0);
  
  return summaryData;
};

/**
 * Formats the summary data into a readable text format
 * @param {Object} summaryData - The structured summary data
 * @returns {string} - Formatted summary text
 */
export const formatSummary = (summaryData) => {
  let formattedSummary = '';
  
  // Add meeting overview
  formattedSummary += '## Meeting Overview\n\n';
  formattedSummary += summaryData.overview + '\n\n';
  
  // Add key points
  formattedSummary += '## Key Points\n\n';
  summaryData.keyPoints.forEach(point => {
    formattedSummary += `- ${point}\n`;
  });
  formattedSummary += '\n';
  
  // Add action items
  formattedSummary += '## Action Items\n\n';
  summaryData.actionItems.forEach(item => {
    formattedSummary += `- ${item}\n`;
  });
  formattedSummary += '\n';
  
  // Add decisions
  formattedSummary += '## Decisions Made\n\n';
  summaryData.decisions.forEach(decision => {
    formattedSummary += `- ${decision}\n`;
  });
  
  return formattedSummary;
};