// проверить асихронность сайтов, возможно убрать puppeteer
const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const puppeteer = require('puppeteer');
const { Sequelize, DataTypes } = require('sequelize')


// URL страницы, которую вы хотите спарсить
const baseUrl = "https://www.hifi-regler.de/suche/?ff_ot[]=bn&ff_ot[]=pp&ff_ot[]=pr&origin=searchbox&referer=&term=drahtlose+Kopfhörer&page=";

// Создаем экземпляр Sequelize и подключаемся к базе данных PostgreSQL
const sequelize = new Sequelize('postgres', 'postgres', 'GhBDtn123', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

// Массив для хранения ссылок
const urls = [];

for (let i = 1; i <= 7; i++) {
    const url = baseUrl + i;
    urls.push(url);
}

// Определяем модель User
const hifiRegler = sequelize.define('hifiRegler', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  qualityRating: {
    type: DataTypes.STRING,
  },
  deliveryTime: {
    type: DataTypes.STRING,
  },
  reviewCount: {
    type: DataTypes.STRING,
  },
  photo: {
    type: DataTypes.STRING,
  },
  remainingQuantity: {
    type: DataTypes.STRING,
  },
  shortDescription: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.DATE,
  },
});

sequelize.sync()
  .then(() => {
    console.log('База данных успешно синхронизирована.');
  })
  .catch((error) => {
    console.error('Ошибка синхронизации базы данных:', error);
  });

  // Функция для преобразования строки в рациональное число
function convertPriceStringToFloat(priceString) {
  const cleanedString = priceString.replace(/[^0-9,]/g, '');
  const floatString = cleanedString.replace(',', '.');
  return parseFloat(floatString);
}

async function processUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Получаем все карточки товаров
    const productCards = $('li[id^="prodid-"]');
    console.log('Product cards length:', productCards.length); // Выводим количество найденных карточек товаров

    // Перебираем каждую карточку товара
    productCards.each((j, card) => {
      const nameElement = $(card).find('.product-detail-link');
      const priceElement = $(card).find('.amount');
      const deliveryTimeElement = $(card).find('.dtimeGreen span');
      const photoElement = $(card).find('.product-thumb img');

      const name = nameElement.text().trim() || 'Название не найдено';
      const price = priceElement.text().trim() || 'Цена не найдена';
      const deliveryTime = deliveryTimeElement.text().trim() || 'Сроки доставки не найдены';
      const photo = photoElement.attr('src') || 'Фото не найдено';

      hifiRegler.create({
        name: name,
        price: convertPriceStringToFloat(price),
        qualityRating: 'не найдено',
        deliveryTime: deliveryTime,
        reviewCount: 'не найдено',
        photo: photo,
        remainingQuantity: 'не найдено',
        shortDescription: 'не найдено',
        date: new Date()
      })
    });
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
}

(async () => {
    const concurrency = 5; // Ограничение количества одновременно загружаемых страниц
    const chunks = [];

    for (let i = 0; i < urls.length; i += concurrency) {
        chunks.push(urls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
        await Promise.all(chunk.map(processUrl));
        await new Promise(resolve => setTimeout(resolve, 3000)); // Задержка между запросами
    }
})();     