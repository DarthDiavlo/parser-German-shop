const axios = require('axios');
const cheerio = require('cheerio');
const { syncbd } = require('./syncbd.js');
const {technikdirektProduct} = require('./models.js')


// URL страницы, которую вы хотите спарсить
const baseUrl = "https://www.technikdirekt.de/search/drahtlose%20Kopfhörer";

// Массив для хранения ссылок
const urls = [];

urls.push(baseUrl);

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
        const productCards = $('.productGridElement');
        console.log('Product cards length:', productCards.length); // Выводим количество найденных карточек товаров

        // Перебираем каждую карточку товара
        const records = [];
        productCards.each((j, card) => {
            const nameElement = $(card).find('.productGridElement__title a');
            const priceElement = $(card).find('.productGridElement__price');
            const shortDescriptionElement = $(card).find('.shortDescription small');
            const deliveryTimeElement = $(card).find('.productAvailability__text small');
            const photoElement = $(card).find('.productGridElement__image img');

            const name = nameElement.text().trim() || 'Название не найдено';
            const price = priceElement.text().trim() || 'Цена не найдена';
            const shortDescription = shortDescriptionElement.length ? shortDescriptionElement.text().trim() : 'Краткое описание не найдено';
            const deliveryTime = deliveryTimeElement.text().trim() || 'Сроки доставки не найдены';
            const photo = photoElement.attr('src') || 'Фото не найдено';

             technikdirektProduct.create({
                name: name,
                price: convertPriceStringToFloat(price),
                deliveryTime: deliveryTime,
                photo: photo,
                shortDescription: shortDescription
            });
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