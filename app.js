import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// SUPABASE CONNECTION
const SUPABASE_URL = "https://ewzhfhaqcqrmvkfwldwp.supabase.co";
const SUPABASE_KEY = "PASTE_YOUR_PUBLISHABLE_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = supabase;

// DATA
let products = [];
let cart = [];

// LOAD PRODUCTS
async function loadProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    document.getElementById("productList").textContent =
      "Products loading failed: " + error.message;
    return;
  }

  products = data || [];
  displayProducts(products);
}

// DISPLAY PRODUCTS
function displayProducts(items) {
  const list = document.getElementById("productList");

  if (!items.length) {
    list.textContent = "No products available yet.";
    return;
  }

  list.innerHTML = items.map(p => `
    <div class="product-card">
      <img src="${p.image_url || p.image || 'https://placehold.co/300x200?text=Product'}"
           alt="Product">
      <h3>${p.name_bn || p.name || p.title || "Product"}</h3>
      <p class="price">৳${p.price ?? 0}</p>
      <button onclick="addToCart('${p.id}')">
        Add to Cart
      </button>
    </div>
  `).join("");
}

// LOAD CATEGORIES
async function loadCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*");

  const list = document.getElementById("categoryList");

  if (error) {
    list.textContent = "Categories loading failed.";
    return;
  }

  if (!data || !data.length) {
    list.textContent = "No categories available yet.";
    return;
  }

  list.innerHTML = data.map(c => `
    <div class="category-card">
      ${c.name_bn || c.name || c.title || "Category"}
    </div>
  `).join("");
}

// SEARCH PRODUCTS
window.searchProducts = function() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase();

  const results = products.filter(p =>
    String(p.name || "").toLowerCase().includes(query) ||
    String(p.name_bn || "").toLowerCase().includes(query)
  );

  displayProducts(results);
};

// ADD TO CART
window.addToCart = function(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;

  const existing = cart.find(item => String(item.id) === String(id));

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  displayCart();
};

// DISPLAY CART
function displayCart() {
  const list = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");

  if (!cart.length) {
    list.textContent = "Your cart is empty.";
    totalElement.textContent = "Total: ৳0";
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <span>${item.name_bn || item.name || "Product"}</span>
      <span>৳${item.price} × ${item.quantity}</span>
      <button onclick="removeFromCart('${item.id}')">Remove</button>
    </div>
  `).join("");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  totalElement.textContent = "Total: ৳" + total;
}

// REMOVE FROM CART
window.removeFromCart = function(id) {
  cart = cart.filter(item => String(item.id) !== String(id));
  displayCart();
};

// LOGIN PLACEHOLDER
window.showLogin = function() {
  alert("Login and Signup system will be added next.");
};

// CHECKOUT PLACEHOLDER
window.checkout = function() {
  if (!cart.length) {
    alert("Your cart is empty!");
    return;
  }

  alert("Checkout system will be activated after customer login and order security setup.");
};

// START WEBSITE
loadProducts();
loadCategories();
displayCart();

console.log("Your Shopping App Started");
                                  
