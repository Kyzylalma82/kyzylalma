let currentQrScanner = null;

// Глобальный массив заказов – он должен быть объявлен до использования
let orders = [];

// Обработчик DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function() {
  // Обработчики для оверлея
  const overlay = document.getElementById('overlay');
  if (overlay) {
    const qrMenuBtn = document.getElementById('qr-menu');
    const qrMenuPlusBtn = document.getElementById('qr-menu-plus');
  
    if (qrMenuBtn) {
      qrMenuBtn.addEventListener('click', function() {
        // Добавляем плавный переход для opacity
        overlay.style.transition = 'opacity 0.5s ease';
        // Устанавливаем opacity в 0 для плавного исчезновения
        overlay.style.opacity = '0';
        console.log("Выбрана опция QR Menu");
        // Через 500 мс (время анимации) удаляем оверлей из DOM
        setTimeout(() => {
          overlay.remove();
          console.log("Оверлей удален");
        }, 500);
      });
    }
  
    if (qrMenuPlusBtn) {
      qrMenuPlusBtn.addEventListener('click', function(e) {
        window.location.href = "http://192.168.0.152:5001/";
      });
    }
    
  }  



  const images = [
    "images/banner1.jpg",
    "images/banner2.jpg",
    "images/banner3.jpg",
    "images/banner4.jpg"
];

let currentIndex = 0;
const bannerImg = document.querySelector(".banner-img");

function changeImage() {
    bannerImg.style.opacity = "0"; // Исчезновение картинки
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % images.length;
        bannerImg.src = images[currentIndex];
        bannerImg.style.opacity = "1"; // Появлениек новой картинки
    }, 500); // Делаем задержку перед сменой
}

