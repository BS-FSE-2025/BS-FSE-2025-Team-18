
//בדיקת יחידה ידנית 
const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();
});

test('updateUserData updates the field successfully', async () => {
    document.body.innerHTML = `
        <input id="edit-input" value="newUsername" />
        <div id="username"></div>
    `;
    const currentField = 'username';
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('username', 'oldUsername');

    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));

    async function updateUserData() {
        const newValue = document.getElementById('edit-input').value;

        try {
            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ field: currentField, value: newValue }),
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById(currentField).innerText = newValue;
                localStorage.setItem(currentField, newValue);
            } else {
                alert(result.message || 'Failed to update field');
            }
        } catch (error) {
            console.error('Error updating field:', error);
        }
    }

    await updateUserData();

    // Validate results
    expect(fetch).toHaveBeenCalledWith('/api/update', expect.any(Object));
    expect(localStorage.getItem('username')).toBe('newUsername');
    expect(document.getElementById('username').innerText).toBe('newUsername');
});











// fine Ai coding
beforeEach(() => {
    fetchMock.resetMocks();
    // Clear localStorage before each test
    localStorage.clear();
});

test('updateUserData updates the field successfully', async () => {
    document.body.innerHTML = `
        <input id="edit-input" value="newUsername" />
        <div id="username"></div>
    `;
    const currentField = 'username';
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('username', 'oldUsername');

    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));

    // Call your existing updateUserData function
    await updateUserData();

    // Validate results
    expect(fetch).toHaveBeenCalledWith('/api/update', expect.objectContaining({
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer dummy-token`,
        },
        body: JSON.stringify({ field: currentField, value: 'newUsername' }),
    }));
    expect(localStorage.getItem('username')).toBe('newUsername');
    expect(document.getElementById('username').innerText).toBe('newUsername');
});




















