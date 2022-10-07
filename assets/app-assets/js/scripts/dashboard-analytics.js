// Dashboard - Analytics
//----------------------

// Collected Amount Chart Variables
var ArrRecoverAmt={};
var barChartLables=[];
var barChartValues=[];
var dashbordLineChart;
var dashbordLineChartData={};

// Collected Disposition Chart Variables
var ArrRecoverCount={};
var donutChartLables=[];
var donutChartValues=[];
var doughnutSalesChart;
var doughnutSalesChartData={};

// FIs Chart Variables
var ArrFisNewCount={};
var ArrFisPrevCount={};
var fisNewChartLables=[];
var fisPrevChartLables=[];
var fisNewChartValues=[];
var fisPrevChartValues=[];
var fisLineChart;
var fisLineChartData={};

// Portfolio Chart Variables
var ArrPortfolioAmount={};
var ArrPortfolioLeadCount={};
var portfolioAmtChartLables=[];
var portfolioLeadChartLables=[];
var portfolioAmtChartValues=[];
var portfolioLeadChartValues=[];
var portfolioLineChart;
var portfolioLineChartData={};

// overallCollection Chart Variables
var ArrOverallColCount={};
var overallColChartLables=[];
var overallColChartValues=[];
var overallColLineChart;
var overallColLineChartData={};

// collectionEfficiency Chart Variables
var ArrEfficiencyCountB0={};
var ArrEfficiencyCountB1={};
var ArrEfficiencyCountB2={};
var ArrEfficiencyCountB3={};
var ArrEfficiencyCountB4={};
var ArrEfficiencyCountB5={};
var ArrEfficiencyCountB6={};
var ArrEfficiencyCountB7={};
var ArrEfficiencyCountB8={};
var ArrEfficiencyCountWriteOff={};
var efficiencyChartLables=[];
var efficiencyChartValuesB0=[];
var efficiencyChartValuesB1=[];
var efficiencyChartValuesB2=[];
var efficiencyChartValuesB3=[];
var efficiencyChartValuesB4=[];
var efficiencyChartValuesB5=[];
var efficiencyChartValuesB6=[];
var efficiencyChartValuesB7=[];
var efficiencyChartValuesWriteOff=[];
var efficiencyLineChart;
var efficiencyLineChartData={};

// agentProductivity Chart Variables
var ArrTelleProductivityCount={};
var ArrFosProductivityCount={};
var telleProductivityChartLables=[];
var fosProductivityChartLables=[];
var telleProductivityChartValues=[];
var fosProductivityChartValues=[];
var agentProductivityLineChart;
var agentProductivityLineChartData={};

