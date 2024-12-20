
document.getElementById('contractor-checklist-form').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const tasks = formData.getAll('tasks[]'); // Get all selected checkboxes
  
    // Save tasks to localStorage under a contractor-specific key
    localStorage.setItem('contractorTasks', JSON.stringify(tasks));
    console.log('Contractor checklist saved to localStorage:', tasks);
  
    alert('Contractor checklist saved!');
  });
  
  // Load contractor tasks from localStorage when the page loads
  document.addEventListener('DOMContentLoaded', () => {
    const tasks = JSON.parse(localStorage.getItem('contractorTasks')) || []; // Retrieve tasks or default to an empty array
  
    console.log('Loading contractor checklist from localStorage:', tasks);
  
    tasks.forEach((task) => {
      const checkbox = document.querySelector(`input[value="${task}"]`);
      if (checkbox) {
        checkbox.checked = true;
      }
    });
  });
  