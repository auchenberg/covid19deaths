$(function () {
  $("#details").click(function () {
    $(this).addClass("hidden");
    $("#withdrawal-control").removeClass("hidden");
  });

  var mobileWidth = 660;
  var showCurrentAge = false;

  function sizeSVG() {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    $("svg").attr("width", windowWidth);
    $("svg").attr("height", windowHeight);
  }

  sizeSVG();
  $(window).resize(function () {
    sizeSVG();
    calc();
  });

  $("#slider-range").slider({
    min: 0,
    max: 100,
    range: true,
    values: [30, 65],
    start: function (event, ui) {
      showCurrentAge = true;
      calc();
    },
    stop: function (event, ui) {
      showCurrentAge = false;
      calc();
    },
    slide: function (event, ui) {
      $("#age").html(ui.values[0]);
      $("#retirement").html(ui.values[1]);
      updateDiv("#retirement-text", ui.values[1]);
      $(this).slider("values", ui.values);
      calc();
    },
  });

  $("#monthly-investment-slider").slider({
    value: 1500,
    min: 0,
    max: 5000,
    step: 50,
    range: "min",
    slide: function (event, ui) {
      $("#monthly-investment").html(formatMoney(ui.value));
      updateDiv("#monthly-investment-text", formatMoney(ui.value));
      $(this).slider("value", ui.value);
      calc();
    },
  });

  $("#working-interest-slider").slider({
    value: 6,
    min: -2,
    max: 15,
    step: 0.5,
    slide: function (event, ui) {
      $("#working-interest").html(ui.value);
      updateDiv("#working-interest-text", ui.value);
      $("#invest-or-save").html(ui.value === 0 ? "save" : "invest");
      $(this).slider("value", ui.value);
      calc();
    },
  });

  $("#withdrawal-rate-slider").slider({
    value: 4,
    min: 1,
    max: 10,
    step: 0.5,
    slide: function (event, ui) {
      $("#withdrawal-rate").html(ui.value);
      $(this).slider("value", ui.value);
      calc();
    },
  });

  function computedSavings(step) {
    if (step < 51) {
      return step * 1000;
    } else if (step < 91) {
      return (step - 50) * 5000 + 50000;
    } else if (step < 166) {
      return (step - 90) * 10000 + 250000;
    } else {
      return (step - 165) * 100000 + 1000000;
    }
  }

  $("#existing-savings-slider").slider({
    value: 0,
    min: 0,
    max: 180,
    step: 1,
    range: "min",
    slide: function (event, ui) {
      $("#existing-savings").html(formatMoney(computedSavings(ui.value)));
      $(this).slider("value", ui.value);
      calc();
    },
  });

  function getCurrentAge() {
    return parseInt($("#slider-range").slider("values")[0]);
  }

  function getRetirementAge() {
    return parseInt($("#slider-range").slider("values")[1]);
  }

  function getMonthlyInvestment() {
    return parseInt($("#monthly-investment-slider").slider("value"));
  }

  function getCurrentInvestment() {
    return parseInt(
      computedSavings($("#existing-savings-slider").slider("value"))
    );
  }

  function getWorkingInterest() {
    return $("#working-interest-slider").slider("value");
  }

  function getWithdrawalRate() {
    return $("#withdrawal-rate-slider").slider("value");
  }

  function getWorkingInterestMonthly() {
    var interestRate = getWorkingInterest();
    var monthlyInterestRate = Math.pow((100 + interestRate) / 100.0, 1 / 12.0);
    return monthlyInterestRate;
  }

  function formatMoney(dollars) {
    return String(dollars).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  function updateDiv(div, value) {
    var jDiv = $(div);
    var currentValue = jDiv.html();
    if (currentValue != value) {
      if (jDiv.hasClass("new-data")) {
        jDiv.removeClass("new-data");
        jDiv.addClass("flash-data");
      } else {
        jDiv.removeClass("flash-data");
        jDiv.addClass("new-data");
      }
      jDiv.html(value);
    }
  }

  // D3 =====================================

  var data = [];
  var latestDomain = 4000000;

  function calcYDomain() {
    var total = getRetirementTotal();
    var latest = 4000000;
    var percentage = Math.pow(latest / total, 2);
    if (total * 1.1 > latest) {
      latestDomain = total * (1 + 0.1 * percentage);
    } else if (total < 1000000) {
      var newDomain = 5000000 - Math.pow(1000000 / total, 0.5) * 1000000;
      latestDomain = newDomain > 1000000 ? newDomain : 1000000;
    } else {
      latestDomain = 4000000;
    }
  }

  function getRetirementTotal() {
    var currentAge = getCurrentAge();
    var retirementAge = getRetirementAge();
    var monthlyInvestment = getMonthlyInvestment();
    var workingInterest = getWorkingInterestMonthly();
    var existingSavings = getCurrentInvestment();

    var rMonths = (retirementAge - currentAge) * 12;
    var retirementTotal = calcInterest(
      monthlyInvestment,
      rMonths,
      workingInterest,
      existingSavings
    );
    return retirementTotal;
  }

  function getRetirementPrincipal() {
    var currentAge = getCurrentAge();
    var retirementAge = getRetirementAge();
    var monthlyInvestment = getMonthlyInvestment();
    var existingSavings = getCurrentInvestment();
    var rMonths = (retirementAge - currentAge) * 12;
    return monthlyInvestment * rMonths + existingSavings;
  }

  function calc() {
    calcYDomain();
    data = [];
    var currentAge = getCurrentAge();
    var retirementAge = getRetirementAge();
    var monthlyInvestment = getMonthlyInvestment();
    var workingInterest = getWorkingInterestMonthly();
    var existingSavings = getCurrentInvestment();
    var withdrawalRate = getWithdrawalRate();

    if ($(window).width() > mobileWidth) {
      for (var k = 0; k <= currentAge; k++) {
        data.push([k, 0, 0, 0]);
      }
    }

    for (var i = currentAge; i < 101; i++) {
      var thisAge = i;
      if (thisAge > retirementAge) thisAge = retirementAge;
      var months = (thisAge - currentAge) * 12;
      var principal =
        (thisAge - currentAge) * monthlyInvestment * 12 + existingSavings;
      var interest = calcInterest(
        monthlyInvestment,
        months,
        workingInterest,
        existingSavings
      );

      var pMonths = (i - currentAge) * 12;
      var possibleInterest = calcInterest(
        monthlyInvestment,
        pMonths,
        workingInterest,
        existingSavings
      );
      var maxValue = latestDomain * 1.5;
      principal = principal < maxValue ? principal : maxValue;
      interest = interest < maxValue ? interest : maxValue;
      possibleInterest =
        possibleInterest < maxValue ? possibleInterest : maxValue;
      data.push([i, principal, interest, possibleInterest]);
    }

    var retirementTotal = getRetirementTotal();
    updateDiv("#retirement-total-text", formatMoney(parseInt(retirementTotal)));
    updateDiv(
      "#retirement-monthly-text",
      formatMoney(parseInt((retirementTotal * withdrawalRate) / 100 / 12))
    );

    drawSVG();
  }

  function calcInterest(
    monthlyInvestment,
    numMonths,
    interestRate,
    existingSavings
  ) {
    var totalInterest = 0;
    for (var j = 1; j < numMonths + 1; j++) {
      totalInterest += monthlyInvestment * Math.pow(interestRate, j);
    }
    totalInterest += existingSavings * Math.pow(interestRate, numMonths);
    return totalInterest;
  }

  function drawSVG() {
    var svg = d3.select("svg");
    svg.selectAll("*").remove();
    svg.data(data),
      (margin = { top: 20, right: 0, bottom: -1, left: 0 }),
      (width = +svg.attr("width") - margin.left - margin.right),
      (height = +svg.attr("height") - margin.top - margin.bottom),
      (g = svg
        .append("g")
        .attr(
          "transform",
          "translate(" + margin.left + "," + margin.top + ")"
        ));

    var x = d3.scaleLinear().rangeRound([0, width]);

    var y = d3.scaleLinear().rangeRound([height, 0]);

    var line = d3
      .line()
      .x(function (d) {
        return x(+d[0]);
      })
      .y(function (d) {
        return y(+d[3]);
      });

    var area = d3
      .area()
      .x(function (d) {
        return x(+d[0]);
      })
      .y0(function (d) {
        return y(0);
      })
      .y1(function (d) {
        return y(+d[1]);
      });

    var interestArea = d3
      .area()
      .x(function (d) {
        return x(+d[0]);
      })
      .y0(function (d) {
        return y(+d[1]);
      })
      .y1(function (d) {
        return y(+d[2]);
      });

    x.domain(
      d3.extent(data, function (d) {
        return +d[0];
      })
    );
    y.domain([0, latestDomain]);

    var retirementAge = getRetirementAge();
    var currentAge = getCurrentAge();
    var workingInterest = getWorkingInterestMonthly();
    var retirementTotal = parseInt(getRetirementTotal());
    var retirementPrincipal = getRetirementPrincipal();

    g.append("path")
      .datum(data)
      .attr("fill", workingInterest < 1 ? "#4caf50" : "#93ce96")
      .attr("opacity", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", area);

    g.append("path")
      .datum(data)
      // .attr("stroke", "black")
      .attr("fill", workingInterest < 1 ? "#f7c4c4" : "#4caf50")
      .attr("opacity", workingInterest < 1 ? 1 : 0.5)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 2)
      .attr("d", interestArea);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4caf50")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line)
      .style("stroke-dasharray", "3, 3");

    g.append("line")
      .attr("x1", x(retirementAge))
      .attr("y1", -50)
      .attr("x2", x(retirementAge))
      .attr("y2", height)
      .style("stroke-dasharray", "3, 3")
      .style("stroke-width", 1.5)
      .style("stroke", "#ff5722")
      .style("fill", "none");

    if ($(window).width() > mobileWidth) {
      g.append("line")
        .attr("x1", x(79))
        .attr("y1", -50)
        .attr("x2", x(79))
        .attr("y2", height / 2 - 72)
        .attr("opacity", 0.4)
        .style("stroke-dasharray", "3, 3")
        .style("stroke-width", 1.5)
        .style("stroke", "#000")
        .style("fill", "none");

      g.append("line")
        .attr("x1", x(79))
        .attr("y1", height / 2 + 70)
        .attr("x2", x(79))
        .attr("y2", height)
        .attr("opacity", 0.4)
        .style("stroke-dasharray", "3, 3")
        .style("stroke-width", 1.5)
        .style("stroke", "#000")
        .style("fill", "none");

      g.append("text")
        .attr("x", x(79))
        .attr("dx", 0)
        .attr("y", height / 2)
        .attr("dy", 4)
        .attr("opacity", 0.4)
        .attr("transform", "rotate(90," + x(79) + "," + height / 2 + ")")
        .attr("fill", "#000")
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .text("Average Life Expectancy");

      if (showCurrentAge) {
        g.append("line")
          .attr("x1", x(currentAge))
          .attr("y1", -50)
          .attr("x2", x(currentAge))
          .attr("y2", height)
          .style("stroke-dasharray", "3, 3")
          .style("stroke-width", 1.5)
          .style("stroke", "#00bcd4")
          .style("fill", "none");
      }

      g.append("text")
        .attr("x", x(retirementAge))
        .attr("dx", -6)
        .attr(
          "y",
          y(
            retirementTotal > retirementPrincipal
              ? retirementTotal
              : retirementPrincipal
          )
        )
        .attr("dy", -6)
        .attr("opacity", workingInterest < 1 ? 0.6 : 1)
        .attr("fill", workingInterest < 1 ? "#cc1515" : "green")
        .attr("text-anchor", "end")
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .text(
          "$" +
            formatMoney(
              retirementTotal > retirementPrincipal
                ? retirementTotal
                : retirementPrincipal
            )
        );

      g.append("text")
        .attr("x", x(retirementAge))
        .attr("dx", retirementAge < 85 ? 6 : -6)
        .attr(
          "y",
          y(
            retirementTotal < retirementPrincipal
              ? retirementTotal
              : retirementPrincipal
          )
        )
        .attr("dy", retirementAge < 85 ? 17 : -6)
        .attr("fill", "green")
        .attr("text-anchor", retirementAge < 85 ? "start" : "end")
        .style("font-family", "Roboto, Helvetica, sans-serif")
        .text(
          "$" +
            formatMoney(
              retirementTotal < retirementPrincipal
                ? retirementTotal
                : retirementPrincipal
            )
        );

      g.append("circle")
        .attr("cx", x(retirementAge))
        .attr("cy", y(retirementTotal))
        .attr("r", 4)
        .style("fill", "green");

      g.append("circle")
        .attr("cx", x(retirementAge))
        .attr("cy", y(retirementPrincipal))
        .attr("r", 4)
        .style("fill", workingInterest < 1 ? "#cc1515" : "green");
    }

    g.append("g")
      .attr("opacity", 0.75)
      .attr("transform", "translate(0," + height + ")")
      .style("font-family", "Roboto, Helvetica, sans-serif")
      .call(d3.axisTop(x))
      .style("font-size", "12px");

    var format = d3.format("$,");
    g.append("g")
      .attr("opacity", 0.75)
      .attr("transform", "translate(" + width + ", 0)")
      .style("font-size", "12px")
      .style("font-family", "Roboto, Helvetica, sans-serif")
      .call(
        d3.axisLeft(y).tickFormat(function (d) {
          if (d >= 1000000) {
            return format(d / 1000000) + "M";
          }
          return format(d);
        })
      );
  }
  calc();
});
