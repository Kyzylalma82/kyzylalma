/* Сброс базовых отступов */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Общий контейнер */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Фон страницы и шрифты */
body {
  font-family: Arial, sans-serif;
  background-color: #1C1C1C;
  color: #FFFFFF;
}

/* ===== БАННЕР ===== */
.banner {
  width: 100%;
  height: 220px;
  overflow: hidden;
  margin-bottom: 20px;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ===== ИНФО-КАРТОЧКА ===== */
.info-card {
  background-color: #2A2A2A;
  border-radius: 10px;
  margin: -30px auto 20px auto;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
  text-align: center;
}

.info-card h1 {
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: #FFFFFF;
}

.sub-info {
  font-size: 0.9rem;
  color: #BFBFBF;
  margin-bottom: 10px;
}

.description {
  font-size: 0.95rem;
  color: #D0D0D0;
  margin-bottom: 15px;
  line-height: 1.4;
}

/* Фиксируем контейнер для поиска вверху экрана */
.search-bar {
  width: 100%;
  padding: 10px;
  /* Если больше не нужно фиксировать, уберите position: fixed */
  /* position: fixed; */
  /* Дополнительное оформление, если нужно */
}


/* Добавляем верхний отступ основному контейнеру, чтобы поиск не перекрывал контент */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 70px 20px 0; /* 70px подбирается в зависимости от высоты поля поиска */
}


.search-bar input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  outline: none;
  font-size: 1rem;
  background-color: #333;  /* новый фон */
  color: #fff;             /* цвет текста, если фон тёмный */
}


/* ===== КНОПКИ info-btn ===== */
/* Основной контейнер с отступом снизу для таб-бара */
/* Обновлённый контейнер: добавляем нижний отступ, чтобы контент не перекрывался таб-баром */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px 80px; /* нижний отступ, чтобы контент не закрывался таб-баром */
}

.info-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;              /* Используем всю ширину экрана */
  z-index: 100;
  background-color: #2A2A2A;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
  /* Отказываемся от transform и max-width, чтобы панель заняла всю ширину */
}

.info-btn {
  flex: 1;                  /* Каждая кнопка занимает равную долю */
  max-width: 100px;         /* При необходимости ограничим максимальную ширину */
  margin: 0 5px;
  background-color: #444;
  color: #FFFFFF;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 10px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border 0.3s;
}

.info-btn:hover {
  background-color: #FFA000;
  color: #000;
}

.info-btn.active {
  background-color: #444;
  color: #FFFFFF;
  border: 2px solid #FFA000;
}











.info-btn {
  background-color: #444;
  color: #FFFFFF;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 10px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border 0.3s;
}

.info-btn:hover {
  background-color: #FFA000;
  color: #000;
}

.info-btn.active {
  background-color: #444;
  color: #FFFFFF;
  border: 2px solid #FFA000;
}

/* ===== ОСНОВНЫЕ КАРТОЧКИ КАТЕГОРИЙ ===== */
.categories-cards {
  margin: 0 auto 40px auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.category-card {
  width: 100%;
  height: 130px;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.category-card .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.4);
  padding: 10px;
  text-align: center;
}

.category-card h3 {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  color: #FFFFFF;
}

.category-card:hover .overlay {
  background: rgba(0,0,0,0.7);
}

/* ===== РАЗДЕЛ С БЛЮДАМИ ===== */
.menu-items {
  margin: 0 auto 40px auto;
  /* Уже есть display: none; по умолчанию */
  position: relative; /* чтобы можно было позиционировать кнопку внутри */
}

/* Контейнер для кнопки */
.back-btn-container {
  position: absolute;
  top: 10px;
  right: 10px; /* или left: 10px, если хотите слева */
}

