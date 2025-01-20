const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Admin Gallery Page', () => {
  let alertMock;

  beforeEach(() => {
    // Mock the DOM elements
    document.body.innerHTML = `
      <select id="categorySelect"></select>
      <div id="productSelection"></div>
      <div id="galleryProjects" class="gallery-grid"></div>
      <form id="addProjectForm"></form>
      <div id="projectModal" class="modal">
        <div id="modalProjectName"></div>
        <img id="modalProjectImage" />
        <p id="modalProjectDescription"></p>
        <div id="modalProjectProducts"></div>
        <p id="modalTotalCost"></p>
      </div>
    `;

    // Mock alert
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('fetchCategories - populates category select', async () => {
    const mockItems = [
      { category: 'Painting' },
      { category: 'Flooring' },
      { category: 'Painting' },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockItems));

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/catalog');
        if (!response.ok) throw new Error('Failed to fetch catalog categories.');
        const items = await response.json();
        const categories = [...new Set(items.map((item) => item.category))];
        populateCategorySelect(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const populateCategorySelect = (categories) => {
      const categorySelect = document.getElementById('categorySelect');
      categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    };

    await fetchCategories();

    const categorySelect = document.getElementById('categorySelect');
    expect(categorySelect.children.length).toBe(2);
    expect(categorySelect.children[0].value).toBe('Painting');
    expect(categorySelect.children[1].value).toBe('Flooring');
  });

  test('fetchProductsByCategory - displays filtered products', async () => {
    const mockItems = [
      { _id: 'prod1', name: 'Product 1', category: 'Painting', pricePerMeter: 10, image: 'image1.jpg' },
      { _id: 'prod2', name: 'Product 2', category: 'Flooring', pricePerMeter: 20, image: 'image2.jpg' },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockItems));

    const fetchProductsByCategory = async (selectedCategory) => {
      if (!selectedCategory) return;
      try {
        const response = await fetch('http://localhost:3000/api/catalog');
        if (!response.ok) throw new Error('Failed to fetch products.');
        const items = await response.json();
        const filteredItems = items.filter((item) => item.category === selectedCategory);
        displayProducts(filteredItems);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    const displayProducts = (products) => {
      const productSelection = document.getElementById('productSelection');
      productSelection.innerHTML = '';
      products.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        productDiv.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <p>${product.name}</p>
          <p>Price: $${product.pricePerMeter}</p>
          <label for="quantity-${product._id}">Quantity:</label>
          <input type="number" id="quantity-${product._id}" min="1" value="1" />
          <button type="button">Add Product</button>
        `;
        productSelection.appendChild(productDiv);
      });
    };

    await fetchProductsByCategory('Painting');

    const productSelection = document.getElementById('productSelection');
    expect(productSelection.children.length).toBe(1);
    expect(productSelection.children[0].querySelector('p').textContent).toBe('Product 1');
  });

  test('fetchGalleryProjects - successfully fetches and displays projects', async () => {
    const mockProjects = [
      { _id: 'proj1', name: 'Project 1', image: 'image1.jpg' },
      { _id: 'proj2', name: 'Project 2', image: 'image2.jpg' },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockProjects));

    const fetchGalleryProjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/gallery');
        if (!response.ok) throw new Error('Failed to fetch gallery projects');
        const projects = await response.json();
        displayGalleryProjects(projects);
      } catch (error) {
        console.error('Error fetching gallery projects:', error);
      }
    };

    const displayGalleryProjects = (projects) => {
      const galleryContainer = document.getElementById('galleryProjects');
      galleryContainer.innerHTML = '';

      projects.forEach((project) => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('gallery-card');

        projectCard.innerHTML = `
          <img src="${project.image}" alt="${project.name}" onclick="openProjectModal('${project._id}')">
          <h3>${project.name}</h3>
          <button class="delete-button" onclick="deleteProject('${project._id}')">Delete</button>
        `;

        galleryContainer.appendChild(projectCard);
      });
    };

    await fetchGalleryProjects();

    const galleryContainer = document.getElementById('galleryProjects');
    expect(galleryContainer.children.length).toBe(2);
    expect(galleryContainer.children[0].querySelector('h3').textContent).toBe('Project 1');
    expect(galleryContainer.children[1].querySelector('h3').textContent).toBe('Project 2');
  });

  test('deleteProject - calls the API and refreshes projects', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Deleted' }), { status: 200 });

    const deleteProject = async (projectId) => {
      if (!confirm('Are you sure you want to delete this project?')) return;

      try {
        const response = await fetch(`http://localhost:3000/api/gallery/${projectId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete project');
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project: ' + error.message);
      }
    };

    global.confirm = jest.fn(() => true);

    await deleteProject('proj1');

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/gallery/proj1', {
      method: 'DELETE',
    });
    expect(alertMock).toHaveBeenCalledWith('Project deleted successfully!');
  });

  test('displayGalleryProjects - handles empty projects array', () => {
    const displayGalleryProjects = (projects) => {
      const galleryContainer = document.getElementById('galleryProjects');
      galleryContainer.innerHTML = '';

      projects.forEach((project) => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('gallery-card');

        projectCard.innerHTML = `
          <img src="${project.image}" alt="${project.name}" onclick="openProjectModal('${project._id}')">
          <h3>${project.name}</h3>
          <button class="delete-button" onclick="deleteProject('${project._id}')">Delete</button>
        `;

        galleryContainer.appendChild(projectCard);
      });
    };

    displayGalleryProjects([]);

    const galleryContainer = document.getElementById('galleryProjects');
    expect(galleryContainer.children.length).toBe(0);
  });
});
