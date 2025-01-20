const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Contractor Checklist Functions', () => {
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

  test('fetchProjects - fetches projects successfully', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify([
        { _id: 'proj1', name: 'Project 1', description: 'Description 1' },
        { _id: 'proj2', name: 'Project 2', description: 'Description 2' },
      ])
    );

    const token = 'mockToken';
    localStorage.setItem('token', token);

    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    };

    const projects = await fetchProjects();

    expect(projects.length).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/projects', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer mockToken',
        'Content-Type': 'application/json',
      },
    });
  });

  test('displayProjects - displays projects correctly', async () => {
    const mockProjectList = { innerHTML: '' };

    const fetchProjects = jest.fn().mockResolvedValue([
      { _id: 'proj1', name: 'Project 1', description: 'Description 1' },
      { _id: 'proj2', name: 'Project 2', description: 'Description 2' },
    ]);

    const displayProjects = async (projects) => {
      mockProjectList.innerHTML = projects
        .map(
          (p) => `
        <div>
          <h4>${p.name}</h4>
          <p>${p.description}</p>
        </div>`
        )
        .join('');
    };

    const projects = await fetchProjects();
    await displayProjects(projects);

    expect(mockProjectList.innerHTML).toContain('Project 1');
    expect(mockProjectList.innerHTML).toContain('Description 1');
    expect(mockProjectList.innerHTML).toContain('Project 2');
    expect(mockProjectList.innerHTML).toContain('Description 2');
  });

  test('viewProjectDetails - fetches and displays project details', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        _id: 'proj1',
        name: 'Project 1',
        products: [
          { name: 'Product 1', quantity: 2, status: 'To Do' },
          { name: 'Product 2', quantity: 3, status: 'Done' },
        ],
      })
    );

    const token = 'mockToken';
    localStorage.setItem('token', token);

    const viewProjectDetails = async (projectId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    };

    const projectDetails = await viewProjectDetails('proj1');

    expect(projectDetails.products.length).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/projects/proj1', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer mockToken',
        'Content-Type': 'application/json',
      },
    });
  });

  test('updateProductStatus - updates product status successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const updateProductStatus = async (itemId, newStatus) => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:3000/api/projects/updateProductStatus',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId, status: newStatus }),
        }
      );
      return response.ok;
    };

    localStorage.setItem('token', 'mockToken');
    const success = await updateProductStatus('item1', 'In Progress');

    expect(success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/projects/updateProductStatus',
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer mockToken',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: 'item1', status: 'In Progress' }),
      }
    );
  });

  test('logout - clears localStorage and redirects', () => {
    localStorage.setItem('token', 'mockToken');
    let redirectUrl = '';

    const logout = () => {
      localStorage.clear();
      redirectUrl = 'main_page.html';
    };

    logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(redirectUrl).toBe('main_page.html');
  });
});
