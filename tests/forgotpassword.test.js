const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Forgot Password Page Functions', () => {
  beforeEach(() => {
    fetchMock.resetMocks();

    // Mock alert function
    global.alert = jest.fn();
  });

  test('Successful forgot password request', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

    // Simulate form submission
    const mockEmail = 'test@example.com';

    // Mock the input element and simulate user input
    document.body.innerHTML = `
      <form id="forgotPasswordForm">
        <input type="email" id="email" />
        <button type="submit">Send Reset Email</button>
      </form>
    `;
    document.getElementById('email').value = mockEmail;

    const form = document.getElementById('forgotPasswordForm');
    const submitEvent = new Event('submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert('A reset link has been sent to your email!');
        } else {
          const error = await response.json();
          alert('Error: ' + error.message);
        }
      } catch (err) {
        console.error('Error:', err);
        alert('An error occurred.');
      }
    });

    form.dispatchEvent(submitEvent);

    // Assertions
    await new Promise((r) => setTimeout(r, 0)); // Wait for async actions
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mockEmail }),
    });
    expect(alert).toHaveBeenCalledWith('A reset link has been sent to your email!');
  });

  test('Forgot password request with server error', async () => {
    const mockErrorMessage = 'User not found';
    fetchMock.mockResponseOnce(
      JSON.stringify({ message: mockErrorMessage }),
      { status: 400 }
    );

    // Simulate form submission
    const mockEmail = 'nonexistent@example.com';

    // Mock the input element and simulate user input
    document.body.innerHTML = `
      <form id="forgotPasswordForm">
        <input type="email" id="email" />
        <button type="submit">Send Reset Email</button>
      </form>
    `;
    document.getElementById('email').value = mockEmail;

    const form = document.getElementById('forgotPasswordForm');
    const submitEvent = new Event('submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert('A reset link has been sent to your email!');
        } else {
          const error = await response.json();
          alert('Error: ' + error.message);
        }
      } catch (err) {
        console.error('Error:', err);
        alert('An error occurred.');
      }
    });

    form.dispatchEvent(submitEvent);

    // Assertions
    await new Promise((r) => setTimeout(r, 0)); // Wait for async actions
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mockEmail }),
    });
    expect(alert).toHaveBeenCalledWith('Error: ' + mockErrorMessage);
  });

  test('Forgot password request with network error', async () => {
    fetchMock.mockReject(new Error('Network error'));

    // Simulate form submission
    const mockEmail = 'test@example.com';

    // Mock the input element and simulate user input
    document.body.innerHTML = `
      <form id="forgotPasswordForm">
        <input type="email" id="email" />
        <button type="submit">Send Reset Email</button>
      </form>
    `;
    document.getElementById('email').value = mockEmail;

    const form = document.getElementById('forgotPasswordForm');
    const submitEvent = new Event('submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          alert('A reset link has been sent to your email!');
        } else {
          const error = await response.json();
          alert('Error: ' + error.message);
        }
      } catch (err) {
        alert('An error occurred.');
      }
    });

    form.dispatchEvent(submitEvent);

    // Assertions
    await new Promise((r) => setTimeout(r, 0)); // Wait for async actions
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mockEmail }),
    });
    expect(alert).toHaveBeenCalledWith('An error occurred.');
  });
});
