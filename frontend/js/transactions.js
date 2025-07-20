// transactions.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please log in first.');
        window.location.href = 'login.html';
        return;
    }

    // Fetch and display transactions
    const fetchTransactions = async () => {
        try {
            const response = await fetch('http://localhost:3000/transactions/transactions', {
                method: 'GET',
                headers: { 'Authorization': token }
            });

            const result = await response.json();
            if (response.status === 200) {
                displayTransactions(result.transactions);
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error fetching transactions');
        }
    };

    // Display transactions in the table
    const displayTransactions = (transactions) => {
        const transactionsTable = document.querySelector('tbody');
        transactionsTable.innerHTML = '';  // Clear the table

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td class="${transaction.type === 'income' ? 'type-income' : 'type-expense'}">
                    ${capitalizeFirstLetter(transaction.type)}
                </td>
                <td>${transaction.description}</td>
                <td>${transaction.amount}</td>
                <td class="actions">
                    <button class="edit" data-id="${transaction.id}">Edit</button>
                    <button class="delete" data-id="${transaction.id}">Delete</button>
                </td>
            `;
            transactionsTable.appendChild(row);
        });

        // Handle actions (edit and delete)
        handleActions();
    };

    // Capitalize the first letter of a string
    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    // Handle edit and delete actions
    const handleActions = () => {
        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const transactionId = e.target.getAttribute('data-id');
                window.location.href = `edit-transaction.html?id=${transactionId}`;
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', async (e) => {
                const transactionId = e.target.getAttribute('data-id');
                await deleteTransaction(transactionId);
            });
        });
    };

    // Delete transaction
    const deleteTransaction = async (transactionId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:3000/transactions/delete-transaction/${transactionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': token },
            });

            const result = await response.json();
            if (response.status === 200) {
                alert(result.message);
                fetchTransactions();  // Reload transactions
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting transaction');
        }
    };

    // Fetch transactions when the page is loaded
    fetchTransactions();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    
    // Redirect to login page
    window.location.href = 'login.html';
});