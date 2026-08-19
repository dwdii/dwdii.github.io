document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded");

   // Add click event handler to button.
  let closeButton = document.getElementById("closeButton");
  closeButton.addEventListener('click', (event) => {
    console.log("closeButton clicked safely and securely!");
    window.close();
  });

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
  const google_merchant_id = urlParams.get('google_merchant_id');

  let nodeString = document.getElementById("humanMessage");
  let humanMessage = "Unknown result";
  if(status == "200") {
    humanMessage = "Account linking proposal for Merchant Center account " + google_merchant_id + " submitted successfully.";
    nodeString.classList.add("alert-primary");
  } 
  else if (status == "500") {
    humanMessage = "An error has occurred. Account linking proposal was not generated. ";
    nodeString.classList.add("alert-danger");
  }

  console.info(humanMessage);
  nodeString.innerHTML = humanMessage;

  // {"status":500,"proposal_names":[],"google_merchant_id":"5423845892","provider_account_id":"abc-xyz-123","timestamp":"2026-08-05T19:59:02.399Z"}
  let node = document.getElementById("messageOutput");
  let eventData = ""; 
  let value = "";
  for (const key of urlParams.keys()) {
    value = urlParams.get(key);

    // Confirm state was passed as expected.
    if(key = "state" && value == "check_value") {
      value += " ✅";
    }

    eventData += createTableRow(key, value);    
  }
 
  node.innerHTML = eventData;
}

function createTableRow(name, value) {
  return "<tr><td>" + name + "</td><td>" + value + "<td></tr>";
}
