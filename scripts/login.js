// Select the form and input fields
const loginForm = document.getElementById("loginform");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

// Listen for the form submission event
loginForm.addEventListener("submit", function (event) {
  // Prevent the form from submitting normally
  event.preventDefault();

  // Get input values
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Validate inputs
  if (username === "") {
    alert("Username cannot be empty.");
    usernameInput.focus(); // Focus on the username field
    return;
  }

  if (password === "") {
    alert("Password cannot be empty.");
    passwordInput.focus(); // Focus on the password field
    return;
  }

  // Example of basic validation logic
  if (username === "admin" && password === "12345") {
    alert("Login successful!");
    // Redirect or perform other actions
    window.location.href = "/main.html";
  } else {
    alert("Invalid username or password.");
  }
});
