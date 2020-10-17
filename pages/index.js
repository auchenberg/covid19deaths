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
        name: "9/11 terrorist attacks",
        death: 2977,
      },
      {
        name: "Korean War",
        death: 36574,
      },
      {
        name: "Vietnam War",
        death: 58220,
      },
      {
        name: "1968 flu pandemic",
        death: 100000,
      },
      {
        name: "World War I",
        death: 116516,
      },
      {
        name: "World War II",
        death: 405399,
      },
      {
        name: "Civil War",
        death: 620000,
      },
      {
        name: "1918 flu pandemic",
        death: 675000,
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
            A visualization of how COVID-19 deaths compares to other deadly
            events from American history.
          </p>

          <p>
            The United States of America have so far had{" "}
            <strong>{formattedDeathCount}</strong> dealths due to COVID-19.
          </p>

          <p>
            Last updated on <strong>{formattedDate}</strong>.
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
