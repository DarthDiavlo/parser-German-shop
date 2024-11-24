const axios = require('axios');
const cheerio = require('cheerio');
const { syncbd } = require('./syncbd.js');
const {alternateProduct} = require('./models.js')

// URL страницы, которую вы хотите спарсить
const baseUrl = "https://www.alternate.de/listing.xhtml?q=drahtlose+Kopfhörer&page=";

// Массив для хранения ссылок
const urls = [];

for (let i = 1; i <= 1; i++) {
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
        const productCards = $('.card.align-content-center.productBox.boxCounter.campaign-timer-container');
        console.log('Product cards length:', productCards.length); // Выводим количество найденных карточек товаров

        // Перебираем каждую карточку товара
        const records = [];
        productCards.each((j, card) => {
            const nameElement = $(card).find('.product-name.font-weight-bold span'); 
            const priceElement = $(card).find('.col-auto.order-2.pl-0 span');
            const ratingElement = $(card).find('.ratingCount.pl-1');
            const deliveryTimeElement = $(card).find('.col-auto.delivery-info.text-right');
            const photoElement = $(card).find('.col-auto.col-sm-3.mx-auto.mx-sm-0.my-2.my-sm-0.pr-sm-0.product-image.position-relative img');

            const name = nameElement.text().trim() || 'Название не найдено';
            const price = priceElement.text().trim() || 'Цена не найдена';
            const rating = ratingElement ? ratingElement.text().trim() : 'Рейтинг не найден';
            const deliveryTime = deliveryTimeElement.text().trim() || 'Сроки доставки не найдены';
            const photo = photoElement.attr('src') || 'Фото не найдено';

            alternateProduct.create({
                name: name,
                price: convertPriceStringToFloat(price),
                qualityRating: rating,
                deliveryTime: deliveryTime,
                photo: photo
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
        await new Promise(resolve => setTimeout(resolve, 30000)); // Задержка между запросами
    }
})();