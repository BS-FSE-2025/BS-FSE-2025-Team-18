document.getElementById('checklist-form').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const tasks1 = formData.getAll('tasks1[]'); // Get all selected checkboxes
  
    // Save tasks to localStorage
    localStorage.setItem('tasks1', JSON.stringify(tasks1));
    console.log('Checklist saved to localStorage:', tasks1);
  
    alert('Checklist saved!');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const tasks1 = JSON.parse(localStorage.getItem('tasks1')) || []; // Retrieve tasks or default to an empty array
  
    console.log('Loading checklist from localStorage:', tasks1);
  
    tasks1.forEach((task1) => {
      const checkbox = document.querySelector(`input[value="${task1}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  });

