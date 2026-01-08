/*************************
 * GLOBAL STATE
 *************************/
let total = 0;
let billItems = {}; // { name: { price, qty } }
const visibleCount = 5;

/*************************
 * FLOATING MENU + BADGE
 *************************/
function toggleUtility() {
  const panel = document.getElementById("utilityPanel");
  if (!panel) return;
  panel.style.display = panel.style.display === "flex" ? "none" : "flex";
}

function updateCartBadge() {
  const fab = document.querySelector(".fab");
  let count = 0;

  Object.values(billItems).forEach(item => {
    count += item.qty;
  });

  let badge = document.getElementById("cartBadge");
  if (!badge) {
    badge = document.createElement("span");
    badge.id = "cartBadge";
    badge.style.cssText = `
      position:absolute;
      top:-5px;
      right:-5px;
      background:#fff;
      color:#ff4d4d;
      font-size:12px;
      font-weight:bold;
      padding:3px 6px;
      border-radius:50%;
    `;
    fab.appendChild(badge);
  }

  badge.style.display = count > 0 ? "block" : "none";
  badge.innerText = count;
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
  updateCartBadge();

  document.getElementById("qty-" + id).innerText = 1;
}

/*************************
 * REMOVE SINGLE ITEM
 *************************/
function removeItem(name) {
  if (!billItems[name]) return;

  total -= billItems[name].price * billItems[name].qty;
  delete billItems[name];

  updateBillUI();
  updateCartBadge();
}

/*************************
 * UPDATE BILL UI
 *************************/
function updateBillUI() {
  const billList = document.getElementById("billList");
  billList.innerHTML = "";

  let i = 1;
  Object.keys(billItems).forEach(name => {
    const item = billItems[name];
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${i}. ${name} × ${item.qty}</span>
      <strong>₹${item.qty * item.price}</strong>
      <button onclick="removeItem('${name}')" style="
        background:none;
        border:none;
        color:red;
        font-size:16px;
        cursor:pointer;
      ">❌</button>
    `;

    billList.appendChild(li);
    i++;
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
  updateCartBadge();
}

/*************************
 * DOWNLOAD BILL AS PDF
 *************************/
function downloadBill() {
  if (total === 0) {
    alert("Bill is empty");
    return;
  }
  window.print(); // user can save as PDF
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
 * CASH ON DELIVERY
 *************************/
function cashOnDelivery() {
  if (total === 0) {
    alert("Add items first");
    return;
  }

  alert("Order placed with Cash on Delivery");
  clearBill();
  closePopup();
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
 * VIEW ALL / VIEW LESS
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
    item.style.display = index < visibleCount ? "block" : "none";
  });

  document.getElementById("viewAllBtn").style.display = "inline-block";
  document.getElementById("closeAllBtn").style.display = "none";

  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}
