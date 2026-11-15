import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* =================================
   YOUR SHOPPING - SUPABASE CONFIG
================================= */

const SUPABASE_URL =
  "https://ewzhfhaqcqrmvkfwldwp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_dvSZPSEhhrrqSP5nW9Z4UA_9U-KCXWb";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* =================================
   APP DATA
================================= */

let products = [];
let categories = [];
let cart = [];
let currentUser = null;
let signupMode = false;

/* =================================
   SECURITY: HTML TEXT
================================= */

function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

/* =================================
   LOAD PRODUCTS
================================= */

async function loadProducts() {
  const list = document.getElementById("productList");

  list.textContent = "Loading products...";

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(100);

    if (error) throw error;

    products = data || [];
    displayProducts(products);

  } catch (error) {
    list.textContent = "Product error: " + error.message;
    console.error("Product loading:", error);
  }
}

/* =================================
   DISPLAY PRODUCTS
================================= */

function displayProducts(items) {
  const list = document.getElementById("productList");

  if (!items.length) {
    list.textContent = "No products available yet.";
    return;
  }

  list.innerHTML = items.map(product => {
    const name = product.name_bn ||
      product.name || product.title || "Product";

    const image = product.image_url ||
      product.image ||
      "https://placehold.co/400x300?text=Product";

    const price = Number(product.price || 0);

    return `
      <article class="product-card">
        <img
          src="${safe(image)}"
          alt="${safe(name)}"
          onerror="this.src='https://placehold.co/400x300?text=Product'">

        <div class="product-info">
          <h3>${safe(name)}</h3>
          <p class="price">৳${price.toLocaleString("en-IN")}</p>

          <button onclick="addToCart('${safe(product.id)}')">
            ADD TO CART
          </button>
        </div>
      </article>
    `;
  }).join("");
}

/* =================================
   LOAD CATEGORIES
================================= */

async function loadCategories() {
  const list = document.getElementById("categoryList");

  list.textContent = "Loading categories...";

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (error) throw error;

    categories = data || [];

    if (!categories.length) {
      list.textContent = "No categories available yet.";
      return;
    }

    list.innerHTML = categories.map(category => {
      const name = category.name_bn ||
        category.name || category.title || "Category";

      return `
        <div class="category-card"
          onclick="filterCategory('${safe(category.id)}')">
          ${safe(name)}
        </div>
      `;
    }).join("");

  } catch (error) {
    list.textContent = "Category error: " + error.message;
    console.error("Category loading:", error);
  }
}

/* =================================
   CATEGORY FILTER
================================= */

window.filterCategory = function(id) {
  const category = categories.find(
    item => String(item.id) === String(id)
  );

  if (!category) return;

  const filtered = products.filter(product =>
    String(product.category_id) === String(category.id)
  );

  displayProducts(filtered);

  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
};

/* =================================
   PRODUCT SEARCH
================================= */

window.searchProducts = function() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const results = products.filter(product => {
    const name = String(product.name || "").toLowerCase();
    const bn = String(product.name_bn || "").toLowerCase();
    const description = String(
      product.description || ""
    ).toLowerCase();

    return name.includes(query) ||
      bn.includes(query) ||
      description.includes(query);
  });

  displayProducts(results);
};

/* =================================
   SHOPPING CART
================================= */

window.addToCart = function(id) {
  const product = products.find(
    item => String(item.id) === String(id)
  );

  if (!product) return;

  const existing = cart.find(
    item => String(item.id) === String(id)
  );

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  displayCart();
};

function displayCart() {
  const list = document.getElementById("cartItems");
  const totalElement = document.getElementById("cartTotal");
  const countElement = document.getElementById("cartCount");

  if (!cart.length) {
    list.textContent = "Your cart is empty.";
    totalElement.textContent = "Total: ৳0";
    countElement.textContent = "0";
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <strong>${safe(item.name_bn || item.name || "Product")}</strong>

      <span>
        ৳${Number(item.price || 0)} × ${item.quantity}
      </span>

      <button onclick="removeFromCart('${safe(item.id)}')">
        Remove
      </button>
    </div>
  `).join("");

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * item.quantity,
    0
  );

  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  totalElement.textContent = "Total: ৳" + total;
  countElement.textContent = String(count);
}

window.removeFromCart = function(id) {
  cart = cart.filter(
    item => String(item.id) !== String(id)
  );

  displayCart();
};

window.goCart = function() {
  document.getElementById("cart").scrollIntoView({
    behavior: "smooth"
  });
};

/* =================================
   LOGIN / SIGNUP
================================= */

window.showLogin = function() {
  document.getElementById("authModal").style.display = "flex";
};

window.closeModal = function() {
  document.getElementById("authModal").style.display = "none";
};

window.toggleAuth = function() {
  signupMode = !signupMode;

  document.getElementById("authTitle").textContent =
    signupMode ? "Create Your Account" : "Welcome Back";

  document.getElementById("authDescription").textContent =
    signupMode ? "Join Your Shopping today" : "Login to your account";

  document.getElementById("authName").hidden = !signupMode;

  document.getElementById("authButton").textContent =
    signupMode ? "SIGN UP" : "LOGIN";

  document.getElementById("authToggle").textContent =
    signupMode ? "Already have an account? Login" :
    "Create a new account";

  document.getElementById("authMessage").textContent = "";
};

/* =================================
   SUPABASE AUTH
================================= */

window.submitAuth = async function() {
  const name = document.getElementById("authName").value.trim();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const message = document.getElementById("authMessage");
  const button = document.getElementById("authButton");

  if (!email || password.length < 6) {
    message.textContent =
      "Enter your email and a password of at least 6 characters.";
    return;
  }

  button.disabled = true;
  message.textContent = "Please wait...";

  try {
    let result;

    if (signupMode) {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      });
    }

    if (result.error) throw result.error;

    if (signupMode && !result.data.session) {
      message.textContent =
        "Account created. Please confirm your email.";
      return;
    }

    currentUser = result.data.user;

    updateAccountButton();

    message.textContent = "Successfully logged in!";

    setTimeout(closeModal, 1000);

  } catch (error) {
    message.textContent = error.message;
  } finally {
    button.disabled = false;
  }
};

/* =================================
   USER SESSION
================================= */

function updateAccountButton() {
  const button = document.querySelector(".outline-btn");

  button.textContent = currentUser
    ? "Logout"
    : "Login / Signup";

  button.onclick = currentUser
    ? logout
    : showLogin;
}

async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  currentUser = null;
  updateAccountButton();
}

async function restoreSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  currentUser = data.session?.user || null;
  updateAccountButton();

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    updateAccountButton();
  });
}

/* =================================
   CHECKOUT
================================= */

window.checkout = function() {
  if (!cart.length) {
    alert("Your shopping cart is empty.");
    return;
  }

  if (!currentUser) {
    alert("Please login before checkout.");
    showLogin();
    return;
  }

  alert(
    "Your cart is ready. Order placement will be enabled after secure database order setup."
  );
};

/* =================================
   START APPLICATION
================================= */

async function startApp() {
  displayCart();

  try {
    await restoreSession();

    await Promise.all([
      loadProducts(),
      loadCategories()
    ]);

    console.log("YOUR SHOPPING READY");

  } catch (error) {
    console.error("Application error:", error);
  }
}

startApp();
