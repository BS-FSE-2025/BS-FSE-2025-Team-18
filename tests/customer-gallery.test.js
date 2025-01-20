const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Customer Gallery Page', () => {
  let alertMock;

  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="gallery-projects" class="gallery-grid"></div>
      <div id="projectModal" class="modal">
        <h2 id="modalProjectName"></h2>
        <img id="modalProjectImage" />
        <p id="modalProjectDescription"></p>
        <div id="modalProjectProducts"></div>
        <p id="modalTotalCost"></p>
      </div>
      <input type="number" id="budgetInput" />
    `;

    // Mock alert
    alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('fetchGalleryProjects - fetches and displays projects', async () => {
    const mockProjects = [
      {
        _id: 'proj1',
        name: 'Project 1',
        description: 'Description 1',
        image: 'image1.jpg',
        products: [
          { price: 10, quantity: 2 },
          { price: 20, quantity: 1 },
        ],
      },
      {
        _id: 'proj2',
        name: 'Project 2',
        description: 'Description 2',
        image: 'image2.jpg',
        products: [{ price: 50, quantity: 3 }],
      },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockProjects));

    const fetchGalleryProjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/gallery');
        const projects = await response.json();
        displayGalleryProjects(projects);
      } catch (error) {
        console.error('Error fetching gallery projects:', error);
      }
    };

    const displayGalleryProjects = (projects) => {
      const galleryContainer = document.getElementById('gallery-projects');
      galleryContainer.innerHTML = '';

      projects.forEach((project) => {
        let totalCost = project.products.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const projectCard = document.createElement('div');
        projectCard.classList.add('gallery-card');
        projectCard.setAttribute('data-project-id', project._id);

        projectCard.innerHTML = `
          <img src="${project.image}" alt="${project.name}">
          <h3>${project.name}</h3>
          <p>${project.description}</p>
          <p>Total Cost: $${totalCost.toFixed(2)}</p>
        `;

        projectCard.addEventListener('click', () => {
          openProjectModal(project._id);
        });

        galleryContainer.appendChild(projectCard);
      });
    };

    await fetchGalleryProjects();

    const galleryContainer = document.getElementById('gallery-projects');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/gallery');
    expect(galleryContainer.children.length).toBe(2);
    expect(galleryContainer.children[0].querySelector('h3').textContent).toBe('Project 1');
  });

  test('openProjectModal - displays project details in modal', async () => {
    const mockProject = {
      _id: 'proj1',
      name: 'Project 1',
      description: 'Description 1',
      image: 'image1.jpg',
      products: [
        { name: 'Product 1', price: 10, quantity: 2, image: 'prod1.jpg' },
        { name: 'Product 2', price: 20, quantity: 1, image: 'prod2.jpg' },
      ],
    };

    fetchMock.mockResponseOnce(JSON.stringify(mockProject));

    const openProjectModal = async (projectId) => {
      const modal = document.getElementById('projectModal');

      try {
        const response = await fetch(`http://localhost:3000/api/gallery/${projectId}`);
        const project = await response.json();

        document.getElementById('modalProjectName').textContent = project.name;
        document.getElementById('modalProjectImage').src = project.image;
        document.getElementById('modalProjectDescription').textContent = project.description;

        const productsContainer = document.getElementById('modalProjectProducts');
        productsContainer.innerHTML = project.products
          .map(
            (item) => `
            <div class="product-item">
              <img src="${item.image}" alt="${item.name}">
              <h3>${item.name}</h3>
              <p> Price: $${item.price}</p>
              <p> Quantity: ${item.quantity}</p>
            </div>
          `
          )
          .join('');

        const totalCost = project.products.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        document.getElementById('modalTotalCost').textContent = `Total Cost: $${totalCost.toFixed(2)}`;

        modal.style.display = 'block';
      } catch (error) {
        console.error('Error opening project modal:', error);
      }
    };

    await openProjectModal('proj1');

    const modal = document.getElementById('projectModal');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/gallery/proj1');
    expect(modal.style.display).toBe('block');
    expect(document.getElementById('modalProjectName').textContent).toBe('Project 1');
  });

});
