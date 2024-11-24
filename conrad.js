const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { syncbd } = require('./syncbd.js');
const {conradProduct} = require('./models.js')

async function getDynamicPage(url, needed_selector) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    });
    await page.goto(url, { timeout: 300000, waitUntil: 'load' });
    await page.waitForSelector(needed_selector);
    const content = await page.content();
    await browser.close();
    return content
}

// URL страницы, которую вы хотите спарсить
const baseUrl = "https://www.conrad.de/de/search.html?search=drahtlose%20Kopfh%C3%B6rer&page=";

// Массив для хранения ссылок
const urls = [];

for (let i = 1; i <= 48; i++) {
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
    const html = await getDynamicPage(url, '.product__title');
    if (!html) return; 

    const $ = cheerio.load(html);
    // Получаем все карточки товаров
    const productCards = $('.tableLayout__row');
    console.log('Product cards length:', productCards.length); // Выводим количество найденных карточек товаров

    // Перебираем каждую карточку товара
    const records = [];
    productCards.each((j, card) => {
        const nameElement = $(card).find('.product__title');
        const priceElement = $(card).find('.product__currentPrice');
        const stockElement = $(card).find('.productAvailability__status span:nth-child(2)');
        const deliveryTimeElement = $(card).find('.productAvailability__estimatedDate');
        const photoElement = $(card).find('.product__imageLink img');

        const name = nameElement.text().trim() || 'Название не найдено';
        const price = priceElement.text().trim() || 'Цена не найдена';
        const stock = stockElement.text().trim() || 'Количество не найдено';
        const deliveryTime = deliveryTimeElement.text().trim() || 'Сроки доставки не найдены';
        const photo = photoElement.attr('src') || 'Фото не найдено';

        conradProduct.create({
        name: name,
        price: convertPriceStringToFloat(price),
        deliveryTime: deliveryTime,
        reviewCount: stock,
        photo: photo,
      })
    });
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