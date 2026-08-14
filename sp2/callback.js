document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded");

  try {
    // Get query string tuples
    const urlParams = new URLSearchParams(window.location.search);
    processResults();
  }
  catch (e) {
    console.error("Failed to process callback data:", e.message);
  }
});

function processResults()
{
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const proposal_names = urlParams.get('proposal_names');
  const google_merchant_id = urlParams.get('google_merchant_id');
  const provider_account_id = urlParams.get('provider_account_id'); // legacy / alpha
  const provider_merchant_id = urlParams.get('provider_merchant_id'); // beta / GA
  const timestamp = urlParams.get('timestamp');

  let nodeString = document.getElementById("humanMessage");
  let humanMessage = "Unknown result";
  if(status == "200") {
    humanMessage = "Account linking proposal for Merchant Center account " + google_merchant_id + " submitted successfully.";
  } 
  else if (status == "500") {
    humanMessage = "An error has occurred. Account linking proposal was not generated. ";
  }

  nodeString.innerHtml = humanMessage;

  // {"status":500,"proposal_names":[],"google_merchant_id":"5423845892","provider_account_id":"abc-xyz-123","timestamp":"2026-08-05T19:59:02.399Z"}
  let node = document.getElementById("messageOutput");
  let eventData = ""; 
  eventData += createTableRow("status", status);
  eventData += createTableRow("proposal_names", proposal_names);
  eventData += createTableRow("google_merchant_id", google_merchant_id); 
  if(null != provider_account_id) {
    eventData += createTableRow("provider_account_id (alpha)", provider_account_id);
  }
  if(null != provider_merchant_id) {
    eventData += createTableRow("provider_merchant_id", provider_merchant_id);
  }
  eventData += createTableRow("timestamp", timestamp);
  node.innerHTML = eventData;
  
}

function createTableRow(name, value) {
  return "<tr><td>" + name + "</td><td>" + value + "<td></tr>";
}
