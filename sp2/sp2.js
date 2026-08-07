// Hook the window message event.
window.addEventListener("message", (event) => {

  console.log("Received a message from origin: " + event.origin);
  console.log("Received a message from source: " + event.source);

  if (event.origin !== "http://merchants.google.com") return;  
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
  let envNode = document.getElementById("environment");
  let environment = envNode.value;
    
  let linkUrl = "https://" + environment + "/mc/linkedaccounts/linking/serviceprovider/link?" + 
    "provider=" + spmcid +
    "&provider_merchant_id=abc-xyz-123&signature=[HMAC_SIGNATURE]" +
    "&timestamp=" + timestampVal + 
    "&nonce=" + nonce +
    "&redirect_uri=https://www.dittenhafer.net/sp2/callback.html" /* TODO: Add callback URL*/ ;
  
  _wndHandle = window.open(
    linkUrl,
    "McAccountLinkPopup",
    "popup=true,width=900,height=1000");

  if(_wndHandle) {
    _wndHandle.focus();
  }
}
