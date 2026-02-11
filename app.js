const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Product Data
const products = [
    { id: 1, name: "Gold Cola", type: "soda", price: 25, img: "https://cdn-icons-png.flaticon.com/512/2405/2405597.png", desc: "Classic dark cola with a golden twist." },
    { id: 2, name: "Gold Lemon", type: "soda", price: 20, img: "https://cdn-icons-png.flaticon.com/512/2442/2442019.png", desc: "Sharp, zesty, and refreshing lemon lime." },
    { id: 3, name: "Gold Tonic", type: "soda", price: 22, img: "https://cdn-icons-png.flaticon.com/512/2405/2405451.png", desc: "The perfect premium mixer." },
    { id: 4, name: "Gold Apple", type: "juice", price: 25, img: "https://cdn-icons-png.flaticon.com/512/415/415733.png", desc: "Crisp red apple flavor." },
    { id: 5, name: "Gold Energy", type: "energy", price: 35, img: "https://cdn-icons-png.flaticon.com/512/6030/6030105.png", desc: "Maximum power for the workday." },
    { id: 6, name: "Gold Orange", type: "juice", price: 20, img: "https://cdn-icons-png.flaticon.com/512/2442/2442019.png", desc: "Sun-ripened orange delight." }
];

let cart = 0;

// Render Products
function renderProducts(filter = 'all') {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    products.forEach(p => {
        if (filter === 'all' || p.type === filter) {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${p.img}" alt="${p.name}">
                <h3>${p.name}</h3>
                <span class="price">${p.price} ETB</span>
            `;
            // Make card interactive
            card.onclick = () => openModal(p);
            grid.appendChild(card);
        }
    });
}

// Modal Logic
const modal = document.getElementById('product-modal');
const modalAddBtn = document.getElementById('modal-add-btn');

function openModal(product) {
    tg.HapticFeedback.impactOccurred('light');
    document.getElementById('modal-img').src = product.img;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-desc').innerText = product.desc;
    document.getElementById('modal-price').innerText = product.price + " ETB";
    
    modal.style.display = 'flex';
    
    // Set button action
    modalAddBtn.onclick = () => {
        addToCart(product);
        closeModal();
    };
}

function closeModal() {
    modal.style.display = 'none';
}

// Cart Logic
function addToCart(product) {
    cart++;
    document.getElementById('cart-count').innerText = cart;
    tg.HapticFeedback.notificationOccurred('success');
    
    // Show Main Button in Telegram
    if (cart > 0) {
        tg.MainButton.text = `CHECKOUT (${cart} ITEMS)`;
        tg.MainButton.show();
    }
}

tg.MainButton.onClick(() => {
    tg.showAlert(`Processing order for ${cart} items!`);
});

// Navigation Logic
function switchTab(tab) {
    tg.HapticFeedback.selectionChanged();
    const shop = document.getElementById('product-grid');
    const hero = document.querySelector('.hero');
    const filters = document.querySelector('.filters');
    const about = document.getElementById('about-section');
    const navItems = document.querySelectorAll('.nav-item');

    if (tab === 'shop') {
        shop.classList.remove('hidden');
        hero.classList.remove('hidden');
        filters.classList.remove('hidden');
        about.classList.add('hidden');
        navItems[0].classList.add('active');
        navItems[1].classList.remove('active');
    } else {
        shop.classList.add('hidden');
        hero.classList.add('hidden');
        filters.classList.add('hidden');
        about.classList.remove('hidden');
        navItems[0].classList.remove('active');
        navItems[1].classList.add('active');
    }
}

function filterProducts(type) {
    tg.HapticFeedback.selectionChanged();
    // Update active chip UI
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    event.target.classList.add('active');
    renderProducts(type);
}

// Initial Render
renderProducts();