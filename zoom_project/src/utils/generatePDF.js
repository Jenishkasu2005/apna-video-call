// Utility function for generating PDF documents from meeting summaries
import html2pdf from 'html2pdf.js';

/**
 * Generates a PDF document from meeting summary data
 * @param {Object} summaryData - The structured summary data
 * @param {string} meetingId - The meeting ID
 * @returns {Promise<Blob>} - PDF document as a Blob
 */
export const generateSummaryPDF = async (summaryData, meetingId) => {
  try {
    if (!summaryData) {
      throw new Error('Summary data is required for PDF generation');
    }

    // Create a formatted HTML document for the PDF
    const htmlContent = `
      <div class="meeting-summary">
        <h1>Meeting Summary: ${meetingId || 'Untitled Meeting'}</h1>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        
        <div class="section">
          <h2>Meeting Overview</h2>
          <p>${summaryData.overview || 'No overview available'}</p>
        </div>
        
        <div class="section">
          <h2>Key Points</h2>
          ${summaryData.keyPoints && summaryData.keyPoints.length > 0 
            ? `<ul>${summaryData.keyPoints.map(point => `<li>${point}</li>`).join('')}</ul>` 
            : '<p>No key points recorded</p>'}
        </div>
        
        <div class="section">
          <h2>Action Items</h2>
          ${summaryData.actionItems && summaryData.actionItems.length > 0 
            ? `<ul>${summaryData.actionItems.map(item => `<li>${item}</li>`).join('')}</ul>` 
            : '<p>No action items recorded</p>'}
        </div>
        
        <div class="section">
          <h2>Decisions Made</h2>
          ${summaryData.decisions && summaryData.decisions.length > 0 
            ? `<ul>${summaryData.decisions.map(decision => `<li>${decision}</li>`).join('')}</ul>` 
            : '<p>No decisions recorded</p>'}
        </div>
      </div>
    `;

    // Create a styled container for the PDF content
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.padding = '20px';
    container.style.color = '#333';
    
    // Apply styles to elements within the container
    const styles = `
      .meeting-summary h1 {
        color: #3f51b5;
        border-bottom: 2px solid #3f51b5;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      .meeting-summary h2 {
        color: #5c6bc0;
        margin-top: 20px;
        margin-bottom: 10px;
      }
      .meeting-summary .timestamp {
        color: #666;
        font-style: italic;
        margin-bottom: 20px;
      }
      .meeting-summary .section {
        margin-bottom: 25px;
      }
      .meeting-summary ul {
        padding-left: 20px;
      }
      .meeting-summary li {
        margin-bottom: 5px;
      }
    `;
    
    // Add styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    container.prepend(styleElement);
    
    // Configure PDF options
    const options = {
      margin: [15, 15],
      filename: `meeting-summary-${meetingId || 'untitled'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate the PDF
    const pdfBlob = await html2pdf().from(container).set(options).outputPdf('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Downloads the generated PDF
 * @param {Blob} pdfBlob - The PDF blob to download
 * @param {string} filename - The filename for the downloaded PDF
 */
export const downloadPDF = (pdfBlob, filename = 'meeting-summary.pdf') => {
  try {
    // Create a URL for the blob
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    
    // Append to the document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};