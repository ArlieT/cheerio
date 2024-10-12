// e = date string
// a = to increment minute, default is 0
export const formatDate = (e: string, a: number | Date) => {
  function padZero(e) {
    return (1 === (e += "").length ? "0" : "") + e;
  }
  a = new Date(Date.parse(e) + 6e4 * a);
  return "Invalid Date" !== (a as any)
    ? `${padZero(a.getMonth() + 1)}/${padZero(a.getDate())} ${padZero(
        a.getHours()
      )}:${padZero(a.getMinutes())}`
    : e;
};

export const reducer = (prevs, curr) => {
  const cleanedHomeTeam = curr.home_team
    ?.replace(/\([^)]+\)|\[[^\]]+\]/g, "")
    ?.replace(/\s+/g, "");
  const cleanedAwayTeam = curr.away_team
    .replace(/\([^)]+\)|\[[^\]]+\]/g, "")
    .replace(/\s+/g, "");

  if (
    prevs.find(
      (prevItem) =>
        prevItem.league_name == curr.league_name &&
        prevItem.date == curr.date &&
        prevItem.home_team == cleanedHomeTeam &&
        prevItem.away_team == cleanedAwayTeam
    )
  ) {
    return prevs.map((prev) => {
      if (
        curr.type !== "moneyline" &&
        prev.league_name == curr.league_name &&
        prev.date == curr.date &&
        prev.home_team == cleanedHomeTeam &&
        prev.away_team == cleanedAwayTeam
      ) {
        prev.odds.push({
          type: curr.type,
          home: parseFloat(curr.home),
          point: curr.point,
          away: parseFloat(curr.away),
        });
      }
      return prev;
    });
  } else {
    return [
      ...prevs,
      {
        league_name: curr.league_name,
        date: curr.date,
        home_team: cleanedHomeTeam,
        english_home_team: cleanedHomeTeam,
        away_team: cleanedAwayTeam,
        english_away_team: cleanedAwayTeam,
        site_id: "dev only",
        sport: curr.sport,
        site_name: "dev only",
        odds: [
          {
            type: curr.type,
            home: parseFloat(curr.home),
            point: curr.point,
            away: parseFloat(curr.away),
          },
        ],
      },
    ];
  }
};

export const ALLOWED_SPORTS = [
  "baseball",
  "volleyball",
  "soccer",
  "basketball",
  "hockey",
];
export const SPORTS = {
  야구: "baseball",
  배구: "volleyball",
  축구: "soccer",
  농구: "basketball",
  하키: "hockey",
};
