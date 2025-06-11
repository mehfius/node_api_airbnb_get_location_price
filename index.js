require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const cheerio = require('cheerio');
const { extractName, extractRoomId, extractTotalReviews, extractScore, extractPrice } = require('./scrapers/extractors');

const app = express();
const port = 3000;

app.use(express.json());

const AIRBNB_URL = process.env.AIRBNB_URL;

async function getAirbnbListingDetails(airbnbUrl) {

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-gpu', '--enable-logging', '--disable-dev-shm-usage', '--incognito']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1440, height: 900 });

        const startTime = Date.now();

        await page.goto(airbnbUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });

        const itemSelector = 'div[itemprop="itemListElement"]';
        const expectedMinCount = 18;

        try {
            await page.waitForFunction(
                (selector, expectedCount) => {
                    return document.querySelectorAll(selector).length >= expectedCount;
                },
                { timeout: 60000, polling: 'raf' },
                itemSelector,
                expectedMinCount
            );

            const endTime = Date.now();
            console.log(`Tempo para encontrar ${expectedMinCount} elementos: ${endTime - startTime}ms`);

            for (let i = 0; i < 3; i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight * 0.8);
                });
            }
        } catch (waitError) {
            console.log(`Tempo parcial (falha na espera): ${Date.now() - startTime}ms`);
        }

        const elementsHtml = await page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return Array.from(elements).map(el => el.outerHTML);
        }, itemSelector);

        const listings = [];
        for (const html of elementsHtml) {
            const $ = cheerio.load(html);
            const element = $('div[itemprop="itemListElement"]').get(0);

            const name = extractName($, element);
            const roomId = extractRoomId($, element);
            const totalReviews = extractTotalReviews($, element);
            const score = extractScore($, element);
            const price = extractPrice($, element);

            if (name || roomId) {
                listings.push({
                    name,
                    roomId,
                    total_reviews: totalReviews,
                    score,
                    price
                });
            }
        }

        return listings;
    } catch (error) {
        console.error('Erro ao raspar Airbnb:', error);
        return null;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function scrapeAndSave(maxPagesToScrape, enableWait) {
    if (!AIRBNB_URL) {
        throw new Error('URL do Airbnb não fornecida. Defina a variável de ambiente AIRBNB_URL.');
    }
    let currentPage = 0;
    const allData = [];
    let firstPageUrl = AIRBNB_URL;

    while (currentPage < maxPagesToScrape) {
        let airbnbUrl = AIRBNB_URL;
        if (currentPage > 0) {
            const offset = 18 * currentPage;
            const cursorObject = {
                section_offset: 0,
                items_offset: offset,
                version: 1
            };
            const cursor = Buffer.from(JSON.stringify(cursorObject)).toString('base64');
            airbnbUrl = `${AIRBNB_URL}&cursor=${encodeURIComponent(cursor)}`;
        }

        const scrapedData = await getAirbnbListingDetails(airbnbUrl);

        if (!scrapedData || scrapedData.length === 0) {
            break;
        }

        const formattedData = scrapedData.map((item, index) => ({
            room_id: item.roomId,
            title: item.name,
            total_reviews: item.total_reviews,
            score: item.score,
            price: item.price ? parseFloat(item.price) : null,
            position: currentPage * 18 + index + 1
        }));

        allData.push(...formattedData);
        currentPage++;

        if (enableWait) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    return { data: allData, firstPageUrl };
}

app.post('/scrape', async (req, res) => {
    try {
        const maxPagesToScrape = req.body.max_pages || 1;
        const enableWait = req.body.enable_wait || false;

        const result = await scrapeAndSave(maxPagesToScrape, enableWait);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});