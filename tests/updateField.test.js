const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

beforeEach(() => {
    fetchMock.resetMocks();
});

test('updateField updates the field successfully', async () => {
    document.body.innerHTML = `
        <input id="edit-input" value="newUsername" />
        // <div id="username"><div>
    `;
    const currentField = 'username';
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('username', 'oldUsername');

    fetchMock.mockResponseOnce(JSON.stringify({ ok: true }));

    async function updateField() {
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

    await updateField();

    // Validate results
    expect(fetch).toHaveBeenCalledWith('/api/update', expect.any(Object));
    expect(localStorage.getItem('username')).toBe('newUsername');
    expect(document.getElementById('username').innerText).toBe('newUsername');
});




// AI unittest // 
describe('updateField', () => {
    const originalAlert = window.alert; // Store original alert
    const originalConsoleError = console.error; // Store original console.error

    beforeEach(() => {
        // Reset mocks and localStorage before each test
        fetch.mockClear();
        window.alert = jest.fn(); // Mock alert
        console.error = jest.fn(); // Mock console.error
        localStorage.clear(); // Clear localStorage before each test
    });

    afterAll(() => {
        window.alert = originalAlert; // Restore original alert
        console.error = originalConsoleError; // Restore original console.error
    });

    it('should update fields and handle errors correctly', async () => {
        const updateScenarios = [
            {
                field: 'username',
                newValue: 'newUsername',
                expectedAlert: 'username updated successfully!',
                expectedFieldInDOM: 'username',
                expectedLocalStorageKey: 'username'
            },
            {
                field: 'email',
                newValue: 'newEmail@example.com',
                expectedAlert: 'email updated successfully!',
                expectedFieldInDOM: 'email',
                expectedLocalStorageKey: 'Useremail'
            },
            {
                field: 'username',
                newValue: 'someValue',
                expectedAlert: 'Update failed',
                isFailure: true
            },
            {
                field: 'username',
                newValue: 'someValue',
                expectedErrorMessage: 'Error updating field:',
                isNetworkError: true
            }
        ];

        for (const scenario of updateScenarios) {
            // Set up the DOM elements
            document.body.innerHTML = `
                <div id="edit-box">
                    <input id="edit-input" value="${scenario.newValue}" />
                </div>
                ${scenario.field === 'username' ? '<div id="username">oldUsername</div>' : '<div id="email">oldEmail@example.com</div>'}
            `;
            const currentField = scenario.field;

            if (scenario.isFailure) {
                const mockResponse = { ok: false, json: jest.fn().mockResolvedValue({ message: 'Update failed' }) };
                fetch.mockResolvedValue(mockResponse);
            } else if (scenario.isNetworkError) {
                fetch.mockRejectedValue(new Error('Network error'));
            } else {
                const mockResponse = { ok: true, json: jest.fn().mockResolvedValue({}) };
                fetch.mockResolvedValue(mockResponse);
            }

            await updateField.call({ currentField });

            if (scenario.isFailure) {
                expect(window.alert).toHaveBeenCalledWith(scenario.expectedAlert);
            } else if (scenario.isNetworkError) {
                expect(console.error).toHaveBeenCalledWith(scenario.expectedErrorMessage, expect.any(Error));
                expect(window.alert).toHaveBeenCalledWith('An error occurred. Please try again.');
            } else {
                expect(fetch).toHaveBeenCalledWith('/api/update', expect.any(Object));
                expect(window.alert).toHaveBeenCalledWith(scenario.expectedAlert);
                expect(document.getElementById(scenario.expectedFieldInDOM).innerText).toBe(scenario.newValue);
                expect(localStorage.getItem(scenario.expectedLocalStorageKey)).toBe(scenario.newValue);
                expect(document.getElementById('edit-box').classList.contains('hidden')).toBe(true);
            }

            // Reset mocks for the next scenario
            window.alert.mockClear();
            console.error.mockClear();
        }
    });
});



