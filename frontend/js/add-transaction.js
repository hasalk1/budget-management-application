// add-transaction.js
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value
    const description = document.getElementById('desc').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in first.');
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch('http://localhost:3000/transactions/add-transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            type,
            category,
            description,
            amount,
            date
        })
    });

    const result = await response.json();
    if (response.status === 201) {
        alert('Transaction added successfully');
        window.location.href = 'dashboard.html';
    } else {
        alert(result.error);
    }
});

const checkBudgetLimit = async (category, amount) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/check-budget', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount })
    });

    const result = await response.json();
    if (response.status === 400) {
        alert(result.error); // Alert if budget is exceeded or nearing the limit
    } else {
        // Proceed with adding the transaction if budget is okay
        alert('Transaction can be added');
    }
};

// Example Usage for Expense Form Submission:
document.querySelector('#addTransactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    // Check if user is about to exceed the budget
    checkBudgetLimit(category, amount);
});

document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});
