const axios = require('axios');
const cheerio = require('cheerio');
const { syncbd } = require('./syncbd.js');
const {hifiReglerProduct} = require('./models.js')


// URL страницы, которую вы хотите спарсить
const baseUrl = "https://www.hifi-regler.de/suche/?ff_ot[]=bn&ff_ot[]=pp&ff_ot[]=pr&origin=searchbox&referer=&term=drahtlose+Kopfhörer&page=";

// Массив для хранения ссылок
const urls = [];

for (let i = 1; i <= 7; i++) {
    const url = baseUrl + i;
    urls.push(url);
}

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

      hifiReglerProduct.create({
        name: name,
        price: convertPriceStringToFloat(price),
        deliveryTime: deliveryTime,
        photo: photo,
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