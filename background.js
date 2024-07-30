chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeText',
    title: 'Analyze Selected Text or Code',
    contexts: ['selection']
  });
  console.log('Context menu item created');
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeText') {
    console.log('Analyze context menu clicked, selection:', info.selectionText);
    analyzeSelectedText(info.selectionText);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received from content script:', message);

  if (message.action === 'processCodeBlocks') {
    console.log('Detected code blocks:', message.data);
  } else if (message.action === 'analyzeSelectedText') {
    console.log('Analyzing selected text or code:', message.data);
    analyzeSelectedText(message.data);
  }

  // Keep the service worker alive until the response is sent
  sendResponse({ status: 'processing' });
  return true;
});

async function analyzeSelectedText(selectedText) {
  console.log('Sending request to server for analysis:', selectedText);

  try {
    const response = await fetch('http://localhost:3000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: selectedText })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Analysis result from server:', result.analysis);

    // Show notification with analysis result
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Analysis Result',
      message: result.analysis
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);

    // Show notification with error message
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Error',
      message: 'Failed to analyze text. Please try again later.'
    });
  }
}
