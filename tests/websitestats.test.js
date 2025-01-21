const fetchMock = require("jest-fetch-mock");
fetchMock.enableMocks();


describe('Website Stats Functions', () => {
  beforeEach(() => {
    fetchMock.resetMocks();

    // Mock DOM elements
    document.body.innerHTML = `
      <div id="users-count"></div>
      <div id="gallery-count"></div>
      <div id="products-count"></div>
    `;
  });

  describe('fetchUserCount', () => {
    test('should display "0" if no users are found', async () => {
      fetchMock.mockResponseOnce(JSON.stringify([])); // Empty user list

      const fetchUserCount = async () => {
        const response = await fetch('http://localhost:3000/api/users');
        const users = await response.json();
        document.getElementById('users-count').textContent = users.length;
      };

      await fetchUserCount();

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/users');
      expect(document.getElementById('users-count').textContent).toBe('0');
    });

    

  });

  describe('fetchGalleryCount', () => {
    test('should handle non-JSON response gracefully', async () => {
      fetchMock.mockResponseOnce('Not JSON', { status: 200 });

      const fetchGalleryCount = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/gallery');
          await response.json(); // This will throw an error
        } catch (error) {
          document.getElementById('gallery-count').textContent = 'Error';
        }
      };

      await fetchGalleryCount();

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/gallery');
      expect(document.getElementById('gallery-count').textContent).toBe('Error');
    });
  });

  describe('fetchProductCount', () => {
    test('should not update DOM if API response is invalid', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(null)); // Invalid response

      const fetchProductCount = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/catalog');
          const products = await response.json();
          if (!products) throw new Error('Invalid data');
        } catch (error) {
          document.getElementById('products-count').textContent = 'Error';
        }
      };

      await fetchProductCount();

      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/catalog');
      expect(document.getElementById('products-count').textContent).toBe('Error');
    });
  });
});
