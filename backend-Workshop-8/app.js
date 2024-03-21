const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mysql = require('mysql2');

const app = express();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'football_db',
  port: 3306
});

const schema = buildSchema(`
  type League {
    league_id: Int!
    league_name: String!
    country: String!
    league_founded_year: Int
  }

  type Team {
    team_id: Int!
    team_name: String!
    team_titles: Int!
    league_id: Int!
  }

  input LeagueInput {
    league_name: String!
    country: String!
    league_founded_year: Int
  }

  input TeamInput {
    team_name: String!
    team_titles: Int!
    league_id: Int!
  }

  type Query {
    leagues: [League]
    teams: [Team]
  }

  type Mutation {
    addLeague(input: LeagueInput): League
    addTeam(input: TeamInput): Team
  }
`);

const root = {
  leagues: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM football_leagues', (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  },
  teams: () => {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM football_team', (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  },
  addLeague: ({ input }) => {
    const { league_name, country, league_founded_year } = input;
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO football_leagues SET ?', { league_name, country, league_founded_year }, (error, results) => {
        if (error) {
          reject(error);
        } else {
          const league_id = results.insertId;
          resolve({ league_id, league_name, country, league_founded_year });
        }
      });
    });
  },
  addTeam: ({ input }) => {
    const { team_name, team_titles, league_id } = input;
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO football_team SET ?', { team_name, team_titles, league_id }, (error, results) => {
        if (error) {
          reject(error);
        } else {
          const team_id = results.insertId;
          resolve({ team_id, team_name, team_titles, league_id });
        }
      });
    });
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});