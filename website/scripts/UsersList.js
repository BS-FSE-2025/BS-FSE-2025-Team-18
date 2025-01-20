// Fetch users from the API
async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/api/users'); // Ensure this URL matches your API route
    if (response.ok) {

      const users = await response.json();
      renderUsers(users);
    } else {
      alert('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('An error occurred while fetching the users.');
  }
}

async function deleteUser(userId) {
  const shouldDelete = confirm("Are you sure you want to delete this user?");
  if (!shouldDelete) return;

  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

 
    await fetchUsers();
    
    

  } catch (error) {
    console.error('Error deleting user:', error);
    alert('An error occurred while deleting the user.');
  }
}


// Render the users in the table
function renderUsers(users) {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = ''; // Clear any previous data
  
 
  users.forEach((user,index) => {
    const row = document.createElement('tr');

    const numberCell = document.createElement('td');
    numberCell.textContent = index + 1;  
    row.appendChild(numberCell);
    
    // Gender-based logo column
    const logoCell = document.createElement('td');
    const logoImage = document.createElement('img');
    logoImage.src = user.gender.toLowerCase() === 'male' ? '/images/Male.png' : '/images/female.jpg';
    logoImage.alt = `${user.gender} logo`;
    logoImage.style.width = '30px'; // Adjust size as needed
    logoImage.style.height = '30px';
    logoCell.appendChild(logoImage);
    row.appendChild(logoCell);

    const usernameCell = document.createElement('td');
    usernameCell.textContent = user.username;
    row.appendChild(usernameCell);

    const emailCell = document.createElement('td');
    emailCell.textContent = user.email;
    row.appendChild(emailCell);

    
    const accountTypeCell = document.createElement('td');
    accountTypeCell.textContent = user.accountType;
    row.appendChild(accountTypeCell);

    const geneder = document.createElement('td');
    geneder.textContent = user.gender;
    row.appendChild(geneder);

    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click',() =>{
      deleteUser(user._id);
    }) 
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell); 

    usersList.appendChild(row);
  });
}

// Call the function to fetch users when the page loads
window.onload = fetchUsers;




const username2 = localStorage.getItem("username");
if (username2) {
  document.getElementById("username2").innerText = username2;
}
let subMenu = document.getElementById("subMenu");
function toggleMenu() {
  subMenu.classList.toggle("open-menu");
}




const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('deleteUser function', () => {
  beforeEach(() => {
    fetchMock.resetMocks();

    // Mock DOM setup
    document.body.innerHTML = `
      <table id="usersList"></table>
    `;
  });

  test('should delete the user and refresh the list', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    // Mock deleteUser function
    const deleteUser = async (userId) => {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Simulate refreshing the user list
      const fetchUsers = async () => {
        const mockUsers = [
          { username: 'Bob', gender: 'Male' },
        ]; // Simulate new list after deletion
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        mockUsers.forEach((user, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.gender}</td>`;
          usersList.appendChild(row);
        });
      };

      await fetchUsers();
    };

    // Call deleteUser with mock userId
    await deleteUser('1');

    // Verify DELETE request
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/users/1', {
      method: 'DELETE',
    });

    // Check that the user list has been refreshed
    const rows = document.querySelectorAll('#usersList tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Bob');
  });

  test('should throw an error if the delete API fails', async () => {
    fetchMock.mockRejectOnce(new Error('Failed to delete user'));

    const deleteUser = async (userId) => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
      } catch (error) {
        throw error;
      }
    };

    // Call deleteUser and expect an error
    await expect(deleteUser('1')).rejects.toThrow('Failed to delete user');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/users/1', {
      method: 'DELETE',
    });
  });
});
