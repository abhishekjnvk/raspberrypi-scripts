const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');
const url = 'https://www.investorgain.com/report/live-ipo-gmp/331/';
let lastScrapedAt = null;

const formatDate = (date, format) => {
  return date.toLocaleString('en-GB', format).replace(',', '').split(' ').join('-');
};

const parseDate = dateStr => {
  const [day, month] = dateStr.split('-');
  const monthIndex = new Date(Date.parse(`${month} 1, 2023`)).getMonth();
  const year = new Date().getFullYear();
  return new Date(year, monthIndex, day).getTime();
};

const isDateInRange = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate) + 86400000; // Add one day in milliseconds
  const today = Date.now();
  return today >= start && today <= end;
};

const getPercentageProfit = estListing => {
  if (!estListing) return null;
  const match = estListing.match(/\(([^)]+)%\)/);
  return match ? parseFloat(match[1]) : null;
};

const scrapIPOData = async (onlyClosingToday = false) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const tableData = [];
    const headers = [];

    $('table thead tr th').each((index, element) => {
      headers.push($(element).text().trim());
    });

    $('table tbody tr').each((index, element) => {
      const row = $(element);
      const cells = row.find('td');
      const rowData = {};

      headers.forEach((header, i) => {
        rowData[header] = $(cells[i]).text().trim();
      });

      const closeDate = rowData['Close'];
      const openDate = rowData['Open'];
      const isOpen = isDateInRange(openDate, closeDate);
      const isClosing = closeDate === formatDate(new Date(), { day: 'numeric', month: 'short' });

      if ((onlyClosingToday && isClosing) || (!onlyClosingToday && isOpen)) {
        tableData.push({
          ipo_name: rowData['IPO'],
          closing_today: isClosing,
          open: openDate,
          close: closeDate,
          gmp: rowData['Est Listing'],
          total_price: Number(rowData['Lot']) * Number(rowData['Price']),
          percentage_profit: getPercentageProfit(rowData['Est Listing'])
        });
      }
    });

    return tableData;
  } catch (error) {
    console.error('Error fetching the website:', error.message);
    return [];
  }
};

const scrapeTable = async () => {
  if (lastScrapedAt && Date.now() - lastScrapedAt < 4 * 60 * 60 * 1000) {
    console.log("IPO data already scraped in last 4 hours");
    return;
  }

  const ipoArr = await scrapIPOData();
  const ipoTableName = db.TABLE_NAME.IPO;
  await db.deleteAll(ipoTableName);
  await Promise.all(ipoArr.map(ipo => db.create(ipoTableName, ipo)));

  lastScrapedAt = Date.now();
  console.log("IPO data scraped successfully");
};

const getIPOData = async (filter = {}) => {
  await scrapeTable();
  const ipoTableName = db.TABLE_NAME.IPO;
  return await db.find(ipoTableName, filter);
};

const getClosingIPO = async () => {
  return await getIPOData({ closing_today: true });
};

const getAllIpo = async () => {
  return await getIPOData();
};

module.exports = { getClosingIPO, getAllIpo };
