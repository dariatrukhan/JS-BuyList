const inp = document.getElementById('name');
const btn = document.getElementById('add');
const itemsList = document.querySelector('.items-list');

// ———————————————————ОНОВЛЕННЯ СТАТИСТИКИ / LOCALSTORAGE
function updateAll() {
    const sections = document.querySelectorAll('.stats-group');
    let leftContainer, boughtContainer;

    sections.forEach(section => {
        const header = section.querySelector('h2');
        if (header?.textContent.includes('Залишилося')) leftContainer = section.querySelector('.content');
        if (header?.textContent.includes('Куплено')) boughtContainer = section.querySelector('.content');
    });

    if (!leftContainer || !boughtContainer) return;
    leftContainer.innerHTML = ''; boughtContainer.innerHTML = '';

    const itemsForStorage = [];

    document.querySelectorAll('.item-row').forEach(row => {
        const name = row.querySelector('.item-name')?.textContent.trim();
        const qty = parseInt(row.querySelector('.quantity-number')?.textContent || 1);
        const isBought = row.querySelector('.status-btn')?.style.display === 'none';

        if (!name) return;
        itemsForStorage.push({ name, quantity: qty, bought: isBought });

        const li = document.createElement('li');
        li.className = isBought ? 'badge bought' : 'badge';
        li.innerHTML = isBought ? `<s>${name}</s> <span class="badge-num"><s>${qty}</s></span>` : `${name} <span class="badge-num">${qty}</span>`;
        (isBought ? boughtContainer : leftContainer).appendChild(li);
    });

    localStorage.setItem('buyListState', JSON.stringify(itemsForStorage));
}

// ———————————————————КНОПКА СТАТУСУ
function StatusBtn(itemRow, isBought) {
    const itemName = itemRow.querySelector('.item-name');
    if (!itemName) return;

    itemName.innerHTML = isBought ? `<s>${itemName.textContent}</s>` : itemName.textContent;
    itemName.setAttribute('data-tooltip', isBought ? 'Куплений товар не можна редагувати' : 'Редагувати назву');

    itemRow.querySelector('.status-btn').style.display = isBought ? 'none' : 'flex';
    itemRow.querySelector('.btn-plus').style.display = isBought ? 'none' : 'flex';
    const btnMinus = itemRow.querySelector('.btn-minus');
    btnMinus.style.display = isBought ? 'none' : 'flex';
    itemRow.querySelector('.dist').style.display = isBought ? 'none' : 'flex';
    itemRow.querySelector('.decline-btn').style.display = isBought ? 'none' : 'flex';

    itemRow.querySelector('.status-btn2').style.display = isBought ? 'flex' : 'none';
    itemRow.querySelector('.btn-plus2').style.display = isBought ? 'flex' : 'none';
    itemRow.querySelector('.btn-minus22').style.display = isBought ? 'flex' : 'none';
    itemRow.querySelector('.distt').style.display = isBought ? 'flex' : 'none';
    itemRow.querySelector('.decline-btn2').style.display = isBought ? 'flex' : 'none';

    if (!isBought) {
        const qty = parseInt(itemRow.querySelector('.quantity-number').textContent);
        btnMinus.disabled = qty <= 1;
        
        if (qty <= 1) {
            btnMinus.setAttribute('data-tooltip', 'Неможливо зменшити');
        } else {
            btnMinus.setAttribute('data-tooltip', 'Зменшити кількість');
        }
    }
}