(function (window, document, $) {
  // Sample toast
  // setTimeout(function () {
  //    M.toast({ html: "Hey! I am a toast." });
  // }, 2000);

  // Check first if any of the task is checked
  $('#task-card input:checkbox').each(function () {
    checkbox_check(this);
  });

  // Task check box
  $('#task-card input:checkbox').change(function () {
    checkbox_check(this);
  });

  // Check Uncheck function
  function checkbox_check(el) {
    if (!$(el).is(':checked')) {
      $(el)
        .next()
        .css('text-decoration', 'none'); // or addClass
    } else {
      $(el)
        .next()
        .css('text-decoration', 'line-through'); // or addClass
    }
  }

  // Dashbord line chart
  const dashbordLineChartCTX = $('#dashbord-line-chart');

  const dashbordLineChartOptions = {
    responsive: true,
    // maintainAspectRatio: false,
    legend: {
      display: false,
    },
    hover: {
      mode: 'label',
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
          },
          ticks: {
            fontColor: '#fff',
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          },
        },
      ],
      yAxes: [
        {
          display: true,
          fontColor: '#fff',
          gridLines: {
            display: true,
            color: 'rgba(255,255,255,0.3)',
          },
          ticks: {
            suggestedMin: 1000,
            fontColor: '#fff',
          },
        },
      ],
    },
  };

  dashbordLineChartData = {
    labels:barChartLables,
    datasets: [
      {
        label: 'Collection Amount(Crore)',
        data: barChartValues,
        backgroundColor: 'rgba(128, 222, 234, 0.5)',
        borderColor: '#d1faff',
        pointBorderColor: '#d1faff',
        pointBackgroundColor: '#00bcd4', 
        pointHighlightFill: '#d1faff',
        pointHoverBackgroundColor: '#d1faff',
        borderWidth: 2,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 4,
        pointRadius: 4,
      },
    ],
  };

  const dashbordLineChartConfig = {
    type: 'bar',
    options: dashbordLineChartOptions,
    data: dashbordLineChartData,
  };


    // report FIs line chart
    const fisLineChartCTX = $('#FIs-line-chart');

    const fisLineChartOptions = {
        responsive: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true
          }
        }
    };

     fisLineChartData = {
      labels:fisNewChartLables,
      datasets: [
        {
          label: 'No of FI added',
          data: fisPrevChartValues,
          backgroundColor: 'rgba(14, 224, 119)',
          borderColor: '#0EE077',
          pointBorderColor: '#0EE077',
          pointBackgroundColor: '#0EE077', 
          pointHighlightFill: '#0EE077',
          pointHoverBackgroundColor: '#0EE077',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
      ],
    };
  
    const fisLineChartConfig = {
      type: 'bar',
      options: fisLineChartOptions,
      data: fisLineChartData,
    };

    // report portfolio line chart
    const portfolioLineChartCTX = $('#portfolio-line-chart');

    const portfolioLineChartOptions = {
      responsive: true,
      // maintainAspectRatio: false,
      legend: {
        display: false,
      },
      hover: {
        mode: 'label',
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      stacked: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
  
          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
        },

      },
    };

     portfolioLineChartData = {
      labels:portfolioAmtChartLables,
      datasets: [
        {
          label: 'Total Amount (Lakhs)',
          data: portfolioAmtChartValues,
          backgroundColor: "rgba(128, 222, 234)",
          borderColor: "#80deea",
          pointBorderColor: "#80deea",
          pointBackgroundColor: "#80deea",
          pointHighlightFill: "#80deea",
          pointHoverBackgroundColor: "#80deea",
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'No of Accounts',
          data: portfolioLeadChartValues,
          backgroundColor: 'rgba(14, 224, 119)',
          borderColor: '#0EE077',
          pointBorderColor: '#0EE077',
          pointBackgroundColor: '#0EE077', 
          pointHighlightFill: '#0EE077',
          pointHoverBackgroundColor: '#0EE077',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
          yAxisID: 'y1',
        },
      ],
    };
  
    const portfolioLineChartConfig = {
      type: 'line',
      options: portfolioLineChartOptions,
      data: portfolioLineChartData,
    };

    // report overallCollection line chart
    const overallCollectionLineChartCTX = $('#overallCollection-line-chart');

    const overallCollectionLineChartOptions = {
      responsive: true,
      // maintainAspectRatio: false,
      legend: {
        display: false,
      },
      hover: {
        mode: 'label',
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: '#fff',
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            },
          },
        ],
        yAxes: [
          {
            display: true,
            fontColor: '#fff',
            gridLines: {
              display: true,
              color: 'rgba(255,255,255,0.3)',
            },
            ticks: {
              suggestedMin: 1000,
              fontColor: '#fff',
            },
          },
        ],
      },
    };

    overallColLineChartData = {
      labels:overallColChartLables,
      datasets: [
        {
          label: 'Collection Amount (Lakhs)',
          data: overallColChartValues,
          backgroundColor: 'rgba(128, 222, 234, 0.5)',
          borderColor: '#d1faff',
          pointBorderColor: '#d1faff',
          pointBackgroundColor: '#00bcd4', 
          pointHighlightFill: '#d1faff',
          pointHoverBackgroundColor: '#d1faff',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
      ],
    };
  
    const overallCollectionLineChartConfig = {
      type: 'bar',
      options: overallCollectionLineChartOptions,
      data: overallColLineChartData,
    };

    // report collectionEfficiency line chart
    const efficiencyLineChartCTX = $('#collectionEfficiency-line-chart');

    const efficiencyLineChartOptions = {
      responsive: true,
      // maintainAspectRatio: false,
      legend: {
        display: false,
      },
      hover: {
        mode: 'label',
      },
      scales: {
        y: {
            stacked: true
        }
      },
    };

     efficiencyLineChartData = {
      labels:efficiencyChartLables,
      datasets: [
        {
          label: 'DPD Bucket(B0)',
          data: efficiencyChartValuesB0,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor: [
            'rgb(255, 99, 132)'
          ],
          pointBackgroundColor: [
            'rgb(255, 99, 132)',
          ], 
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B1)',
          data: efficiencyChartValuesB1,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor: [
            'rgb(255, 159, 64)',
          ],
          pointBackgroundColor: [
            'rgb(255, 159, 64)',
          ],
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B2)',
          data: efficiencyChartValuesB2,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(204, 102, 255)',
          ],
          pointBackgroundColor:[
            'rgb(204, 102, 255)',
          ], 
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B3)',
          data: efficiencyChartValuesB3,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(75, 192, 192)',
          ],
          pointBackgroundColor: [
            'rgb(75, 192, 192)',
          ],
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B4)',
          data: efficiencyChartValuesB4,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(0, 128, 85)',
          ],
          pointBackgroundColor: [
            'rgb(0, 128, 85)',
          ], 
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B5)',
          data: efficiencyChartValuesB5,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(0, 57, 77)',
          ],
          pointBackgroundColor: [
            'rgb(0, 57, 77)',
          ], 
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B6)',
          data: efficiencyChartValuesB6,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(128, 128, 0)',
          ],
          pointBackgroundColor:[
            'rgb(128, 128, 0)',
          ],
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(B7)',
          data: efficiencyChartValuesB7,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(0, 255, 255)',
          ],
          pointBackgroundColor:[
            'rgb(0, 255, 255)',
          ], 
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'DPD Bucket(Write-Off)',
          data:  efficiencyChartValuesWriteOff,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(204, 102, 255)',
            'rgb(75, 192, 192)',
            'rgb(0, 128, 85)',
            'rgb(0, 57, 77)',
            'rgb(128, 128, 0)',
            'rgb(0, 255, 255)',
            'rgb(102, 255, 51)'
          ],
          pointBorderColor:[
            'rgb(102, 255, 51)',
          ],
          pointBackgroundColor:[
            'rgb(102, 255, 51)',
          ], 
          pointHighlightFill: '#03a9f4',
          pointHoverBackgroundColor: '#03a9f4',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
      ],
    };
  
    const efficiencyLineChartConfig = {
      type: 'line',
      options: efficiencyLineChartOptions,
      data: efficiencyLineChartData,
    };

    // report agentProductivity line chart
    const agentProductivityLineChartCTX = $('#agentProductivity-line-chart');

    const agentProductivityLineChartOptions = {
      responsive: true,
      // maintainAspectRatio: false,
      legend: {
        display: false,
      },
      hover: {
        mode: 'label',
      },
      scales: {
        xAxes: [
          {
            display: true,
            gridLines: {
              display: false,
            },
            ticks: {
              fontColor: '#fff',
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45
            },
          },
        ],
        yAxes: [
          {
            display: true,
            fontColor: '#fff',
            gridLines: {
              display: true,
              color: 'rgba(255,255,255,0.3)',
            },
            ticks: {
              suggestedMin: 1000,
              fontColor: '#fff',
            },
          },
        ],
      },
    };

     agentProductivityLineChartData = {
      labels:telleProductivityChartLables,
      datasets: [
        {
          label: 'Telecaller Productivity',
          data: telleProductivityChartValues,
          backgroundColor: '#6DF4F6',
          borderColor: '#6DF4F6',
          pointBorderColor: '#6DF4F6',
          pointBackgroundColor: '#6DF4F6', 
          pointHighlightFill: '#6DF4F6',
          pointHoverBackgroundColor: '#6DF4F6',
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
        {
          label: 'FOS Productivity',
          data: fosProductivityChartValues,
          backgroundColor: "#0EE077",
          borderColor: "#0EE077",
          pointBorderColor: "#0EE077",
          pointBackgroundColor: "#0EE077",
          pointHighlightFill: "#0EE077",
          pointHoverBackgroundColor: "#0EE077",
          borderWidth: 2,
          pointBorderWidth: 2,
          pointHoverBorderWidth: 4,
          pointRadius: 4,
        },
      ],
    };
  
    const agentProductivityLineChartConfig = {
      type: 'bar',
      options: agentProductivityLineChartOptions,
      data: agentProductivityLineChartData,
    };


/*
  Doughnut Chart Widget
*/

  const doughnutSalesChartCTX = $('#doughnut-chart-lead');
  
  var browserStatsChartOptions = {
    cutoutPercentage: 70,
    responsive: true,
    maintainAspectRatio: false,
    responsiveAnimationDuration: 0,
    legend: {
      display: true,
      position: "bottom"
   },
   plugins: {
    tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            let data= label+" : "+ context.dataset.data[context.dataIndex] + '%';
            return data;
        }
        }
      }
    }
  };

  doughnutSalesChartData = {
    labels: donutChartLables,
    datasets: [
      {
        label: 'Disposition',
        data:donutChartValues,
        backgroundColor: ["#03a9f4", "#7F76BC", "#ffc107", "#e91e63", "#4caf50","#78BC76","#D9E21E"]
      },
    ],
  };

  const doughnutSalesChartConfig = {
    type: 'doughnut',
    options: browserStatsChartOptions,
    data: doughnutSalesChartData,
  };

  /*
Monthly Revenue : Trending Bar Chart
*/

  const monthlyRevenueChartCTX = $('#trending-bar-chart');
  const monthlyRevenueChartOptions = {
    responsive: true,
    // maintainAspectRatio: false,
    legend: {
      display: false,
    },
    hover: {
      mode: 'label',
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          display: true,
          fontColor: '#fff',
          gridLines: {
            display: false,
          },
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    tooltips: {
      titleFontSize: 0,
      callbacks: {
        label(tooltipItem, data) {
          return tooltipItem.yLabel;
        },
      },
    },
  };
  const monthlyRevenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept'],
    datasets: [
      {
        label: 'Sales',
        data: [6, 9, 8, 4, 6, 7, 9, 4, 8],
        backgroundColor: '#46BFBD',
        hoverBackgroundColor: '#009688',
      },
    ],
  };

  let nReloads1 = 0;
  const min1 = 1;
  const max1 = 10;
  let monthlyRevenueChart;
  function updateMonthlyRevenueChart() {
    if (typeof monthlyRevenueChart !== 'undefined') {
      nReloads1++;
      const x = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      monthlyRevenueChartData.datasets[0].data.shift();
      monthlyRevenueChartData.datasets[0].data.push([x]);
      monthlyRevenueChart.update();
    }
  }
  setInterval(updateMonthlyRevenueChart, 2000);

  const monthlyRevenueChartConfig = {
    type: 'bar',
    options: monthlyRevenueChartOptions,
    data: monthlyRevenueChartData,
  };

  /*
Trending Bar Chart
*/

  const browserStatsChartCTX = $('#trending-radar-chart');

  var browserStatsChartOptions = {
    responsive: true,
    // maintainAspectRatio: false,
    legend: {
      display: false,
    },
    hover: {
      mode: 'label',
    },
    scale: {
      angleLines: { color: 'rgba(255,255,255,0.4)' },
      gridLines: { color: 'rgba(255,255,255,0.2)' },
      ticks: {
        display: false,
      },
      pointLabels: {
        fontColor: '#fff',
      },
    },
  };

  const browserStatsChartData = {
    labels: ['Chrome', 'Mozilla', 'Safari', 'IE10', 'Opera'],
    datasets: [
      {
        label: 'Browser',
        data: [5, 6, 7, 8, 6],
        fillColor: 'rgba(255,255,255,0.2)',
        borderColor: '#fff',
        pointBorderColor: '#fff',
        pointBackgroundColor: '#00bfa5',
        pointHighlightFill: '#fff',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 4,
      },
    ],
  };

  let nReloads2 = 0;
  const min2 = 1;
  const max2 = 10;
  let browserStatsChart;
  function browserStatsChartUpdate() {
    if (typeof browserStatsChart !== 'undefined') {
      nReloads2++;
      const x = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
      browserStatsChartData.datasets[0].data.pop();
      browserStatsChartData.datasets[0].data.push([x]);
      browserStatsChart.update();
    }
  }
  setInterval(browserStatsChartUpdate, 2000);

  const browserStatsChartConfig = {
    type: 'radar',
    options: browserStatsChartOptions,
    data: browserStatsChartData,
  };

  /*
   Revenue by country - Line Chart
*/

  const countryRevenueChartCTX = $('#line-chart');

  const countryRevenueChartOption = {
    responsive: true,
    // maintainAspectRatio: false,
    legend: {
      display: false,
    },
    hover: {
      mode: 'label',
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
          },
          ticks: {
            fontColor: '#fff',
          },
        },
      ],
      yAxes: [
        {
          display: true,
          fontColor: '#fff',
          gridLines: {
            display: false,
          },
          ticks: {
            beginAtZero: false,
            fontColor: '#fff',
          },
        },
      ],
    },
  };

  const countryRevenueChartData = {
    labels: ['USA', 'UK', 'UAE', 'AUS', 'IN', 'SA'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 45, 50, 30, 63, 45],
        fill: false,
        lineTension: 0,
        borderColor: '#fff',
        pointBorderColor: '#fff',
        pointBackgroundColor: '#009688',
        pointHighlightFill: '#fff',
        pointHoverBackgroundColor: '#fff',
        borderWidth: 2,
        pointBorderWidth: 2,
        pointHoverBorderWidth: 4,
        pointRadius: 4,
      },
    ],
  };
  const countryRevenueChartConfig = {
    type: 'line',
    options: countryRevenueChartOption,
    data: countryRevenueChartData,
  };

  // Create the chart

  window.onload = function () {
    dashbordLineChart = new Chart(dashbordLineChartCTX, dashbordLineChartConfig);
    fisLineChart = new Chart(fisLineChartCTX, fisLineChartConfig);
    portfolioLineChart = new Chart(portfolioLineChartCTX, portfolioLineChartConfig);
    overallColLineChart = new Chart(overallCollectionLineChartCTX, overallCollectionLineChartConfig);
    efficiencyLineChart = new Chart(efficiencyLineChartCTX, efficiencyLineChartConfig);
    agentProductivityLineChart = new Chart(agentProductivityLineChartCTX, agentProductivityLineChartConfig);
    monthlyRevenueChart = new Chart(monthlyRevenueChartCTX, monthlyRevenueChartConfig);
    doughnutSalesChart = new Chart(doughnutSalesChartCTX, doughnutSalesChartConfig);
    browserStatsChart = new Chart(browserStatsChartCTX, browserStatsChartConfig);
    const countryRevenueChart = new Chart(countryRevenueChartCTX, countryRevenueChartConfig);
  };

  $(() => {
    /*
       * STATS CARDS
       */
    // Bar chart ( New Clients)
    $('#clients-bar').sparkline([70, 80, 65, 78, 58, 80, 78, 80, 70, 50, 75, 65, 80, 70, 65, 90, 65, 80, 70, 65, 90], {
      type: 'bar',
      height: '25',
      barWidth: 7,
      barSpacing: 4,
      barColor: '#b2ebf2',
      negBarColor: '#81d4fa',
      zeroColor: '#81d4fa',
    });
    // Total Sales - Bar
    $('#sales-compositebar').sparkline([4, 6, 7, 7, 4, 3, 2, 3, 1, 4, 6, 5, 9, 4, 6, 7, 7, 4, 6, 5, 9], {
      type: 'bar',
      barColor: '#F6CAFD',
      height: '25',
      width: '100%',
      barWidth: '7',
      barSpacing: 4,
    });
    // Total Sales - Line
    $('#sales-compositebar').sparkline([4, 1, 5, 7, 9, 9, 8, 8, 4, 2, 5, 6, 7], {
      composite: true,
      type: 'line',
      width: '100%',
      lineWidth: 2,
      lineColor: '#fff3e0',
      fillColor: 'rgba(255, 82, 82, 0.25)',
      highlightSpotColor: '#fff3e0',
      highlightLineColor: '#fff3e0',
      minSpotColor: '#00bcd4',
      maxSpotColor: '#00e676',
      spotColor: '#fff3e0',
      spotRadius: 4,
    });
    // Tristate chart (Today Profit)
    $('#profit-tristate').sparkline([2, 3, 0, 4, -5, -6, 7, -2, 3, 0, 2, 3, -1, 0, 2, 3, 3, -1, 0, 2, 3], {
      type: 'tristate',
      width: '100%',
      height: '25',
      posBarColor: '#ffecb3',
      negBarColor: '#fff8e1',
      barWidth: 7,
      barSpacing: 4,
      zeroAxis: false,
    });
    // Line chart ( New Invoice)
    $('#invoice-line').sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5], {
      type: 'line',
      width: '100%',
      height: '25',
      lineWidth: 2,
      lineColor: '#E1D0FF',
      fillColor: 'rgba(255, 255, 255, 0.2)',
      highlightSpotColor: '#E1D0FF',
      highlightLineColor: '#E1D0FF',
      minSpotColor: '#00bcd4',
      maxSpotColor: '#4caf50',
      spotColor: '#E1D0FF',
      spotRadius: 4,
    });

    /*
       * Project Line chart ( Project Box )
       */
    $('#project-line-1').sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
      type: 'line',
      width: '100%',
      height: '30',
      lineWidth: 2,
      lineColor: '#00bcd4',
      fillColor: 'rgba(0, 188, 212, 0.2)',
    });
    $('#project-line-2').sparkline([6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4], {
      type: 'line',
      width: '100%',
      height: '30',
      lineWidth: 2,
      lineColor: '#00bcd4',
      fillColor: 'rgba(0, 188, 212, 0.2)',
    });
    $('#project-line-3').sparkline([2, 4, 6, 7, 5, 6, 7, 9, 5, 6, 7, 9, 9, 5, 3, 2, 9, 5, 3, 2, 2, 4, 6, 7], {
      type: 'line',
      width: '100%',
      height: '30',
      lineWidth: 2,
      lineColor: '#00bcd4',
      fillColor: 'rgba(0, 188, 212, 0.2)',
    });
    $('#project-line-4').sparkline([9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
      type: 'line',
      width: '100%',
      height: '30',
      lineWidth: 2,
      lineColor: '#00bcd4',
      fillColor: 'rgba(0, 188, 212, 0.2)',
    });
  });
}(window, document, jQuery));

