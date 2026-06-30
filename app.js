// State Management
let menu = [];
let cart = [];
let transactions = [];
let selectedCategory = 'all';
let searchQuery = '';
let selectedPaymentMethod = 'Cash';

// Default Settings
let settings = {
    cafeName: 'CAFFÈ ANDRIAN COZY',
    cafeAddress: 'Jl. Sidokatut Ketanireng kode pos 67157',
    cafePhone: '085536581733',
    receiptFooter1: 'Terima Kasih Atas Kunjungan Anda',
    receiptFooter2: 'Dukung Kami dengan Datang Kembali!'
};

// Default Menu Items (First load fallback)
const defaultMenu = [
    { id: 'm1', name: 'Espresso', category: 'kopi', price: 15000, desc: 'Tembakan kopi murni yang pekat dan beraroma kuat', emoji: '☕' },
    { id: 'm2', name: 'Americano', category: 'kopi', price: 20000, desc: 'Espresso dengan tambahan air panas, segar dan ringan', emoji: '☕' },
    { id: 'm3', name: 'Cafe Latte', category: 'kopi', price: 25000, desc: 'Espresso dengan susu segar berbusa lembut di atasnya', emoji: '☕' },
    { id: 'm4', name: 'Cappuccino', category: 'kopi', price: 25000, desc: 'Espresso dengan kombinasi susu dan busa susu tebal', emoji: '☕' },
    { id: 'm5', name: 'Es Kopi Aren', category: 'kopi', price: 22000, desc: 'Kopi susu khas Indonesia dengan manisnya gula aren murni', emoji: '☕' },
    { id: 'm6', name: 'Matcha Latte', category: 'non-kopi', price: 24000, desc: 'Teh hijau Jepang bubuk premium diseduh dengan susu segar', emoji: '🥤' },
    { id: 'm7', name: 'Chocolate Signature', category: 'non-kopi', price: 24000, desc: 'Cokelat hitam pekat premium yang manis dan creamy', emoji: '🥤' },
    { id: 'm8', name: 'Lemon Tea', category: 'non-kopi', price: 18000, desc: 'Teh hitam segar berpadu dengan perasan lemon asli', emoji: '🥤' },
    { id: 'm9', name: 'Nasi Goreng Cafe', category: 'makanan', price: 30000, desc: 'Nasi goreng bumbu spesial cafe dengan telur dan kerupuk', emoji: '🍛' },
    { id: 'm10', name: 'Mie Goreng Spesial', category: 'makanan', price: 28000, desc: 'Mie goreng lezat dengan suwiran ayam dan sayuran segar', emoji: '🍛' },
    { id: 'm11', name: 'Croissant Butter', category: 'cemilan', price: 22000, desc: 'Roti prancis mentega berlapis yang renyah dan gurih', emoji: '🥐' },
    { id: 'm12', name: 'French Fries', category: 'cemilan', price: 18000, desc: 'Kentang goreng renyah dengan taburan garam gurih', emoji: '🥐' }
];

// Helper: Format number to Indonesian Rupiah currency
function formatRupiah(number) {
    return 'Rp ' + number.toLocaleString('id-ID');
}

// Initialise App on load
window.addEventListener('DOMContentLoaded', () => {
    // Load Menu from localStorage or load default
    if (!localStorage.getItem('cozy_cafe_menu')) {
        localStorage.setItem('cozy_cafe_menu', JSON.stringify(defaultMenu));
        menu = [...defaultMenu];
    } else {
        menu = JSON.parse(localStorage.getItem('cozy_cafe_menu'));
    }

    // Load Transactions from localStorage
    if (localStorage.getItem('cozy_cafe_transactions')) {
        transactions = JSON.parse(localStorage.getItem('cozy_cafe_transactions'));
    }

    // Load Settings from localStorage
    if (!localStorage.getItem('cozy_cafe_settings')) {
        localStorage.setItem('cozy_cafe_settings', JSON.stringify(settings));
    } else {
        settings = JSON.parse(localStorage.getItem('cozy_cafe_settings'));
    }

    // Run Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Initial renders
    renderMenu();
    renderCart();
    renderMenuMgmt();
    renderHistory();
});

// Update date and time on sidebar
function updateClock() {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const dateNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const dateDisplay = document.getElementById('date-display');
    const timeDisplay = document.getElementById('time-display');

    if (dateDisplay) dateDisplay.textContent = `${dayName}, ${dateNum} ${monthName} ${year}`;
    if (timeDisplay) timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}

