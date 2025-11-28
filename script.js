// Copied script.js into proj/ so index will load properly when deployed to GitHub Pages
const people = [];
const expenses = [];
const peoplePhotos = [];

function addPerson() {
    const name = document.getElementById("personName").value.trim();
    const photoInput = document.getElementById('personPhoto');
    const file = photoInput && photoInput.files && photoInput.files[0];
    if (!name) return alert("Enter a name");

    if (people.includes(name)) return alert("This name already exists!");

    people.push(name);
    if (file) peoplePhotos.push(URL.createObjectURL(file)); else peoplePhotos.push(null);
    document.getElementById("personName").value = "";
    if (photoInput) photoInput.value = null;

    renderPeople();
    renderPayerList();
    renderSummary();
}

// helpers for avatar initials and colors
function getInitials(name) {
    return name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getColorForName(name) {
    const colors = ['#09fbd3', '#ff6b6b', '#f9c74f', '#90be6d', '#5b86e5', '#7b61ff', '#ff9f1c'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
}

function renderPeople() {
    const list = document.getElementById("peopleList");
    list.innerHTML = "<h4>Participants:</h4>";
    people.forEach((p, i) => {
        const initials = getInitials(p);
        const color = getColorForName(p);
        if (peoplePhotos[i]) {
            list.innerHTML += `
                <div class="list-item person-entry">
                    <div style="display:flex;align-items:center">
                        <img class="avatar" src="${peoplePhotos[i]}" style="border-radius:10px;width:40px;height:40px;margin-right:10px" />
                        <div>${p}</div>
                    </div>
                    <div>—</div>
                </div>`;
        } else {
            list.innerHTML += `
            <div class="list-item person-entry">
                <div style="display:flex;align-items:center">
                    <div class="avatar" style="background:${color}">${initials}</div>
                    <div>${p}</div>
                </div>
                <div>—</div>
            </div>
            `;
        }
    });
}

function renderPayerList() {
    const select = document.getElementById("expensePayer");
    select.innerHTML = "";

    people.forEach((p, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = p;
        select.appendChild(opt);
    });
}

function addExpense() {
    const desc = document.getElementById("expenseDesc").value.trim();
    const amt = parseFloat(document.getElementById("expenseAmt").value);
    const payer = parseInt(document.getElementById("expensePayer").value);

    if (!desc || !amt) return alert("Enter valid expense details");
    if (people.length === 0) return alert("Add people first");

    expenses.push({ desc, amt, payer });

    document.getElementById("expenseDesc").value = "";
    document.getElementById("expenseAmt").value = "";

    renderExpenses();
    renderSummary();
}

function renderExpenses() {
    const list = document.getElementById("expenseList");
    list.innerHTML = "<h4>Expenses:</h4>";
    expenses.forEach((e) => {
        const initials = getInitials(people[e.payer]);
        const color = getColorForName(people[e.payer]);
        const photo = peoplePhotos[e.payer];
        list.innerHTML += `
            <div class="list-item">
                <div style="display:flex;align-items:center;gap:10px">
                    ${photo ? `<img class="avatar" src="${photo}" style="border-radius:10px;width:40px;height:40px;margin-right:10px" />` : `<div class="avatar" style="background:${color}">${initials}</div>`}
                    <div>${e.desc}</div>
                </div>
                <div>₹${e.amt.toFixed(2)} (Paid by ${people[e.payer]})</div>
            </div>
        `;
    });
}

function renderSummary() {
    const area = document.getElementById("summaryArea");
    area.innerHTML = "";

    const balance = new Array(people.length).fill(0);
    let totalExpense = 0;
    const spent = new Array(people.length).fill(0);

    expenses.forEach((e) => {
        totalExpense += e.amt;
        spent[e.payer] += e.amt;

        const share = e.amt / people.length;
        people.forEach((_, i) => balance[i] -= share);
        balance[e.payer] += e.amt;
    });

    const totalBalance = balance.reduce((a, b) => a + b, 0);
    const remainingBalance = (totalExpense - totalExpense).toFixed(2); // always 0
    const totalPeople = people.length;
    const totalExpensesCount = expenses.length;
    const avgExpense = totalPeople ? totalExpense / totalPeople : 0;

    const maxSpent = spent.length > 0 ? Math.max(...spent) : 0;
    const minSpent = spent.length > 0 ? Math.min(...spent) : 0;

    const highestSpender = people[spent.indexOf(maxSpent)] || "–";
    const lowestSpender = people[spent.indexOf(minSpent)] || "–";

    // Update summary HTML
    document.getElementById("totalExpense").innerText = totalExpense.toFixed(2);
    document.getElementById("totalBalance").innerText = totalBalance.toFixed(2);
    document.getElementById("remainingBalance").innerText = remainingBalance;
    document.getElementById("totalPeople").innerText = totalPeople;
    document.getElementById("totalExpensesCount").innerText = totalExpensesCount;
    document.getElementById("avgExpense").innerText = avgExpense.toFixed(2);
    document.getElementById("highestSpender").innerText = `${highestSpender} (₹${maxSpent.toFixed(2)})`;
    document.getElementById("lowestSpender").innerText = `${lowestSpender} (₹${minSpent.toFixed(2)})`;

    // Table view
    let html = "<table><tr><th>Name</th><th>Balance</th></tr>";
    balance.forEach((b, i) => {
        html += `
            <tr>
                <td>${people[i]}</td>
                <td class="${b >= 0 ? 'green' : 'red'}">₹${b.toFixed(2)}</td>
            </tr>
        `;
    });
    html += "</table>";
    area.innerHTML = html;
}

// Attach ui event listeners
document.addEventListener('DOMContentLoaded', () => {
    const addPersonBtn = document.getElementById('addPersonBtn');
    if (addPersonBtn) addPersonBtn.addEventListener('click', addPerson);

    const addExpenseBtn = document.getElementById('addExpenseBtn');
    if (addExpenseBtn) addExpenseBtn.addEventListener('click', addExpense);

    // download resume: simple HTML snapshot
    const downloadBtn = document.getElementById('downloadResume');
    if (downloadBtn) downloadBtn.addEventListener('click', () => {
        const html = `<!doctype html><html>${document.documentElement.innerHTML}</html>`;
        const blob = new Blob([html], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'split-bill-calculator-resume.html';
        a.click();
        URL.revokeObjectURL(url);
    });
    const changePhoto = document.getElementById('changePhoto');
    const profileUpload = document.getElementById('profileUpload');
    if (changePhoto && profileUpload) {
        changePhoto.addEventListener('click', () => profileUpload.click());
        profileUpload.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (f) {
                const p = document.getElementById('profilePhoto');
                p.src = URL.createObjectURL(f);
            }
        });
    }
});