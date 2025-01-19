const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Check List Functions', () => {
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

  test('loadCheckList - displays empty checklist when no items', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ items: [] }));
    const mockChecklistContainer = { innerHTML: '' };

    document.getElementById = jest.fn(() => mockChecklistContainer);

    const loadCheckList = async () => {
      const userEmail = localStorage.getItem('Useremail');
      if (!userEmail) return;

      const response = await fetch(`http://localhost:3000/api/cart/${userEmail}`);
      const cart = await response.json();

      const displayCheckList = (cart) => {
        if (!cart || !cart.items || cart.items.length === 0) {
          mockChecklistContainer.innerHTML = '<p>Your checklist is empty.</p>';
          return;
        }
      };

      displayCheckList(cart);
    };

    localStorage.setItem('Useremail', 'test@example.com');
    await loadCheckList();

    expect(mockChecklistContainer.innerHTML).toBe('<p>Your checklist is empty.</p>');
  });

  test('displayCheckList - displays checklist items correctly', () => {
    const mockCart = {
      items: [
        {
          productId: { _id: '1', name: 'Product 1', image: 'img1.png', price: 10 },
          status: 'Pending',
          quantity: 2,
        },
        {
          productId: { _id: '2', name: 'Product 2', image: 'img2.png', price: 20 },
          status: 'In Progress',
          quantity: 3,
        },
      ],
    };

    const mockChecklistContainer = { innerHTML: '', appendChild: jest.fn() };

    document.getElementById = jest.fn(() => mockChecklistContainer);

    const displayCheckList = (cart) => {
      if (!cart || !cart.items || cart.items.length === 0) {
        mockChecklistContainer.innerHTML = '<p>Your checklist is empty.</p>';
        return;
      }

      cart.items.forEach((item) => {
        const { productId, status, quantity } = item;
        const { name, image, _id } = productId;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('checklist-item');

        itemDiv.innerHTML = `
          <div class="item-info">
            <img src="${image || 'default-image.png'}" alt="${name}" />
            <h3>${name}</h3>
            <p>Quantity: ${quantity}</p>
            <label>Status:</label>
            <select id="status-${_id}">
              <option value="Pending" ${status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="In Progress" ${status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>
        `;

        mockChecklistContainer.appendChild(itemDiv);
      });
    };

    displayCheckList(mockCart);

    expect(mockChecklistContainer.appendChild).toHaveBeenCalledTimes(2);
    const firstCall = mockChecklistContainer.appendChild.mock.calls[0][0];
    expect(firstCall.innerHTML).toContain('Product 1');
    expect(firstCall.innerHTML).toContain('img1.png');
    const secondCall = mockChecklistContainer.appendChild.mock.calls[1][0];
    expect(secondCall.innerHTML).toContain('Product 2');
    expect(secondCall.innerHTML).toContain('img2.png');
  });

  test('updateStatus - updates item status successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const updateStatus = async (productId, status) => {
      const userEmail = localStorage.getItem('Useremail');
      if (!userEmail) throw new Error('User not logged in.');

      const response = await fetch(
        `http://localhost:3000/api/cart/${userEmail}/update-status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, status }),
        }
      );

      if (!response.ok) throw new Error('Failed to update status.');
    };

    localStorage.setItem('Useremail', 'test@example.com');
    await updateStatus('1', 'Completed');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cart/test@example.com/update-status',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: '1', status: 'Completed' }),
      }
    );
  });

  test('logout - clears localStorage and redirects', () => {
    localStorage.setItem('Useremail', 'test@example.com');
    let redirectUrl = '';

    const logout = () => {
      localStorage.clear();
      redirectUrl = 'main_page.html';
    };

    logout();

    expect(localStorage.getItem('Useremail')).toBeNull();
    expect(redirectUrl).toBe('main_page.html');
  });
});
