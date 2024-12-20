test('check local storage if it is emoty after no tasks are selected', () => {
    
    localStorage.clear();
  
    
    const tasks = [];
    localStorage.setItem('customerTasks', JSON.stringify(tasks));
  
    // Retrieve the saved tasks
    const savedTasks = JSON.parse(localStorage.getItem('customerTasks'));
  
    // Assert
    expect(savedTasks).toEqual([]); // Ensure it is an empty array
  });






  //Ai - Claude.ai Unit Test:
  test('should save empty array when no tasks are checked', () => {
    // Arrange
    const form = document.getElementById('checklist-form');
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    
    // Explicitly ensure no checkboxes are checked
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  
    // Act
    form.dispatchEvent(new Event('submit'));
  
    // Assert
    // Verify localStorage receives empty array
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'tasks',
      JSON.stringify([])
    );
    
    // Verify console.log shows empty array
    expect(console.log).toHaveBeenCalledWith(
      'Checklist saved to localStorage:',
      []
    );
    
    // Verify FormData returns empty array
    const formData = new FormData(form);
    expect(Array.from(formData.getAll('tasks[]'))).toHaveLength(0);
    
    // Verify alert is still shown
    expect(alertMock).toHaveBeenCalledWith('Checklist saved!');
  });