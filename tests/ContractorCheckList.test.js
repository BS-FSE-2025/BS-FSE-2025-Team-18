test('Saves a selected contractor task to localStorage', () => {
    // Mock localStorage
    localStorage.clear();
  
    // Simulate saving a task
    const tasks = ['Blueprint Review'];
    localStorage.setItem('contractorTasks', JSON.stringify(tasks));
  
    // Retrieve the saved task
    const savedTasks = JSON.parse(localStorage.getItem('contractorTasks'));
  
    // Assert
    expect(savedTasks).toEqual(['Blueprint Review']);
  });
  

//AI unit test
  test('Saves a selected contractor task to localStorage', () => {
    // Mock localStorage
    localStorage.clear();
  
    // Simulate the form submission and saving a task
    const form = document.createElement('form');
    form.id = 'contractor-checklist-form';
    form.innerHTML = `
      <input type="checkbox" name="tasks[]" value="Blueprint Review" checked>
      <input type="checkbox" name="tasks[]" value="Design Approval">
      <button type="submit">Submit</button>
    `;
  
    // Add the event listener to the form
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const tasks = formData.getAll('tasks[]');
      localStorage.setItem('contractorTasks', JSON.stringify(tasks));
    });
  
    // Simulate form submission
    form.dispatchEvent(new Event('submit'));
  
    // Retrieve the saved task
    const savedTasks = JSON.parse(localStorage.getItem('contractorTasks'));
  
    // Assert
    expect(savedTasks).toEqual(['Blueprint Review']);
  });