// Sidebar Tab Switcher
function switchTab(tabId) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    // Remove active style from all sidebar buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected panel
    const selectedPanel = document.getElementById(`tab-${tabId}`);
    if (selectedPanel) selectedPanel.classList.add('active');

    // Highlight active sidebar button
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Refresh layout data if necessary
    if (tabId === 'menu-mgmt') {
        renderMenuMgmt();
    } else if (tabId === 'history') {
        renderHistory();
    } else if (tabId === 'pos') {
        renderMenu();
    } else if (tabId === 'settings') {
        document.getElementById('settings-cafe-name').value = settings.cafeName;
        document.getElementById('settings-cafe-address').value = settings.cafeAddress;
        document.getElementById('settings-cafe-phone').value = settings.cafePhone;
        document.getElementById('settings-footer-1').value = settings.receiptFooter1;
        document.getElementById('settings-footer-2').value = settings.receiptFooter2;
    }
}

// --- Point of Sale (POS) Logic ---

// Set category filter and update display
function setCategoryFilter(category) {
    selectedCategory = category;
    
    // Update active filter pill style
    const filterContainer = document.getElementById('category-filters');
    filterContainer.querySelectorAll('.filter-pill').forEach(pill => {
        pill.classList.remove('active');
    });

    // Find the clicked pill based on category parameter
    const pills = filterContainer.querySelectorAll('.filter-pill');
    pills.forEach(pill => {
        const text = pill.textContent.toLowerCase();
        if (category === 'all' && text.includes('semua')) {
            pill.classList.add('active');
        } else if (category === 'kopi' && text.includes('kopi') && !text.includes('non-kopi')) {
            pill.classList.add('active');
        } else if (category === 'non-kopi' && text.includes('non-kopi')) {
            pill.classList.add('active');
        } else if (category === 'makanan' && text.includes('makanan')) {
            pill.classList.add('active');
        } else if (category === 'cemilan' && text.includes('cemilan')) {
            pill.classList.add('active');
        }
    });

    renderMenu();
}

// Set search query
function filterMenu() {
    searchQuery = document.getElementById('menu-search').value.toLowerCase();
    renderMenu();
}

// Render menu items matching filter and search
function renderMenu() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = '';

    const filteredMenu = menu.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery) || 
                              item.desc.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-cart" style="grid-column: 1 / -1; padding: 4rem 1rem;">
                <div class="empty-icon">🔍</div>
                <p>Menu tidak ditemukan. Coba kata kunci lain atau tambahkan menu baru.</p>
            </div>
        `;
        return;
    }

    filteredMenu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.onclick = () => addToCart(item.id);
        card.innerHTML = `
            <div class="menu-item-info">
                <h3 class="menu-item-name" title="${item.name}">${item.name}</h3>
                <span class="menu-item-price" style="display: block; margin-top: 0.2rem; margin-bottom: 0.4rem;">${formatRupiah(item.price)}</span>
                <p class="menu-item-desc">${item.desc || 'Tanpa deskripsi.'}</p>
            </div>
            <div class="menu-item-bottom" style="display: flex; justify-content: flex-end; align-items: center; margin-top: 0.5rem;">
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${item.id}')">+</button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

// Add item to Cart
function addToCart(productId) {
    const product = menu.find(item => item.id === productId);
    if (!product) return;

    const existingCartItem = cart.find(item => item.product.id === productId);

    if (existingCartItem) {
        existingCartItem.quantity += 1;
    } else {
        cart.push({
            product: product,
            quantity: 1,
            note: ''
        });
    }

    renderCart();
    calculateTotal();
}

// Decrease/Increase item quantity in cart
function updateQuantity(productId, delta) {
    const cartItemIndex = cart.findIndex(item => item.product.id === productId);
    if (cartItemIndex === -1) return;

    cart[cartItemIndex].quantity += delta;

    if (cart[cartItemIndex].quantity <= 0) {
        cart.splice(cartItemIndex, 1);
    }

    renderCart();
    calculateTotal();
}

// Remove item completely from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    renderCart();
    calculateTotal();
}

// Save customization note for cart item
function updateItemNote(productId, noteText) {
    const cartItem = cart.find(item => item.product.id === productId);
    if (cartItem) {
        cartItem.note = noteText;
    }
}

