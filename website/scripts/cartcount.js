function updateCartCount() {
    const userEmail = localStorage.getItem("Useremail");
  
    if (!userEmail) {
      document.getElementById("cart-count").innerText = "0";
      return;
    }
  
    fetch(`http://localhost:3000/api/cart/${userEmail}`)
      .then((response) => response.json())
      .then((cart) => {
        const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        document.getElementById("cart-count").innerText = itemCount;
      })
      .catch((error) => {
        console.error("Error fetching cart count:", error);
        document.getElementById("cart-count").innerText = "0";
      });
  }
  
  // Update the cart count on page load
  document.addEventListener("DOMContentLoaded", updateCartCount);
  
  module.exports = { updateCartCount };
