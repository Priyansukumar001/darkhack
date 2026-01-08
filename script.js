/*************************
 * GLOBAL STATE
 *************************/
let total = 0;
let billItems = {}; // { name: { price, qty } }
const visibleCount = 5;

/*************************
 * FLOATING MENU
 *************************/
function toggleUtility() {
  const panel = document.getElementById("utilityPanel");
  if (!panel) return;
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
}

/*************************
 * POPUP SYSTEM
 *************************/
function openPopup(sectionId) {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popup").style.display = "block";

  document.querySelectorAll(".popup-section").forEach(sec => {
    sec.style.display = "none";
  });

  document.getElementById(sectionId).style.display = "block";

  const panel = document.getElementById("utilityPanel");
  if (panel) panel.style.display = "none";
}

function closePopup() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popup").style.display = "none";
}

/* ESC key closes popup */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closePopup();
});

/*************************
 * SEARCH
 *************************/
function searchItems() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const items = document.querySelectorAll(".sweet-item");
  let found = false;

  items.forEach(item => {
    const name = item.dataset.name.toLowerCase();
    if (name.includes(input)) {
      item.style.display = "block";
      found = true;
    } else {
      item.style.display = "none";
    }
  });

  const noResult = document.getElementById("noResult");
  if (noResult) noResult.style.display = found ? "none" : "block";
}

/*************************
 * QUANTITY CONTROL
 *************************/
function changeQty(id, change) {
  const qtySpan = document.getElementById("qty-" + id);
  let qty = parseInt(qtySpan.innerText);
  qty += change;
  if (qty < 1) qty = 1;
  qtySpan.innerText = qty;
}

/*************************
 * ADD TO BILL
 *************************/
function addItem(name, price, id) {
  const qty = parseInt(document.getElementById("qty-" + id).innerText);

  if (!billItems[name]) {
    billItems[name] = { price, qty: 0 };
  }

  billItems[name].qty += qty;
  total += price * qty;

  updateBillUI();
  document.getElementById("qty-" + id).innerText = 1;
}

/*************************
 * UPDATE BILL UI
 *************************/
function updateBillUI() {
  const billList = document.getElementById("billList");
  billList.innerHTML = "";

  Object.keys(billItems).forEach(name => {
    const item = billItems[name];
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${name} × ${item.qty}</span>
      <strong>₹${item.qty * item.price}</strong>
    `;
    billList.appendChild(li);
  });

  document.getElementById("total").innerText = total;
}

/*************************
 * CLEAR BILL
 *************************/
function clearBill() {
  billItems = {};
  total = 0;
  document.getElementById("billList").innerHTML = "";
  document.getElementById("total").innerText = "0";
}

/*************************
 * GOOGLE PAY (TEST MODE)
 *************************/
let paymentsClient = null;

function onGooglePayLoaded() {
  paymentsClient = new google.payments.api.PaymentsClient({
    environment: "TEST"
  });
}

function onGooglePayClicked() {
  if (!paymentsClient) {
    alert("Payment system loading. Please wait.");
    return;
  }

  if (total === 0) {
    alert("Please add items to bill first");
    return;
  }

  const paymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: "CARD",
      parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["VISA", "MASTERCARD"]
      },
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "example",
          gatewayMerchantId: "exampleMerchantId"
        }
      }
    }],
    merchantInfo: {
      merchantName: "SweetSmart (TEST MODE)"
    },
    transactionInfo: {
      totalPriceStatus: "FINAL",
      totalPrice: total.toString(),
      currencyCode: "INR"
    }
  };

  paymentsClient.loadPaymentData(paymentDataRequest)
    .then(() => {
      alert("Payment Successful (TEST MODE)");
      clearBill();
      closePopup();
    })
    .catch(err => {
      console.log(err);
      alert("Payment cancelled");
    });
}

/*************************
 * INITIAL PRODUCT LIMIT
 *************************/
window.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".sweet-item");
  items.forEach((item, index) => {
    if (index >= visibleCount) item.style.display = "none";
  });
});

/*************************
 * VIEW ALL / BACK BUTTON
 *************************/
function viewAllProducts() {
  document.querySelectorAll(".sweet-item").forEach(item => {
    item.style.display = "block";
  });

  document.getElementById("viewAllBtn").style.display = "none";
  document.getElementById("closeAllBtn").style.display = "inline-block";
}

function closeAllProducts() {
  const items = document.querySelectorAll(".sweet-item");

  items.forEach((item, index) => {
    if (index >= visibleCount) {
      item.style.display = "none";
    } else {
      item.style.display = "block";
    }
  });

  document.getElementById("viewAllBtn").style.display = "inline-block";
  document.getElementById("closeAllBtn").style.display = "none";

  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}
