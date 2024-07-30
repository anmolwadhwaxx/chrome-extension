// content.js

// Function to extract all code blocks from the page
function getCodeBlocks() {
    // Select code blocks on pages, typically within <pre> or <code> tags
    const codeBlocks = document.querySelectorAll('pre, code');
    return Array.from(codeBlocks).map(block => block.innerText).filter(code => code.trim().length > 0);
  }
  
  // Function to send messages to the background script
  function sendMessage(action, data) {
    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action, data }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
        }
        console.log('Response:', response);
      });
    } else {
      console.error('chrome.runtime is not available');
    }
  }
  
  // Send the extracted code blocks to the background script
  sendMessage('processCodeBlocks', getCodeBlocks());
  
  // Add event listeners to document for contextual analysis on selection
  document.addEventListener('mouseup', event => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      console.log('Selected text:', selection); // Log selected text
      sendMessage('analyzeSelectedText', selection);
    }
  });
  