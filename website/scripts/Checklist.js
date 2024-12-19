function addRow(){
    const checklist = document.getElementById('checklist');

    const row = document.createElement('tr');

    const numberCell = document.createElement('td');
    numberCell.textContent = checklist.rows.length+1; // Update number based on current row count
    row.appendChild(numberCell);


    const todoCell = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter item name';
    todoCell.appendChild(input);
    row.appendChild(todoCell);


    // Create a cell for the checkbox
    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkboxCell.appendChild(checkbox);
    row.appendChild(checkboxCell);

    // Create a cell for notes
    const notesCell = document.createElement('td');
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Add note!';
    notesCell.appendChild(textarea);
    row.appendChild(notesCell);

    // Create a cell for the "Remove" button
    const actionCell = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = () => row.remove(); // Remove row when clicked
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);


     // Append the new row to the table
     checklist.appendChild(row);
 }
 
 // Add event listener to the "Add Row" button
 document.getElementById('addbtn').addEventListener('click',addRow);
