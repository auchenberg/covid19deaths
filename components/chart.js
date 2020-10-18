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
    this.scaleYMaxBound = 2000;
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
    // Grab y axis g element
    this.elmAxisY = g
      .append("g")
      .attr("id", "axis-y")
      .attr("opacity", 0.75)
      .attr("transform", "translate(" + this.state.width + ", 0)")
      .style("font-size", "12px")
      .style("font-family", "Roboto, Helvetica, sans-serif");

    this.changeYscale(this.scaleYMaxBound);
  }

  drawXscale(g) {
    const isMobile = this.state.width < 600;

    this.scaleX = d3
      .scaleTime()
      .domain([new Date(2020, 1, 1), moment().add(3, "months")])
      .rangeRound([0, this.state.width])
      .nice();

    g.append("g")
      .attr("class", "axis-x")
      .attr("opacity", 0.75)
      .attr("transform", "translate(0," + this.state.height + ")")
      .style("font-family", "Roboto, Helvetica, sans-serif")
      .transition()
      .duration(500)
      .call(
        d3.axisTop(this.scaleX).tickFormat(function (d) {
          return isMobile
            ? moment(d).format("MMM")
            : moment(d).format("MMM YYYY");
        })
      )
      .style("font-size", "12px");
  }

  draw() {
    if (!this.props.data) {
      return;
    }

    this.scaleYMaxBound = d3.max(this.props.data, (d) => d.death) * 1.5;
    this.drawChart();

    // setTimeout(() => {
    //   this.changeYscale(80000);
    //   this.drawChart();
    // }, 2000);

    // setTimeout(() => {
    //   this.changeYscale(100000);
    //   this.drawChart();
    // }, 4000);

    // setTimeout(() => {
    //   let currentMax = d3.max(this.props.data, (d) => d.death);

    //   this.changeYscale(currentMax);
    //   this.drawChart();
    // }, 6000);
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

    g.append("path")
      .datum(data)
      .transition()
      .duration(500)
      .attr("fill", "none")
      .attr("stroke", "#cf1110")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", line);
  }

  drawMilestones(isMobile, milestones, g) {
    let milestoneLeftMargin = isMobile ? 20 : 60;

    milestones.forEach((m) => {
      g.append("text")
        .transition()
        .duration(500)
        .attr("x", milestoneLeftMargin)
        .attr("dx", 0)
        .attr("y", this.scaleY(m.death))
        .attr("dy", -5)
        .attr("opacity", 0.4)
        .attr("fill", "#000")
        .attr("text-anchor", "left")
        .style("font-size", "12px")
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .text(m.name);

      g.append("line")
        .transition()
        .duration(500)
        .attr("x1", 0)
        .attr("x2", this.scaleX(this.scaleX.domain()[1]))
        .attr("y1", this.scaleY(m.death))
        .attr("y2", this.scaleY(m.death))
        .style("stroke-dasharray", "2, 3")
        .style("stroke-width", 0.5)
        .attr("opacity", 0.4)
        .style("stroke", "#000")
        .style("fill", "none");

      g.append("circle")
        .attr("cx", 0)
        .attr("cy", this.scaleY(m.death))
        .attr("r", 3)
        .style("fill", "#ff5722");
    });
  }

  drawElectionLine(g, height) {
    let dateElection = this.scaleX(moment("2020-11-03"));
    g.append("line")
      .transition()
      .duration(500)
      .attr("x1", dateElection)
      .attr("y1", -50)
      .attr("x2", dateElection)
      .attr("y2", height / 2 - 60)
      .attr("opacity", 0.4)
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", 1.5)
      .style("stroke", "#000")
      .style("fill", "none");

    g.append("line")
      .transition()
      .duration(500)
      .attr("x1", dateElection)
      .attr("y1", height / 2 + 60)
      .attr("x2", dateElection)
      .attr("y2", height)
      .attr("opacity", 0.4)
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", 1.5)
      .style("stroke", "#000")
      .style("fill", "none");

    g.append("text")

      .attr("x", dateElection)
      .attr("dx", 0)
      .attr("y", height / 2)
      .attr("dy", 4)
      .attr("opacity", 0.4)
      .attr("transform", "rotate(90," + dateElection + "," + height / 2 + ")")
      .attr("fill", "#000")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-family", "Roboto, Helvetica, sans-serif")
      .text("US Election 2020");
  }

  drawTodayLine(g, height) {
    let dateToday = this.scaleX(moment().seconds(0).minutes(0).hours(0));
    g.append("line")
      .transition()
      .duration(500)
      .attr("x1", dateToday)
      .attr("y1", -50)
      .attr("x2", dateToday)
      .attr("y2", height)
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", 1.5)
      .style("stroke", "#ff5722")
      .style("fill", "none");
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
    g.append("path")
      .datum(data)
      .transition()
      .duration(500)
      .attr("fill", "#fbe9e7")
      .attr("opacity", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 7)
      .attr("d", area);
  }

  render() {
    return (
      <div className="chart" ref={this.myRef}>
        <svg></svg>
      </div>
    );
  }
}
