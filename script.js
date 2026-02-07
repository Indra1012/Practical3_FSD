document.addEventListener('DOMContentLoaded', () => {
    // ────────────────────────────────────────────────
    //  Responsive Hamburger Menu
    // ────────────────────────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active'); // for cross animation in CSS
        });
    }

    // ────────────────────────────────────────────────
    //  Cart Logic (using localStorage)
    // ────────────────────────────────────────────────
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const elements = {
        cartCount: document.getElementById('cart-count'),
        cartModal: document.getElementById('cart-modal'),
        cartItems: document.getElementById('cart-items'),
        cartTotal: document.getElementById('cart-total'),
        closeBtn: document.querySelector('.close-btn'),
        clearCartBtn: document.getElementById('clear-cart'),
        cartLink: document.getElementById('cart-link')
    };

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (elements.cartCount) {
            elements.cartCount.textContent = totalItems;
        }
    }

    function renderCart() {
        if (!elements.cartItems || !elements.cartTotal) return;

        elements.cartItems.innerHTML = '';
        let totalAmount = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name} × ${item.quantity}</span>
                <span>₹${itemTotal.toLocaleString('en-IN')}</span>
            `;
            elements.cartItems.appendChild(div);
        });

        elements.cartTotal.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
    }

    // Show cart modal
    if (elements.cartLink && elements.cartModal) {
        elements.cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            renderCart();
            elements.cartModal.style.display = 'block';
        });
    }

    // Close modal
    if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', () => {
            elements.cartModal.style.display = 'none';
        });
    }

    // Close when clicking outside modal content
    if (elements.cartModal) {
        window.addEventListener('click', (e) => {
            if (e.target === elements.cartModal) {
                elements.cartModal.style.display = 'none';
            }
        });
    }

    // Clear cart
    if (elements.clearCartBtn) {
        elements.clearCartBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the entire cart?')) {
                cart = [];
                saveCart();
                updateCartCount();
                renderCart();
            }
        });
    }

    // ────────────────────────────────────────────────
    //  Product Cards – Quantity + Add to Cart
    // ────────────────────────────────────────────────
    document.querySelectorAll('.product-card').forEach(card => {
        const addBtn    = card.querySelector('.add-to-cart');
        const qtyInput  = card.querySelector('.qty-input');
        const minusBtn  = card.querySelector('.qty-btn.minus');
        const plusBtn   = card.querySelector('.qty-btn.plus');
        const priceEl   = card.querySelector('.price');
        const totalEl   = card.querySelector('.total-price');

        if (!addBtn || !qtyInput || !minusBtn || !plusBtn || !priceEl || !totalEl) return;

        const basePrice = parseFloat(priceEl.dataset.basePrice);
        const productName = card.dataset.name || 'Product';
        const productId   = card.dataset.id;

        if (!productId || isNaN(basePrice)) return; // safety check

        const MAX_QTY = 999;

        function updateTotal() {
            let qty = parseInt(qtyInput.value, 10) || 1;
            qty = Math.max(1, Math.min(MAX_QTY, qty));
            qtyInput.value = qty;

            const total = basePrice * qty;
            totalEl.textContent = `Total: ₹${total.toLocaleString('en-IN')}`;
        }

        // ── Quantity controls ──────────────────────────────
        minusBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value, 10) || 1;
            if (qty > 1) {
                qtyInput.value = qty - 1;
                updateTotal();
            }
        });

        plusBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value, 10) || 1;
            if (qty < MAX_QTY) {
                qtyInput.value = qty + 1;
                updateTotal();
            }
        });

        qtyInput.addEventListener('input', () => {
            let val = qtyInput.value.replace(/\D/g, '');
            if (val === '') val = '1';
            qtyInput.value = val;
            updateTotal();
        });

        // Prevent invalid paste / manual entry outside 1–999
        qtyInput.addEventListener('blur', () => {
            let qty = parseInt(qtyInput.value, 10) || 1;
            qty = Math.max(1, Math.min(MAX_QTY, qty));
            qtyInput.value = qty;
            updateTotal();
        });

        // ── Add to cart ────────────────────────────────────
        addBtn.addEventListener('click', () => {
            let qty = parseInt(qtyInput.value, 10) || 1;
            qty = Math.max(1, Math.min(MAX_QTY, qty));

            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += qty;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: basePrice,
                    quantity: qty
                });
            }

            saveCart();
            updateCartCount();

            // Optional: nicer feedback
            addBtn.textContent = 'Added ✓';
            addBtn.style.backgroundColor = '#2e7d32';
            setTimeout(() => {
                addBtn.textContent = 'Add to Cart';
                addBtn.style.backgroundColor = '';
            }, 1200);

            // Reset quantity
            qtyInput.value = 1;
            updateTotal();
        });

        // Initialize total on page load
        updateTotal();
    });

    // Initial cart count on page load
    updateCartCount();
});