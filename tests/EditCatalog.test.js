const fetchMock = require('jest-fetch-mock');
fetchMock.enableMocks();

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

const API_URL = "http://localhost:3000/api/catalog";

describe('EditCatalog functions', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
  });

  test('addItem - successful submission', async () => {
    document.body.innerHTML = `
      <form id="add-item-form">
        <input id="item-name" value="Test Item" />
        <textarea id="item-description">Test Description</textarea>
        <input id="item-price" value="10" />
        <select id="item-category">
          <option value="Painting" selected>Painting</option>
        </select>
        <input id="item-image" type="file" />
        <input id="item-time" value="30" />
      </form>
      <div id="catalog-categories"></div>
    `;

    const file = new Blob([''], { type: 'image/png' });
    Object.defineProperty(document.getElementById('item-image'), 'files', {
      value: [file],
    });

    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const addItem = async (event) => {
      event.preventDefault();
      const name = document.getElementById("item-name").value;
      const description = document.getElementById("item-description").value;
      const price = parseFloat(document.getElementById("item-price").value);
      const category = document.getElementById("item-category").value;
      const image = document.getElementById("item-image").files[0];
      const time = parseFloat(document.getElementById("item-time").value);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("pricePerMeter", price);
      formData.append("category", category);
      formData.append("image", image);
      formData.append("totalTime", time);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to add item.");
      }
    };

    await addItem({ preventDefault: () => {} });
    expect(fetch).toHaveBeenCalledWith(API_URL, expect.anything());
  });

  test('fetchCatalog - successful fetch', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { _id: "1", name: "Item1", category: "Painting" },
      { _id: "2", name: "Item2", category: "Woodwork" },
    ]));

    const fetchCatalog = async () => {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch catalog items.");
      return await response.json();
    };

    const catalogItems = await fetchCatalog();
    expect(catalogItems).toHaveLength(2);
    expect(catalogItems[0].name).toBe("Item1");
  });

  test('displayCatalog - renders categories and items', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { _id: "1", name: "Item1", category: "Painting", image: "img1.png", pricePerMeter: 10, totalTime: 30 },
      { _id: "2", name: "Item2", category: "Painting", image: "img2.png", pricePerMeter: 20, totalTime: 45 },
    ]));

    document.body.innerHTML = `<div id="catalog-categories"></div>`;

    const displayCatalog = async () => {
      const response = await fetch(API_URL);
      const catalogItems = await response.json();

      const catalogDiv = document.getElementById("catalog-categories");
      catalogDiv.innerHTML = "";

      const categories = [...new Set(catalogItems.map((item) => item.category))];

      categories.forEach((category) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.innerHTML = `<h3>${category}</h3><div class="category-items"></div>`;
        const itemsDiv = categoryDiv.querySelector(".category-items");

        catalogItems.filter(item => item.category === category).forEach(item => {
          const itemDiv = document.createElement("div");
          itemDiv.innerHTML = `
            <h4>${item.name}</h4>
          `;
          itemsDiv.appendChild(itemDiv);
        });

        catalogDiv.appendChild(categoryDiv);
      });
    };

    await displayCatalog();

    expect(document.querySelectorAll("h3").length).toBe(1);
    expect(document.querySelectorAll("h4").length).toBe(2);
  });

  test('deleteItem - successful deletion', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    const deleteItem = async (itemId) => {
      const response = await fetch(`${API_URL}/${itemId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete item.");
    };

    await deleteItem("1");
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/1`, { method: "DELETE" });
  });

  test('toggleMenu - toggles menu visibility', () => {
    document.body.innerHTML = `<div id="subMenu" class="open-menu"></div>`;

    const toggleMenu = () => {
      const subMenu = document.getElementById("subMenu");
      subMenu.classList.toggle("open-menu");
    };

    toggleMenu();
    expect(document.getElementById("subMenu").classList.contains("open-menu")).toBe(false);
  });

  test('logout - clears localStorage and redirects', () => {
    localStorage.setItem("username", "testuser");

    // Mock window.location.href
    delete global.window.location;
    global.window.location = { href: "" };

    const logout = () => {
      localStorage.clear();
      window.location.href = "main_page.html";
    };

    logout();

    expect(localStorage.getItem("username")).toBeNull();
    expect(window.location.href).toBe("main_page.html");
  });
});
