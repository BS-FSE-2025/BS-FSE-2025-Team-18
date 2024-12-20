test('check local storage if it is emoty after no tasks are selected', () => {
    
    localStorage.clear();
  
    
    const tasks = [];
    localStorage.setItem('customerTasks', JSON.stringify(tasks));
  
    // Retrieve the saved tasks
    const savedTasks = JSON.parse(localStorage.getItem('customerTasks'));
  
    // Assert
    expect(savedTasks).toEqual([]); // Ensure it is an empty array
  });