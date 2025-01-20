describe('Font size controls', () => {
    let fontSize;
  
    beforeEach(() => {
      // Mock DOM elements
      document.body.innerHTML = `
        <button id="increase-font">Increase Font</button>
        <button id="decrease-font">Decrease Font</button>
        <button id="reset-font">Reset Font</button>
      `;
  
      fontSize = 100;
  
      // Mock the font size functionality
      document.getElementById('increase-font').addEventListener('click', () => {
        if (fontSize < 300) {
          fontSize += 10;
          document.documentElement.style.fontSize = `${fontSize}%`;
        }
      });
  
      document.getElementById('decrease-font').addEventListener('click', () => {
        if (fontSize > 50) {
          fontSize -= 10;
          document.documentElement.style.fontSize = `${fontSize}%`;
        }
      });
  
      document.getElementById('reset-font').addEventListener('click', () => {
        fontSize = 100;
        document.documentElement.style.fontSize = '100%';
      });
    });
  
    test('should increase font size', () => {
      const increaseBtn = document.getElementById('increase-font');
  
      // Simulate button clicks
      increaseBtn.click();
      expect(fontSize).toBe(110);
      expect(document.documentElement.style.fontSize).toBe('110%');
  
      increaseBtn.click();
      expect(fontSize).toBe(120);
      expect(document.documentElement.style.fontSize).toBe('120%');
    });
  
    test('should not exceed maximum font size of 300%', () => {
      const increaseBtn = document.getElementById('increase-font');
      fontSize = 290; // Set font size close to max
  
      increaseBtn.click();
      expect(fontSize).toBe(300);
      expect(document.documentElement.style.fontSize).toBe('300%');
  
      increaseBtn.click(); // Should not increase further
      expect(fontSize).toBe(300);
      expect(document.documentElement.style.fontSize).toBe('300%');
    });
  
    test('should decrease font size', () => {
      const decreaseBtn = document.getElementById('decrease-font');
  
      // Simulate button clicks
      decreaseBtn.click();
      expect(fontSize).toBe(90);
      expect(document.documentElement.style.fontSize).toBe('90%');
  
      decreaseBtn.click();
      expect(fontSize).toBe(80);
      expect(document.documentElement.style.fontSize).toBe('80%');
    });
  
    test('should not go below minimum font size of 50%', () => {
      const decreaseBtn = document.getElementById('decrease-font');
      fontSize = 60; // Set font size close to min
  
      decreaseBtn.click();
      expect(fontSize).toBe(50);
      expect(document.documentElement.style.fontSize).toBe('50%');
  
      decreaseBtn.click(); // Should not decrease further
      expect(fontSize).toBe(50);
      expect(document.documentElement.style.fontSize).toBe('50%');
    });
  
    test('should reset font size to default', () => {
      const resetBtn = document.getElementById('reset-font');
      fontSize = 200; // Set font size to a custom value
  
      resetBtn.click();
      expect(fontSize).toBe(100);
      expect(document.documentElement.style.fontSize).toBe('100%');
    });
  });
  