async function getCollectedAmt(filterObj) {
  console.log("filterObj Data33", filterObj);

 await fetch(`${baseUrl}dashboard/getRecoveredAmt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObj)
  }).then(response => response.json()).then(data => {
    console.log("getRecoveredAmt Success: -----", data);
    $("#caseCnt").html(data.data.caseCount); 
    ArrRecoverAmt=data.data.leadArrData;
    ArrRecoverCount=data.data.donutDataArr;
    
    donutChartLables=Object.keys(ArrRecoverCount);
    donutChartValues=Object.values(ArrRecoverCount);
   
    barChartLables=Object.keys(ArrRecoverAmt);
    barChartValues=Object.values(ArrRecoverAmt);
    dashbordLineChartData.labels=barChartLables;
    dashbordLineChartData.datasets[0].data=barChartValues;
  
    doughnutSalesChartData.labels=donutChartLables;
    doughnutSalesChartData.datasets[0].data=donutChartValues;
    doughnutSalesChart.update();
    dashbordLineChart.update();
  }).catch(error => {
    console.error("Error:", error);
  });
}

async function getFICount(filterObjFIs) {
  console.log("filterObjFIs Data", filterObjFIs);

 await fetch(`${baseUrl}reports/getFICount`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObjFIs)
  }).then(response => response.json()).then(data => {
    console.log("getFICount Success: -----", data);
 
    ArrFisPrevCount=data.data.leadDataSet1;
    
    fisPrevChartLables=Object.keys(ArrFisPrevCount);
    fisPrevChartValues=Object.values(ArrFisPrevCount);
    fisLineChartData.labels=fisPrevChartLables;
    fisLineChartData.datasets[0].data=fisPrevChartValues;
    fisLineChart.update();
  }).catch(error => {
    console.error("Error:", error);
  });
}

async function getPortfolioAnalysis(filterObjPortfolio) {
  console.log("filterObjPortfolio Data", filterObjPortfolio);

 await fetch(`${baseUrl}reports/getPortfolioAnalysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObjPortfolio)
  }).then(response => response.json()).then(data => {
    console.log("getPortfolioAnalysis Success: -----", data);
    ArrPortfolioAmount=data.data.leadDataSet1;
    ArrPortfolioLeadCount=data.data.leadDataSet2;
    
    portfolioAmtChartLables=Object.keys(ArrPortfolioAmount);
    portfolioAmtChartValues=Object.values(ArrPortfolioAmount);
    portfolioLineChartData.labels=portfolioAmtChartLables;
    portfolioLineChartData.datasets[0].data=portfolioAmtChartValues;
  
    portfolioLeadChartLables=Object.keys(ArrPortfolioLeadCount);
    portfolioLeadChartValues=Object.values(ArrPortfolioLeadCount);
    portfolioLineChartData.labels=portfolioLeadChartLables;
    portfolioLineChartData.datasets[1].data=portfolioLeadChartValues;
    portfolioLineChart.update();
  }).catch(error => {
    console.error("Error:", error);
  });
}

