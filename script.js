let currentLang = "en";
let restaurantData = null;

// ======= DOM Elements =======
const landingPage = document.getElementById("landing-screen");
const landingLogo = document.getElementById("landingLogo");
const landingTitle = document.getElementById("landingTitle");
const openMenuBtn = document.getElementById("openMenuBtn");

const menuPage = document.getElementById("menu-book");
const restaurantLogo = document.getElementById("restaurantLogo");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const langToggle = document.getElementById("langToggle");
const menuContainer = document.getElementById("menu-sections");

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalIngredients = document.getElementById("modal-ingredients");
const modalClose = modal.querySelector(".close");

const defaultLogo = "images/default-logo.png";

// ======= Create Search Bar =======
const searchDiv = document.createElement("div");
searchDiv.style.textAlign = "center";
searchDiv.style.margin = "20px";
searchDiv.innerHTML = `
  <input type="text" id="menuSearch" placeholder="Search menu..." 
         style="padding:8px 12px; border-radius:8px; border:1px solid #ccc; width:70%; max-width:300px;">
`;
menuPage.insertBefore(searchDiv, menuContainer);
const menuSearch = document.getElementById("menuSearch");

// ======= Safe image setter =======
function safeSetImage(imgEl, src, altText) {
  if (!src) {
    imgEl.src = "";
    imgEl.alt = altText;
  } else {
    imgEl.src = src;
    imgEl.alt = altText;
    imgEl.onerror = () => { imgEl.src = ""; imgEl.alt = altText; };
  }
}

// ======= Load Restaurant JSON =======
async function loadRestaurantData() {
  try {
    const params = new URLSearchParams(window.location.search);
    const restaurant = params.get("restaurant") || "silver-spoon";
    const res = await fetch(`data/${restaurant}.json`);
    if (!res.ok) throw new Error("Menu file not found");
    restaurantData = await res.json();
    renderLanding();
    renderMenuSections();
  } catch (err) {
    console.error(err);
    landingTitle.textContent = "Restaurant not found";
    openMenuBtn.style.display = "none";
  }
}

// ======= Landing Page =======
function renderLanding() {
  landingTitle.textContent = restaurantData.name;
  titleEl.textContent = `${restaurantData.name}`;
  subtitleEl.textContent = restaurantData.subtitle || "";

  safeSetImage(landingLogo, restaurantData.logo, restaurantData.name);
  safeSetImage(restaurantLogo, restaurantData.logo, restaurantData.name);
}

// ======= Menu Sections =======
function renderMenuSections(searchQuery = "") {
  menuContainer.innerHTML = "";

  let anyMatch = false;

  restaurantData.sections.forEach(section => {
    const sectionKey = section.key;
    const sectionTitle = currentLang === "en" ? section.titleEn : section.titleHi;

    // Filter items by type AND search query
    const sectionItems = restaurantData.items.filter(i => {
      const itemName = i.name[currentLang].toLowerCase();
      return i.type === sectionKey && itemName.includes(searchQuery.toLowerCase());
    });

    if (!sectionItems.length) return;

    anyMatch = true;

    const secDiv = document.createElement("section");
    secDiv.className = "menu-section";
    secDiv.innerHTML = `<h2 class="menu-headline">${sectionTitle}</h2>`;

    const ul = document.createElement("ul");
    ul.className = "menu-list";

    sectionItems.forEach(item => {
      const li = document.createElement("li");
      li.className = "menu-item";

      li.innerHTML = `
        <span class="menu-item-name">${item.name[currentLang]}</span>
        <span class="menu-item-price">₹${item.price}</span>
      `;

      li.addEventListener("click", () => showItemDetails(item));

      ul.appendChild(li);
    });

    secDiv.appendChild(ul);
    menuContainer.appendChild(secDiv);

    // Toggle section open/close
    const headline = secDiv.querySelector(".menu-headline");
    headline.addEventListener("click", () => {
      secDiv.classList.toggle("active");
    });
  });

  // If no items matched the search
  if (searchQuery && !anyMatch) {
    const noResult = document.createElement("p");
    noResult.textContent = `Sorry, "${searchQuery}" is not available.`;
    noResult.style.textAlign = "center";
    noResult.style.color = "#a87e3a";
    noResult.style.fontSize = "1.1rem";
    menuContainer.appendChild(noResult);
  }
}

// ======= Item Details Modal =======
function showItemDetails(item) {
  modalTitle.textContent = item.name[currentLang];
  modalPrice.textContent = `₹${item.price}`;
  modalIngredients.innerHTML = item.ingredients[currentLang].map(i => `<li>${i}</li>`).join("");
  safeSetImage(modalImg, item.image, item.name[currentLang]);
  modal.style.display = "block";
}

// Close modal
modalClose.addEventListener("click", () => { modal.style.display = "none"; });
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

// ======= Language Toggle =======
langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "hi" : "en";
  langToggle.textContent = currentLang === "en" ? "हिंदी" : "English";
  renderMenuSections(menuSearch.value);
});

// ======= Search =======
menuSearch.addEventListener("input", () => {
  renderMenuSections(menuSearch.value);
});

// ======= Page Flow =======
openMenuBtn.addEventListener("click", () => {
  landingPage.style.display = "none";
  menuPage.style.display = "block";
});

// ======= Init =======
loadRestaurantData();
