window.addEventListener("message", (event) => {
  if (event.origin !== "http://merchants.google.com") return;
  
  node = document.gtElementById("messageOutput");
  
  eventData = ""; event.origin
  eventData += "event.source: " + event.source;
  eventData += "<br />event.orgin: " + event.orgin;
  eventData += "<br />event.data: " + event.data;
  node.textContent = eventData;
});

function onLinkMcAccount() {
  window.open(
    "https://merchants.google.com/mc/linkedaccounts/linking/serviceprovider/link?provider=5825924880&provider_merchant_id=abc-xyz-123&signature=[HMAC_SIGNATURE]&timestamp=[TIMESTAMP]&nonce=[NONCE]",
    "McAccountLinkPopup",
    "popup=true");
}
