// Hook the window message event.
window.addEventListener("message", (event) => {

  console.log("Received a message from " + event.origin);
  
  if (event.origin !== "http://merchants.google.com") return;
  
  let node = document.getElementById("messageOutput");
  
  let eventData = ""; 
  eventData += "event.source: " + event.source;
  eventData += "<br />event.orgin: " + event.orgin;
  eventData += "<br />event.data: " + event.data;
  node.textContent = eventData;
});

document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM is fully parsed. You can now select HTML elements!");

  // Add click event handler to button.
  let linkButton = document.getElementById("linkButton");
  linkButton.addEventListener('click', (event) => {
    console.log("Button clicked safely and securely!");
    onLinkMcAccount();
  });
});

// Launch the account linking flow.
let _wndHandle;
function onLinkMcAccount() {
  
  let node = document.getElementById("spmcid");
  let spmcid = node.value;
  let timestampVal = Math.floor(Date.now() / 1000); // Convert to seconds per Google spec
  let nonce = crypto.randomUUID();
  
  let linkUrl = "https://merchants.google.com/mc/linkedaccounts/linking/serviceprovider/link?" + 
    "provider=" + spmcid +
    "&provider_merchant_id=abc-xyz-123&signature=[HMAC_SIGNATURE]" +
    "&timestamp=" + timestampVal + 
    "&nonce=" + nonce;
  
  _wndHandle = window.open(
    linkUrl,
    "McAccountLinkPopup",
    "popup=true,width=1000,height=1000");

  if(_wndHandle) {
    _wndHandle.focus();
  }
}
