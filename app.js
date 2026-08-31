// WhatsApp number: country code + number, without + or spaces.
const WHATSAPP_NUMBER = "2203782199";

const starterProducts = [
  { id: 1, name: "Everyday Tote", category: "Fashion", price: 18, icon: "👜" },
  { id: 2, name: "Soft Linen Set", category: "Home", price: 24, icon: "🕯️" },
  { id: 3, name: "Glow Essentials", category: "Beauty", price: 15, icon: "✨" },
  { id: 4, name: "Classic Cap", category: "Fashion", price: 12, icon: "🧢" },
  { id: 5, name: "Weekend Mug", category: "Home", price: 10, icon: "☕" },
  { id: 6, name: "Daily Care Set", category: "Beauty", price: 20, icon: "🌿" },
  { id: 7, name: "Easy Slides", category: "Fashion", price: 16, icon: "🩴" },
  { id: 8, name: "Little Vase", category: "Home", price: 14, icon: "🏺" }
];
let products = [];

let selectedCategory = "All";
let cart = JSON.parse(localStorage.getItem("pickYoursCart") || "[]");
let likes = JSON.parse(localStorage.getItem("pickYoursLikes") || "[]");
const productGrid = document.querySelector("#products");
const cartPanel = document.querySelector("#cart-panel");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");

function money(value) { return `$${value.toFixed(2)}`; }
function save() { localStorage.setItem("pickYoursCart", JSON.stringify(cart)); localStorage.setItem("pickYoursLikes", JSON.stringify(likes)); }
function showToast(message) { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 2400); }

function renderProducts() {
  const visible = products.filter(p => selectedCategory === "All" || p.category === selectedCategory);
  productGrid.innerHTML = visible.map(p => `
    <article class="product">
      <div class="product-image">${p.image ? `<img src="${p.image}" alt="${p.name}" />` : `<span>${p.icon || "✨"}</span>`}<button class="like ${likes.includes(p.id) ? "liked" : ""}" data-like="${p.id}" type="button" aria-label="Like ${p.name}">${likes.includes(p.id) ? "♥" : "♡"}</button></div>
      <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><div class="product-bottom"><span class="price">${money(p.price)}</span><div class="product-actions"><button class="small-button" data-share="${p.id}" type="button">Share</button><button class="small-button" data-add="${p.id}" type="button">Add</button></div></div></div>
    </article>`).join("");
}
function renderCart() {
  const items = cart.map(id => products.find(p => p.id === id)).filter(Boolean);
  document.querySelector("#cart-count").textContent = items.length;
  document.querySelector("#cart-total").textContent = money(items.reduce((sum, item) => sum + item.price, 0));
  document.querySelector("#cart-items").innerHTML = items.length ? items.map((p, index) => `<div class="cart-row"><div><p><strong>${p.name}</strong></p><p>${money(p.price)}</p></div><button class="remove" data-remove="${index}" type="button">Remove</button></div>`).join("") : '<p class="cart-empty">Your basket is empty.<br />Pick something you love.</p>';
}
function openCart() { cartPanel.classList.add("open"); overlay.classList.add("show"); cartPanel.setAttribute("aria-hidden", "false"); }
function closeCart() { cartPanel.classList.remove("open"); overlay.classList.remove("show"); cartPanel.setAttribute("aria-hidden", "true"); }

document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => { selectedCategory = button.dataset.category; document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button)); renderProducts(); }));
productGrid.addEventListener("click", async event => {
  const id = Number(event.target.dataset.like || event.target.dataset.share || event.target.dataset.add);
  if (!id) return;
  const product = products.find(p => p.id === id);
  if (event.target.dataset.like) { likes = likes.includes(id) ? likes.filter(item => item !== id) : [...likes, id]; save(); renderProducts(); }
  if (event.target.dataset.add) { cart.push(id); save(); renderCart(); showToast(`${product.name} added to your basket.`); }
  if (event.target.dataset.share) { const text = `I found ${product.name} at Pick Yours — ${money(product.price)}`; if (navigator.share) { await navigator.share({ title: "Pick Yours", text, url: location.href }); } else { await navigator.clipboard.writeText(`${text} ${location.href}`); showToast("Product link copied — ready to share."); } }
});
document.querySelector("#cart-items").addEventListener("click", event => { if (event.target.dataset.remove !== undefined) { cart.splice(Number(event.target.dataset.remove), 1); save(); renderCart(); } });
document.querySelector("#open-cart").addEventListener("click", openCart); document.querySelector("#close-cart").addEventListener("click", closeCart); overlay.addEventListener("click", closeCart);
document.querySelector("#checkout").addEventListener("click", () => { if (!cart.length) return showToast("Add a product before placing an order."); closeCart(); document.querySelector("#order-dialog").showModal(); });
document.querySelector("#close-dialog").addEventListener("click", () => document.querySelector("#order-dialog").close());
document.querySelector("#order-form").addEventListener("submit", event => { event.preventDefault(); const data = new FormData(event.target); const items = cart.map(id => products.find(p => p.id === id)); const message = `Hello Pick Yours! I would like to order:%0A%0A${items.map(p => `• ${p.name} — ${money(p.price)}`).join("%0A")}%0A%0ATotal: ${money(items.reduce((sum,p) => sum+p.price, 0))}%0A%0AName: ${data.get("name")}%0ALocation: ${data.get("location")}%0APhone: ${data.get("phone")}`; if (!WHATSAPP_NUMBER) return showToast("Add your WhatsApp number in app.js before publishing."); window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank"); });
document.querySelector("#year").textContent = new Date().getFullYear();
fetch("products.json").then(response => { if (!response.ok) throw new Error("Products unavailable"); return response.json(); }).then(data => { products = data; renderProducts(); renderCart(); }).catch(() => { products = starterProducts; renderProducts(); renderCart(); });
