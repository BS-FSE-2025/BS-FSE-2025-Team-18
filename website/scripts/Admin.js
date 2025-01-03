const username = localStorage.getItem("username");
const username2 = localStorage.getItem("username");
if (username) {
  document.getElementById("username").innerText = username;
}
if (username2) {
  document.getElementById("username2").innerText = username2;
}

let subMenu = document.getElementById("subMenu");
function toggleMenu() {
  subMenu.classList.toggle("open-menu");
}


document.getElementById("feature").addEventListener("click", (e) => {
  const target = e.target;

  // Check if the clicked element is a feature card
  if (target.classList.contains("feature-card")) {
    const cardId = target.id;
  
  if (cardId === "card1") {
    window.location.href = "UsersList.html";
  } else if (cardId === "card2") {
    window.location.href = "WebsiteStats.html";
  } else if (cardId === "card3") {
    window.location.href = "EditCatalog.html";
  }
}
});


function logout(){
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = '../main_page.html';
}
