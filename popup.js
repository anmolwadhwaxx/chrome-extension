document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['analysis'], function(result) {
      if (result.analysis) {
        document.getElementById('result').innerText = result.analysis;
      }
    });
  });
  
  