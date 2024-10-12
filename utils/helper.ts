export const formatDate = (e, a) => {
  function padZero(e) {
    return (1 === (e += '').length ? '0' : '') + e;
  }
  a = new Date(Date.parse(e) + 6e4 * a);
  return 'Invalid Date' !== a
    ? `${padZero(a.getMonth() + 1)}/${padZero(a.getDate())} ${padZero(
        a.getHours()
      )}:${padZero(a.getMinutes())}`
    : e;
};

export function getTeamNameTranslations(
  home_team_name,
  away_team_name,
  teamData
) {
  return {
    home: home_team_name,
    away: away_team_name,
  };
}

const teamData = {};
const siteID = 1;
const siteName = 'sandbox';

export const reducer = (prevs: any[], curr: any) => {
  const { home_team, away_team } = curr;
  const home_team_name = home_team.replace(/\([^)]+\)|\[[^\]]+\]/g, '').trim();
  const away_team_name = away_team.replace(/\([^)]+\)|\[[^\]]+\]/g, '').trim();

  if (
    prevs.find(
      (row) =>
        row.league_name == curr.league_name &&
        row.date == curr.date &&
        row.home_team == home_team_name &&
        row.away_team == away_team_name
    )
  ) {
    return prevs.map((row) => {
      if (
        row.league_name == curr.league_name &&
        row.date == curr.date &&
        row.home_team == home_team_name &&
        row.away_team == away_team_name
      ) {
        row.odds.push({
          type: curr.type,
          home: parseFloat(curr.home),
          point: curr.point,
          away: parseFloat(curr.away),
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
      ...prevs,
      {
        league_name: curr.league_name,
        date: curr.date,
        home_team: home_team_name,
        english_home_team: translation.home,
        away_team: away_team_name,
        english_away_team: translation.away,
        site_id: siteID,
        sport: curr.sport,
        site_name: siteName,
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

function parseDate(dateString: string) {
  const currentDate = new Date();
  let year = currentDate.getFullYear();
  const getDateTime = dateString.split(' ');
  const getMonthDay = getDateTime[0].split('/');
  const getHourMinute = getDateTime[1].split(':');

  if (
    currentDate.getMonth() === 11 &&
    currentDate.getDate() === 31 &&
    getMonthDay[0] === '01'
  ) {
    year += 1;
  }
  const itemDate = new Date(
    year,
    parseInt(getMonthDay[0]) - 1,
    parseInt(getMonthDay[1]),
    parseInt(getHourMinute[0]),
    parseInt(getHourMinute[1])
  );
  return new Date(itemDate);
}

var count = 0;

export function filterByDate(dateToCheck: string) {
  const timeZone = 'Asia/Seoul';
  let endDate;
  let startDate;
  const timestampToCheck = parseDate(dateToCheck);

  // Use the hardcoded date for testing
  // const now = new Date('2024-10-12T13:00:00Z');
  const now = new Date();

  // Get the current time in the specified timezone
  const currentInTimeZone = new Date(now.toLocaleString('en-US', { timeZone }));

  console.log({ currentInTimeZone });

  // Check if the current hour is before 13:00
  if (currentInTimeZone.getHours() < 13) {
    // Set startDate to 1 PM on the previous day
    startDate = new Date(currentInTimeZone);
    startDate.setDate(startDate.getDate() - 1); // Previous day
    startDate.setHours(13, 0, 0, 0); // Start time: 1 PM on current day

    // Set endDate to 12:59 AM today
    endDate = new Date(currentInTimeZone);
    endDate.setHours(12, 59, 0, 0); // End time: 12:59 AM current day
    count++;
  } else {
    // Set startDate to 1 PM today
    startDate = new Date(currentInTimeZone);
    startDate.setHours(13, 0, 0, 0); // Start time: 1 PM on current day

    // Set endDate to 11:59 AM tomorrow
    endDate = new Date(currentInTimeZone);
    endDate.setDate(endDate.getDate() + 1); // Move to the next day
    endDate.setHours(12, 59, 0, 0); // End time: 12:59 AM next day
    count++;
  }

  // console.log(timestampToCheck);
  // console.log(startDate);
  // console.log(endDate);

  // Return true if the dateToCheck is between 1 PM and 11:59 AM on the next day
  return timestampToCheck >= startDate && timestampToCheck <= endDate;
}