setInterval(changeImage, 5000);


  // Далее – ваш код для сайта
  const categoryImages = {
    "hot": "images/hot.jpg",
    "pizza": "images/pizza.jpg",
    "salads": "images/salads.jpg",
    "drinks": "images/drinks.jpg",
    "desserts": "images/desserts.jpg",
    "showcase": "images/showcase.jpg"  // для "Витрина"
  };
  
  function mapCategoryName(name) {
    const mapping = {
      "горячие блюда": "hot",
      "пиццы": "pizza",
      "салаты": "salads",
      "напитки": "drinks",
      "десерты": "desserts",
      "витрина": "showcase"
    };
    return mapping[name.toLowerCase()] || name.toLowerCase();
  }
  

  let categoriesMap = {};
  
  function getCategoryNameFromId(category_id) {
    return categoriesMap[category_id] || "unknown";
  }


  const waiterClose = document.getElementById('waiter-modal-close');
  if (waiterClose) {
    waiterClose.addEventListener('click', function() {
      document.getElementById('waiter-modal').style.display = 'none';
    });
  }
  
  const tableButtons = document.querySelectorAll('.table-button');
  let selectedTable = null;
  tableButtons.forEach(button => {
    button.addEventListener('click', function() {
      tableButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      selectedTable = button.dataset.table;
      document.getElementById('call-waiter').disabled = false;
    });
  });
  
  const callWaiterBtn = document.getElementById('call-waiter');
  if (callWaiterBtn) {
    callWaiterBtn.addEventListener('click', function() {
      if (!selectedTable) return;
      callWaiter(selectedTable);
    });
  }
  
  function callWaiter(tableNumber) {
    db.collection('calls').add({
      table: tableNumber,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      alert("Официант вызван для стола " + tableNumber);
      document.getElementById('waiter-modal').style.display = 'none';
      tableButtons.forEach(btn => btn.classList.remove('selected'));
      selectedTable = null;
      document.getElementById('call-waiter').disabled = true;
    })
    .catch(error => {
      console.error("Ошибка вызова официанта:", error);
    });
  }
  
  window.addEventListener('click', function(event) {
    const waiterModal = document.getElementById('waiter-modal');
    if (event.target === waiterModal) {
      waiterModal.style.display = 'none';
    }
  });

  // ------------------ Инициализация Firebase ------------------
  // Убедитесь, что в HTML подключены скрипты:
  // <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
  // <script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-firestoreк.js"></script>
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

  // Подписка на категории из Firestore
  function subscribeCategories() {
    db.collection('categories').onSnapshot((snapshot) => {
      let categories = [];
      snapshot.forEach(doc => {
        let data = doc.data();
        data.id = doc.id; // используем idк документа
        categories.push(data);
      });
      console.log('Категории из Firestore:', categories);
      renderCategories(categories);
    }, (error) => {
      console.error('Ошибка подписки на категории:', error);
    });
  }

  // Подписка на блюда из Firestore
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

  // Отрисовка категорий
  function renderCategories(categories) {
    const container = document.getElementById('categories-cards-container');
    if (container) {
      container.innerHTML = "";
      categories.forEach(cat => {
        // Заполняем маппинг: idк -> имя
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

  // Отрисовка блюд
  function renderDishes(dishes) {
    const itemsList = document.querySelector('.items-list');
    if (itemsList) {
      itemsList.innerHTML = "";
      dishes.forEach(dish => {
        const item = document.createElement('div');
        item.classList.add('menu-item');
  
        // Определяемк категорию
        const mappedCategory = dish.categoryName 
            ? mapCategoryName(dish.categoryName) 
            : mapCategoryName(getCategoryNameFromId(dish.category_id));
        item.dataset.category = mappedCategory;
        if (mappedCategory === "pizza") {
          item.dataset.subcategory = "pizza30";
        }
  
        // Получаем URL изображения
        let imageUrl = dish.image_path;
        if (imageUrl) {
          imageUrl = imageUrl.replace("C:\\cafe_app\\bludim\\", "images/");
        } else {
          imageUrl = "images/default-dish.jpg";
        }
  
        // Формируем карточку блюда с блоком dish-info для веса и цены
        item.innerHTML = `
          <img src="${imageUrl}" alt="${dish.name}">
          <h3>${dish.name}</h3>
          <div class="dish-info">
            <span class="dish-weight">${dish.weight} г</span>
            <span class="dish-price">${dish.price} сом</span>
          </div>
        `;
        
        // Сохраняем данные вк data-атрибутах для использования в модальном окне
        item.dataset.description = dish.description;
        item.dataset.imageUrl = imageUrl;
        item.dataset.id = dish.id;
        item.dataset.weight = dish.weight;
        item.dataset.quantity = dish.quantity;
        item.dataset.price = dish.price;  // Сохраняем цену
  
        itemsList.appendChild(item);
        console.log(`Добавлено блюдо: ${dish.name} | mappedCategory: ${mappedCategory}`);
      });
    }
  }
  

  

  function addDishModalListeners() {
    const itemsList = document.querySelector('.items-list');
    const modal = document.getElementById('dish-modal');
    const modalContent = document.getElementById('dish-details');
    const modalClose = document.getElementById('modal-close');
  
    if (!itemsList || !modal || !modalContent || !modalClose) {
      console.error("Не найдены необходимые элементы: .items-list, dish-modal, dish-details, modal-close");
      return;
    }
  
    // При клике на карточку блюда открываем модальное окно
    itemsList.addEventListener("click", function(e) {
      const item = e.target.closest(".menu-item");
      if (!item) return;
  
      // Извлекаем данные из data-атрибутов
      const dishName = item.querySelector("h3") ? item.querySelector("h3").textContent : "";
      const dishDescription = item.dataset.description || "";
      const dishPrice = item.dataset.price || "";
      const dishImageHTML = item.querySelector("img") ? item.querySelector("img").outerHTML : "";
      const dishWeight = item.dataset.weight || "";
      const dishQuantity = item.dataset.quantity || "";
  
      // Формируем содержимое модальногок окна, выводим данные в нужном порядке
      modalContent.innerHTML = `
      <h2>${dishName}</h2>
      ${dishImageHTML}
      <p class="dish-description">${dishDescription}</p>
      <div class="dish-info">
        <span class="dish-weight">${dishWeight} г</span>
        <span class="dish-quantity">${dishQuantity} шт</span>
        <span class="dish-price">${dishPrice} сом</span>
      </div>
    `;
    
      
      modal.style.display = "block";
    });
  
    // Закрытие модального окнка по кнопке "X"
    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
    });
  
    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }
  

  
  // Функция для показа блюд по выбраннойк категории
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


  // Функция для обработки клика по кнопке "add-to-order"
  function handleAddToOrderClick(item, addBtn) {
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
  
    const quantityControls = document.createElement('div');
    quantityControls.classList.add('quantity-controls');
    quantityControls.innerHTML = `
      <button class="decrement">-</button>
      <span class="quantity">1</span>
      <button class="increment">+</button>
    `;
    
    // Заменяем кнопку "add-to-order"к непосредственно на панель управления:
    item.replaceChild(quantityControls, addBtn);
  
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
          // Возвращаем панель обратно вк виде кнопки, сохраняя позицию
          const newAddBtn = createAddToOrderButton(item);
          item.replaceChild(newAddBtn, quantityControls);
        }
        updateOrdersCount();
      }
    });
  }
  

  // Функция для добавления обработчиков длкя всех кнопок "add-to-order" в карточках блюд
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

  // Функция для добавления обработчиков дляк кнопок поиска
  function addSearchFunctionality() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
  
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (query !== "") {
        document.getElementById('categories-cards-container').style.display = "none";
        document.getElementById('menu-items').style.display = "block";
      } else {
        // Возвращаем исходное состояние, когда поиск пуст
        document.getElementById('categories-cards-container').style.display = "flex";
        document.getElementById('menu-items').style.display = "none";
      }
      const menuItems = document.querySelectorAll('.menu-item');
      menuItems.forEach(item => {
        const dishName = item.querySelector('h3') ? item.querySelector('h3').textContent.toLowerCase() : "";
        item.style.display = (dishName.indexOf(query) > -1) ? "block" : "none";
      });
    });
  }
  


  // Функция для обработчиков info-кнопок (кнапример, верхнего меню)
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
          document.getElementById('categories-cards-container').style.display = "none";
          document.getElementById('menu-items').style.display = "block";
          const menuItems = document.querySelectorAll('.menu-item');
          menuItems.forEach(item => {
            item.style.display = (item.dataset.category === btn.dataset.category) ? "block" : "none";
          });
        }
      });
    });
  }
  


subscribeCategories();
subscribeDishes();
addInfoButtonListeners();
addDishModalListeners();  // <-- Этот вызовк должен быть здесь!
addAddToOrderListeners();
addSearchFunctionality();
addInfoButtonListeners();

});




