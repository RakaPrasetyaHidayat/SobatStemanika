document.addEventListener('DOMContentLoaded', function() {
  
  const ctx = document.getElementById('dashboardChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Eskul A',
          data: [12, 19, 13, 15, 22, 30, 28],
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4
        },
        {
          label: 'Eskul B',
          data: [8, 11, 9, 14, 18, 20, 19],
          borderColor: '#ffd600',
          backgroundColor: 'rgba(255, 214, 0, 0.1)',
          tension: 0.4
        }
        
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
});
