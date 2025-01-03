document.getElementById('checklist-form').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const tasks = formData.getAll('tasks[]'); // Get all selected checkboxes
  
    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log('Checklist saved to localStorage:', tasks);
  
    alert('Checklist saved!');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Retrieve tasks or default to an empty array
  
    console.log('Loading checklist from localStorage:', tasks);
  
    tasks.forEach((task) => {
      const checkbox = document.querySelector(`input[value="${task}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  });

