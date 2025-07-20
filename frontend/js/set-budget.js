document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in first');
        window.location.href = 'login.html';
        return;
    }

    // Fetch and display current budgets
    const fetchCurrentBudgets = async () => {
        try {
            const response = await fetch('http://localhost:3000/budget/current-budgets', {
                method: 'GET',
                headers: { 'Authorization': token }
            });

            const result = await response.json();
            if (response.status === 200) {
                const budgetList = document.getElementById('budget-list');
                budgetList.innerHTML = ''; // Clear current list

                result.budgets.forEach(budget => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `<b>${budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}:</b> $${budget.amount}`;
                    budgetList.appendChild(listItem);
                });
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching budgets');
        }
    };

    // Call function on page load
    fetchCurrentBudgets();

    // Handle form submission to set budget
    const form = document.getElementById('set-budget-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const category = document.getElementById('category').value;
        const budgetAmount = parseFloat(document.getElementById('budget').value);

        const response = await fetch('http://localhost:3000/budget/set-budget', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ category, budgetAmount })
        });

        const result = await response.json();
        if (response.status === 201) {
            alert(result.message);
            fetchCurrentBudgets();  // Reload the current budgets
        } else {
            alert(result.error);
        }
    });
});

// Alert if budget is exceeded
const checkBudgetLimit = async (category, amount) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3000/budget/check-budget', {
        method: 'POST',
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount })
    });

    const result = await response.json();
    if (response.status === 400) {
        alert(result.error); // Alert if budget is exceeded
    }
};

// Example Usage for Expense Form Submission:
document.querySelector('#set-budget-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('category').value;
    const budgetAmount = parseFloat(document.getElementById('budget').value);

    // Check if user is trying to exceed the budget
    checkBudgetLimit(category, budgetAmount);
});

document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});
