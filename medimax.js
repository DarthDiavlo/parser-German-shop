const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const { syncbd } = require('./syncbd.js');
const {medimaxProduct} = require('./models.js')

async function getDynamicPage(url, needed_selector) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    });
    await page.goto(url, { timeout: 60000, waitUntil: 'load' });
    await page.waitForSelector(needed_selector);
    const content = await page.content();
    await browser.close();
    return content
}

// URL страницы, которую вы хотите спарсить
const baseUrl = "https://www.medimax.de/search?q=drahtlose+Kopfhörer%3Arelevance%3AhasStock%3Atrue&page=";

// Массив для хранения ссылок
const urls = [];

for (let i = 0; i <= 19; i++) {
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
    const html = await getDynamicPage(url, '.cmsproductlist-name-link');
    if (!html) return; // Пропускаем страницу, если произошла ошибка

    const $ = cheerio.load(html);
    // Получаем все карточки товаров
    const productCards = $('.cmsproductlist-desktop-layout-item');
    console.log('Product cards length:', productCards.length); // Выводим количество найденных карточек товаров

    // Перебираем каждую карточку товара
    const records = [];
    productCards.each((j, card) => {
        const nameElement = $(card).find('.cmsproductlist-name-link');
        const priceElement = $(card).find('.cmsproductlist-price');
        const deliveryTimeElement = $(card).find('.stock-status-message');

        const name = nameElement.text().trim() || 'Название не найдено';
        const price = priceElement.text().trim() || 'Цена не найдена';
        const deliveryTime = deliveryTimeElement.text().trim() || 'Сроки доставки не найдены';

        medimaxProduct.create({
            name: name,
            price: convertPriceStringToFloat(price),
            deliveryTime: deliveryTime,
        });
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