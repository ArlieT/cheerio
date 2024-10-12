const parser = (
  cheerio,
  html,
  siteName,
  siteID,
  leagueNames,
  teamNames,
  teamData
) => {
  const $ = cheerio.load(html);

  // Define regular expressions
  const dateRegex = new RegExp("(\\d{2})\\/(\\d{2}) (\\d{2}):(\\d{2})");
  const bracketRegex = new RegExp("\\[([^\\]]+)\\]");

  // Initialize variables
  let leagueName = "";
  let dateTime = "";
  let homeTeam = "";
  let awayTeam = "";
  let sport = "";

  const sportsAllowed = [
    "baseball",
    "basketball",
    "volleyball",
    "hockey",
    "soccer",
  ];

  const typeList = {
    승무패: "moneyline",
    "승패 [연장포함]": "moneyline",
    승패: "moneyline",
    "승패 (연장포함)": "moneyline",
    "승무패 (연장포함)": "moneyline",
    "승패(연장포함)": "moneyline",
    "승무패 [전반전]": "moneyline",
    핸디캡: "handicap",
    "핸디캡 [연장포함]": "handicap",
    "핸디캡 (연장포함)": "handicap",
    "전반-핸디캡": "handicap",
    언더오버: "over_under",
    "언더오버 [연장포함]": "over_under",
    오버언더: "over_under",
    "오버언더 (연장포함)": "over_under",
    "코너킥 오버언더": "over_under",
    "오버언더 [연장포함]": "over_under",
  };
  const sportList = {
    "/image/Sports/Category/yellow17/35232.png": "hockey",
    "/image/Sports/Category/yellow17/6046.png": "soccer",
    "/image/Sports/Category/yellow17/48242.png": "basketball",
    "/image/Sports/Category/yellow17/154914.png": "baseball",
    "/image/Sports/Category/yellow17/154830.png": "volleyball",
  };

  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);

    // Extract the month, day, and time
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    // Format the date in MM/DD HH:mm format
    const formattedDate = `${month}/${day} ${hours}:${minutes}`;
    return formattedDate;
  };
  return $(
    ".el-row > .pull-left,  .sports2boxtop-yellow17-prematch .display-center-vertical, .el-row > ul.list-box-g"
  )
    .map((i, e) => {
      const data = {};
      const current = $(e);

      if (current.hasClass("pull-left")) {
        leagueName = current
          .find(".league-info-name-yellow17")
          .eq(1)
          .text()
          .trim();
        const sportUrl = current.find("img").eq(1).attr("src");
        sport = sportList[sportUrl];
      } else if (current.hasClass("display-center-vertical")) {
        dateTime = formatDate(current.text().trim(), 0);
      } else {
        const home = current.children().eq(1);
        const away = current.children().eq(3);
        const draw = current.children().eq(2).text().trim();
        const type = current.children().eq(0).text().trim();
        data["point"] = draw === "VS" ? "vs" : parseFloat(draw);

        if (type === "승무패" || type === "승패") {
          data["type"] = "moneyline";
        }
        if (type === "핸디캡") {
          data["type"] = "handicap";
          data["point"] = draw === "VS" ? 0 : parseFloat(draw);
        }
        if (type === "오버언더") {
          data["type"] = "over_under";
        }

        if (homeTeam.includes("1이닝 득점")) {
          data["point"] = 0.5;
          data["type"] = "over_under";
        }

        const homeTeamName = $(home).find(".main-odd-team").eq(0).text().trim();
        const awayTeamName = $(away).find(".main-odd-team").eq(0).text().trim();

        if (homeTeamName !== "오버" && awayTeamName !== "언더") {
          homeTeam = homeTeamName;
          awayTeam = awayTeamName;
        }
        data["league_name"] = leagueName;
        data["date"] = dateTime.replace("-", "");
        data["sport"] = sport;
        data["home"] = parseFloat(
          $(home).find(".main-odd-val").eq(0).text().trim()
        );
        data["away"] = parseFloat(
          $(away).find(".main-odd-val").eq(0).text().trim()
        );
        data["home_team"] = homeTeam;
        data["away_team"] = awayTeam;
        if (sportsAllowed.includes(sport)) {
          return data;
        }
      }
    })
    .get();
};
