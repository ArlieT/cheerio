import cheerio from "cheerio";
import html from "../utils/temp-html";
import "./styles.css";
import { formatDate, getTeamNameTranslations, reducer } from "../utils/helper";

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
  const i = cheerio.load(html);

  // Regex patterns (unused in the current code, might be for future use)
  const datePattern = new RegExp("(\\d{2})\\/(\\d{2}) (\\d{2}):(\\d{2})");
  const leaguePattern = new RegExp("\\[([^\\]]+)\\]");

  let leagueName = "",
    dateTime = "";

  return i("div.league, div.participant-item")
    .map((e, t) => {
      let matchData = {};

      // If it's not a league, we process the match data
      if (!i(t).hasClass("league")) {
        matchData.league_name = leagueName;
        matchData.date = formatDate(dateTime, 0);

        // Get home and away team names
        matchData.home_team = i(t)
          .parent()
          .parent()
          .parent()
          .prev()
          .children()
          .eq(0)
          .children("div.truncate")
          .eq(0)
          .text()
          .trim();

        matchData.away_team = i(t)
          .parent()
          .parent()
          .parent()
          .prev()
          .children()
          .eq(0)
          .children("div.truncate")
          .eq(1)
          .text()
          .trim();

        // Get odds for home, point, and away
        matchData.home = i(t)
          .children()
          .first()
          .find("div.odds-value")
          .text()
          .trim();

        matchData.point =
          i(t).children().length === 3
            ? i(t).children().eq(1).text().trim()
            : "0";

        matchData.away = i(t)
          .children()
          .last()
          .find("div.odds-value")
          .text()
          .trim();

        // Set type and handle point values
        matchData.type = "moneyline";
        matchData.point =
          matchData.point === "VS" ? "vs" : parseFloat(matchData.point);

        return matchData;
      }

      // Update league name and dateTime for the next entries
      leagueName = i(t).children().eq(0).children("div").text().trim();
      dateTime = i(t).children().eq(1).children("div").text().trim();
    })
    .get()
    .reduce((rows, item) => {
      const { home_team, away_team } = item;
      const home_team_name = home_team
        .replace(/\([^)]+\)|\[[^\]]+\]/g, "")
        .trim();
      const away_team_name = away_team
        .replace(/\([^)]+\)|\[[^\]]+\]/g, "")
        .trim();

      if (
        rows.find(
          (row) =>
            row.league_name == item.league_name &&
            row.date == item.date &&
            row.home_team == home_team_name &&
            row.away_team == away_team_name
        )
      ) {
        return rows.map((row) => {
          if (
            item.type !== "moneyline" &&
            row.league_name == item.league_name &&
            row.date == item.date &&
            row.home_team == home_team_name &&
            row.away_team == away_team_name
          ) {
            row.odds.push({
              type: item.type,
              home: parseFloat(item.home),
              point: item.point,
              away: parseFloat(item.away),
            });
          }
          return row;
        });
      } else {
        const translation = getTeamNameTranslations(
          home_team_name,
          away_team_name,
          teamData
        );
        return [
          ...rows,
          {
            league_name: item.league_name,
            date: item.date,
            home_team: home_team_name,
            english_home_team: translation?.home,
            away_team: away_team_name,
            english_away_team: translation?.away,
            site_id: siteID,
            sport: item.sport,
            site_name: siteName,
            odds: [
              {
                type: item.type,
                home: parseFloat(item.home),
                point: item.point,
                away: parseFloat(item.away),
              },
            ],
          },
        ];
      }
    }, []);
};
// .get().reduce(reducer, [])
// change the html value to the site you want to scrape
console.log(parser(cheerio, html));
