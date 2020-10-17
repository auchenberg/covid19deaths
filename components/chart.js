import React, { Component } from "react";
import moment from "moment";
import * as d3 from "d3";
import * as d3Time from "d3-time-format";

export class Chart extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  componentDidUpdate() {
    this.drawChart();
  }

  updateDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  drawChart() {
    const height = this.state.height;
    const width = this.state.width;
    const data = this.props.data;
    const milestones = this.props.milestones;

    if (!data) {
      return;
    }

    const svg = d3.select(this.myRef.current).select("svg");
    svg.selectAll("*").remove();

    let g = svg.append("g").attr("transform", "translate(" + 0 + "," + 0 + ")");

    // Draw X scale
    var x = d3
      .scaleTime()
      .domain([new Date(2020, 1, 1), moment().add(3, "months")])
      .rangeRound([0, width])
      .nice();

    g.append("g")
      .attr("opacity", 0.75)
      .attr("transform", "translate(0," + height + ")")
      .style("font-family", "Roboto, Helvetica, sans-serif")
      .call(
        d3.axisTop(x).tickFormat(function (d) {
          return moment(d).format("MMM YYYY");
        })
      )
      .style("font-size", "12px");

    // Draw Y scale
    let currentMax = d3.max(data, function (d) {
      return d.death;
    });

    let scaleMax = currentMax * 2;
    var y = d3.scaleLinear().domain([0, scaleMax]).rangeRound([height, 0]);

    var format = d3.format(",");
    g.append("g")
      .attr("opacity", 0.75)
      .attr("transform", "translate(" + width + ", 0)")
      .style("font-size", "12px")
      .style("font-family", "Roboto, Helvetica, sans-serif")
      .call(
        d3.axisLeft(y).tickFormat(function (d) {
          return format(d);
        })
      );

    // Draw chart line
    var line = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.death);
      });

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#cf1110")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Draw area
    var area = d3
      .area()
      .x(function (d) {
        return x(d.date);
      })
      .y0(function (d) {
        return y(0);
      })
      .y1(function (d) {
        return y(d.death);
      });
    g.append("path")
      .datum(data)
      .attr("fill", "#fbe9e7")
      .attr("opacity", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 7)
      .attr("d", area);

    // Draw today line
    let dateToday = x(moment().seconds(0).minutes(0).hours(0));
    g.append("line")
      .attr("x1", dateToday)
      .attr("y1", -50)
      .attr("x2", dateToday)
      .attr("y2", height)
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", 1.5)
      .style("stroke", "#ff5722")
      .style("fill", "none");

    // Election day
    let dateElection = x(moment("11-03-2020"));
    g.append("line")
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

    // Draw milestones

    milestones.forEach((m) => {
      g.append("text")
        .attr("x", 60)
        .attr("dx", 0)
        .attr("y", y(m.death))
        .attr("dy", -5)
        .attr("opacity", 0.4)
        .attr("fill", "#000")
        .attr("text-anchor", "left")
        .style("font-size", "12px")
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .text(m.name);

      g.append("line")
        .attr("x1", 0)
        .attr("x2", x(x.domain()[1]))
        .attr("y1", y(m.death))
        .attr("y2", y(m.death))
        .style("stroke-dasharray", "2, 3")
        .style("stroke-width", 0.5)
        .attr("opacity", 0.4)
        .style("stroke", "#000")
        .style("fill", "none");
    });
  }

  render() {
    return (
      <div className="chart" ref={this.myRef}>
        <svg />
      </div>
    );
  }
}
