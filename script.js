/***********************
 * GLOBAL STATE
 ***********************/
let total = 0;
let billItems = {}; // { name: { price, qty } }

/***********************
 * 🔍 SEARCH FUNCTION (NEW)
 ***********************/
function searchItems() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const items = document.getElementsByClassName("sweet-item");
  let found = false;

  for (let i = 0; i < items.length; i++) {
    const name = items[i].getAttribute("data-name").toLowerCase();

    if (name.includes(input)) {
      items[i].style.display = "";
      found = true;
    } else {
      items[i].style.display = "none";
    }
  }

  document.getElementById("noResult").style.display =
    found ? "none" : "block";
}const sweetItems = document.querySelectorAll(".sweet-item");
const visibleCount = 5;

// SHOW ONLY FIRST 5 ON LOAD
window.addEventListener("DOMContentLoaded", () => {
  sweetItems.forEach((item, index) => {
    if (index >= visibleCount) {
      item.style.display = "none";
    }
  });
});

// VIEW ALL FUNCTION
function viewAllProducts() {
  sweetItems.forEach(item => {
    item.style.display = "";
  });

  document.getElementById("viewAllBtn").style.display = "none";
}






/***********************
 * QUANTITY CONTROL
 ***********************/
function changeQty(id, value) {
  const qtySpan = document.getElementById("qty-" + id);
  let qty = parseInt(qtySpan.innerText);
  qty += value;
  if (qty < 1) qty = 1;
  qtySpan.innerText = qty;
}

/***********************
 * ADD ITEM TO BILL
 ***********************/
function addItem(name, price, id) {
  const qty = parseInt(document.getElementById("qty-" + id).innerText);

  if (!billItems[name]) {
    billItems[name] = { price: price, qty: 0 };
  }

  billItems[name].qty += qty;
  total += price * qty;

  updateBillUI();

  // reset qty
  document.getElementById("qty-" + id).innerText = 1;
}

/***********************
 * UPDATE BILL UI
 ***********************/
function updateBillUI() {
  const billList = document.getElementById("billList");
  billList.innerHTML = "";

  Object.keys(billItems).forEach(name => {
    const item = billItems[name];
    const li = document.createElement("li");
    li.innerText = `${name} × ${item.qty} = ₹${item.price * item.qty}`;
    billList.appendChild(li);
  });

  document.getElementById("total").innerText = total;
}

/***********************
 * CLEAR BILL
 ***********************/
function clearBill() {
  billItems = {};
  total = 0;
  document.getElementById("billList").innerHTML = "";
  document.getElementById("total").innerText = 0;
}

/***********************
 * GOOGLE PAY
 ***********************/
let paymentsClient = null;

function onGooglePayLoaded() {
  paymentsClient = new google.payments.api.PaymentsClient({
    environment: "TEST"
  });
}

function onGooglePayClicked() {
  if (total === 0) {
    alert("Please add items first");
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
      merchantName: "SweetSmart Demo"
    },
    transactionInfo: {
      totalPriceStatus: "FINAL",
      totalPrice: total.toString(),
      currencyCode: "INR"
    }
  };

  paymentsClient.loadPaymentData(paymentDataRequest)
    .then(paymentData => {
      saveOrderToFirebase(paymentData);
    })
    .catch(err => console.log("Payment cancelled", err));
}

/***********************
 * FIREBASE SAVE
 ***********************/
function saveOrderToFirebase(paymentData) {
  firebase.database().ref("orders").push({
    items: billItems,
    totalAmount: total,
    paymentMode: "Google Pay (TEST)",
    paymentToken: paymentData.paymentMethodData.tokenizationData.token,
    time: new Date().toString()
  });

  alert("Payment Successful (TEST MODE)");
  clearBill();
}
