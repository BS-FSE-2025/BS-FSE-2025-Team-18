const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Contractor Sign-Up Page', () => {
  let alertMock;

  beforeEach(() => {
    // Set up the DOM structure
    document.body.innerHTML = `
      <form id="contractorSignupForm">
        <input type="text" id="signupUsername" />
        <input type="email" id="signupEmail" />
        <input type="password" id="signupPassword" />
        <div>
          <input type="radio" id="male" name="gender" value="Male" />
          <label for="male">Male</label>
          <input type="radio" id="female" name="gender" value="Female" />
          <label for="female">Female</label>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    `;
    fetchMock.resetMocks();
    localStorage.clear();

    // Mock the alert function
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Reattach the event listener
    document.getElementById('contractorSignupForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const gender = document.querySelector('input[name="gender"]:checked').value;
      localStorage.setItem('gender', gender);

      const response = await fetch('/api/auth/signup/contractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, gender }),
      });

      if (response.ok) {
        alert('Contractor account created successfully!');
        window.location.href = 'login.html';
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle form submission and send correct data', async () => {
    // Mock the response
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Success' }), { status: 200 });

    // Populate the form
    document.getElementById('signupUsername').value = 'testuser';
    document.getElementById('signupEmail').value = 'testuser@example.com';
    document.getElementById('signupPassword').value = 'password123';
    document.getElementById('male').checked = true;

    // Mock window.location.href
    delete global.window.location;
    global.window.location = { href: '' };

    const form = document.getElementById('contractorSignupForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Wait for asynchronous operations
    await new Promise(process.nextTick);

    // Check the fetch call
    expect(fetch).toHaveBeenCalledWith('/api/auth/signup/contractor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        gender: 'Male',
      }),
    });

    // Check that localStorage was updated
    expect(localStorage.getItem('gender')).toBe('Male');

    // Check that window location was updated
    expect(window.location.href).toBe('login.html');

    // Check that the alert was called
    expect(alertMock).toHaveBeenCalledWith('Contractor account created successfully!');
  });

  test('should handle errors gracefully', async () => {
    // Mock the response with an error
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Email already exists' }), { status: 400 });

    // Populate the form
    document.getElementById('signupUsername').value = 'testuser';
    document.getElementById('signupEmail').value = 'existinguser@example.com';
    document.getElementById('signupPassword').value = 'password123';
    document.getElementById('female').checked = true;

    const form = document.getElementById('contractorSignupForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Wait for asynchronous operations
    await new Promise(process.nextTick);

    // Check the fetch call
    expect(fetch).toHaveBeenCalledWith('/api/auth/signup/contractor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'existinguser@example.com',
        password: 'password123',
        gender: 'Female',
      }),
    });

    // Check that an error alert was shown
    expect(alertMock).toHaveBeenCalledWith('Error: Email already exists');
  });
});
