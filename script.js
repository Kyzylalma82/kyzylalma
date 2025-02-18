document.addEventListener("DOMContentLoaded", async function() {
  // Глобальный массив для хранения заказанных блюд
  let orders = [];

  // Локальный словарь для сопоставления категорий и изображений
  const categoryImages = {
    "hot": "images/hot.jpg",
    "pizza": "images/pizza.jpg",
    "soups": "images/soups.jpg",
    "salads": "images/salads.jpg",
    "side": "images/side.jpg",
    "drinks": "images/drinks.jpg",
    "desserts": "images/desserts.jpg",
    "extra": "images/extra.jpg"
  };

  // Функция для преобразования русского названия категории в ключ словаря
  function mapCategoryName(name) {
    const mapping = {
      "горячие блюда": "hot",
      "восточное блюдо": "hot",
      "супы": "soups",
      "салаты": "salads",
      "гарниры": "side",
      "напитки": "drinks",
      "десерты": "desserts",
      "дополнительно": "extra",
      "пицца 30 см": "pizza",
      "пицца": "pizza"
    };
    return mapping[name.toLowerCase()] || name.toLowerCase();
  }

  // Глобальный объект для маппинга id категории на её имя
  let categoriesMap = {};

  // Функция для получения названия категории по id из categoriesMap
  function getCategoryNameFromId(category_id) {
    return categoriesMap[category_id] || "unknown";
  }

  // ------------------ Инициализация Firebase ------------------
  // Убедитесь, что в HTML подключены:
  // <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
  // <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js"></script>
  const firebaseConfig = {
    apiKey: "AIzaSyCBrM43FbbmUGkb3hg1c7TvATWE5nG843Q",
    authDomain: "qrmenu-8de3b.firebaseapp.com",
    projectId: "qrmenu-8de3b",
    storageBucket: "qrmenu-8de3b.firebasestorage.app",
    messagingSenderId: "860100694312",
    appId: "1:860100694312:web:060ffbc16f3561349b401d"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  // ------------------------------------------------------------

  // Функция для подписки на коллекцию категорий из Firestore
  function subscribeCategories() {
    db.collection('categories').onSnapshot((snapshot) => {
      let categories = [];
      snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id; // используем id документа
        categories.push(data);
      });
      console.log('Категории из Firestore:', categories);
      renderCategories(categories);
    }, (error) => {
      console.error('Ошибка подписки на категории:', error);
    });
  }

  // Функция для подписки на коллекцию блюд из Firestore
  function subscribeDishes() {
    db.collection('menu').onSnapshot((snapshot) => {
      let dishes = [];
      snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id;
        dishes.push(data);
      });
      console.log('Блюда из Firestore:', dishes);
      renderDishes(dishes);
    }, (error) => {
      console.error('Ошибка подписки на блюда:', error);
    });
  }

  // Функция для отрисовки категорий
  function renderCategories(categories) {
    const container = document.getElementById('categories-cards-container');
    if (container) {
      container.innerHTML = "";
      categories.forEach(cat => {
        // Заполняем маппинг: id -> имя
        categoriesMap[cat.id] = cat.name;
        const card = document.createElement('div');
        card.classList.add('category-card');

        const categoryKey = mapCategoryName(cat.name);
        let subcategory = "";
        if (categoryKey === "pizza") {
          subcategory = "pizza30";
        }
        card.dataset.category = categoryKey;
        if (subcategory) {
          card.dataset.subcategory = subcategory;
        }

        card.style.backgroundImage = `url('${cat.imageUrl || categoryImages[categoryKey] || "images/default.jpg"}')`;
        card.innerHTML = `<div class="overlay"><h3>${cat.name}</h3></div>`;
        card.addEventListener('click', () => showMenuItems(categoryKey, subcategory));
        container.appendChild(card);
      });
      addInfoButtonListeners();
    }
  }

  // Функция для отрисовки блюд
  function renderDishes(dishes) {
    const itemsList = document.querySelector('.items-list');
    if (itemsList) {
      itemsList.innerHTML = "";
      dishes.forEach(dish => {
        const item = document.createElement('div');
        item.classList.add('menu-item');

        // Если в блюде есть поле categoryName, используем его, иначе получаем название через category_id
        const mappedCategory = dish.categoryName 
            ? mapCategoryName(dish.categoryName) 
            : mapCategoryName(getCategoryNameFromId(dish.category_id));
        item.dataset.category = mappedCategory;
        if (mappedCategory === "pizza") {
          item.dataset.subcategory = "pizza30";
        }

        let imageUrl = dish.image_path;
        if (imageUrl) {
          imageUrl = imageUrl.replace("C:\\cafe_app\\bludim\\", "images/");
        } else {
          imageUrl = "images/default-dish.jpg";
        }

        item.innerHTML = `
          <img src="${imageUrl}" alt="${dish.name}">
          <h3>${dish.name}</h3>
          <p>Цена: ${dish.price} сом</p>
          <p>Вес: ${dish.weight} г, Количество: ${dish.quantity} шт</p>
          <button class="add-to-order">+</button>
        `;
        item.dataset.description = dish.description;
        item.dataset.imageUrl = imageUrl;
        item.dataset.id = dish.id;
        itemsList.appendChild(item);

        console.log(`Добавлено блюдо: ${dish.name} | mappedCategory: ${mappedCategory}`);
      });
      addAddToOrderListeners();
    }
  }

  // Функция для показа блюд по выбранной категории
  function showMenuItems(category, subcategory = "") {
    const infoCard = document.querySelector('.info-card');
    if (infoCard) infoCard.style.display = "none";
    document.getElementById('categories-cards-container').style.display = "none";
    document.getElementById('menu-items').style.display = "block";
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      const itemCat = item.dataset.category;
      const itemSub = item.dataset.subcategory || "";
      item.style.display = (itemCat === category && (subcategory === "" || itemSub === subcategory))
        ? "block"
        : "none";
    });
  }

  // Функция для показа списка заказов в модальном окне
  function showOrdersModal() {
    const orderModal = document.getElementById('order-modal');
    const orderDetails = document.getElementById('order-details');
    let html = "<h2>Ваши заказы</h2>";
    if (orders.length === 0) {
      html += "<p>Заказов пока нет.</p>";
    } else {
      orders.forEach((order, index) => {
        html += `
          <div class="order-item">
            <img src="${order.imageUrl}" alt="${order.name}">
            <div class="order-info">
              <p><strong>${order.name}</strong></p>
              <p>Цена: ${order.price} сом</p>
              <p>Вес: ${order.weight} г, Количество: ${order.quantity} шт</p>
            </div>
            <div class="order-actions">
              <button data-index="${index}" class="increment-order">+</button>
              <button data-index="${index}" class="decrement-order">-</button>
              <button data-index="${index}" class="remove-order">Удалить</button>
            </div>
          </div>
        `;
      });
    }
    orderDetails.innerHTML = html;
    document.getElementById('order-modal').style.display = "block";
    addOrderActionListeners();
  }

  // Функция для обновления счётчика заказов
  function updateOrdersCount() {
    const ordersButton = document.querySelector('.info-btn[data-category="orders"]');
    if (ordersButton) {
      const total = orders.reduce((acc, order) => acc + order.quantity, 0);
      let countSpan = ordersButton.querySelector('.orders-count');
      if (!countSpan) {
        countSpan = document.createElement('span');
        countSpan.classList.add('orders-count');
        ordersButton.appendChild(countSpan);
      }
      countSpan.textContent = `${total}`;
    }
    updateDishCardsUI();
  }

  // Функция для обновления UI карточек блюд (если изменился заказ)
  function updateDishCardsUI() {
    const dishItems = document.querySelectorAll('.menu-item');
    dishItems.forEach(item => {
      const dishId = item.dataset.id;
      const existing = orders.find(o => o.id == dishId);
      if (!existing) {
        const qc = item.querySelector('.quantity-controls');
        if (qc) qc.remove();
        if (!item.querySelector('.add-to-order')) {
          const newAddBtn = createAddToOrderButton(item);
          item.appendChild(newAddBtn);
        }
      } else {
        const qc = item.querySelector('.quantity-controls');
        if (qc) {
          const quantitySpan = qc.querySelector('.quantity');
          if (quantitySpan) {
            quantitySpan.textContent = existing.quantity;
          }
        }
      }
    });
  }

  // Функция для добавления блюда в заказы
  function addToOrder(dish) {
    const existing = orders.find(o => o.id === dish.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      orders.push({ ...dish, quantity: 1 });
    }
    updateOrdersCount();
    console.log("Заказы:", orders);
  }

  // Функция для добавления обработчиков в модальном окне заказов
  function addOrderActionListeners() {
    const removeButtons = document.querySelectorAll('.remove-order');
    const incrementButtons = document.querySelectorAll('.increment-order');
    const decrementButtons = document.querySelectorAll('.decrement-order');

    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        orders.splice(index, 1);
        showOrdersModal();
        updateOrdersCount();
      });
    });

    incrementButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        orders[index].quantity += 1;
        showOrdersModal();
        updateOrdersCount();
      });
    });

    decrementButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        if (orders[index].quantity > 1) {
          orders[index].quantity -= 1;
        } else {
          orders.splice(index, 1);
        }
        showOrdersModal();
        updateOrdersCount();
      });
    });
  }

  // Функция для создания кнопки "add-to-order"
  function createAddToOrderButton(item) {
    const btn = document.createElement('button');
    btn.classList.add('add-to-order');
    btn.textContent = "+";
    console.log("Создана кнопка + для элемента:", item);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAddToOrderClick(item, btn);
    });
    return btn;
  }

  // Функция для обработки клика по кнопке "add-to-order"
  function handleAddToOrderClick(item, addBtn) {
    console.log("handleAddToOrderClick вызвана для элемента:", item);
    if (item.querySelector('.quantity-controls')) return;

    const dish = {
      id: item.dataset.id || item.querySelector('h3').textContent,
      name: item.querySelector('h3').textContent,
      price: item.querySelector('p').textContent.replace("Цена: ", "").replace(" сом", ""),
      weight: item.querySelector('p:nth-of-type(2)')
                ? item.querySelector('p:nth-of-type(2)').textContent.match(/Вес:\s*(\d+)/)?.[1] || ""
                : "",
      quantity: 1,
      description: item.dataset.description || "",
      imageUrl: item.dataset.imageUrl
    };

    addToOrder(dish);
    updateOrdersCount();
    addBtn.remove();

    const quantityControls = document.createElement('div');
    quantityControls.classList.add('quantity-controls');
    quantityControls.innerHTML = `
      <button class="decrement">-</button>
      <span class="quantity">1</span>
      <button class="increment">+</button>
    `;
    item.appendChild(quantityControls);

    const incrementBtn = quantityControls.querySelector('.increment');
    const decrementBtn = quantityControls.querySelector('.decrement');
    const quantitySpan = quantityControls.querySelector('.quantity');

    incrementBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const existing = orders.find(o => o.id === dish.id);
      if (existing) {
        existing.quantity += 1;
        quantitySpan.textContent = existing.quantity;
        updateOrdersCount();
      }
    });

    decrementBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const existing = orders.find(o => o.id === dish.id);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
          quantitySpan.textContent = existing.quantity;
        } else {
          orders = orders.filter(o => o.id !== dish.id);
          quantityControls.remove();
          const newAddBtn = createAddToOrderButton(item);
          item.appendChild(newAddBtn);
          newAddBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleAddToOrderClick(item, newAddBtn);
          });
        }
        updateOrdersCount();
      }
    });
  }

  // Функция для добавления обработчиков для всех кнопок "add-to-order" в карточках блюд
  function addAddToOrderListeners() {
    const addButtons = document.querySelectorAll('.menu-item .add-to-order');
    addButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.menu-item');
        if (item.querySelector('.quantity-controls')) return;

        const dish = {
          id: item.dataset.id || item.querySelector('h3').textContent,
          name: item.querySelector('h3').textContent,
          price: item.querySelector('p').textContent.replace("Цена: ", "").replace(" сом", ""),
          weight: item.querySelector('p:nth-of-type(2)')
                  ? item.querySelector('p:nth-of-type(2)').textContent.match(/Вес:\s*(\d+)/)?.[1] || ""
                  : "",
          quantity: 1,
          description: item.dataset.description || "",
          imageUrl: item.dataset.imageUrl
        };

        addToOrder(dish);
        updateOrdersCount();
        btn.remove();

        const quantityControls = document.createElement('div');
        quantityControls.classList.add('quantity-controls');
        quantityControls.innerHTML = `
          <button class="decrement">-</button>
          <span class="quantity">1</span>
          <button class="increment">+</button>
        `;
        item.appendChild(quantityControls);

        const incrementBtn = quantityControls.querySelector('.increment');
        const decrementBtn = quantityControls.querySelector('.decrement');
        const quantitySpan = quantityControls.querySelector('.quantity');

        incrementBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const existing = orders.find(o => o.id === dish.id);
          if (existing) {
            existing.quantity += 1;
            quantitySpan.textContent = existing.quantity;
            updateOrdersCount();
          }
        });

        decrementBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const existing = orders.find(o => o.id === dish.id);
          if (existing) {
            if (existing.quantity > 1) {
              existing.quantity -= 1;
              quantitySpan.textContent = existing.quantity;
            } else {
              orders = orders.filter(o => o.id !== dish.id);
              quantityControls.remove();
              const newAddBtn = createAddToOrderButton(item);
              item.appendChild(newAddBtn);
              newAddBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAddToOrderClick(item, newAddBtn);
              });
            }
            updateOrdersCount();
          }
        });
      });
    });
  }

  function addSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query !== "") {
        document.getElementById('categories-cards-container').style.display = "none";
        document.getElementById('menu-items').style.display = "block";
      }
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        const dishName = item.querySelector('h3') ? item.querySelector('h3').textContent.toLowerCase() : "";
        item.style.display = (dishName.indexOf(query) > -1) ? "block" : "none";
      });
    });
  }

  // Функция для обработчиков info-кнопок (например, верхнего меню)
  function addInfoButtonListeners() {
    const infoButtons = document.querySelectorAll('.info-btn');
    infoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        infoButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.action === "categories") {
          document.querySelector('.banner').style.display = "block";
          document.querySelector('.info-card').style.display = "block";
          document.getElementById('categories-cards-container').style.display = "flex";
          document.getElementById('menu-items').style.display = "none";
          window.scrollTo(0, 0);
        } else {
          document.querySelector('.info-card').style.display = "none";
          if (btn.dataset.category === "orders") {
            showOrdersModal();
          } else {
            document.getElementById('categories-cards-container').style.display = "none";
            document.getElementById('menu-items').style.display = "block";
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
              item.style.display = (item.dataset.category === btn.dataset.category) ? "block" : "none";
            });
          }
        }
      });
    });
  }

  // Функция для добавления обработчиков для модального окна блюд (при клике на блюдо, не на кнопку +)
  function addDishModalListeners() {
    const dishItems = document.querySelectorAll('.menu-item');
    const modal = document.getElementById('dish-modal');
    const modalContent = document.getElementById('dish-details');
    const modalClose = document.getElementById('modal-close');

    dishItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-order')) return;

        const dishName = item.querySelector('h3').textContent;
        const dishDescription = item.dataset.description || "";
        const dishPrice = item.querySelector('p').textContent;
        const dishImageHTML = item.querySelector('img').outerHTML;
        modalContent.innerHTML = `
          <h2>${dishName}</h2>
          ${dishImageHTML}
          <p>${dishDescription}</p>
          <p>${dishPrice}</p>
          <button class="add-to-order">+</button>
        `;
        modal.style.display = "block";

        const modalAddButton = modalContent.querySelector('.add-to-order');
        modalAddButton.addEventListener('click', (e) => {
          e.stopPropagation();
          if (modalContent.querySelector('.quantity-controls')) return;

          const dish = {
            id: item.dataset.id || dishName,
            name: dishName,
            price: dishPrice.replace("Цена: ", "").replace(" сом", ""),
            weight: item.querySelector('p:nth-of-type(2)')
                      ? item.querySelector('p:nth-of-type(2)').textContent.match(/Вес:\s*(\d+)/)?.[1] || ""
                      : "",
            quantity: 1,
            description: dishDescription,
            imageUrl: item.dataset.imageUrl
          };
          addToOrder(dish);
          updateOrdersCount();

          modalAddButton.remove();

          const quantityControls = document.createElement('div');
          quantityControls.classList.add('quantity-controls');
          quantityControls.innerHTML = `
            <button class="decrement">-</button>
            <span class="quantity">1</span>
            <button class="increment">+</button>
          `;
          modalContent.appendChild(quantityControls);

          const incrementBtn = quantityControls.querySelector('.increment');
          const decrementBtn = quantityControls.querySelector('.decrement');
          const quantitySpan = quantityControls.querySelector('.quantity');

          incrementBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const existing = orders.find(o => o.id === dish.id);
            if (existing) {
              existing.quantity += 1;
              quantitySpan.textContent = existing.quantity;
              updateOrdersCount();
            }
          });

          decrementBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const existing = orders.find(o => o.id === dish.id);
            if (existing) {
              if (existing.quantity > 1) {
                existing.quantity -= 1;
                quantitySpan.textContent = existing.quantity;
              } else {
                orders = orders.filter(o => o.id !== dish.id);
                quantityControls.remove();
                const newAddBtn = createAddToOrderButton(item);
                modalContent.appendChild(newAddBtn);
                newAddBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  handleAddToOrderClick(item, newAddBtn);
                });
              }
              updateOrdersCount();
            }
          });
        });
      });
    });

    modalClose.addEventListener('click', () => {
      modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });

    let touchStartY = 0;
    let touchEndY = 0;

    modal.addEventListener('touchstart', function(e) {
      touchStartY = e.changedTouches[0].screenY;
    });

    modal.addEventListener('touchend', function(e) {
      touchEndY = e.changedTouches[0].screenY;
      if (touchEndY - touchStartY > 50) {
        modal.style.display = "none";
      }
    });
  }

  // Функция для добавления обработчиков для кнопки "add-to-order" внутри карточек блюд
  function addAddToOrderListeners() {
    const addButtons = document.querySelectorAll('.menu-item .add-to-order');
    addButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = btn.closest('.menu-item');
        if (item.querySelector('.quantity-controls')) return;

        const dish = {
          id: item.dataset.id || item.querySelector('h3').textContent,
          name: item.querySelector('h3').textContent,
          price: item.querySelector('p').textContent.replace("Цена: ", "").replace(" сом", ""),
          weight: item.querySelector('p:nth-of-type(2)')
                  ? item.querySelector('p:nth-of-type(2)').textContent.match(/Вес:\s*(\d+)/)?.[1] || ""
                  : "",
          quantity: 1,
          description: item.dataset.description || "",
          imageUrl: item.dataset.imageUrl
        };

        addToOrder(dish);
        updateOrdersCount();
        btn.remove();

        const quantityControls = document.createElement('div');
        quantityControls.classList.add('quantity-controls');
        quantityControls.innerHTML = `
          <button class="decrement">-</button>
          <span class="quantity">1</span>
          <button class="increment">+</button>
        `;
        item.appendChild(quantityControls);

        const incrementBtn = quantityControls.querySelector('.increment');
        const decrementBtn = quantityControls.querySelector('.decrement');
        const quantitySpan = quantityControls.querySelector('.quantity');

        incrementBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const existing = orders.find(o => o.id === dish.id);
          if (existing) {
            existing.quantity += 1;
            quantitySpan.textContent = existing.quantity;
            updateOrdersCount();
          }
        });

        decrementBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const existing = orders.find(o => o.id === dish.id);
          if (existing) {
            if (existing.quantity > 1) {
              existing.quantity -= 1;
              quantitySpan.textContent = existing.quantity;
            } else {
              orders = orders.filter(o => o.id !== dish.id);
              quantityControls.remove();
              const newAddBtn = createAddToOrderButton(item);
              item.appendChild(newAddBtn);
              newAddBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAddToOrderClick(item, newAddBtn);
              });
            }
            updateOrdersCount();
          }
        });
      });
    });
  }

  function addSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query !== "") {
        document.getElementById('categories-cards-container').style.display = "none";
        document.getElementById('menu-items').style.display = "block";
      }
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        const dishName = item.querySelector('h3') ? item.querySelector('h3').textContent.toLowerCase() : "";
        item.style.display = (dishName.indexOf(query) > -1) ? "block" : "none";
      });
    });
  }

  // Используем Firebase-подписки вместо fetch-запросов
  subscribeCategories();
  subscribeDishes();
  addInfoButtonListeners();
  addDishModalListeners();
  addOrderActionListeners();
  addAddToOrderListeners();
  addSearchFunctionality();
});