async function getOverallCollection(filterObjOverall) {
  console.log("filterObjOverall Data", filterObjOverall);

 await fetch(`${baseUrl}reports/getOverallCollection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObjOverall)
  }).then(response => response.json()).then(data => {
    console.log("getOverallCollection Success: -----", data);
    ArrOverallColCount=data.data.leadDataSet;
    
    overallColChartLables=Object.keys(ArrOverallColCount);
    overallColChartValues=Object.values(ArrOverallColCount);

    overallColLineChartData.labels=overallColChartLables;
    overallColLineChartData.datasets[0].data=overallColChartValues;
    overallColLineChart.update();
  }).catch(error => {
    console.error("Error:", error);
  });
}

async function getAgent(filterObjAgent) {
  console.log("filterObjAgent Data", filterObjAgent);

 await fetch(`${baseUrl}reports/getAgent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObjAgent)
  }).then(response => response.json()).then(data => {
    console.log("getAgent Success: -----", data);
    $("#avgTellecaller").html(data.data.teleAvgCollection.toLocaleString());
    $("#avgFos").html(data.data.fosAvgCollection.toLocaleString());
  }).catch(error => {
    console.error("Error:", error);
  });
}

async function getAgentProductivity(filterObjAgentProduct) {
  console.log("filterObjAgentProduct Data", filterObjAgentProduct);

 await fetch(`${baseUrl}reports/getAgentProductivity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObjAgentProduct)
  }).then(response => response.json()).then(data => {
    console.log("getAgentProductivity Success: -----", data);
    ArrTelleProductivityCount=data.data.leadDataSet1;
    ArrFosProductivityCount=data.data.leadDataSet2;
    
    telleProductivityChartLables=Object.keys(ArrTelleProductivityCount);
    telleProductivityChartValues=Object.values(ArrTelleProductivityCount);
    agentProductivityLineChartData.labels=telleProductivityChartLables;
    agentProductivityLineChartData.datasets[0].data=telleProductivityChartValues;
  
    fosProductivityChartLables=Object.keys(ArrFosProductivityCount);
    fosProductivityChartValues=Object.values(ArrFosProductivityCount);
    agentProductivityLineChartData.labels=fosProductivityChartLables;
    agentProductivityLineChartData.datasets[1].data=fosProductivityChartValues;
    agentProductivityLineChart.update();
  }).catch(error => {
    console.error("Error:", error);
  });
}

async function getCollectionEfficiency(filterObjEfficiency) {
  console.log("filterObjEfficiency Data", filterObjEfficiency);

 await fetch(`${baseUrl}reports/getCollectionEfficiency`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(filterObjEfficiency)
  }).then(response => response.json()).then(data => {
    console.log("getCollectionEfficiency Success: -----", data);
    ArrEfficiencyCountB0=data.data.leadDataSetB0;
    ArrEfficiencyCountB1=data.data.leadDataSetB1;
    ArrEfficiencyCountB2=data.data.leadDataSetB2;
    ArrEfficiencyCountB3=data.data.leadDataSetB3;
    ArrEfficiencyCountB4=data.data.leadDataSetB4;
    ArrEfficiencyCountB5=data.data.leadDataSetB5;
    ArrEfficiencyCountB6=data.data.leadDataSetB6;
    ArrEfficiencyCountB7=data.data.leadDataSetB7;
    ArrEfficiencyCountWriteOff=data.data.leadDataSetWriteOff;
  
    efficiencyChartLables=Object.keys(ArrEfficiencyCountB0);
    efficiencyChartValuesB0=Object.values(ArrEfficiencyCountB0);
    efficiencyChartValuesB1=Object.values(ArrEfficiencyCountB1);
    efficiencyChartValuesB2=Object.values(ArrEfficiencyCountB2);
    efficiencyChartValuesB3=Object.values(ArrEfficiencyCountB3);
    efficiencyChartValuesB4=Object.values(ArrEfficiencyCountB4);
    efficiencyChartValuesB5=Object.values(ArrEfficiencyCountB5);
    efficiencyChartValuesB6=Object.values(ArrEfficiencyCountB6);
    efficiencyChartValuesB7=Object.values(ArrEfficiencyCountB7);
    efficiencyChartValuesWriteOff=Object.values(ArrEfficiencyCountWriteOff);
   
    efficiencyLineChartData.labels=efficiencyChartLables;
    efficiencyLineChartData.datasets[0].data=efficiencyChartValuesB0;
    efficiencyLineChartData.datasets[1].data=efficiencyChartValuesB1;
    efficiencyLineChartData.datasets[2].data=efficiencyChartValuesB2;
    efficiencyLineChartData.datasets[3].data=efficiencyChartValuesB3;
    efficiencyLineChartData.datasets[4].data=efficiencyChartValuesB4;
    efficiencyLineChartData.datasets[5].data=efficiencyChartValuesB5;
    efficiencyLineChartData.datasets[6].data=efficiencyChartValuesB6;
    efficiencyLineChartData.datasets[7].data=efficiencyChartValuesB7;
    efficiencyLineChartData.datasets[8].data=efficiencyChartValuesWriteOff;
    efficiencyLineChart.update();
  }).catch(error => {
    console.error("Error:", error);
  });
}