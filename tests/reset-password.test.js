describe('Reset Password Page Functions', () => {
  let fetchMock;
  let alertMock;
  let consoleErrorMock;

  beforeEach(() => {
    // Mock fetch and alert
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    alertMock = jest.fn();
    global.alert = alertMock;

    // Mock console.error
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock window.location
    delete window.location;
    window.location = { href: '' };

    // Set up the DOM
    document.body.innerHTML = `
      <div class="background-container">
        <div class="centered-container">
          <h2>Reset Your Password</h2>
          <p>Please enter a new password to reset your account.</p>
          <form id="resetPasswordForm">
            <input type="password" id="newPassword" placeholder="Enter new password" required>
            <button type="submit">Reset Password</button>
          </form>
        </div>
      </div>
    `;

    // Embed the script logic
    const urlParams = new URLSearchParams('?token=mockToken123');
    const token = urlParams.get('token');

    document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('newPassword').value;

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        });

        if (response.ok) {
          alert('Password reset successful! You can now log in.');
          window.location.href = '/login.html';
        } else {
          const error = await response.json();
          alert('Error: ' + error.message);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Successful password reset', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');

    newPasswordInput.value = 'newStrongPassword';
    form.dispatchEvent(new Event('submit'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'mockToken123', newPassword: 'newStrongPassword' }),
    });

    expect(alertMock).toHaveBeenCalledWith('Password reset successful! You can now log in.');
    expect(window.location.href).toBe('/login.html');
  });

  test('Password reset with invalid token', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Invalid token' }),
    });

    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');

    newPasswordInput.value = 'newStrongPassword';
    form.dispatchEvent(new Event('submit'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'mockToken123', newPassword: 'newStrongPassword' }),
    });

    expect(alertMock).toHaveBeenCalledWith('Error: Invalid token');
  });

  test('Password reset with network error', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const form = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');

    newPasswordInput.value = 'newStrongPassword';
    form.dispatchEvent(new Event('submit'));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'mockToken123', newPassword: 'newStrongPassword' }),
    });

    expect(consoleErrorMock).toHaveBeenCalledWith('Error:', expect.any(Error));
  });
});
