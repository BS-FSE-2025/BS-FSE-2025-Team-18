const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('My Works Functions', () => {
  beforeEach(() => {
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

    document.body.innerHTML = `
      <div id="worksContainer"></div>
    `;
  });

  test('loadMyWorks - displays works correctly', async () => {
    const mockWorks = [
      {
        _id: '1',
        name: 'Project 1',
        description: 'Description 1',
        image: 'img1.png',
        products: [
          { name: 'Product 1', price: 10, quantity: 2, image: 'prod1.png' },
          { name: 'Product 2', price: 20, quantity: 1, image: 'prod2.png' },
        ],
      },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockWorks));

    const loadMyWorks = async () => {
      const email = 'test@example.com';
      const response = await fetch(`/api/myworks/${email}`);
      const works = await response.json();

      const container = document.getElementById('worksContainer');
      container.innerHTML = '';

      works.forEach((work) => {
        const workDiv = document.createElement('div');
        workDiv.classList.add('work-card');

        let totalCost = 0;

        const productsHTML = work.products
          .map((product) => {
            const productTotal = product.price * product.quantity;
            totalCost += productTotal;
            return `
              <li>
                <img src="${product.image}" alt="${product.name}">
                <div class="product-details">
                  <p><strong>Name:</strong> ${product.name}</p>
                  <p><strong>Quantity:</strong> ${product.quantity}</p>
                  <p><strong>Price:</strong> $${product.price}</p>
                  <p><strong>Total:</strong> $${productTotal.toFixed(2)}</p>
                </div>
              </li>`;
          })
          .join('');

        workDiv.innerHTML = `
          <img src="${work.image}" alt="${work.name}">
          <h3>${work.name}</h3>
          <p>${work.description}</p>
          <div class="products-container">
            <h4>Products:</h4>
            <ul>${productsHTML}</ul>
            <p class="total-cost"><strong>Total Project Cost:</strong> $${totalCost.toFixed(2)}</p>
          </div>
        `;

        container.appendChild(workDiv);
      });
    };

    await loadMyWorks();

    const worksContainer = document.getElementById('worksContainer');
    expect(worksContainer.childElementCount).toBe(1);

    const project = worksContainer.firstChild;

    // Validate project details
    expect(project.querySelector('h3').textContent).toBe('Project 1');
    expect(project.querySelector('p').textContent).toBe('Description 1');

    // Validate product details
    const products = project.querySelectorAll('.product-details');
    expect(products.length).toBe(2);

    expect(products[0].textContent).toContain('Product 1');
    expect(products[0].textContent).toContain('$10');
    expect(products[0].textContent).toContain('Total: $20.00');

    expect(products[1].textContent).toContain('Product 2');
    expect(products[1].textContent).toContain('$20');
    expect(products[1].textContent).toContain('Total: $20.00');

    // Validate total project cost
    expect(project.querySelector('.total-cost').textContent).toContain('Total Project Cost: $40.00');
  });

  test('deleteWork - deletes work successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const deleteWork = async (workId) => {
      const response = await fetch(`/api/myworks/${workId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete work.');
    };

    await deleteWork('1');
    expect(fetchMock).toHaveBeenCalledWith('/api/myworks/1', { method: 'DELETE' });
  });

  test('shareToGallery - shares work to gallery successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const shareToGallery = async (workId) => {
      const response = await fetch(`/api/myworks/${workId}/share`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to share work to gallery.');
    };

    await shareToGallery('1');
    expect(fetchMock).toHaveBeenCalledWith('/api/myworks/1/share', { method: 'POST' });
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
