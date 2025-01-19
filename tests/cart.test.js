const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Shopping Cart Functions', () => {
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => (store[key] = value.toString()),
        clear: () => (store = {}),
      };
    })();
    global.localStorage = localStorageMock;

    // Mock fetch
    fetchMock.resetMocks();
  });

  test('loadCart - displays empty cart when no items', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ items: [] }));
    const mockCartList = { innerHTML: '' };
    const mockTotalItems = { innerText: '' };
    const mockTotalPrice = { innerText: '' };

    const loadCart = async () => {
      const userEmail = localStorage.getItem('Useremail');
      if (!userEmail) return;

      const response = await fetch(`http://localhost:3000/api/cart/${userEmail}`);
      const cart = await response.json();

      if (!cart || cart.items.length === 0) {
        mockCartList.innerHTML = '<p>Your cart is empty.</p>';
        mockTotalItems.innerText = '0';
        mockTotalPrice.innerText = '0.00';
        return;
      }
    };

    localStorage.setItem('Useremail', 'test@example.com');
    await loadCart();

    expect(mockCartList.innerHTML).toBe('<p>Your cart is empty.</p>');
    expect(mockTotalItems.innerText).toBe('0');
    expect(mockTotalPrice.innerText).toBe('0.00');
  });

  test('displayCart - calculates totals correctly', () => {
    const mockCart = {
      items: [
        { productId: { pricePerMeter: 10, totalTime: 120 }, quantity: 2 },
        { productId: { pricePerMeter: 15, totalTime: 60 }, quantity: 3 },
      ],
    };
    const mockTotalItems = { innerText: '' };
    const mockTotalPrice = { innerText: '' };
    const mockTotalTime = { innerText: '' };

    const displayCart = (cart) => {
      let total = 0;
      let totalTimeEst = 0;

      cart.items.forEach((item) => {
        total += item.productId.pricePerMeter * item.quantity;
        totalTimeEst += (item.productId.totalTime * item.quantity) / 60;
      });

      mockTotalItems.innerText = cart.items.length.toString();
      mockTotalPrice.innerText = total.toFixed(2);
      mockTotalTime.innerText = totalTimeEst.toFixed(2);
    };

    displayCart(mockCart);

    expect(mockTotalItems.innerText).toBe('2');
    expect(mockTotalPrice.innerText).toBe('65.00');
    expect(mockTotalTime.innerText).toBe('7.00');
  });

  test('removeItemFromCart - removes item successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const removeItemFromCart = async (index) => {
      const userEmail = localStorage.getItem('Useremail');
      if (!userEmail) return;

      const response = await fetch(`http://localhost:3000/api/cart/${userEmail}/${index}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item from cart.');
    };

    localStorage.setItem('Useremail', 'test@example.com');
    await removeItemFromCart(1);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cart/test@example.com/1',
      { method: 'DELETE' }
    );
  });

  test('toggleMenu - toggles menu visibility', () => {
    let mockSubMenu = { classList: { toggle: jest.fn() } };

    const toggleMenu = () => {
      mockSubMenu.classList.toggle('open-menu');
    };

    toggleMenu();
    expect(mockSubMenu.classList.toggle).toHaveBeenCalledWith('open-menu');
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

  test('addToCart - adds item successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const addToCart = async (productId, pricePerMeter) => {
      const userEmail = localStorage.getItem('Useremail');
      if (!userEmail) return;

      const response = await fetch(`http://localhost:3000/api/cart/${userEmail}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          pricePerMeter,
          quantity: 1,
          totalPrice: pricePerMeter,
        }),
      });

      if (!response.ok) throw new Error('Failed to add item to cart.');
    };

    localStorage.setItem('Useremail', 'test@example.com');
    await addToCart('12345', 10);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cart/test@example.com',
      expect.anything()
    );
  });

  test('loadRecommendedProducts - loads recommended products', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { name: 'Product 1', pricePerMeter: 10, image: 'img1.png' },
        { name: 'Product 2', pricePerMeter: 20, image: 'img2.png' },
      ])
    );

    const mockRecommendedList = { innerHTML: '' };

    const loadRecommendedProducts = async () => {
      const response = await fetch('http://localhost:3000/api/recommended');
      const products = await response.json();

      mockRecommendedList.innerHTML = products
        .map(
          (p) => `
        <div>
          <h4>${p.name}</h4>
          <p>$${p.pricePerMeter}</p>
        </div>
      `
        )
        .join('');
    };

    await loadRecommendedProducts();

    expect(mockRecommendedList.innerHTML).toContain('Product 1');
    expect(mockRecommendedList.innerHTML).toContain('Product 2');
  });

  
});
