import React, { Component } from "react";
import { Chart } from "../components/chart";
import * as d3 from "d3";
import * as d3Time from "d3-time-format";
import moment from "moment";
import Head from "next/head";
import Loader from "../components/loader";

export default class Page extends Component {
  state = {
    data: null,
    milestones: [
      {
        name: "2009 H1N1 Pandemic (took 1 year)",
        deaths: 12469, // https://www.cdc.gov/flu/pandemic-resources/2009-h1n1-pandemic.html
      },
      {
        name: "Korean War (took 3 years)",
        deaths: 36516, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "Vietnam War (took 20 years)",
        deaths: 58209, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "1968 Pandemic H3N2 virus (took 1 year)",
        deaths: 100000, // https://www.cdc.gov/flu/pandemic-resources/1957-1958-pandemic.html
      },
      {
        name: "World War I (took 4 years)",
        deaths: 116516, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "Civil War - Confederate Army (took 4 years)",
        deaths: 290000, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "Civil War - U.S. Army (took 4 years)",
        deaths: 364511, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "World War II (took 4 years)",
        deaths: 405399, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },

      {
        name: "1918 Pandemic H1N1 virus (took 1 year)",
        deaths: 675000, // https://www.cdc.gov/flu/pandemic-resources/1918-pandemic-h1n1.html
      },
    ],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    d3.csv(
      "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv"
    ).then((data) => {
      // Format data
      var parseDate = d3.timeParse("%Y-%m-%d"); // Json is formatted like 20201016

      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.deaths = parseInt(d.deaths, 10);
      });

      data.sort(function (a, b) {
        return a.date - b.date;
      });

      let mostRecentItem = data[data.length - 1];

      this.setState({
        data: data,
        mostRecent: mostRecentItem,
      });
    });
  }

  render() {
    let formattedDeathCount = this.state.mostRecent
      ? new Intl.NumberFormat().format(this.state.mostRecent.deaths)
      : 0;

    let formattedDate = this.state.mostRecent
      ? moment(this.state.mostRecent.date).format(`dddd, MMMM Do YYYY`)
      : "";

    return (
      <div>
        <Head>
          <title>Covid-19 deaths in The United States of America</title>
        </Head>
        <div className="info">
          <h1>COVID19 DEATHS</h1>
          <p>
            A visualization of how COVID-19 deaths compare to other deadly
            events from American history.
          </p>
          <div>
            {this.state.data && (
              <>
                <p>
                  The United States of America has so far had{" "}
                  <strong>{formattedDeathCount}</strong> deaths due to COVID-19.
                </p>
                <p className="small">
                  Last updated on <strong>{formattedDate}</strong>.
                </p>
                <p className="small">
                  Data from{" "}
                  <a href="https://covidtracking.com/">
                    The COVID tracking project
                  </a>
                  .
                </p>
                <p className="small">
                  Created by{" "}
                  <a href="https://twitter.com/auchenberg">
                    Kenneth Auchenberg
                  </a>
                  .
                </p>
              </>
            )}
            {!this.state.data && <Loader />}
          </div>
        </div>

        <div className="chart-wrapper">
          <Chart data={this.state.data} milestones={this.state.milestones} />
        </div>
      </div>
    );
  }
}
