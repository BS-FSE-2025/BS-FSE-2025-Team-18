const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Contractor Projects Page Functions', () => {
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
        { _id: 'proj1', name: 'Project 1', description: 'Description 1', status: 'Pending' },
        { _id: 'proj2', name: 'Project 2', description: 'Description 2', status: 'Completed' },
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
        Authorization: `Bearer mockToken`,
        'Content-Type': 'application/json',
      },
    });
  });

  test('addProject - adds a new project successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const addProject = async (name, description) => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });
      return response.ok;
    };

    localStorage.setItem('token', 'mockToken');
    const success = await addProject('New Project', 'New Description');

    expect(success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer mockToken',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New Project', description: 'New Description' }),
    });
  });

  test('deleteProject - deletes a project successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const deleteProject = async (projectId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    };

    localStorage.setItem('token', 'mockToken');
    const success = await deleteProject('proj1');

    expect(success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/projects/proj1', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer mockToken',
        'Content-Type': 'application/json',
      },
    });
  });



  test('saveProjectChanges - saves edited project successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const saveProjectChanges = async (projectId, updatedData) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      return response.ok;
    };

    localStorage.setItem('token', 'mockToken');
    const success = await saveProjectChanges('proj1', {
      name: 'Updated Project',
      description: 'Updated Description',
      status: 'Completed',
    });

    expect(success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/projects/proj1', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer mockToken',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Project',
        description: 'Updated Description',
        status: 'Completed',
      }),
    });
  });

  test('editProject - edits a project successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const editProject = async (projectId, name, description, status) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, status }),
      });
      return response.ok;
    };

    localStorage.setItem('token', 'mockToken');
    const success = await editProject('proj1', 'Updated Name', 'Updated Desc', 'Completed');

    expect(success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/projects/proj1', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer mockToken',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Updated Name',
        description: 'Updated Desc',
        status: 'Completed',
      }),
    });
  });

  test('removeProductFromProject - removes a product from a project successfully', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const removeProductFromProject = async (projectId, itemId) => {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/projects/${projectId}/removeProduct`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        }
      );
      return response.ok;
    };

    localStorage.setItem('token', 'mockToken');
    const success = await removeProductFromProject('proj1', 'item1');

    expect(success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/projects/proj1/removeProduct',
      {
        method: 'PUT',
        headers: {
          Authorization: 'Bearer mockToken',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: 'item1' }),
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

  test('displayProjects - displays projects correctly', async () => {
    const mockProjectList = { innerHTML: '' };

    const fetchProjects = jest.fn().mockResolvedValue([
      { _id: 'proj1', name: 'Project 1', description: 'Description 1', status: 'Pending' },
      { _id: 'proj2', name: 'Project 2', description: 'Description 2', status: 'Completed' },
    ]);

    const displayProjects = async () => {
      const projects = await fetchProjects();
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

    await displayProjects();

    expect(mockProjectList.innerHTML).toContain('Project 1');
    expect(mockProjectList.innerHTML).toContain('Description 1');
    expect(mockProjectList.innerHTML).toContain('Project 2');
    expect(mockProjectList.innerHTML).toContain('Description 2');
  });
});
