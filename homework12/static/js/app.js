function buildMetadata(sample) {
  // Retrieving data from the metadata endpoint
  d3.json(`/metadata/${sample}`).then(function(sampleData) {
    // Using d3 to select the panel with id of `#sample-metadata`
    const PANEL = d3.select("#sample-metadata");
    // Using `.html("") to clear any existing metadata
    PANEL.html("");
    // Using `Object.entries` to add each key and value pair to the panel
    // Using d3 to append new tags for each key-value in the metadata.
    Object.entries(sampleData).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key}, ${value}`);
    })
    // BONUS: Build the Gauge Chart
    const wash_freq = sampleData.WFREQ;
    // Initializing the gauge chart parameters
    let level = wash_freq;
    // Trig to calc meter point
    let degrees = 173-(level)*20;
         radius = .5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);
    // Initializing path parameters
    let mainPath = "M -.0 -0.035 L .0 0.035 L ",
         pathX = String(x),
         space = " ",
         pathY = String(y),
         pathEnd = " Z";
    let path = mainPath.concat(pathX,space,pathY,pathEnd);
    // Initializing chart parameters
    let data = [{ type: "category",
       x: [0], y:[0],
        marker: {size: 28, color:"850000"},
        showlegend: false,
        name: "speed",
        text: level,
        hoverinfo: "text+name"},
      { values: [1,1,1,1,1,1,1,1,1,9],
      rotation: 90,
      text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1"],
      textinfo: "text",
      textposition:"inside",
      marker: {colors:[
        "rgba(127, 191, 63, 0.9)",
        "rgba(127, 191, 63, 0.8)",
        "rgba(127, 191, 63, 0.7)",
        "rgba(127, 191, 63, 0.6)",
        "rgba(127, 191, 63, 0.5)",
        "rgba(127, 191, 63, 0.4)",
        "rgba(127, 191, 63, 0.3)",
        "rgba(127, 191, 63, 0.2)",
        "rgba(127, 191, 63, 0.1)",
        "transparent"]},
      labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1"],
      hoverinfo: "label",
      hole: .5,
      type: "pie",
      showlegend: false
    }];
    // Initializing layout parameters
    let layout = {
      shapes:[{
          type: "path",
          path: path,
          fillcolor: "850000",
          line: {
            color: "850000"
          }
        }],
      title: "<b>Belly Button Washing Frequency</b><br>Scrubs Per Week",
      height: 500,
      width: 600,
      xaxis: {type:"category",zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {type:"category",zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]}
    };
    // Drawing gauge plot
    Plotly.newPlot("gauge", data, layout);
  })
};
// Initializing a function that will build the pie and bubble charts
function buildCharts(sample) {
  // Retrieving data from the samples endpoint
  d3.json(`/samples/${sample}`).then(function (sampleData) {
    // Initializing letiables with the data that will be used to plot the
    // charts
    const otu_ids = sampleData.otu_ids;
    const otu_labels = sampleData.otu_labels;
    const sample_values = sampleData.sample_values;
    // Building Bubble chart
    const bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: "markers",
      marker: {
        size: sample_values,
        color: otu_ids,
        colorscale: "Earth"
      }
    }];
    // Initializing the bubble chart layout
    const bubbleLayout = {
      margin: { t: 0 },
      hovermode: "closest",
      xaxis: {title: "OTU ID"},
      yaxis: {title: ""}
    };
    // Drawing the bubble chart
    Plotly.plot("bubble", bubbleData, bubbleLayout);
    // Building Pie Chart
    const pieData = [{
      values: sample_values.slice(0,10),
      labels: otu_ids.slice(0,10),
      hovertext: otu_labels.slice(0,10,),
      hoverinfo: "hovertext",
      type: "pie"
    }];
    // Initializing the pie chart layout
    const pieLayout = {
      margin: {t: 0, l: 0}
    }
    // Drawing the pie chart
    Plotly.plot("pie", pieData, pieLayout);
  });
}
// Initializing the init function that will call the previous two functions
function init() {
  // Grab a reference to the dropdown select element
  const sampleSelector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      sampleSelector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}
// Initializing a function that will call buildCharts and buildMetadata when
// the user selects a new sample number to display data for
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}
// Initialize the dashboard
init();
