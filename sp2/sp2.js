window.addEventListener("message", (event) => {

  console.log("Received a message from " + event.origin");
  
  if (event.origin !== "http://merchants.google.com") return;
  
  node = document.getElementById("messageOutput");
  
  eventData = ""; event.origin
  eventData += "event.source: " + event.source;
  eventData += "<br />event.orgin: " + event.orgin;
  eventData += "<br />event.data: " + event.data;
  node.textContent = eventData;
});

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM is fully parsed. You can now select HTML elements!");

  linkButton = document.getElementById("linkButton");
  linkButton.addEventListener('click', (event) => {
    console.log("Button clicked safely and securely!");
    onLinkMcAccount();
  });
});

function onLinkMcAccount() {
  wndHandle = window.open(
    "https://merchants.google.com/mc/linkedaccounts/linking/serviceprovider/link?provider=5825924880&provider_merchant_id=abc-xyz-123&signature=[HMAC_SIGNATURE]&timestamp=[TIMESTAMP]&nonce=[NONCE]",
    "McAccountLinkPopup",
    "popup=true,width=1024,height=640");

  wndHandle.focus();
}
