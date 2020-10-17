import React, { Component } from "react";
import { Chart } from "../components/chart";
import * as d3 from "d3";
import * as d3Time from "d3-time-format";
import moment from "moment";
import Head from "next/head";

export default class Page extends Component {
  state = {
    data: null,
    milestones: [
      {
        name: "9/11 terrorist attacks (1 day)",
        death: 2977,
      },
      {
        name: "2009 H1N1 Pandemic (1 year)",
        death: 12469, // https://www.cdc.gov/flu/pandemic-resources/2009-h1n1-pandemic.html
      },
      {
        name: "Korean War (3 years)",
        death: 36516, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "Vietnam War (20 years)",
        death: 58209, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "1968 Pandemic H3N2 virus (1 year)",
        death: 100000, // https://www.cdc.gov/flu/pandemic-resources/1957-1958-pandemic.html
      },
      {
        name: "World War I (4 years)",
        death: 116516, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "Civil War - U.S. Army (4 years)",
        death: 364511, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "Civil War - Confederate Army (4 years)",
        death: 290000, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },
      {
        name: "World War II (4 years)",
        death: 405399, // https://en.wikipedia.org/wiki/United_States_military_casualties_of_war
      },

      {
        name: "1918 Pandemic H1N1 virus (1 year)",
        death: 675000, // https://www.cdc.gov/flu/pandemic-resources/1918-pandemic-h1n1.html
      },
      {
        name: "AIDS",
        death: 700000,
      },
    ],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    d3.json("https://api.covidtracking.com/v1/us/daily.json").then((data) => {
      // Format data
      var parseDate = d3.timeParse("%Y%m%d"); // Json is formatted like 20201016

      data.forEach(function (d) {
        d.date = parseDate(d.date);
      });

      let mostRecentItem = data.slice(0)[0];

      this.setState({
        data: data,
        mostRecent: mostRecentItem,
      });
    });
  }

  render() {
    let formattedDeathCount = this.state.mostRecent
      ? new Intl.NumberFormat().format(this.state.mostRecent.death)
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

          <p>
            The United States of America has so far had{" "}
            <strong>{formattedDeathCount}</strong> deaths due to COVID-19.
          </p>

          <p>
            Last updated on <strong>{formattedDate}</strong>.
          </p>

          <p className="small">
            Data from{" "}
            <a href="https://covidtracking.com/">The COVID tracking project</a>.
          </p>

          <p className="small">
            Created by{" "}
            <a href="https://twitter.com/auchenberg">Kenneth Auchenberg</a>.
          </p>
        </div>

        <div className="chart-wrapper">
          <Chart data={this.state.data} milestones={this.state.milestones} />
        </div>
      </div>
    );
  }
}
