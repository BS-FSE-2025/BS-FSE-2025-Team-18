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

    // Mock fetchUsers function
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
});