// Reset cart state
function clearCart() {
    cart = [];
    document.getElementById('cart-discount-input').value = 0;
    renderCart();
    calculateTotal();
}

// Render active cart sidebar UI
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-icon">🛒</div>
                <p>Keranjang kosong. Pilih menu di sebelah kiri untuk memesan.</p>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <div class="cart-item-top">
                <span class="cart-item-name" title="${item.product.name}">${item.product.name}</span>
                <span class="cart-item-price">${formatRupiah(item.product.price * item.quantity)}</span>
            </div>
            <input type="text" class="cart-item-note-input" placeholder="Tambah catatan (cth: es dikit)..." value="${item.note}" onchange="updateItemNote('${item.product.id}', this.value)">
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="qty-btn" onclick="updateQuantity('${item.product.id}', -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.product.id}', 1)">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart('${item.product.id}')" title="Hapus Item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(itemRow);
    });
}

// Calculate cart costs
let calculatedSubtotal = 0;
let calculatedTax = 0;
let calculatedDiscountAmount = 0;
let calculatedTotalDue = 0;

function calculateTotal() {
    calculatedSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // Tax % from input field
    const taxPercent = parseInt(document.getElementById('cart-tax-input').value) || 0;
    calculatedTax = Math.round(calculatedSubtotal * (taxPercent / 100));
    
    // Discount
    const discountPercent = parseInt(document.getElementById('cart-discount-input').value) || 0;
    calculatedDiscountAmount = Math.round((calculatedSubtotal + calculatedTax) * (discountPercent / 100));

    // Grand Total
    calculatedTotalDue = (calculatedSubtotal + calculatedTax) - calculatedDiscountAmount;

    // Render costs
    document.getElementById('cart-subtotal').textContent = formatRupiah(calculatedSubtotal);
    document.getElementById('cart-tax').textContent = formatRupiah(calculatedTax);
    document.getElementById('cart-total').textContent = formatRupiah(calculatedTotalDue);

    // Disable checkout button if empty
    const btnCheckout = document.getElementById('btn-checkout');
    if (btnCheckout) {
        btnCheckout.disabled = cart.length === 0;
    }
}

