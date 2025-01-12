document.addEventListener('DOMContentLoaded', () => {
    fetchUserCount();  // Fetch the user count
    fetchGalleryCount();  // Fetch the gallery count
    fetchProductCount();
});

// Fetch the user count from the API
async function fetchUserCount() {
    const API_URL = "http://localhost:3000/api/users";
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const userCount = users.length;

        document.getElementById('users-count').textContent = userCount;
    } catch (error) {
        console.error("Error fetching users:", error);
        document.getElementById('users-count').textContent = "Error";
    }
}


async function fetchGalleryCount() {
    const API_URL = "http://localhost:3000/api/gallery"; // Update this URL if needed

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch gallery projects");

        const projects = await response.json();
        const projectsCount = projects.length;

        document.getElementById('gallery-count').textContent = projectsCount;
    } catch (error) {
        console.error("Error fetching gallery projects:", error);
        document.getElementById('gallery-count').textContent = "Error";
    }
}

// Fetch the product count from the API
async function fetchProductCount() {
    const API_URL = "http://localhost:3000/api/catalog"; // Update this URL if needed

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch products");

        const products = await response.json();
        const productsCount = products.length;

        document.getElementById('products-count').textContent = productsCount;
    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById('products-count').textContent = "Error";
    }
}


const username2 = localStorage.getItem("username");
if (username2) {
  document.getElementById("username2").innerText = username2;
}
let subMenu = document.getElementById("subMenu");
function toggleMenu() {
  subMenu.classList.toggle("open-menu");
}