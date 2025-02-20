// Mock data object used for LineChart and BarChart

const data = {
  labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
  horizontalLabels: [0, 5000, 10000, 15000, 20000, 25000],
  datasets: [
    {
      data: [7432, 234, 4342, 4123, 15000, 3423, 20000, 0],
      color: (opacity = 1) => `rgba(0, 159, 213, ${1})` // optional
    }
  ]
};

// Mock data object used for Contribution Graph

const contributionData = [
  { date: "2016-01-02", count: 1 },
  { date: "2016-01-03", count: 2 },
  { date: "2016-01-04", count: 3 },
  { date: "2016-01-05", count: 4 },
  { date: "2016-01-06", count: 5 },
  { date: "2016-01-30", count: 2 },
  { date: "2016-01-31", count: 3 },
  { date: "2016-03-01", count: 2 },
  { date: "2016-04-02", count: 4 },
  { date: "2016-03-05", count: 2 },
  { date: "2016-02-30", count: 4 }
];

// Mock data object for Pie Chart

const pieChartData = [
  {
    name: "Seoul",
    population: 21500000,
    color: "rgba(131, 167, 234, 1)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Toronto",
    population: 2800000,
    color: "#F00",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Beijing",
    population: 527612,
    color: "red",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "New York",
    population: 8538000,
    color: "#ffffff",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
    name: "Moscow",
    population: 11920000,
    color: "rgb(0, 0, 255)",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  }
];

// Mock data object for Progress

const progressChartData = {
  labels: ["Swim", "Bike", "Run"], // optional
  data: [0.2, 0.5, 0.3]
};

const stackedBarGraphData = {
  labels: ["Test1", "Test2"],
  legend: ["L1", "L2", "L3"],
  data: [[60, 60, 60], [30, 30, 60]],
  barColors: ["#dfe4ea", "#ced6e0", "#a4b0be"]
};

export {
  data,
  contributionData,
  pieChartData,
  progressChartData,
  stackedBarGraphData
};
