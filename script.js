/**
 * MT Guppy Galaxy - Modern 3D E-Commerce Script
 * =============================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // LOADER
  // ==========================================
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => loader.remove(), 500);
    }, 1500);
  }

  // ==========================================
  // PARTICLES BACKGROUND
  // ==========================================
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  // ==========================================
  // HEADER SCROLL EFFECT
  // ==========================================
  const header = document.getElementById('header');
  let lastScrollY = 0;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    lastScrollY = window.scrollY;
  });

  // ==========================================
  // MOBILE MENU TOGGLE
  // ==========================================
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  
  menuToggle?.addEventListener('click', () => {
    nav?.classList.toggle('active');
    menuToggle.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav?.contains(e.target) && !menuToggle?.contains(e.target)) {
      nav?.classList.remove('active');
      menuToggle?.classList.remove('active');
    }
  });

  // ==========================================
  // CART FUNCTIONALITY
  // ==========================================
  // Initialize cart in sessionStorage
  if (!sessionStorage.getItem('cart')) {
    sessionStorage.setItem('cart', JSON.stringify([]));
  }

  const getCart = () => JSON.parse(sessionStorage.getItem('cart') || '[]');
  const saveCart = (cart) => sessionStorage.setItem('cart', JSON.stringify(cart));

  // Update cart count badge
  const updateCartCount = () => {
    const cartCountElements = document.querySelectorAll('#cartCount');
    const cart = getCart();
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    cartCountElements.forEach(el => {
      el.textContent = count;
      // Add pulse animation
      el.style.transform = 'scale(1.2)';
      setTimeout(() => el.style.transform = 'scale(1)', 200);
    });
  };

  updateCartCount();

  // Add to Cart functionality
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.product-card');
      if (!card) return;

      const title = card.dataset.title;
      const price = parseInt(card.dataset.price);
      const category = card.dataset.category;
      const image = card.querySelector('img')?.src || 'images/guppy1.svg';

      const cart = getCart();
      const existingItem = cart.find(item => item.title === title);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cart.push({ title, price, category, image, quantity: 1 });
      }

      saveCart(cart);
      updateCartCount();

      // Button animation
      if (typeof gsap !== 'undefined') {
        gsap.to(button, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: 'power2.out'
        });
      }

      // Show notification
      showNotification(`${title} added to cart!`, 'success');
    });
  });

  // ==========================================
  // CART PAGE FUNCTIONALITY
  // ==========================================
  const cartItemsList = document.getElementById('cartItemsList');
  const cartEmpty = document.getElementById('cartEmpty');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const shippingEl = document.getElementById('shipping');
  const totalEl = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function renderCart() {
    if (!cartItemsList) return;

    const cart = getCart();
    
    if (cart.length === 0) {
      cartItemsList.innerHTML = '';
      if (cartEmpty) cartEmpty.style.display = 'block';
      updateCartSummary(0);
      return;
    }

    if (cartEmpty) cartEmpty.style.display = 'none';

    cartItemsList.innerHTML = cart.map((item, index) => `
      <div class="cart-item" data-index="${index}">
        <div class="cart-item-image">
          <img src="${item.image || 'images/guppy1.svg'}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.title}</h4>
          <p class="cart-item-price">₹${item.price} × ${item.quantity || 1}</p>
        </div>
        <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">🗑️</button>
      </div>
    `).join('');

    // Add remove functionality
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        removeFromCart(index);
      });
    });

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    updateCartSummary(subtotal);
  }

  function removeFromCart(index) {
    const cart = getCart();
    const removedItem = cart[index];
    cart.splice(index, 1);
    saveCart(cart);
    updateCartCount();
    renderCart();
    showNotification(`${removedItem?.title} removed from cart`, 'info');
  }

  function updateCartSummary(subtotal) {
    const shipping = subtotal > 0 ? 50 : 0;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + tax;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (taxEl) taxEl.textContent = `₹${tax}`;
    if (shippingEl) shippingEl.textContent = subtotal > 0 ? `₹${shipping}` : '₹0';
    if (totalEl) totalEl.textContent = `₹${total}`;
  }

  // Initialize cart page
  renderCart();

  // Checkout button
  checkoutBtn?.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
      showNotification('Your cart is empty!', 'error');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const total = subtotal + 50 + Math.round(subtotal * 0.05);

    showNotification(`Order placed! Total: ₹${total}. Thank you for shopping!`, 'success');
    
    // Clear cart
    saveCart([]);
    updateCartCount();
    renderCart();
  });

  // ==========================================
  // PRODUCT FILTERING & SORTING
  // ==========================================
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterSelect = document.getElementById('filterSelect');
  const productGrid = document.getElementById('productGrid');

  function filterProducts() {
    if (!productGrid) return;

    const searchValue = searchInput?.value.toLowerCase() || '';
    const sortValue = sortSelect?.value || '';
    const filterValue = filterSelect?.value || '';

    let cards = Array.from(document.querySelectorAll('.product-card'));

    // Filter by search
    cards.forEach(card => {
      const title = card.dataset.title?.toLowerCase() || '';
      const category = card.dataset.category || '';
      
      const matchesSearch = title.includes(searchValue);
      const matchesFilter = !filterValue || category === filterValue;
      
      card.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
    });

    // Sort visible cards
    let visibleCards = cards.filter(card => card.style.display !== 'none');
    
    if (sortValue) {
      visibleCards.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        const titleA = a.dataset.title;
        const titleB = b.dataset.title;

        switch (sortValue) {
          case 'priceAsc': return priceA - priceB;
          case 'priceDesc': return priceB - priceA;
          case 'nameAsc': return titleA.localeCompare(titleB);
          case 'nameDesc': return titleB.localeCompare(titleA);
          default: return 0;
        }
      });

      // Reorder in DOM
      visibleCards.forEach(card => productGrid.appendChild(card));
    }
  }

  searchInput?.addEventListener('input', filterProducts);
  sortSelect?.addEventListener('change', filterProducts);
  filterSelect?.addEventListener('change', filterProducts);

  // ==========================================
  // CONTACT FORM
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name')?.value;
    const email = document.getElementById('email')?.value;
    const message = document.getElementById('message')?.value;

    if (name && email && message) {
      showNotification(`Thank you ${name}! We'll get back to you soon.`, 'success');
      contactForm.reset();
    }
  });

  // ==========================================
  // ANIMATIONS - GSAP
  // ==========================================
  // Hero content animation
  const heroContent = document.getElementById('heroContent');
  if (heroContent && typeof gsap !== 'undefined') {
    gsap.from(heroContent.children, {
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 1.5
    });
  }

  // Intersection Observer for fade-in animations
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (typeof gsap !== 'undefined') {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
        } else {
          entry.target.classList.add('visible');
        }
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeElements.forEach(el => {
    if (typeof gsap !== 'undefined') {
      gsap.set(el, { opacity: 0, y: 30 });
    }
    fadeObserver.observe(el);
  });

  // ==========================================
  // WISHLIST FUNCTIONALITY
  // ==========================================
  document.querySelectorAll('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      btn.textContent = isActive ? '💖' : '❤️';
      
      if (typeof gsap !== 'undefined') {
        gsap.to(btn, {
          scale: 1.3,
          duration: 0.2,
          yoyo: true,
          repeat: 1
        });
      }

      showNotification(isActive ? 'Added to wishlist!' : 'Removed from wishlist', 'info');
    });
  });

  // ==========================================
  // NOTIFICATION SYSTEM
  // ==========================================
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">×</button>
    `;
    
    // Styles
    Object.assign(notification.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      background: type === 'success' ? 'linear-gradient(135deg, #00d4ff, #7b2fff)' :
                  type === 'error' ? 'linear-gradient(135deg, #ff4757, #ff6b81)' :
                  'linear-gradient(135deg, #2d3436, #636e72)',
      color: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: '9999',
      fontFamily: 'Rajdhani, sans-serif',
      fontSize: '1rem',
      fontWeight: '500',
      transform: 'translateX(120%)',
      transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.style.transform = 'translateX(120%)';
      setTimeout(() => notification.remove(), 400);
    });

    // Auto remove
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 400);
      }
    }, 4000);
  }

  // ==========================================
  // 3D TILT EFFECT ON PRODUCT CARDS
  // ==========================================
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  console.log('🐠 MT Guppy Galaxy - Website Loaded Successfully!');
});
