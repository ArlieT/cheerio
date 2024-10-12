```typescript
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
```
