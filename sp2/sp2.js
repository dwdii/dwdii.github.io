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
async function onLinkMcAccount() {
  
  let node = document.getElementById("spmcid");
  let spmcid = node.value;
  
  let nodeExtAcct = document.getElementById("spclientid");
  let spclientid = nodeExtAcct.value;
  
  let timestampVal = Math.floor(Date.now() / 1000); // Convert to seconds per Google spec
  let nonce = crypto.randomUUID();
  let envNode = document.getElementById("environment");
  let environment = envNode.value;
  let redirect_uri = "";
  let redirect_url_val = null;

  let callbackSwitch = document.getElementById("callbackUriSwitch");
  if(callbackSwitch.checked) {
    let stateParam = "check_value";
    redirect_url_val = "https://www.dittenhafer.net/sp2/callback.html?state=" + stateParam;
    redirect_uri = "&redirect_uri=" + encodeURIComponent(redirect_url_val);
  }

  let signature = await buildSignature(spmcid, spclientid, timestampVal, nonce, redirect_url_val)
  console.log("Signature: " + signature);
    
  let linkUrl = "https://" + environment + "/mc/linkedaccounts/linking/serviceprovider/link?" + 
    "provider=" + encodeURIComponent(spmcid) +
    "&provider_merchant_id=" + encodeURIComponent(spclientid) +
    // "&signature=[HMAC_SIGNATURE]" +
    "&timestamp=" + encodeURIComponent(timestampVal) +
    "&nonce=" + encodeURIComponent(nonce) +
    redirect_uri;

  // Window size, location
  let width = 800;
  let left = (window.screen.width / 2) - (width / 2);

  // Open the window
  _wndHandle = window.open(
    linkUrl,
    "McAccountLinkPopup",
    "popup=true,width=" + width + ",height=1000,top=200,left=" + left);

  if(_wndHandle) {
    _wndHandle.focus();
  }
}

async function buildSignature(
  provider,
  provider_merchant_id,
  timestamp,
  nonce,
  redirect_uri) {

  const encoder = new TextEncoder();
  const keyBytes = encoder.encode("test_secret_key_9f82c4b108e147da");
  
  let inputStr = "GET\n/sp/link\nclient_id=" + encodeURIComponent(provider) + 
    "&nonce=" + encodeURIComponent(nonce) + 
    "&provider_merchant_id=" + encodeURIComponent(provider_merchant_id);

  if(redirect_uri != null || redirect_uri.length() > 0) {
    inputStr += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  }

  inputStr += "&timestamp=" + encodeURIComponent(timestamp);
  console.log(inputStr);

  // 1. Import the secret key
  const messageBytes = encoder.encode(inputStr);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // 2. Sign the message
  let signatureBuffer = null;
  console.log("key: " + cryptoKey.toString());
  signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    messageBytes);

  // 3. Convert ArrayBuffer to Hex String
  let signature = null;
  signature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

  return signature;
}
