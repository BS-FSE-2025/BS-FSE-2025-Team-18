const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Products Functions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    fetchMock.resetMocks();
    global.localStorage = {
      data: {},
      getItem: function (key) {
        return this.data[key] || null;
      },
      setItem: function (key, value) {
        this.data[key] = value;
      },
      clear: function () {
        this.data = {};
      },
    };
  });

  test('fetchProducts - fetches products successfully', async () => {
    const mockProducts = [
      { _id: '1', name: 'Product 1', category: 'Painting' },
      { _id: '2', name: 'Product 2', category: 'Woodwork' },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockProducts));

    const fetchProducts = async () => {
      const response = await fetch('http://localhost:3000/api/catalog');
      if (!response.ok) throw new Error('Failed to fetch products.');
      return await response.json();
    };

    const products = await fetchProducts();
    expect(products).toEqual(mockProducts);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/catalog');
  });

  test('displayProducts - displays all products correctly', async () => {
    const mockProducts = [
      {
        _id: '1',
        name: 'Product 1',
        category: 'Painting',
        description: 'A great painting product.',
        image: 'img1.png',
        pricePerMeter: 10,
        totalTime: 60,
      },
      {
        _id: '2',
        name: 'Product 2',
        category: 'Woodwork',
        description: 'A great woodwork product.',
        image: 'img2.png',
        pricePerMeter: 20,
        totalTime: 120,
      },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockProducts));

    const mockCatalogDiv = { innerHTML: '' };
    document.getElementById = jest.fn(() => mockCatalogDiv);

    const displayProducts = async (selectedCategory = 'all') => {
      const response = await fetch('http://localhost:3000/api/catalog');
      const catalogItems = await response.json();

      const filteredItems =
        selectedCategory === 'all'
          ? catalogItems
          : catalogItems.filter((item) => item.category === selectedCategory);

      mockCatalogDiv.innerHTML = filteredItems
        .map(
          (item) => `
          <div class="catalog-item">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <p>Price: $${item.pricePerMeter}</p>
          </div>
        `
        )
        .join('');
    };

    await displayProducts('all');

    expect(mockCatalogDiv.innerHTML).toContain('Product 1');
    expect(mockCatalogDiv.innerHTML).toContain('Product 2');
  });

  test('getUnitByCategory - returns correct unit for category', () => {
    const getUnitByCategory = (category) => {
      switch (category) {
        case 'Painting':
          return 'liters';
        case 'Woodwork':
        case 'Flooring':
          return 'm²';
        case 'Lighting':
        case 'Kitchens':
        case 'Outdoor':
          return 'units';
        default:
          return 'm²';
      }
    };

    expect(getUnitByCategory('Painting')).toBe('liters');
    expect(getUnitByCategory('Woodwork')).toBe('m²');
    expect(getUnitByCategory('Lighting')).toBe('units');
    expect(getUnitByCategory('Unknown')).toBe('m²');
  });

  test('addToCart - adds item to cart successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const addToCart = async (productId, pricePerUnit, unit, name, image) => {
      const email = localStorage.getItem('Useremail');
      if (!email) throw new Error('User not logged in.');

      const size = 2; // Mock size input

      const response = await fetch(`http://localhost:3000/api/cart/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          price: pricePerUnit,
          name,
          image,
          quantity: size,
          totalPrice: pricePerUnit * size,
        }),
      });

      if (!response.ok) throw new Error('Failed to add item to cart.');
    };

    localStorage.setItem('Useremail', 'test@example.com');
    await addToCart('12345', 10, 'm²', 'Product 1', 'img1.png');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/cart/test@example.com',
      expect.anything()
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