// --- Checkout Modal ---
function openPaymentModal() {
    if (cart.length === 0) return;

    // Show Modal
    const modal = document.getElementById('payment-modal');
    modal.style.display = 'flex';

    // Populate billing total
    document.getElementById('pay-amount-due').textContent = formatRupiah(calculatedTotalDue);
    
    // Default configuration (Cash method)
    selectPaymentMethod('Cash');
    
    // Reset cash inputs
    document.getElementById('cash-received').value = '';
    calculateChange();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Switch payment fields
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Adjust button classes
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const activeBtn = document.getElementById(`method-${method.toLowerCase()}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Show/Hide fields
    const cashFields = document.getElementById('cash-payment-fields');
    const nonCashFields = document.getElementById('non-cash-fields');
    const qrisScanner = document.getElementById('qris-scanner');
    const cardTerminal = document.getElementById('card-terminal');

    if (method === 'Cash') {
        cashFields.style.display = 'block';
        nonCashFields.style.display = 'none';
        qrisScanner.style.display = 'none';
        cardTerminal.style.display = 'none';
        calculateChange(); // Validate cash received
    } else {
        cashFields.style.display = 'none';
        nonCashFields.style.display = 'block';
        
        if (method === 'QRIS') {
            qrisScanner.style.display = 'block';
            cardTerminal.style.display = 'none';
        } else if (method === 'Card') {
            qrisScanner.style.display = 'none';
            cardTerminal.style.display = 'block';
        }

        // Auto-enable transaction completion for simulated e-payments
        const btnSubmit = document.getElementById('btn-submit-payment');
        btnSubmit.disabled = false;
    }
}

// Quick cash selection helper
function quickCash(amount) {
    const input = document.getElementById('cash-received');
    if (amount === 'pas') {
        input.value = calculatedTotalDue;
    } else {
        input.value = amount;
    }
    calculateChange();
}

// Real-time calculation of change
function calculateChange() {
    const inputVal = parseFloat(document.getElementById('cash-received').value) || 0;
    const changeDisplay = document.getElementById('cash-change');
    const btnSubmit = document.getElementById('btn-submit-payment');
    
    if (selectedPaymentMethod !== 'Cash') {
        return;
    }

    const change = inputVal - calculatedTotalDue;

    if (inputVal === 0) {
        changeDisplay.textContent = formatRupiah(0);
        changeDisplay.className = 'pas';
        btnSubmit.disabled = true;
    } else if (change < 0) {
        // Not enough cash paid
        changeDisplay.textContent = 'Kurang ' + formatRupiah(Math.abs(change));
        changeDisplay.className = 'kurang';
        btnSubmit.disabled = true;
    } else {
        // Paid successfully with optional change
        changeDisplay.textContent = formatRupiah(change);
        changeDisplay.className = 'pas';
        btnSubmit.disabled = false;
    }
}

// Save transaction and switch to receipt modal
function processPayment() {
    const cashReceivedVal = parseFloat(document.getElementById('cash-received').value) || 0;
    
    // Create new transaction object
    const txId = 'TX-' + Date.now().toString().slice(-6); // generated unique transaction ID
    const now = new Date();
    const datetimeStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const paidVal = selectedPaymentMethod === 'Cash' ? cashReceivedVal : calculatedTotalDue;
    const changeVal = selectedPaymentMethod === 'Cash' ? Math.max(0, cashReceivedVal - calculatedTotalDue) : 0;

    const taxPercentVal = parseInt(document.getElementById('cart-tax-input').value) || 0;

    const newTransaction = {
        id: txId,
        datetime: datetimeStr,
        items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            note: item.note
        })),
        subtotal: calculatedSubtotal,
        taxPercent: taxPercentVal,
        tax: calculatedTax,
        discount: calculatedDiscountAmount,
        total: calculatedTotalDue,
        method: selectedPaymentMethod,
        paid: paidVal,
        change: changeVal
    };

    // Save to sales log
    transactions.push(newTransaction);
    localStorage.setItem('cozy_cafe_transactions', JSON.stringify(transactions));

    // Close payment checkout modal
    closeModal('payment-modal');

    // Build thermal receipt printout
    renderReceipt(newTransaction);

    // Open receipt modal
    document.getElementById('receipt-modal').style.display = 'flex';

    // Clear active cart & update POS/stats dashboard
    clearCart();
    renderHistory();
}

// Render receipt inside modal
function renderReceipt(tx) {
    // Render receipt header/footer from settings
    document.getElementById('receipt-title-val').textContent = settings.cafeName;
    document.getElementById('receipt-address-val').textContent = settings.cafeAddress;
    document.getElementById('receipt-phone-val').textContent = `Telp: ${settings.cafePhone}`;
    document.getElementById('receipt-footer-msg1').textContent = settings.receiptFooter1;
    document.getElementById('receipt-footer-msg2').textContent = settings.receiptFooter2;

    document.getElementById('receipt-tx-id').textContent = tx.id;
    document.getElementById('receipt-date').textContent = tx.datetime;
    document.getElementById('receipt-method').textContent = tx.method;
    
    // Render item rows
    const list = document.getElementById('receipt-items-list');
    list.innerHTML = '';

    tx.items.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'receipt-item-row';
        itemRow.innerHTML = `
            <div class="receipt-item-name">${item.name}</div>
            <div class="receipt-item-details">
                <span>${item.quantity} x ${formatRupiah(item.price)}</span>
                <span>${formatRupiah(item.price * item.quantity)}</span>
            </div>
            ${item.note ? `<div class="receipt-item-note">* Catatan: ${item.note}</div>` : ''}
        `;
        list.appendChild(itemRow);
    });

    // Render costs summary
    document.getElementById('receipt-subtotal').textContent = formatRupiah(tx.subtotal);
    document.getElementById('receipt-tax-label').textContent = `Pajak (${tx.taxPercent !== undefined ? tx.taxPercent : 10}%):`;
    document.getElementById('receipt-tax').textContent = formatRupiah(tx.tax);
    
    const discRow = document.getElementById('receipt-discount-row');
    if (tx.discount > 0) {
        discRow.style.display = 'flex';
        document.getElementById('receipt-discount').textContent = '-' + formatRupiah(tx.discount);
    } else {
        discRow.style.display = 'none';
    }

    document.getElementById('receipt-total').textContent = formatRupiah(tx.total);
    document.getElementById('receipt-paid').textContent = formatRupiah(tx.paid);
    document.getElementById('receipt-change').textContent = formatRupiah(tx.change);
}

// Print / save receipt
function printReceipt() {
    window.print();
}

// --- Tab 2: Menu Management CRUD Logic ---

function renderMenuMgmt() {
    const tableBody = document.getElementById('menu-mgmt-list');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    menu.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${item.name}</strong>
            </td>
            <td style="text-transform: capitalize;">${item.category}</td>
            <td>${formatRupiah(item.price)}</td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.desc || '-'}</td>
            <td>
                <div class="action-btn-group">
                    <button class="action-btn edit-btn" onclick="openEditMenuModal('${item.id}')" title="Ubah Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteMenuItem('${item.id}')" title="Hapus Menu">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function openAddMenuModal() {
    document.getElementById('menu-modal-title').textContent = 'Tambah Menu Baru';
    document.getElementById('menu-id-input').value = '';
    document.getElementById('menu-name-input').value = '';
    document.getElementById('menu-category-input').value = 'kopi';
    document.getElementById('menu-price-input').value = '';
    document.getElementById('menu-desc-input').value = '';
    document.getElementById('menu-emoji-input').value = '☕';

    document.getElementById('menu-modal').style.display = 'flex';
}

function openEditMenuModal(productId) {
    const item = menu.find(i => i.id === productId);
    if (!item) return;

    document.getElementById('menu-modal-title').textContent = 'Ubah Menu';
    document.getElementById('menu-id-input').value = item.id;
    document.getElementById('menu-name-input').value = item.name;
    document.getElementById('menu-category-input').value = item.category;
    document.getElementById('menu-price-input').value = item.price;
    document.getElementById('menu-desc-input').value = item.desc || '';
    document.getElementById('menu-emoji-input').value = item.emoji || '☕';

    document.getElementById('menu-modal').style.display = 'flex';
}

// Add/Save menu item form action
function saveMenuItem(event) {
    event.preventDefault();
    
    const idVal = document.getElementById('menu-id-input').value;
    const nameVal = document.getElementById('menu-name-input').value;
    const catVal = document.getElementById('menu-category-input').value;
    const priceVal = parseFloat(document.getElementById('menu-price-input').value) || 0;
    const descVal = document.getElementById('menu-desc-input').value;
    const emojiVal = document.getElementById('menu-emoji-input').value || '☕';

    if (idVal) {
        // Edit Mode
        const index = menu.findIndex(item => item.id === idVal);
        if (index !== -1) {
            menu[index] = {
                id: idVal,
                name: nameVal,
                category: catVal,
                price: priceVal,
                desc: descVal,
                emoji: emojiVal
            };
        }
    } else {
        // Add Mode
        const newId = 'm-' + Date.now();
        menu.push({
            id: newId,
            name: nameVal,
            category: catVal,
            price: priceVal,
            desc: descVal,
            emoji: emojiVal
        });
    }

    // Persist and close modal
    localStorage.setItem('cozy_cafe_menu', JSON.stringify(menu));
    closeModal('menu-modal');

    // Update displays
    renderMenuMgmt();
    renderMenu();
}

function deleteMenuItem(productId) {
    const item = menu.find(i => i.id === productId);
    if (!item) return;

    const confirmDel = confirm(`Apakah Anda yakin ingin menghapus "${item.name}" dari menu?`);
    if (confirmDel) {
        menu = menu.filter(i => i.id !== productId);
        localStorage.setItem('cozy_cafe_menu', JSON.stringify(menu));
        
        // Update displays
        renderMenuMgmt();
        renderMenu();
    }
}

// --- Tab 3: Sales History and Stats Logic ---

function renderHistory() {
    const listBody = document.getElementById('history-list');
    if (!listBody) return;

    listBody.innerHTML = '';

    let totalRevenue = 0;
    let transactionCount = transactions.length;

    // Render list (latest first)
    const reversedTransactions = [...transactions].reverse();

    if (reversedTransactions.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 3rem 1rem;">
                    Belum ada riwayat transaksi hari ini.
                </td>
            </tr>
        `;
    } else {
        reversedTransactions.forEach(tx => {
            totalRevenue += tx.total;

            const row = document.createElement('tr');
            
            // Format badge method
            let badgeClass = 'badge-cash';
            if (tx.method === 'QRIS') badgeClass = 'badge-qris';
            else if (tx.method === 'Card') badgeClass = 'badge-card';

            row.innerHTML = `
                <td><strong>${tx.id}</strong></td>
                <td>${tx.datetime}</td>
                <td><span class="tx-method-badge ${badgeClass}">${tx.method}</span></td>
                <td>${formatRupiah(tx.subtotal)}</td>
                <td><strong>${formatRupiah(tx.total)}</strong></td>
                <td>
                    <button class="action-btn edit-btn" onclick="reprintReceipt('${tx.id}')" title="Cetak Ulang Struk">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </button>
                </td>
            `;
            listBody.appendChild(row);
        });
    }

    // Calculate aggregated revenue (from all transactions, not just rendered ones)
    const totalRevAll = transactions.reduce((sum, tx) => sum + tx.total, 0);
    const avgBasket = transactionCount > 0 ? Math.round(totalRevAll / transactionCount) : 0;

    // Render statistics cards
    document.getElementById('stat-total-revenue').textContent = formatRupiah(totalRevAll);
    document.getElementById('stat-total-transactions').textContent = transactionCount;
    document.getElementById('stat-avg-transaction').textContent = formatRupiah(avgBasket);
}

