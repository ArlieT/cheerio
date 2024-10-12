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
  const i: TCheerio = cheerio.load(html);

  let leagueName = "",
    dateTime = "",
    homeTeam = "",
    awayTeam = "";
  return i(
    "h4.eventlist_eu_fe_KoreanLeagueItem_bigHeaderName, div.eventlist_eu_fe_KoreanEventItemDesktop_wrapperInfoBlock, div.eventlist_eu_fe_KoreanEventMarkets_wrapperMarkets"
  )
    .map((e, t) => {
      const el = i(t);
      const data = {};

      if (el.hasClass("eventlist_eu_fe_KoreanLeagueItem_bigHeaderName")) {
        leagueName = el
          .text()
          .trim()
          .replace(/\s*\(.*?\)\s*/g, "")
          .trim();
      } else if (
        el.hasClass("eventlist_eu_fe_KoreanEventItemDesktop_wrapperInfoBlock")
      ) {
        //date
        const dateParent = el
          .children()
          .eq(0)
          .find("span.eventlist_eu_fe_PreLiveEventCounter_time")
          .parent();

        const firstPart = dateParent.children().eq(0).text().trim();
        const secondPart = dateParent.children().eq(1).text().trim();
        const formattedDateTime = formatDate(`${firstPart} ${secondPart}`, 0);

        dateTime = formattedDateTime;

        const parentName = el
          .children()
          .eq(0)
          .find("div.eventlist_eu_fe_KoreanEventInfo_participantsContainer");

        homeTeam = parentName.find("span").text().trim();
        awayTeam = parentName.find("span").last().text().trim();
      } else {
        data.league_name = leagueName;
        data.date = dateTime;
        data.type_name = el.children().eq(0).text().trim();
        data.home_team = homeTeam;
        data.away_team = awayTeam;

        data.home = el
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("button")
          .children()
          .eq(0)
          .children()
          .eq(0)
          .text()
          .trim();
        data.home = el
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("button")
          .first()
          .children()
          .eq(0)
          .children()
          .eq(1)
          .text()
          .trim();

        data.point = el
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("button")
          .eq(1)
          .children()
          .eq(0)
          .children()
          .eq(1)
          .text()
          .trim();

        const button = el
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("button")
          .eq(1);

        // Check if the button has two descendants
        data.point =
          button.children().eq(0).children().length === 2
            ? button.children().eq(0).children().eq(1).text().trim()
            : button.text().trim();

        data.away = el
          .children()
          .eq(1)
          .children()
          .eq(0)
          .find("button")
          .last()
          .children()
          .eq(0)
          .children()
          .eq(0)
          .text()
          .trim();

        if (data.type_name.includes("승무패")) {
          data.type = "moneyline";
          data.point = data.point === "VS" ? "vs" : parseFloat(data.point);
        }
        if (data.type_name.includes("핸디캡")) {
          data.type = "handicap";
          data.point = data.point === "VS" ? 0 : parseFloat(data.point);
        }
        if (data.type_name.includes("오버/언더")) {
          data.type = "over_under";
          data.point = parseFloat(data.point);
        }

        return data;
      }
    })
    .get()
    .reduce(reducer, []);
};
// change the html value to the site you want to scrape
console.log(parser(cheerio, html));
