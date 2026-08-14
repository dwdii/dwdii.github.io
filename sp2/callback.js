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

  let nodeString = document.getElementById("humanMessage");
  let humanMessage = "Unknown result";
  if(status == "200") {
    humanMessage = "Account linking proposal for Merchant Center account " + google_merchant_id + " submitted successfully.";
  } 
  else if (status == "500") {
    humanMessage = "An error has occurred. Account linking proposal was not generated. ";
  }

  console.info(humanMessage);
  nodeString.innerHtml = humanMessage;

  // {"status":500,"proposal_names":[],"google_merchant_id":"5423845892","provider_account_id":"abc-xyz-123","timestamp":"2026-08-05T19:59:02.399Z"}
  let node = document.getElementById("messageOutput");
  let eventData = ""; 
  for (const key of urlParams.keys()) {
    eventData += createTableRow(key, urlParams.get(key));
  }
 
  node.innerHTML = eventData;
}

function createTableRow(name, value) {
  return "<tr><td>" + name + "</td><td>" + value + "<td></tr>";
}
