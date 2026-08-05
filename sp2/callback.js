document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded");

  try {
    // Get query string tuples
    const urlParams = new URLSearchParams(window.location.search);
    const cbData = JSON.parse(urlParams.get("result"));

    // {"status":500,"proposal_names":[],"google_merchant_id":"5423845892","provider_account_id":"abc-xyz-123","timestamp":"2026-08-05T19:59:02.399Z"}
    let node = document.getElementById("messageOutput");
    let eventData = ""; 
    eventData += createTableRow("status", cbData.status);
    eventData += createTableRow("proposal_names", cbData.proposal_names);
    eventData += createTableRow("google_merchant_id", cbData.google_merchant_id); 
    eventData += createTableRow("timestamp", cbData.timestamp);
    node.innerHTML = eventData;
  }
  catch (e) {
    console.error("Failed to parse callback data into JSON:", e.message);
  }
});

function alternateApproach()
{
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get('status');
  const proposal_names = urlParams.get('proposal_names');
  const google_merchant_id = urlParams.get('google_merchant_id');
  const provider_account_id = urlParams.get('provider_account_id');
  const timestamp = urlParams.get('timestamp');
}

function createTableRow(name, value) {
  return "<tr><td>" + name + "</td><td>" + value + "<td></tr>";
}
