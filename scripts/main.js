// Test JavaScript connection
console.log("JavaScript is connected!");

// Example: Add click event to all buttons
const buttons = document.querySelectorAll('.buttons button');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        alert('Button clicked!');
    });
});