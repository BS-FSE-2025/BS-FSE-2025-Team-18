require('jest-fetch-mock').enableMocks();

describe('Login Page Functions', () => {
  beforeEach(() => {
    fetch.resetMocks();

    // Mock localStorage
    global.localStorage = {
      data: {},
      getItem: function (key) {
        return this.data[key] || null;
      },
      setItem: function (key, value) {
        this.data[key] = value.toString();
      },
      clear: function () {
        this.data = {};
      },
    };

    // Mock the DOM structure
    document.body.innerHTML = `
      <form id="loginForm">
        <input type="email" id="loginEmail" />
        <input type="password" id="loginPassword" />
        <button type="submit" id="loginButton">Log in</button>
      </form>
    `;

    // Mock window.location.href
    delete global.window.location;
    global.window.location = {
      href: '',
    };

    // Add event listener from the script
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.toLowerCase();
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const { token, accountType, username } = await response.json();
          localStorage.setItem('token', token);
          localStorage.setItem('username', username);
          localStorage.setItem('Useremail', email);

          if (accountType === 'Customer') {
            window.location.href = 'homepage-customer.html';
          } else if (accountType === 'Contractor') {
            window.location.href = 'homepage-contractor.html';
          } else if (accountType === 'Admin') {
            window.location.href = 'Admin.html';
          }
        } else {
          const errorMessage = await response.text();
          alert('Error: ' + errorMessage);
        }
      } catch (err) {
        alert('An error occurred while logging in.');
      }
    });
  });

  test('Successful login as Customer', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({ token: 'mockToken', accountType: 'Customer', username: 'TestUser' })
    );

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    const form = document.getElementById('loginForm');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async actions

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });
    expect(localStorage.getItem('token')).toBe('mockToken');
    expect(localStorage.getItem('username')).toBe('TestUser');
    expect(localStorage.getItem('Useremail')).toBe('test@example.com');
    expect(window.location.href).toBe('homepage-customer.html');
  });

  test('Login failure - invalid credentials', async () => {
    fetch.mockResponseOnce('Invalid credentials', { status: 401 });

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    emailInput.value = 'invalid@example.com';
    passwordInput.value = 'wrongpassword';

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const form = document.getElementById('loginForm');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async actions

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid@example.com', password: 'wrongpassword' }),
    });
    expect(alertMock).toHaveBeenCalledWith('Error: Invalid credentials');
    alertMock.mockRestore();
  });

  test('Login failure - server error', async () => {
    fetch.mockRejectOnce(new Error('Server error'));

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    emailInput.value = 'error@example.com';
    passwordInput.value = 'password123';

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const form = document.getElementById('loginForm');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async actions

    expect(alertMock).toHaveBeenCalledWith('An error occurred while logging in.');
    alertMock.mockRestore();
  });
});
