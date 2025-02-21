
let currentQrScanner = null;

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

  // ... остальной ваш код (подписки, рендер, обработчики и т.д.) ...

  // Вставьте код для модального окна официанта здесь, перед закрывающей скобкой.
  // Например:
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

  // Конец обработчика DOMContentLoaded



  // ------------------ Инициализация Firebase ------------------
  // Убедитесь, что в HTML подключены скрипты:
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

  // Подписка на категории из Firestore
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

  // Отрисовка блюд
  function renderDishes(dishes) {
    const itemsList = document.querySelector('.items-list');
    if (itemsList) {
      itemsList.innerHTML = "";
      dishes.forEach(dish => {
        const item = document.createElement('div');
        item.classList.add('menu-item');

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
        <p>Цена: ${dish.price} сом | Вес: ${dish.weight}  |  ${dish.quantity} шт</p>
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

  function addDishModalListeners() {
    const itemsList = document.querySelector('.items-list');
    const modal = document.getElementById('dish-modal');
    const modalContent = document.getElementById('dish-details');
    const modalClose = document.getElementById('modal-close');
  
    if (!itemsList || !modal || !modalContent || !modalClose) {
      console.error("Не найдены необходимые элементы: .items-list, dish-modal, dish-details, modal-close");
      return;
    }
  
    // Делегирование клика на контейнере блюд
    itemsList.addEventListener("click", function(e) {
      // Если кликнули по кнопке добавления, не открываем модальное окно
      if (e.target.classList.contains("add-to-order")) return;
  
      const item = e.target.closest(".menu-item");
      if (!item) return;
  
      // Получаем данные блюда
      const dishName = item.querySelector("h3") ? item.querySelector("h3").textContent : "";
      const dishDescription = item.dataset.description || "";
      const dishPrice = item.querySelector("p") ? item.querySelector("p").textContent : "";
      const dishImageHTML = item.querySelector("img") ? item.querySelector("img").outerHTML : "";
  
      // Подготовка объекта блюда (используем id из data, если есть)
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
  
      // Проверяем, существует ли заказ для этого блюда
      const existingOrder = orders.find(o => o.id === dish.id);
  
      // Формируем содержимое модального окна:
      // Если уже добавлено, показываем панель управления с текущим количеством,
      // иначе – показываем кнопку "add-to-order"
      if (existingOrder) {
        modalContent.innerHTML = `
          <h2>${dishName}</h2>
          ${dishImageHTML}
          <p>${dishDescription}</p>
          <p>${dishPrice}</p>
          <div class="modal-controls">
            <div id="modal-qty" class="quantity-controls">
              <button class="decrement">-</button>
              <span class="quantity">${existingOrder.quantity}</span>
              <button class="increment">+</button>
            </div>
          </div>
        `;
      } else {
        modalContent.innerHTML = `
          <h2>${dishName}</h2>
          ${dishImageHTML}
          <p>${dishDescription}</p>
          <p>${dishPrice}</p>
          <div class="modal-controls">
            <button id="modal-add" class="add-to-order">+</button>
            <div id="modal-qty" class="quantity-controls" style="display: none;">
              <button class="decrement">-</button>
              <span class="quantity">1</span>
              <button class="increment">+</button>
            </div>
          </div>
        `;
      }
  
      modal.style.display = "block";
  
      // Назначаем обработчик для кнопки "add-to-order", если она присутствует
      const modalAddButton = modalContent.querySelector("#modal-add");
      if (modalAddButton) {
        modalAddButton.addEventListener("click", function(e) {
          e.stopPropagation();
          // При клике скрываем кнопку и показываем панель
          modalAddButton.style.display = "none";
          const modalQty = modalContent.querySelector("#modal-qty");
          modalQty.style.display = "inline-flex";
  
          // Добавляем блюдо в заказ
          addToOrder(dish);
          updateOrdersCount();
  
          // Настраиваем обработчики для кнопок в панели управления
          setModalQuantityHandlers(dish, modalContent);
        });
      } else {
        // Если панель уже показывается (заказ существует), назначаем обработчики для кнопок
        const modalQty = modalContent.querySelector("#modal-qty");
        if (modalQty) {
          setModalQuantityHandlers(dish, modalContent);
        }
      }
    });
  
    // Закрытие модального окна по кнопке "X"
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
  
  // Вспомогательная функция для назначения обработчиков для кнопок панели управления в модальном окне
  function setModalQuantityHandlers(dish, modalContent) {
    const modalQty = modalContent.querySelector("#modal-qty");
    const incrementBtn = modalQty.querySelector(".increment");
    const decrementBtn = modalQty.querySelector(".decrement");
    const quantitySpan = modalQty.querySelector(".quantity");
  
    incrementBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      const existing = orders.find(o => o.id === dish.id);
      if (existing) {
        existing.quantity += 1;
        quantitySpan.textContent = existing.quantity;
        updateOrdersCount();
      }
    });
  
    decrementBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      const existing = orders.find(o => o.id === dish.id);
      if (existing) {
        if (existing.quantity > 1) {
          existing.quantity -= 1;
          quantitySpan.textContent = existing.quantity;
        } else {
          // Если количество становится 0, удаляем блюдо из заказа и восстанавливаем кнопку "+"
          orders = orders.filter(o => o.id !== dish.id);
          modalQty.style.display = "none";
          const modalAddButton = modalContent.querySelector("#modal-add");
          if (modalAddButton) {
            modalAddButton.style.display = "inline-block";
          } else {
            // Если кнопка не была создана ранее, создаем её заново
            const newAddBtn = document.createElement("button");
            newAddBtn.id = "modal-add";
            newAddBtn.classList.add("add-to-order");
            newAddBtn.textContent = "+";
            modalContent.querySelector(".modal-controls").appendChild(newAddBtn);
            newAddBtn.addEventListener("click", (e) => {
              e.stopPropagation();
              newAddBtn.style.display = "none";
              modalQty.style.display = "inline-flex";
              addToOrder(dish);
              updateOrdersCount();
              setModalQuantityHandlers(dish, modalContent);
            });
          }
        }
        updateOrdersCount();
      }
    });
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








  // Функция для показа модального окна заказов
// Функция проверки подключения через AJAX (ожидается, что сервер вернет { connected: true/false })
// Функция проверки подключения через AJAX (ожидается, что сервер вернет { connected: true/false })
// Функция проверки подключения
// Функция проверки подключения Wi‑Fi, возвращает Promise, который резолвится в true/false
// Определяем функцию checkWiFiConnection внутри script.js
// Функция проверки подключения Wi‑Fi (возвращает Promise, который резолвится в true/false)
function checkWiFiConnection() {
  return fetch("http://192.168.0.152:5001/check-connection")
    .then(response => response.json())
    .then(data => {
      console.log("Ответ от сервера:", data);
      return data.connected;  // true, если подключен, false если нет
    })
    .catch(err => {
      console.error("Ошибка проверки подключения:", err);
      return false;
    });
}

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

    let subtotal = orders.reduce((acc, order) => acc + (parseFloat(order.price) * order.quantity), 0);
    html += `<div class="order-subtotal" style="margin-top: 15px;">Подитог: ${subtotal.toFixed(2)} сом</div>`;
    html += `<div class="order-service" style="margin-top: 5px;">Обслуживание не включено</div>`;

    html += `<div id="waiter-section" style="margin-top: 15px;">`;
    // Кнопка "Вызвать официанта" – текст остаётся неизменным и кнопка всегда кликабельна
    html += `<button id="order-call-waiter" class="styled-button">Вызвать официанта</button>`;
    // Инструкция для пользователя (будет показана, если клиент не подключён к Wi‑Fi)
    html += `<p id="wifi-instruction" style="margin-left: 10px; font-size: 0.9rem; color: #ccc; display: none;"></p>`;
    // Кнопка для сканирования QR‑кода (активируется, если клиент не в сети)
    html += `<button id="scan-qr" disabled class="styled-button">Сканировать QR‑code Wi‑Fi</button>`;
    html += `</div>`;
  }

  orderDetails.innerHTML = html;
  orderModal.style.display = "block";
  addOrderActionListeners();

  // Получаем элементы, которые мы только что создали
  const orderCallWaiterBtn = document.getElementById('order-call-waiter');
  const scanQrBtn = document.getElementById('scan-qr');
  const wifiInstruction = document.getElementById('wifi-instruction');

  // Всегда делаем кнопку "Вызвать официанта" активной
  orderCallWaiterBtn.disabled = false;

  // Обновляем интерфейс (например, показываем инструкцию и активируем кнопку сканирования)
  checkWiFiConnection().then(connected => {
    if (orderCallWaiterBtn && scanQrBtn && wifiInstruction) {
      if (connected) {
        wifiInstruction.style.display = 'none';
        scanQrBtn.disabled = true;
      } else {
        wifiInstruction.style.display = 'inline-block';
        wifiInstruction.textContent = "Для вызова официанта, пожалуйста, подключитесь к Wi‑Fi кафе.";
        scanQrBtn.disabled = false;
      }
      updateButtonStyles(orderCallWaiterBtn);
      updateButtonStyles(scanQrBtn);
    }
  });

  // Обработчик клика для кнопки "Вызвать официанта"
  orderCallWaiterBtn.addEventListener('click', function () {
    checkWiFiConnection().then(connected => {
      if (connected) {
        // Если клиент подключён к Wi‑Fi, открываем модальное окно выбора стола
        document.getElementById('waiter-modal').style.display = 'block';
      } else {
        // Если клиент не в сети, перенаправляем его на локальный сервер
        window.location.href = "http://192.168.0.152:5001/";
      }
    });
  });

  // Обработчик для кнопки "Сканировать QR‑code Wi‑Fi"
  if (scanQrBtn) {
    scanQrBtn.addEventListener('click', function () {
      startQrScanner();
    });
  }

  // Обработчик для кнопки "Назад" в модальном окне QR‑сканера
  const qrScannerBackBtn = document.getElementById('qr-scanner-back');
  if (qrScannerBackBtn) {
    qrScannerBackBtn.addEventListener('click', function () {
      document.getElementById('qr-scanner-modal').style.display = 'none';
      orderModal.style.display = 'block';
      stopQrScanner();
    });
  }
}














