const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('fetchUsers function', () => {
  beforeEach(() => {
    fetchMock.resetMocks();

    // Mock DOM setup
    document.body.innerHTML = `
      <table id="usersList"></table>
    `;
  });

  test('should fetch users and display them correctly', async () => {
    const mockUsers = [
      { username: 'Alice', gender: 'Female' },
      { username: 'Bob', gender: 'Male' },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockUsers));

    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3000/api/users');
      const users = await response.json();
      const usersList = document.getElementById('usersList');
      usersList.innerHTML = '';

      users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.gender}</td>`;
        usersList.appendChild(row);
      });
    };

    await fetchUsers();

    const rows = document.querySelectorAll('#usersList tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[1].textContent).toContain('Bob');
  });

  test('should handle an empty user list', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([]));

    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3000/api/users');
      const users = await response.json();
      const usersList = document.getElementById('usersList');
      usersList.innerHTML = '';

      users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.gender}</td>`;
        usersList.appendChild(row);
      });
    };

    await fetchUsers();

    const rows = document.querySelectorAll('#usersList tr');
    expect(rows.length).toBe(0);
  });

  test('should throw an error if API response fails', async () => {
    fetchMock.mockRejectOnce(new Error('Failed to fetch users'));

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
      } catch (error) {
        throw error;
      }
    };

    await expect(fetchUsers()).rejects.toThrow('Failed to fetch users');
  });

  test('should handle missing table element', async () => {
    document.body.innerHTML = ''; // Remove table element

    const mockUsers = [{ username: 'Alice', gender: 'Female' }];
    fetchMock.mockResponseOnce(JSON.stringify(mockUsers));

    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3000/api/users');
      const users = await response.json();
      const usersList = document.getElementById('usersList');
      if (!usersList) return; // Gracefully handle missing table

      usersList.innerHTML = '';
      users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${user.username}</td><td>${user.gender}</td>`;
        usersList.appendChild(row);
      });
    };

    await fetchUsers();

    const rows = document.querySelectorAll('#usersList tr');
    expect(rows.length).toBe(0); // No rows should be added
  });

  test('should handle non-JSON API response', async () => {
    fetchMock.mockResponseOnce('Not JSON', { status: 200 });

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        await response.json(); // This will throw an error
      } catch (error) {
        throw error;
      }
    };

    await expect(fetchUsers()).rejects.toThrow();
  });





  test('should delete a user and refresh the list', async () => {
    // Mock initial user data
    const mockUsers = [
      { _id: '1', username: 'Alice', email: 'alice@example.com', accountType: 'Admin', gender: 'Female' },
      { _id: '2', username: 'Bob', email: 'bob@example.com', accountType: 'User', gender: 'Male' },
    ];

    fetchMock.mockResponses(
      [JSON.stringify(mockUsers), { status: 200 }], // Initial fetch
      [JSON.stringify({ success: true }), { status: 200 }], // Delete request
      [JSON.stringify([mockUsers[1]]), { status: 200 }] // Fetch after delete
    );

    // Mock fetchUsers function
    const fetchUsers = async () => {
      const response = await fetch('http://localhost:3000/api/users');
      const users = await response.json();
      const usersList = document.getElementById('usersList');
      usersList.innerHTML = ''; // Clear previous content

      users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-user-id', user._id);

        row.innerHTML = `
          <td>${index + 1}</td>
          <td><img src="../images/avatar-logo.jpg" alt="User Logo"></td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.accountType}</td>
          <td>${user.gender}</td>
          <td><button class="delete-btn">Delete</button></td>
        `;

        row.querySelector('.delete-btn').addEventListener('click', () => deleteUser(user._id));
        usersList.appendChild(row);
      });
    };

    // Mock deleteUser function
    const deleteUser = async (userId) => {
      try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete user');
        await fetchUsers(); // Refresh user list
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    };

    // Initial fetch to populate the table
    await fetchUsers();

    // Verify the table initially contains two users
    let rows = document.querySelectorAll('#usersList tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[1].textContent).toContain('Bob');

    // Simulate deleting the first user
    await deleteUser('1');

    // Verify the table contains one user after deletion
    rows = document.querySelectorAll('#usersList tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Bob');
  });
});
