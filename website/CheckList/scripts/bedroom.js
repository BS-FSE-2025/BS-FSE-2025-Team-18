document.getElementById('checklist-form').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const tasks2 = formData.getAll('tasks2[]'); // Get all selected checkboxes
  
    // Save tasks to localStorage
    localStorage.setItem('tasks2', JSON.stringify(tasks2));
    console.log('Checklist saved to localStorage:', tasks2);
  
    alert('Checklist saved!');
  });

  document.addEventListener('DOMContentLoaded', () => {
    const tasks2 = JSON.parse(localStorage.getItem('tasks2')) || []; // Retrieve tasks or default to an empty array
  
    console.log('Loading checklist from localStorage:', tasks2);
  
    tasks2.forEach((task2) => {
      const checkbox = document.querySelector(`input[value="${task2}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  });

