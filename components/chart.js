import React, { Component } from "react";
import moment from "moment";
import * as d3 from "d3";
import * as d3Time from "d3-time-format";
import { axisRight } from "d3";

export class Chart extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.scaleY = null;
    this.scaleYMaxBound = 10000;
    this.elmMilestones = [];
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  componentDidUpdate() {
    this.draw();
  }

  updateDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  changeYscale(maxScaleBound) {
    var format = d3.format(",");

    console.log("changeYscale", maxScaleBound);

    this.scaleYMaxBound = maxScaleBound;

    this.scaleY = d3
      .scaleLinear()
      .domain([0, maxScaleBound])
      .rangeRound([this.state.height, 0]);

    this.elmAxisY
      .transition()
      .duration(500)
      .call(
        d3.axisLeft(this.scaleY).tickFormat(function (d) {
          return format(d);
        })
      );
  }

  drawYscale(g) {
    if (!this.elmAxisY) {
      this.elmAxisY = g
        .append("g")
        .attr("id", "axis-y")
        .attr("opacity", 0.75)
        .style("font-size", "12px")
        .style("font-family", "Roboto, Helvetica, sans-serif");
    }

    this.elmAxisY.attr("transform", "translate(" + this.state.width + ", 0)");

    this.changeYscale(this.scaleYMaxBound);
  }

  updateXscale(maxScaleBound) {
    this.scaleX = d3
      .scaleTime()
      .domain([new Date(2020, 1, 1), maxScaleBound])
      .rangeRound([0, this.state.width])
      .nice();
  }

  drawXscale(g) {
    const isMobile = this.state.width < 600;

    if (!this.elmAxisX) {
      this.elmAxisX = g
        .append("g")
        .attr("class", "axis-x")
        .attr("opacity", 0.75)
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .style("font-size", "12px");
    }

    this.elmAxisX
      .attr("transform", "translate(0," + this.state.height + ")")
      .transition()
      .duration(500)
      .call(
        d3.axisTop(this.scaleX).tickFormat(function (d) {
          return isMobile
            ? moment(d).format("MMM DD")
            : moment(d).format("MMM DD YYYY");
        })
      );
  }

  draw() {
    if (!this.props.data) {
      return;
    }

    let dateStart = moment(new Date(2020, 1, 1));
    let dateFuture = moment().add(1, "months");

    let intervalSize = 20;
    let numOfDays = dateFuture.diff(dateStart, "days");
    let numOfDateCycles = Math.round(numOfDays / intervalSize);

    let dateMax = dateStart.clone().add(7, "days");
    this.updateXscale(dateMax);

    for (let i = 1; i < numOfDateCycles; i++) {
      setTimeout(() => {
        let dateMax = dateStart.clone().add(i * intervalSize, "days");
        this.updateXscale(dateMax);
        this.drawChart();

        const maxYValue = d3.max(this.props.data, (v) => {
          return v.date >= this.scaleX.domain()[0] &&
            v.date <= this.scaleX.domain()[1]
            ? v.death
            : null;
        });

        let roundedMax = Math.round(maxYValue * 1.4);
        let minScaleValue = Math.max(10000, roundedMax);
        this.changeYscale(minScaleValue);
      }, i * 2000);
    }

    this.drawChart();
    this.changeYscale(10000);
  }

  drawChart() {
    const height = this.state.height;
    const width = this.state.width;
    const data = this.props.data;
    const milestones = this.props.milestones;
    const isMobile = width < 600;

    const svg = d3.select(this.myRef.current).select("svg");

    let g = svg.append("g");

    this.drawXscale(g);
    this.drawYscale(g);

    this.drawLine(g, data);
    this.drawArea(g, data);

    this.drawTodayLine(g, height);
    this.drawElectionLine(g, height);

    this.drawMilestones(isMobile, milestones, g);
  }
  drawLine(g, data) {
    var line = d3
      .line()
      .x((d) => {
        return this.scaleX(d.date);
      })
      .y((d) => {
        return this.scaleY(d.death);
      });

    if (!this.elmLine) {
      this.elmLine = g
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#cf1110")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3);
    }

    this.elmLine.datum(data).transition().duration(500).attr("d", line);
  }

  drawMilestones(isMobile, milestones, g) {
    let milestoneLeftMargin = isMobile ? 20 : 60;

    milestones.forEach((m, index) => {
      this.elmMilestones[index] = this.elmMilestones[index] || {};

      if (!this.elmMilestones[index].text) {
        this.elmMilestones[index].text = g
          .append("text")
          .attr("opacity", 0.4)
          .attr("fill", "#000")
          .attr("text-anchor", "left")
          .style("font-size", "12px")
          .style("font-family", "Roboto, Helvetica, sans-serif")
          .text(m.name);
      }

      this.elmMilestones[index].text
        .transition()
        .duration(500)
        .attr("x", milestoneLeftMargin)
        .attr("dx", 0)
        .attr("y", this.scaleY(m.death))
        .attr("dy", -5);

      if (!this.elmMilestones[index].line) {
        this.elmMilestones[index].line = g
          .append("line")
          .style("stroke-dasharray", "2, 3")
          .style("stroke-width", 0.5)
          .attr("opacity", 0.4)
          .style("stroke", "#000")
          .style("fill", "none");
      }

      this.elmMilestones[index].line
        .transition()
        .duration(500)
        .attr("x1", 0)
        .attr("x2", this.scaleX(this.scaleX.domain()[1]))
        .attr("y1", this.scaleY(m.death))
        .attr("y2", this.scaleY(m.death));

      if (!this.elmMilestones[index].circle) {
        this.elmMilestones[index].circle = g
          .append("circle")
          .attr("r", 3)
          .style("fill", "#ff5722");
      }

      this.elmMilestones[index].circle
        .transition()
        .duration(500)
        .attr("cx", 0)
        .attr("cy", this.scaleY(m.death));
    });
  }

  drawElectionLine(g, height) {
    let dateElection = this.scaleX(moment("2020-11-03"));

    if (!this.elmLineElection1) {
      this.elmLineElection1 = g
        .append("line")
        .attr("opacity", 0.4)
        .style("stroke-dasharray", "3, 3")
        .style("stroke-width", 1.5)
        .style("stroke", "#000")
        .style("fill", "none");
    }

    this.elmLineElection1
      .transition()
      .duration(500)
      .attr("x1", dateElection)
      .attr("y1", -50)
      .attr("x2", dateElection)
      .attr("y2", height / 2 - 60);

    if (!this.elmLineElection2) {
      this.elmLineElection2 = g
        .append("line")
        .attr("opacity", 0.4)
        .style("stroke-dasharray", "3, 3")
        .style("stroke-width", 1.5)
        .style("stroke", "#000")
        .style("fill", "none");
    }

    this.elmLineElection2
      .transition()
      .duration(500)
      .attr("x1", dateElection)
      .attr("y1", height / 2 + 60)
      .attr("x2", dateElection)
      .attr("y2", height);

    if (!this.elmLineElectionText) {
      this.elmLineElectionText = g
        .append("text")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .text("US Election 2020");
    }

    this.elmLineElectionText
      .transition()
      .duration(500)
      .attr("x", dateElection)
      .attr("dx", 0)
      .attr("y", height / 2)
      .attr("dy", 4)
      .attr("opacity", 0.4)
      .attr("transform", "rotate(90," + dateElection + "," + height / 2 + ")");
  }

  drawTodayLine(g, height) {
    let dateToday = this.scaleX(moment().seconds(0).minutes(0).hours(0));
    if (!this.elmLineToday) {
      this.elmLineToday = g
        .append("line")
        .style("stroke-dasharray", "3, 3")
        .style("stroke-width", 1.5)
        .style("stroke", "#ff5722")
        .style("fill", "none");
    }

    this.elmLineToday
      .transition()
      .duration(500)
      .attr("x1", dateToday)
      .attr("y1", -50)
      .attr("x2", dateToday)
      .attr("y2", height);
  }

  drawArea(g, data) {
    var area = d3
      .area()
      .x((d) => {
        return this.scaleX(d.date);
      })
      .y0((d) => {
        return this.scaleY(0);
      })
      .y1((d) => {
        return this.scaleY(d.death);
      });

    if (!this.elmArea) {
      this.elmArea = g
        .append("path")
        .attr("fill", "#fbe9e7")
        .attr("opacity", 0.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 7);
    }

    this.elmArea.datum(data).transition().duration(500).attr("d", area);
  }

  render() {
    return (
      <div className="chart" ref={this.myRef}>
        <svg></svg>
      </div>
    );
  }
}
