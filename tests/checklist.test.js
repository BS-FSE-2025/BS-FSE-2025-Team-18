test('Does not save anything to localStorage if no tasks are selected', () => {
    document.body.innerHTML = `
      <form id="checklist-form">
        <input type="checkbox" name="tasks[]" value="Task1" />
        <input type="checkbox" name="tasks[]" value="Task2" />
        <button type="submit">Save</button>
      </form>
    `;
    const form = document.getElementById('checklist-form');
    const formData = new FormData(form);
    const tasks = formData.getAll('tasks[]');
    localStorage.setItem('ToDo', JSON.stringify(tasks));

    const savedTasks = JSON.parse(localStorage.getItem('ToDo'));
    expect(savedTasks).toEqual([]);
  });
  