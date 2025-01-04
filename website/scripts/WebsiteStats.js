// async function fetchStats() {
//     try {
//       const response = await fetch('http://localhost:3000/api/stats'); // API endpoint
//       if (!response.ok) {
//         throw new Error('Failed to fetch stats');
//       }
  
//       const stats = await response.json();
  
//       // Update table values
//       document.getElementById('users-count').textContent = stats.users;
//       document.getElementById('projects-count').textContent = stats.projects;
//       document.getElementById('products-count').textContent = stats.products;
//     } catch (error) {
//       console.error('Error fetching stats:', error);
  
//       // Fallback values in case of an error
//       document.getElementById('users-count').textContent = 'Error';
//       document.getElementById('projects-count').textContent = 'Error';
//       document.getElementById('products-count').textContent = 'Error';
//     }
//   }
  
//   // Fetch stats when the page loads
//   document.addEventListener('DOMContentLoaded', fetchStats);
  