// Функция для запуска сканера QR‑кодов
function startQrScanner() {
  console.log("startQrScanner() вызвана");

  const qrScannerModal = document.getElementById("qr-scanner-modal");
  if (!qrScannerModal) {
    console.error("Элемент с id 'qr-scanner-modal' не найден.");
    return;
  }
  qrScannerModal.style.display = "block";

  const qrReaderDiv = document.getElementById("qr-reader");
  if (!qrReaderDiv) {
    console.error("Элемент с id 'qr-reader' не найден.");
    return;
  }

  qrReaderDiv.style.display = "block";
  qrReaderDiv.innerHTML = "";

  // Получаем список камер
  Html5Qrcode.getCameras().then(devices => {
    if (!devices || devices.length === 0) {
      console.error("Камеры не найдены.");
      alert("Не найдено ни одной камеры.");
      return;
    }

    // Выбираем ЗАДНЮЮ камеру
    let backCamera = devices.find(device => device.label.toLowerCase().includes("back"));
    let selectedCameraId = backCamera ? backCamera.id : devices[0].id; // Если нет задней, берем первую

    console.log("Используем камеру:", backCamera ? "Заднюю" : "Первую доступную");

    // Запускаем QR-сканер
    const html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: 250 };

    html5QrCode.start(
      selectedCameraId,
      config,
      (decodedText, decodedResult) => {
        console.log("QR‑код прочитан:", decodedText);

        const expectedCode = "WIFI:S:K&A;T:WPA;P:15690024;;";
        if (decodedText.trim() === expectedCode) {
          alert("Подключение подтверждено!");
          html5QrCode.stop().then(() => {
            qrScannerModal.style.display = "none";
          }).catch(err => console.error("Ошибка остановки сканера:", err));
        } else {
          alert("Неверный QR-код. Попробуйте снова.");
        }
      },
      (errorMessage) => {
        console.warn("Ошибка чтения QR:", errorMessage);
      }
    ).catch(err => console.error("Ошибка запуска сканера QR-кода:", err));

  }).catch(err => console.error("Ошибка получения списка камер:", err));
}
