/* Стили кнопки */
.back-btn {
  background-color: #444;
  color: #FFFFFF;
  border: 2px solid transparent;
  border-radius: 50%; /* Круглая кнопка */
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, border 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.back-btn:hover {
  background-color: #FFA000;
  color: #000;
}




.items-list {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(2, 1fr); /* Всегда две колонки */
}

.menu-item {
  background-color: rgba(42, 42, 42, 0.85); /* полупрозрачный фон, можно заменить на нужный */
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s;
}

.menu-item:hover {
  transform: scale(1.02);
}

.menu-item img {
  width: 100%;
  height: 150px;            /* Фиксированная высота для всех изображений */
  object-fit: contain;      /* Сохраняем пропорции, показывая всю картинку */
  object-position: center;  /* Центрирование изображения */
}






/* Изменение размера и стиля заголовка блюда */
.menu-item h3 {
  font-size: 1rem;       /* немного меньше, чем раньше */
  color: #FFA000;        /* оставляем яркий оранжевый цвет */
  margin-bottom: 5px;
  text-transform: uppercase;
}

/* Изменение стиля описания и цены */
.menu-item p {
  font-size: 0.85rem;    /* немного уменьшенный размер */
  color: #ffffff;        /* белый цвет для читаемости */
  margin: 2px 0;
}

/* Если хотите добавить фон или градиент вместо однотонного фона */
.menu-item {
  background: linear-gradient(135deg, rgba(42,42,42,0.85) 0%, rgba(30,30,30,0.85) 100%);
}



/* ===== АДАПТИВНЫЕ НАСТРОЙКИ ===== */
@media (max-width: 500px) {
  .banner {
    height: 180px;
  }
  .info-card {
    margin-top: -40px;
  }
  .category-card {
    height: 150px;
  }
  .menu-item {
    width: 100%;
  }
}


/* Модальное окно (скрыто по умолчанию) */
.modal {
  display: none; /* Скрыто по умолчанию */
  position: fixed; /* Фиксированное положение */
  z-index: 200; /* Поверх всего */
  left: 0;
  top: 0;
  width: 100%; /* Полная ширина */
  height: 100%; /* Полная высота */
  overflow: auto; /* Прокрутка при необходимости */
  background-color: rgba(0, 0, 0, 0.5); /* Полупрозрачный фон */
}


/* Стили для модального окна */
/* Стили для модального окна заказов */
/* Стили для модального окна заказов */
/* Модальное окно – остаётся фиксированным, но содержимое адаптивное */


.modal-content {
  background-color: #2A2A2A;
  margin: 10% auto;
  padding: 20px;
  width: 90%;
  max-width: 300px;
  border-radius: 10px;
  color: #fff;
  box-sizing: border-box;
}
/* Если модальное окно заказов, можно задать аналогичные правила: */
.order-modal-content {
  max-width: 500px;
}

/* Ограничение для изображений внутри модального окна */
.modal-content img {
  max-width: 80%;
  height: auto;
  display: block;
  margin: 0 auto;
}



.close {
  color: #aaa;
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: #fff;
  text-decoration: none;
}

/* Стили для элементов заказа внутри модального окна */
.order-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #444;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.order-item .order-info {
  flex-grow: 1;
}

.order-item .order-info p {
  margin: 2px 0;
  font-size: 0.9rem;
}

.order-item button {
  background-color: #444;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background 0.3s;
}

.order-item button:hover {
  background-color: #FFA000;
  color: #000;
}

/* Стили для кнопки "+" внутри модального окна блюда (для добавления в заказ)    */
.add-to-order {
  background-color: #FFA000;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  color: #000;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 10px;
}

.add-to-order:hover {
  background-color: #ffbf40;
}
/* Для модального окна (заказов) */
/* Увеличение кнопок внутри модального окна заказов */
#order-modal .order-actions button {
  padding: 10px 15px !important;
  font-size: 1.2rem !important;
  border-radius: 8px !important;
  margin: 5px !important;
}

/* Панель управления количеством, появляющаяся рядом с кнопкой "add-to-order" */
.quantity-controls {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
}
.quantity-controls button {
  background-color: #FFA000;
  border: none;
  border-radius: 50%; /* тот же скругленный вид */
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  color: #000;
  cursor: pointer;
  transition: background 0.3s;
}

.quantity-controls button:hover {
  background-color: #ffbf40;
}

.quantity-controls span {
  font-size: 1rem;
  min-width: 20px;
  text-align: center;
  color: #fff;
}

.title-icon {
  width: 40px;      /* Размер иконки, настройте по вкусу */
  height: 40px;
  margin-right: 10px;
  vertical-align: middle; /* Чтобы иконка была по центру текста */
}
.title-icon {
  width: 60px;      /* увеличенный размер */
  height: 60px;
  margin-right: 10px;
  vertical-align: middle;
}
.info-card h1 {
  font-size: 2.5rem;              /* Увеличенный размер заголовка */
  font-family: 'Georgia', serif;  /* Можно заменить на любой красивый шрифт */
  color: #FFA000;                 /* Яркий оранжевый цвет */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); /* Тень для объёма */
  border-bottom: 2px solid #FFA000; /* Нижняя линия для акцента */
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab-icon {
  width: 40px;    /* Подберите нужный размер */
  height: 40px;
  display: inline-block;
}
.orders-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: bold;
}


/* Стили для модального окна официанта */
.waiter-modal-content {
  max-width: 400px;
  width: 90%;
  padding: 20px;
  margin: 10% auto;
}

/* Сетка столов */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

/* Кнопки столов */
.table-button {
  background-color: #444;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 15px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.table-button:hover {
  background-color: #FFA000;
  color: #000;
}

.table-button.selected {
  background-color: #FFA000;
  color: #000;
}

/* Кнопка "Позвать официанта" */
/* Кнопка "Позвать официанта" */
#order-call-waiter {
  background-color: #FFA000;  /* активное состояние */
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  margin: 10px; /* одинаковый отступ */
}

#order-call-waiter:disabled {
  background-color: #cccccc; /* более светлый, серый для неактивного */
  color: #777777;
  cursor: not-allowed;
  margin: 10px; /* отступы сохраняются */
}

/* Кнопка "Сканировать QR‑code Wi‑Fi" */
#scan-qr {
  background-color: #FFA000;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
  margin: 10px; /* одинаковый отступ */
}

#scan-qr:hover {
  background-color: #ffbf40;
  margin: 10px;
}
#wifi-instruction {
  margin-left: 10px;
  font-size: 0.9rem;
  color: #ccc;
}
