const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('User Profile Functions', () => {
  beforeEach(() => {
    // Reset mocks and localStorage
    fetchMock.resetMocks();
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
  });

  test('Displays user profile information correctly', () => {
    // Set mock data in localStorage
    localStorage.setItem('username', 'TestUser');
    localStorage.setItem('accountType', 'Contractor');
    localStorage.setItem('Useremail', 'test@example.com');

    const mockUsername = { innerText: '' };
    const mockEmail = { innerText: '' };
    const mockAccountType = { innerText: '' };

    document.getElementById = jest.fn((id) => {
      switch (id) {
        case 'username':
          return mockUsername;
        case 'username1':
          return mockUsername;
        case 'email':
          return mockEmail;
        case 'accountType':
          return mockAccountType;
        default:
          return null;
      }
    });

    // Load and display user data
    const username = localStorage.getItem('username') || 'Guest';
    const email = localStorage.getItem('Useremail') || 'Not Available';
    const accountType = localStorage.getItem('accountType') || 'Contractor';

    document.getElementById('username').innerText = username;
    document.getElementById('email').innerText = email;
    document.getElementById('accountType').innerText = accountType;

    expect(mockUsername.innerText).toBe('TestUser');
    expect(mockEmail.innerText).toBe('test@example.com');
    expect(mockAccountType.innerText).toBe('Contractor');
  });

  test('showEditBox - displays edit box with correct field name', () => {
    const mockEditBox = { classList: { remove: jest.fn() } };
    const mockEditFieldName = { innerText: '' };
    const mockEditInput = { value: '' };

    document.getElementById = jest.fn((id) => {
      switch (id) {
        case 'edit-box':
          return mockEditBox;
        case 'edit-field-name':
          return mockEditFieldName;
        case 'edit-input':
          return mockEditInput;
        case 'username':
          return { innerText: 'TestUser' };
        case 'email':
          return { innerText: 'test@example.com' };
        default:
          return null;
      }
    });

    const showEditBox = (field) => {
      document.getElementById('edit-box').classList.remove('hidden');

      const fieldNameMap = { username: 'Username', email: 'Email', password: 'Password' };
      document.getElementById('edit-field-name').innerText = fieldNameMap[field];

      if (field !== 'password') {
        const currentValue = document.getElementById(
          field === 'username' ? 'username' : 'email'
        ).innerText;
        document.getElementById('edit-input').value = currentValue;
      } else {
        document.getElementById('edit-input').value = ''; // סיסמה נשארת ריקה
      }
    };

    showEditBox('email');

    expect(mockEditBox.classList.remove).toHaveBeenCalledWith('hidden');
    expect(mockEditFieldName.innerText).toBe('Email');
    expect(mockEditInput.value).toBe('test@example.com');
  });

  test('updateField - updates user profile field successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const mockEditBox = { classList: { add: jest.fn() } };
    const mockUsername = { innerText: '' };
    const mockEmail = { innerText: '' };

    document.getElementById = jest.fn((id) => {
      switch (id) {
        case 'edit-box':
          return mockEditBox;
        case 'username':
          return mockUsername;
        case 'email':
          return mockEmail;
        case 'edit-input':
          return { value: 'UpdatedUser' };
        default:
          return null;
      }
    });

    const updateField = async () => {
      const newValue = document.getElementById('edit-input').value;
      const currentField = 'username';

      const response = await fetch('/api/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ field: currentField, value: newValue }),
      });

      const result = await response.json();
      if (response.ok) {
        document.getElementById(currentField).innerText = newValue;
        localStorage.setItem(currentField === 'username' ? 'username' : 'Useremail', newValue);
        document.getElementById('edit-box').classList.add('hidden');
      } else {
        throw new Error(result.message || 'Failed to update field');
      }
    };

    localStorage.setItem('token', 'dummy-token');
    await updateField();

    expect(fetchMock).toHaveBeenCalledWith('/api/update', expect.anything());
    expect(mockUsername.innerText).toBe('UpdatedUser');
    expect(localStorage.getItem('username')).toBe('UpdatedUser');
    expect(mockEditBox.classList.add).toHaveBeenCalledWith('hidden');
  });

  test('logout - clears localStorage and redirects', () => {
    localStorage.setItem('username', 'TestUser');
    let redirectUrl = '';

    const logout = () => {
      localStorage.clear();
      redirectUrl = 'login.html';
    };

    logout();

    expect(localStorage.getItem('username')).toBeNull();
    expect(redirectUrl).toBe('login.html');
  });
});