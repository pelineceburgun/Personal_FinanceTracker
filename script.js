document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transaction-form");
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const categoryInput = document.getElementById("category");
  const transactionList = document.getElementById("transaction-list");
  const balanceAmount = document.getElementById("balance-amount");
  const totalIncome = document.getElementById("total-income");
  const totalExpense = document.getElementById("total-expense");

  const transactions = [];

  
  const chartLabels = ["Income", "Expense"];
  let chartData = [0, 0];
  const ctx = document.getElementById("myChart").getContext("2d");
  const transactionChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: chartLabels,
      datasets: [{
        label: "Transactions",
        data: chartData,
        backgroundColor: ["#4caf50", "#f44336"],
      }],
    },
    options: {
      responsive: true,
    },
  });

  
  const filterContainer = document.createElement("div");
  const filterInput = document.createElement("input");
  filterInput.id = "filter-search";
  filterInput.placeholder = "Search by description...";
  const filterCategory = document.createElement("select");
  filterCategory.id = "filter-category";
  filterCategory.innerHTML = `
    <option value="all">All Categories</option>
    <option value="income">Income</option>
    <option value="expense">Expense</option>
  `;
  filterContainer.append(filterInput, filterCategory);
  transactionList.parentNode.insertBefore(filterContainer, transactionList);

  
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value.trim());
    const category = categoryInput.value;
    const date = new Date().toLocaleDateString();

    if (!description || isNaN(amount)) return;

    transactions.push({ description, amount, category, date });
    updateUI();
    updateChart();
    updateSummary();
    form.reset();
  });

  
  function updateUI() {
    const searchTerm = filterInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const filteredTransactions = transactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm);
      const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    renderTransactions(filteredTransactions);
    updateBalance();
  }

  
  function renderTransactions(transactionArray) {
    transactionList.innerHTML = "";
    transactionArray.forEach(({ description, amount, category, date }, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${date} - ${description} <strong>${amount > 0 ? "+" : ""}${amount}₺</strong> [${category}]
        <button class="delete-btn" data-index="${index}">Delete</button>
      `;
      transactionList.appendChild(li);
    });
  }

  
  function updateBalance() {
    const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    balanceAmount.textContent = total.toFixed(2);
  }

  
  transactionList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      const removed = transactions.splice(index, 1)[0];

      
      if (removed.category === "income") {
        chartData[0] -= removed.amount;
      } else if (removed.category === "expense") {
        chartData[1] += removed.amount;
      }
      updateUI();
      updateChart();
      updateSummary();
      
    }
  });

  function updateSummary() {
    const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = income - expense;

    balanceAmount.textContent = `${balance}₺`;
    totalIncome.textContent = `${income}₺`;
    totalExpense.textContent = `${expense}₺`;

    chartData[0] = income;
    chartData[1] = expense;
    transactionChart.update();
  }
  
  function updateChart() {
    chartData = [0, 0]; 
    transactions.forEach((transaction) => {
      if (transaction.category === "income") {
        chartData[0] += transaction.amount;
      } else if (transaction.category === "expense") {
        chartData[1] += Math.abs(transaction.amount);
      }
    });
    transactionChart.data.datasets[0].data = chartData;
    transactionChart.update();
  }

  
  filterInput.addEventListener("input", updateUI);
  filterCategory.addEventListener("change", updateUI);
});

