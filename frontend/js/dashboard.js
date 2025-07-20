// dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in first');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('http://localhost:3000/dashboard/dashboard-summary', {
        method: 'GET',
        headers: { 'Authorization': token },
    });

    const result = await response.json();

    if (response.status === 200) {
        // Update the dashboard
        document.getElementById('total-balance').textContent = `$${result.totalBalance}`;
        document.getElementById('monthly-income').textContent = `$${result.totalIncome}`;
        document.getElementById('monthly-expenses').textContent = `$${result.totalExpenses}`;
    } else {
        alert(result.error);
    }
});

// Fetch Recent Transactions
const fetchTransactions = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
        const response = await fetch('http://localhost:3000/transactions/recent-transactions', {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        const data = await response.json();
        if (response.status === 200) {
            const transactionsTable = document.getElementById('transactions-table');
            data.transactions.forEach((transaction) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transaction.date}</td>
                    <td class="${transaction.type.toLowerCase()}">${transaction.type}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.amount}</td>
                `;
                transactionsTable.appendChild(row);
            });
        } else {
            console.error(data.error);
        }
    } catch (error) {
        console.error(error);
    }
};

// Call the function on page load
window.onload = () => {
    fetchTransactions();
};

document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});

