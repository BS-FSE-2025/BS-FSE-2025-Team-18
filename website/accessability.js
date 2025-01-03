
let fontSize = 100;

// Increase font size
document.getElementById('increase-font').addEventListener('click', () => {
  if (fontSize < 300) {
    fontSize += 10;
    document.documentElement.style.fontSize = `${fontSize}%`;
  }
});

// Decrease font size
document.getElementById('decrease-font').addEventListener('click', () => {
  if (fontSize > 50) {
    fontSize -= 10;
    document.documentElement.style.fontSize = `${fontSize}%`;
  }
});

// Reset font size
document.getElementById('reset-font').addEventListener('click', () => {
  fontSize = 100;
  document.documentElement.style.fontSize = '100%';
});
