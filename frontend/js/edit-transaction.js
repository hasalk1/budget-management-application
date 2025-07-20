document.addEventListener('DOMContentLoaded', async () => {
    const transactionId = new URLSearchParams(window.location.search).get('id');
    if (!transactionId) {
        alert('No transaction ID provided');
        window.location.href = 'transactions.html';
        return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in first');
        window.location.href = 'login.html';
        return;
    }

    // Fetch the transaction data
    const response = await fetch(`http://localhost:3000/transactions/transaction/${transactionId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();
    if (response.status === 200) {
        const transaction = result.transaction;
        // Fill the form with existing transaction data
        document.getElementById('edit-type').value = transaction.type;
        document.getElementById('edit-description').value = transaction.description;
        document.getElementById('edit-amount').value = transaction.amount;
        document.getElementById('edit-date').value = transaction.date;
    } else {
        alert(result.error);
        window.location.href = 'transactions.html';
    }

    // Handle form submission
    const form = document.getElementById('edit-transaction-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const type = document.getElementById('edit-type').value;
        const description = document.getElementById('edit-description').value;
        const amount = parseFloat(document.getElementById('edit-amount').value);
        const date = document.getElementById('edit-date').value;

        const response = await fetch(`http://localhost:3000/transactions/edit-transaction/${transactionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type, description, amount, date })
        });

        const result = await response.json();
        if (response.status === 200) {
            alert(result.message);
            window.location.href = 'transactions.html';  // Redirect back to the transactions page
        } else {
            alert(result.error);
        }
    });
});

document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});