// Re-open receipt from history tab
function reprintReceipt(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    renderReceipt(tx);
    document.getElementById('receipt-modal').style.display = 'flex';
}

// Save Settings Form Handler
function saveSettings(event) {
    event.preventDefault();
    settings.cafeName = document.getElementById('settings-cafe-name').value;
    settings.cafeAddress = document.getElementById('settings-cafe-address').value;
    settings.cafePhone = document.getElementById('settings-cafe-phone').value;
    settings.receiptFooter1 = document.getElementById('settings-footer-1').value;
    settings.receiptFooter2 = document.getElementById('settings-footer-2').value;
    
    localStorage.setItem('cozy_cafe_settings', JSON.stringify(settings));
    alert('Pengaturan struk berhasil disimpan!');
}
// Fitur Tutup Buku: Reset statistik harian tanpa menghapus history permanen
function tutupBukuHarian() {
    // 1. Ambil transaksi hari ini
    if (transactions.length === 0) {
        alert("Belum ada transaksi hari ini untuk ditutup buku.");
        return;
    }

    const konfirmasi = confirm("Apakah Anda yakin ingin melakukan Tutup Buku? Statistik hari ini akan kembali ke Rp 0, dan semua transaksi hari ini akan dipindahkan ke Arsip Permanen.");
    
    if (konfirmasi) {
        // 2. Ambil data arsip lama yang sudah ada di localStorage (jika ada)
        let archive = [];
        if (localStorage.getItem('cozy_cafe_archive')) {
            archive = JSON.parse(localStorage.getItem('cozy_cafe_archive'));
        }

        // 3. Gabungkan transaksi hari ini ke dalam arsip permanen
        archive = archive.concat(transactions);
        localStorage.setItem('cozy_cafe_archive', JSON.stringify(archive));

        // 4. Kosongkan transaksi harian
        transactions = [];
        localStorage.setItem('cozy_cafe_transactions', JSON.stringify(transactions));

        // 5. Perbarui tampilan halaman kasir menjadi Rp 0 kembali
        renderHistory();
        
        alert("Tutup buku berhasil! Statistik harian telah di-reset, dan data aman di arsip.");
    }
}
// Fungsi untuk membuka modal arsip dan menampilkan datanya
function openArchiveModal() {
    const modal = document.getElementById('archive-modal');
    const listBody = document.getElementById('archive-list');
    if (!modal || !listBody) return;

    listBody.innerHTML = '';

    // Ambil data dari penyimpanan arsip permanen
    let archive = [];
    if (localStorage.getItem('cozy_cafe_archive')) {
        archive = JSON.parse(localStorage.getItem('cozy_cafe_archive'));
    }

    // Jika arsip masih kosong
    if (archive.length === 0) {
        listBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #7f8c8d;">
                    Belum ada data transaksi yang diarsip.
                </td>
            </tr>
        `;
    } else {
        // Tampilkan data arsip (terbaru ditaruh paling atas)
        const reversedArchive = [...archive].reverse();
        reversedArchive.forEach(tx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${tx.id}</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tx.datetime}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${tx.method}</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${formatRupiah(tx.total)}</strong></td>
            `;
            listBody.appendChild(row);
        });
    }

    // Tampilkan modal pop-up ke layar
    modal.style.display = 'flex';
}