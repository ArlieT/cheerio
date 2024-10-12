import cheerio from 'cheerio';
import html from '../utils/temp-html';
import './styles.css';
import {
  filterByDate,
  formatDate,
  getTeamNameTranslations,
  reducer,
} from '../utils/helper';

type TCheerio = typeof cheerio;

// e = date string
// a = to increment minute, default is 0
// ===================== POINT =====================

// moneyline point = data.point = data.point === "VS" ? "vs" : parseFloat(data.point)
// handicap point = data.point = data.point === "VS" ? 0 : parseFloat(data.point)
// over_under point = data.point = parseFloat(data.point)

// ===================== INNINGS =====================
// game with a text like [1이닝 득점], type will be over_unde and point is 0.5
// data.type = over_under
// data.point = 0.5

// ===================== TEMPLATE =====================
// you can use 1 element to scrape depends on the html structure
// roma-italy.com
const parser = (
  cheerio,
  html,
  siteName,
  siteID,
  leagueNames,
  teamNames,
  teamData
) => {
  const d = cheerio.load(html); // Load the HTML content
  // Regular expressions (not actually used in the code)
  new RegExp('(\\d{2})\\/(\\d{2}) (\\d{2}):(\\d{2})');
  new RegExp('\\[([^\\]]+)\\]');

  let leagueName = ''; // Variable to store the league name

  // Map through elements with "league-label" or "team-div"
  return d('div.league-label, div.col > div.team-div > div')
    .map((e, t) => {
      var matchData = {}; // Object to store the data for each match

      // If the current element has the class "league-label", it's a league name
      if (d(t).hasClass('league-label')) {
        leagueName = d(t).text().trim(); // Update the league name
      } else {
        // Populate the matchData object
        matchData.league_name = leagueName; // Assign the current league name

        // Extract match date and time
        matchData.date = d(t)
          .children()
          .eq(0)
          .children()
          .eq(1)
          .children('span')
          .last()
          .text()
          .trim();

        // Extract match type (e.g., 승패, 핸디캡)
        matchData.type_name = d(t)
          .children()
          .eq(1)
          .find('div.row > div')
          .eq(5)
          .text()
          .trim();

        // Extract home team name and its rate
        matchData.home_team = d(t)
          .children()
          .eq(0)
          .children()
          .eq(0)
          .find('div.preamtch-home-away > div')
          .eq(0)
          .children('span')
          .eq(1)
          .text()
          .trim();
        matchData.home = d(t)
          .children()
          .eq(1)
          .find('div.row > div')
          .eq(1)
          .text()
          .trim();

        // Extract point rate
        matchData.point = d(t)
          .children()
          .eq(1)
          .find('div.row > div')
          .eq(2)
          .text()
          .trim();

        // Extract away team name and its rate
        matchData.away_team = d(t)
          .children()
          .eq(0)
          .children()
          .eq(0)
          .find('div.preamtch-home-away > div')
          .eq(1)
          .children('span')
          .eq(1)
          .text()
          .trim();
        matchData.away = d(t)
          .children()
          .eq(1)
          .find('div.row > div')
          .eq(3)
          .text()
          .trim();

        // Extract match status
        matchData.status = d(t)
          .children()
          .eq(1)
          .find('div.row > div')
          .eq(6)
          .text()
          .trim();

        // Determine the type of bet based on the type_name
        if (
          matchData.type_name === '승패' ||
          matchData.type_name === '승무패' ||
          matchData.type_name === '승패 [연장포함]' ||
          matchData.type_name === '승무패 [연장포함]' ||
          matchData.type_name === '승무패 [정규시간]'
        ) {
          matchData.type = 'moneyline'; // Assign moneyline type for 승패 bets
          matchData.point =
            matchData.point === 'VS' ? 'vs' : parseFloat(matchData.point); // Handle point
        } else if (
          matchData.type_name === '핸디캡' ||
          matchData.type_name === '핸디캡 [연장포함]' ||
          matchData.type_name.includes('핸디캡')
        ) {
          matchData.type = 'handicap'; // Assign spread type for 핸디캡 bets
          matchData.point =
            matchData.point === 'VS' ? '0' : parseFloat(matchData.point); // Handle point
        } else if (
          matchData.type_name === '오버언더' ||
          matchData.type_name === '오버언더 [연장포함]'
        ) {
          matchData.type = 'over_under'; // Assign total type for 오버언더 bets
          matchData.point = parseFloat(matchData.point); // Use the point as the point
        }

        // Only return the matchData if the status is "진행" (in progress)
        if (matchData.status === '진행') {
          return matchData;
        }
      }
    })
    .get()
    .reduce(reducer, []);

  // .filter((e) => filterByDate(e.date));
};
// change the html value to the site you want to scrape
console.log(parser(cheerio, html));
