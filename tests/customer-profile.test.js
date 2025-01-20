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

  test('fetchUserProfile - fetches user profile data successfully', async () => {
    const mockProfileData = {
      username: 'TestUser',
      email: 'test@example.com',
      accountType: 'Customer',
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockProfileData));

    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    };

    localStorage.setItem('token', 'dummy-token');
    const profileData = await fetchUserProfile();

    expect(profileData).toEqual(mockProfileData);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer dummy-token',
        'Content-Type': 'application/json',
      },
    });
  });

  test('Displays user profile information correctly', () => {
    localStorage.setItem('username', 'TestUser');
    localStorage.setItem('Useremail', 'test@example.com');
    localStorage.setItem('accountType', 'Customer');

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

    const username = localStorage.getItem('username') || 'Guest';
    const email = localStorage.getItem('Useremail') || 'Not Available';
    const accountType = localStorage.getItem('accountType') || 'Customer';

    document.getElementById('username').innerText = username;
    document.getElementById('email').innerText = email;
    document.getElementById('accountType').innerText = accountType;

    expect(mockUsername.innerText).toBe('TestUser');
    expect(mockEmail.innerText).toBe('test@example.com');
    expect(mockAccountType.innerText).toBe('Customer');
  });

  test('showEditBox - displays edit box with correct field', () => {
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
      document.getElementById('edit-input').value =
        field !== 'password'
          ? document.getElementById(field).innerText
          : '';
    };

    showEditBox('email');

    expect(mockEditBox.classList.remove).toHaveBeenCalledWith('hidden');
    expect(mockEditFieldName.innerText).toBe('Email');
    expect(mockEditInput.value).toBe('test@example.com');
  });

  test('updateUserData - updates user data successfully', async () => {
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

    const updateUserData = async () => {
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
        localStorage.setItem(currentField, newValue);
        document.getElementById('edit-box').classList.add('hidden');
      } else {
        throw new Error(result.message || 'Failed to update field');
      }
    };

    localStorage.setItem('token', 'dummy-token');
    await updateUserData();

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