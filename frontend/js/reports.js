document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in first.');
        window.location.href = 'login.html';
        return;
    }

    // Fetch the report data
    const response = await fetch('http://localhost:3000/reports/get-financial-reports', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (response.status === 200) {
        // Populate the reports with fetched data
        document.getElementById('total-income').textContent = `$${result.totalIncome}`;
        document.getElementById('total-savings').textContent = `$${result.totalSavings}`;
        document.getElementById('food-expenses').textContent = `$${result.foodExpenses}`;
        document.getElementById('entertainment-expenses').textContent = `$${result.entertainmentExpenses}`;

        // Create charts
        renderCharts(result);
    } else {
        alert(result.error);
    }
});

// Function to render charts
function renderCharts(data) {
    // Expense Chart
    const ctx1 = document.getElementById('expenseChart').getContext('2d');
    const expenseChart = new Chart(ctx1, {
        type: 'pie',
        data: {
            labels: ['Food', 'Entertainment', 'Others'],  // Categories
            datasets: [{
                data: [data.foodExpenses, data.entertainmentExpenses, data.totalExpenses - data.foodExpenses - data.entertainmentExpenses],
                backgroundColor: ['#36a2eb', '#ffcd56', '#ff6384'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
        }
    });

    // Savings Chart
    const ctx2 = document.getElementById('savingsChart').getContext('2d');
    const savingsChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Total Savings', 'Total Income', 'Total Expenses'],
            datasets: [{
                label: 'Financial Overview',
                data: [data.totalSavings, data.totalIncome, data.totalExpenses],
                backgroundColor: ['#4caf50', '#2196f3', '#f44336'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
        }
    });
}

// Function to download CSV
function downloadCSV() {
    const rows = [
        ["Category", "Amount"],
        ["Total Income", document.getElementById('total-income').textContent],
        ["Total Savings", document.getElementById('total-savings').textContent],
        ["Food Expenses", document.getElementById('food-expenses').textContent],
        ["Entertainment Expenses", document.getElementById('entertainment-expenses').textContent]
    ];

    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_reports.csv");
    link.click();
}

document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});
