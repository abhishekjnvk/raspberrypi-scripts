const axios = require('axios');
const cheerio = require('cheerio');
const url = 'https://www.investorgain.com/report/live-ipo-gmp/331/';

const isClosingToday = closeDate => {
  if (!closeDate) {return false;}
  closeDate = closeDate.trim();

  const today = new Date();
  const formattedToday = today.toLocaleString('en-GB', { day: 'numeric', month: 'short' }).replace(',', '').split(' ').join('-');

  return closeDate === formattedToday;
};

const isIPOOpen = (startDate, endDate) => {
  if (!startDate || !endDate) {return false;}
  startDate = startDate.trim();
  endDate = endDate.trim();

  const parseDate = dateStr => {
    const [day, month] = dateStr.split('-');
    const monthIndex = new Date(Date.parse(`${month} 1, 2023`)).getMonth();
    const year = new Date().getFullYear();

    return new Date(year, monthIndex, day).getTime();
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate) + 86400000; // Add one day in milliseconds
  const today = Date.now();

  return today >= start && today <= end;
};

const getPercentageProfit = estListing => {
  if (!estListing) {return null;}
  const match = estListing.match(/\(([^)]+)%\)/);

  return match ? parseFloat(match[1]) : null;
};

const scrapeTable = async (onlyClosingToday=false) => {
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
      const object = {};

      headers.forEach((header, i) => {
        rowData[header] = $(cells[i]).text().trim();
      });

      const closeDate = rowData['Close'];
      const openDate = rowData['Open'];
      const isOpen = isIPOOpen(openDate, closeDate);
      const isClosing = isClosingToday(closeDate);

      const validIPO = onlyClosingToday ? isClosing : isOpen;
      if (validIPO) {
        object['ipo_name'] = rowData['IPO'];
        object['closing_today'] = isClosing;
        object['open'] = openDate;
        object['close'] = closeDate;
        object['gmp'] = rowData['Est Listing'];
        object['total_price'] = Number(rowData['Lot']) * Number(rowData['Price']);
        object['percentage_profit'] = getPercentageProfit(rowData['Est Listing']);
        tableData.push(object);
      }
    });

    return tableData;
  } catch (error) {
    console.error('Error fetching the website:', error.message);

    return [];
  }
};

module.exports = scrapeTable;