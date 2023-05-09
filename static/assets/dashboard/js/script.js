// This code is for the ablility to see data visualization. We are using Apex Chart.
//Column Chart
var options = {
  series: [
    {
      name: "Daily students visited",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66],  
    },
    {
      name: "Messages",
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
    },
    {
      name: "NIRF Ranking",
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
    },
  ],
  chart: {
    type: "bar",
    height: 250, // make this 250
    sparkline: {
      enabled: true, // make this true
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "55%",
      endingShape: "rounded",
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ["transparent"],
  },
  xaxis: {
    categories: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  },
  yaxis: {
    title: {
      // text: "$ (thousands)",
      text: "(thousands)",
    },
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        // return "$ " + val + " thousands";
        return val + " thousands";
      },
    },
  },
};

var chart = new ApexCharts(document.querySelector("#apex1"), options);
chart.render();

//Piechart
var options = {
  series: [44, 55, 13, 43, 22, 23, 24, 16, 66],
  chart: {
  width: 380,
  type: 'pie',
},
labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
responsive: [{
  breakpoint: 480,
  options: {
    chart: {
      width: 200
    },
    legend: {
      position: 'bottom'
    }
  }
}]
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();