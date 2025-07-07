// Expense Tracker - script.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const balanceEl = document.getElementById('balance');
    const transactionListEl = document.getElementById('transaction-list');
    const form = document.getElementById('transaction-form');
    const nameInput = document.getElementById('transaction-name');
    const amountInput = document.getElementById('transaction-amount');
    const typeInputs = document.getElementsByName('transaction-type');
    const warningEl = document.getElementById('form-warning');
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const closeWelcomeBtn = document.getElementById('close-welcome-btn');

    let transactions = [];
    let lastBalance = 0;

    // Welcome popup logic
    if (welcomeOverlay && closeWelcomeBtn) {
        welcomeOverlay.style.display = 'flex';
        closeWelcomeBtn.addEventListener('click', () => {
            welcomeOverlay.style.display = 'none';
        });
    }

    // Load transactions from localStorage
    function loadTransactions() {
        const data = localStorage.getItem('expense-tracker-transactions');
        if (data) {
            try {
                transactions = JSON.parse(data);
            } catch (e) {
                transactions = [];
            }
        } else {
            transactions = [];
        }
    }

    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
    }

    // Render all transactions
    function renderTransactions() {
        transactionListEl.innerHTML = '';
        if (transactions.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = 'No transactions yet.';
            emptyMsg.style.color = '#a5b4fc';
            emptyMsg.style.textAlign = 'center';
            transactionListEl.appendChild(emptyMsg);
            return;
        }
        transactions.forEach((tx, idx) => {
            const li = document.createElement('li');
            li.className = 'transaction-item animate-in';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'transaction-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'transaction-name';
            nameSpan.textContent = tx.name;

            const typeSpan = document.createElement('span');
            typeSpan.className = 'transaction-type';
            typeSpan.textContent = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);

            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(typeSpan);

            const amountSpan = document.createElement('span');
            amountSpan.className = 'transaction-amount ' + tx.type;
            amountSpan.textContent = (tx.type === 'expense' ? '-' : '+') + '$' + Number(tx.amount).toFixed(2);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.setAttribute('data-idx', idx);

            li.appendChild(infoDiv);
            li.appendChild(amountSpan);
            li.appendChild(deleteBtn);
            transactionListEl.appendChild(li);

            setTimeout(() => li.classList.remove('animate-in'), 600);
        });
    }

    // Update balance display with animation
    function updateBalance() {
        let income = 0, expense = 0;
        transactions.forEach(tx => {
            if (tx.type === 'income') {
                income += Number(tx.amount);
            } else {
                expense += Number(tx.amount);
            }
        });
        const balance = income - expense;
        balanceEl.textContent = (balance >= 0 ? '$' : '-$') + Math.abs(balance).toFixed(2);
        balanceEl.style.color = balance >= 0 ? '#10b981' : '#ef4444';
        if (balance !== lastBalance) {
            balanceEl.classList.remove('balance-animate');
            void balanceEl.offsetWidth;
            balanceEl.classList.add('balance-animate');
            lastBalance = balance;
        }
    }

    // Show warning message
    function showWarning(message) {
        warningEl.textContent = message;
        warningEl.classList.add('active');
        setTimeout(() => warningEl.classList.remove('active'), 2500);
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const amountRaw = amountInput.value.trim();
        const type = Array.from(typeInputs).find(r => r.checked).value;
        const amount = Math.abs(Number(amountRaw));

        if (!name) {
            showWarning('Please enter a transaction name.');
            return;
        }
        if (!amountRaw || isNaN(amount) || amount <= 0) {
            showWarning('Please enter a valid amount greater than zero.');
            return;
        }

        transactions.push({
            name,
            amount: amount.toFixed(2),
            type
        });
        saveTransactions();
        renderTransactions();
        updateBalance();
        form.reset();
    });

    // Handle delete transaction with animation
    transactionListEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const idx = e.target.getAttribute('data-idx');
            const li = e.target.closest('.transaction-item');
            if (li) {
                li.classList.add('animate-out');
                setTimeout(() => {
                    transactions.splice(idx, 1);
                    saveTransactions();
                    renderTransactions();
                    updateBalance();
                }, 500);
            }
        }
    });

    // Initial load
    loadTransactions();
    renderTransactions();
    updateBalance();
}); 