document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOMContentLoaded");

  // Get query string tuples
  const urlParams = new URLSearchParams(window.location.search);

  // {"status":500,"proposal_names":[],"google_merchant_id":"5423845892","provider_account_id":"abc-xyz-123","timestamp":"2026-08-05T19:59:02.399Z"}
  // Get values
  const status = urlParams.get('status');
  const proposal_names = urlParams.get('proposal_names');
  const google_merchant_id = urlParams.get('google_merchant_id');
  const provider_account_id = urlParams.get('provider_account_id');
  const timestamp = urlParams.get('timestamp');

  
});
