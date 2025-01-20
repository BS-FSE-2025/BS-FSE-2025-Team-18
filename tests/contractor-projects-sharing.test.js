const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

describe('Project Functions', () => {
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

    document.body.innerHTML = ''; // Reset DOM
  });

  test('shareProject - shares project successfully', async () => {
    // Arrange
    const mockProjectId = '123';
    global.confirm = jest.fn(() => true); // Simulate user clicking "OK" in confirm dialog
    global.alert = jest.fn(); // Mock alert

    localStorage.setItem('token', 'mock-token');

    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const shareProject = async (projectId) => {
      if (!confirm('Are you sure you want to share this project to the gallery?')) return;

      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}/share`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to share project.');

        alert('Project shared to gallery successfully!');
      } catch (error) {
        alert('Error sharing project: ' + error.message);
      }
    };

    // Act
    await shareProject(mockProjectId);

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/api/projects/${mockProjectId}/share`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      })
    );
    expect(alert).toHaveBeenCalledWith('Project shared to gallery successfully!');
  });

  test('downloadProjectAsText - downloads project as a text file', async () => {
    // Arrange
    const mockProjectId = '123';
    const mockProject = {
      name: 'Mock Project',
      description: 'This is a test project.',
      status: 'In Progress',
      products: [
        { name: 'Product 1', quantity: 2, price: 10 },
        { name: 'Product 2', quantity: 1, price: 20 },
      ],
    };

    localStorage.setItem('token', 'mock-token');
    fetchMock.mockResponseOnce(JSON.stringify(mockProject));
    global.alert = jest.fn(); // Mock alert
    global.console.log = jest.fn(); // Mock console.log

    const mockCreateObjectURL = jest.fn();
    const mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    document.body.innerHTML = ''; // Reset DOM

    const downloadProjectAsText = async (projectId) => {
      const token = localStorage.getItem('token');

      try {
        console.log('Fetching project details for ID:', projectId);

        const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Failed to fetch project details: ${errorDetails}`);
        }

        const project = await response.json();

        if (!project || !project.name || !project.products) {
          throw new Error('Project details are incomplete.');
        }

        const content = `
==========================================================
                     Project Details
==========================================================

Project Name     : ${project.name}
Description      : ${project.description || 'No description provided'}
Status           : ${project.status || 'No status provided'}

==========================================================
                     Products List
==========================================================

${
  project.products.length > 0
    ? project.products
        .map(
          (product, index) => `
----------------------------------------------------------
 Product ${index + 1}
----------------------------------------------------------
 Name            : ${product.name || 'Unknown'}
 Quantity        : ${product.quantity || 0}
 Price per Unit  : $${product.price || 0}
 Total Cost      : $${(product.quantity || 0) * (product.price || 0)}
`
        )
        .join('\n')
    : 'No products added.\n'
}

==========================================================
                     End of Project
==========================================================
        `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${project.name}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading project as text:', error.message);
        alert('Error downloading project as text: ' + error.message);
      }
    };

    // Act
    await downloadProjectAsText(mockProjectId);

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      `http://localhost:3000/api/projects/${mockProjectId}`,
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Bearer mock-token' },
      })
    );
    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('Fetching project details for ID:', mockProjectId);
  });
});
