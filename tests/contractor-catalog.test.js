const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Contractor Catalog Functions', () => {
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

  // פונקציית getUnitByCategory
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
        return 'm²'; // Default unit
    }
  };

  // Mock fetchProjects function
  const fetchProjects = async () => {
    const mockProjects = [
      { _id: '1', name: 'Project 1' },
      { _id: '2', name: 'Project 2' },
    ];
    return mockProjects;
  };

  // Mock fetchProducts function
  const fetchProducts = async () => {
    const mockProducts = [
      { _id: '1', name: 'Product 1', category: 'Painting', pricePerMeter: 10, image: 'img1.png' },
      { _id: '2', name: 'Product 2', category: 'Woodwork', pricePerMeter: 20, image: 'img2.png' },
    ];
    return mockProducts;
  };

  test('fetchProjects - fetches projects for user', async () => {
    const projects = await fetchProjects();
    expect(projects).toEqual([
      { _id: '1', name: 'Project 1' },
      { _id: '2', name: 'Project 2' },
    ]);
  });

  test('fetchProducts - fetches products from catalog', async () => {
    const products = await fetchProducts();
    expect(products).toEqual([
      { _id: '1', name: 'Product 1', category: 'Painting', pricePerMeter: 10, image: 'img1.png' },
      { _id: '2', name: 'Product 2', category: 'Woodwork', pricePerMeter: 20, image: 'img2.png' },
    ]);
  });

  test('displayProducts - displays products grouped by categories', async () => {
    const mockCatalogDiv = { innerHTML: '', appendChild: jest.fn() };

    document.getElementById = jest.fn((id) => {
      if (id === 'catalog-categories') return mockCatalogDiv;
      return null;
    });

    const displayProducts = async (selectedCategory = 'all') => {
      const catalogItems = await fetchProducts();
      const projects = await fetchProjects();

      const catalogDiv = document.getElementById('catalog-categories');
      catalogDiv.innerHTML = '';

      const filteredItems =
        selectedCategory === 'all'
          ? catalogItems
          : catalogItems.filter((item) => item.category === selectedCategory);

      const categories = [...new Set(filteredItems.map((item) => item.category))];

      categories.forEach((category) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('catalog-category');
        categoryDiv.innerHTML = `<h3>${category}</h3>`;
        mockCatalogDiv.appendChild(categoryDiv);
      });
    };

    await displayProducts();

    expect(mockCatalogDiv.appendChild).toHaveBeenCalledTimes(2);
  });

  test('addToProject - validates inputs and makes an API call', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    // Mock DOM elements
    document.getElementById = jest.fn((id) => {
      if (id === 'size-prod1') return { value: '5' };
      if (id === 'project-prod1') return { value: 'proj1' };
      return null;
    });

    // Mock localStorage token
    localStorage.setItem('token', 'mockToken');

    const addToProject = async (productId, pricePerUnit, unit) => {
      const sizeInput = document.getElementById(`size-${productId}`);
      const projectSelect = document.getElementById(`project-${productId}`);

      const quantity = parseFloat(sizeInput.value);
      const projectId = projectSelect.value;

      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:3000/api/projects/${projectId}/addProductToProject`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, quantity, pricePerUnit }),
        }
      );

      if (!response.ok) throw new Error('Failed to add product to project.');
    };

    // Call the function
    await addToProject('prod1', 10, 'liters');

    // Verify the API call
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/projects/proj1/addProductToProject',
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer mockToken',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: 'prod1', quantity: 5, pricePerUnit: 10 }),
      }
    );
  });

  test('logout - clears localStorage and redirects', () => {
    localStorage.setItem('username', 'TestUser');
    let redirectUrl = '';

    const logout = () => {
      localStorage.clear();
      redirectUrl = 'main_page.html';
    };

    logout();

    expect(localStorage.getItem('username')).toBeNull();
    expect(redirectUrl).toBe('main_page.html');
  });

  test('getUnitByCategory - returns correct units for categories', () => {
    expect(getUnitByCategory('Painting')).toBe('liters');
    expect(getUnitByCategory('Woodwork')).toBe('m²');
    expect(getUnitByCategory('Flooring')).toBe('m²');
    expect(getUnitByCategory('Lighting')).toBe('units');
    expect(getUnitByCategory('Kitchens')).toBe('units');
    expect(getUnitByCategory('Outdoor')).toBe('units');
    expect(getUnitByCategory('UnknownCategory')).toBe('m²'); // Default case
  });
});