// ———————————————————КНОПКИ ЗМІНИ КІЛЬКОСТІ / НАЗВИ / ВИДАЛЕННЯ
function ItemEvents(itemRow) {
    // видалити
    const removeRow = () => { itemRow.remove(); updateAll(); };
    itemRow.querySelector('.decline-btn').onclick = removeRow;
    itemRow.querySelector('.decline-btn2').onclick = removeRow;

    // змінити кількість
    const qtyNum = itemRow.querySelector('.quantity-number');
    const btnMinus = itemRow.querySelector('.btn-minus');

    const validMinus = (qty) => {
        if (qty <= 1) {
            btnMinus.disabled = true;
            btnMinus.setAttribute('data-tooltip', 'Неможливо зменшити');
        } else {
            btnMinus.disabled = false;
            btnMinus.setAttribute('data-tooltip', 'Зменшити кількість');
        }
    };

    if (qtyNum && btnMinus) {
        validMinus(parseInt(qtyNum.textContent));
    }

    itemRow.querySelector('.btn-plus').onclick = () => {
        let qty = parseInt(qtyNum.textContent) + 1;
        qtyNum.textContent = qty;
        validMinus(qty);
        updateAll();
    };

    btnMinus.onclick = () => {
        let qty = parseInt(qtyNum.textContent);
        if (qty > 1) qtyNum.textContent = --qty;
        validMinus(qty);
        updateAll();
    };

    itemRow.querySelector('.status-btn').onclick = () => {
        StatusBtn(itemRow, true);
        updateAll();
    };
    itemRow.querySelector('.status-btn2').onclick = () => {
        StatusBtn(itemRow, false);
        updateAll();
    };

    //редагувати назву
    const itemName = itemRow.querySelector('.item-name');
    itemName.onclick = () => {
        if (itemRow.querySelector('.status-btn2').style.display === 'flex')
            return;

        const currentName = itemName.textContent.trim();
        const form2 = document.createElement('form');
        form2.className = 'form2';
        form2.onsubmit = e => e.preventDefault();

        const input2 = document.createElement('input');
        input2.type = 'text'; input2.value = currentName;
        form2.appendChild(input2);

        itemName.removeAttribute('data-tooltip');
        itemName.style.display = 'none';
        itemName.parentNode.insertBefore(form2, itemName);
        input2.focus(); input2.select();

        let isCancelled = false;

        const saveName = () => {
            if (isCancelled) return;
            const newName = input2.value.trim();

            if (!newName) {
                alert("Назва товару не може бути порожньою!");
                input2.focus();
                return;
            }
            
            const duplicates = Array.from(document.querySelectorAll('.item-name'))
                .filter(el => el !== itemName)
                .map(el => el.textContent.trim().toLowerCase());

            if (duplicates.includes(newName.toLowerCase())) {
                alert("Цей товар вже існує!");
                input2.focus();
                return;
            }

            itemName.textContent = newName;
            form2.remove();
            itemName.style.display = 'inline-block';
            itemName.setAttribute('data-tooltip', 'Редагувати назву');
            updateAll();
        };

        input2.onkeydown = e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveName();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                isCancelled = true;
                form2.remove();
                itemName.style.display = 'inline-block';
                itemName.setAttribute('data-tooltip', 'Редагувати назву');
            }
        };
        input2.onblur = () => setTimeout(() => {
            if (!isCancelled && document.body.contains(form2))
            saveName();
        }, 100);
    };
}

// ———————————————————СТВОРЕННЯ ЕЛЕМЕНТА В DOM 
function NewItemDOM(name, quantity, isBought) {
    const template = document.getElementById('item-template');
    if (!itemsList || !template) return;

    const itemFragment = template.content.cloneNode(true);
    itemFragment.querySelector('.item-name').textContent = name;
    itemFragment.querySelector('.quantity-number').textContent = quantity;

    const li = itemFragment.querySelector('.item-row');
    ItemEvents(li);
    StatusBtn(li, isBought);
    itemsList.appendChild(itemFragment);
}

// ———————————————————КНОПКА ДОДАВАННЯ ТОВАРУ
function AddBtn() {
    if (!inp || !btn) return;

    const handleAdd = () => {
        const title = inp.value.trim();
        if (!title) { inp.value = ""; inp.focus(); return; }

        const existing = Array.from(document.querySelectorAll('.item-name')).map(el => el.textContent.trim().toLowerCase());
        if (existing.includes(title.toLowerCase())) {
            alert("Цей товар вже існує!");
            inp.focus(); return;
        }

        NewItemDOM(title, 1, false);
        inp.value = ""; inp.focus();
        updateAll();
    };

    btn.onclick = handleAdd;
    inp.onkeydown = e => {
        if (e.key === 'Enter') {
            e.preventDefault(); handleAdd();
        }
    };
}

// ———————————————————ЗАПУСК
AddBtn();
const savedData = localStorage.getItem('buyListState');

if (savedData) {
    if (itemsList) itemsList.innerHTML = '';
    JSON.parse(savedData).forEach(item => NewItemDOM(item.name, item.quantity, item.bought));
} else {
    document.querySelectorAll('.item-row').forEach(row => {
        ItemEvents(row);
        const isCurrentlyBought = row.querySelector('.item-name s') !== null;
        StatusBtn(row, isCurrentlyBought); 
    });
}
updateAll();