function stopQrScanner() {
  if (currentQrScanner) {
    currentQrScanner.stop().then(() => {
      console.log("Сканер остановлен.");
      currentQrScanner = null;
    }).catch(err => {
      console.error("Ошибка остановки сканера: ", err);
    });
  }
}






















// Функция обновления внешнего вида кнопок в зависимости от состояния disabled
function updateButtonStyles(button) {
  if (button.disabled) {
    button.style.backgroundColor = '#cccccc';
    button.style.cursor = 'not-allowed';
  } else {
    button.style.backgroundColor = '#FFA000';
    button.style.cursor = 'pointer';
  }
}




  
  
  // Функция для закрытия модального окна заказов
  function addOrderModalListeners() {
    const orderModal = document.getElementById('order-modal');
    const orderModalClose = document.getElementById('order-modal-close');
    if (orderModalClose) {
      orderModalClose.addEventListener('click', () => {
        orderModal.style.display = "none";
      });
    }
    window.addEventListener('click', (event) => {
      if (event.target === orderModal) {
        orderModal.style.display = "none";
      }
    });
  }

  // Функция для обновления счётчика заказов и UI блюд
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

  // Обновление UI карточек блюд
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

  // Функция для добавления блюда в заказ
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

  // Обработчики кнопок в модальном окне заказов
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
    
    // Заменяем кнопку "add-to-order" непосредственно на панель управления:
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
          // Возвращаем панель обратно в виде кнопки, сохраняя позицию
          const newAddBtn = createAddToOrderButton(item);
          item.replaceChild(newAddBtn, quantityControls);
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

  // Функция для добавления обработчиков для кнопок поиска
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

  // Функция для закрытия модального окна заказов


  function addOrderModalListeners() {
  const orderModal = document.getElementById('order-modal');
  const orderModalClose = document.getElementById('order-modal-close');
  // Закрытие при клике по кнопке "X"
  if (orderModalClose) {
    orderModalClose.addEventListener('click', () => {
      orderModal.style.display = "none";
    });
  }
  // Закрытие при клике на область вне содержимого модального окна
  orderModal.addEventListener('click', (event) => {
    // Если кликнули по самому контейнеру модального окна, а не по его внутреннему содержимому
    if (event.target === orderModal) {
      orderModal.style.display = "none";
    }
  });
}

fetch("http://192.168.0.152:5001/check-connection", { method: "HEAD" })
  .catch(() => {
    document.getElementById("local-server-warning").style.display = "block";
  });


  
  // Вызываем функции подписок и обработчиков (однократно)
// Вызываем функции подписок и обработчиков
subscribeCategories();
subscribeDishes();
addInfoButtonListeners();
addDishModalListeners();  // <-- Этот вызов должен быть здесь!
addOrderModalListeners();
addAddToOrderListeners();
addSearchFunctionality();

});




