let total = 0;
let items = [];

function addItem(name, price) {
  let li = document.createElement("li");
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

function payNow() {
  if (total === 0) {
    alert("Please add items first");
    return;
  }



  firebase.database().ref("orders").push({
    items: items,
    total: total,
    time: new Date().toString()
  });

  let upi = `upi://pay?pa=sweetshop@upi&pn=SweetSmart&am=${total}&cu=INR`;
  window.location.href = upi;
}
