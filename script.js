let total = 0;
let items = [];

/* BILL LOGIC */
function addItem(name, price) {
  const li = document.createElement("li");
  li.textContent = `${name} - ₹${price}`;
  document.getElementById("billList").appendChild(li);

  total += price;
  items.push(name);
  document.getElementById("total").innerText = total;
}

function clearBill() {
  document.getElementById("billList").innerHTML = "";
  total = 0;
  items = [];
  document.getElementById("total").innerText = total;
}

/* GOOGLE PAY */
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

/* FIREBASE SAVE */
function saveOrderToFirebase(paymentData) {
  firebase.database().ref("orders").push({
    items: items,
    totalAmount: total,
    paymentMode: "Google Pay (TEST)",
    paymentToken: paymentData.paymentMethodData.tokenizationData.token,
    time: new Date().toString()
  });

  alert("Payment Successful (TEST MODE)");
  clearBill();
}
