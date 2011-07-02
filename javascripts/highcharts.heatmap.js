// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
/** HighCharts Heatmap.
 *  
 *  Description:
 *  This plugin extends highcharts to create simple heatmaps sometimes called "stoplight charts". This chart is helpful to quickly
 *  determine the performance of an item within a category relative to some arbitrary perforance threshold.
 *
 *  This plugin does not visually scale the point items relative to some other measurement value, which many heatmaps do. 
 *  
 *  Copyright (c) 2011 Mark Daggett
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// JSLint options:
/*jslint forin: true */
/*global document, window, navigator, setInterval, clearInterval, clearTimeout, setTimeout, location, jQuery, $ */

$.fn.heatmap = function(chartOptions, config) {
    var element = $(this);
    var heatMapper = {
        buildSeriesData: function(data) {
            return data;
        },

        /*
          Creates the appropriately sized heatmap rect for the space provided by the chart.
        */
        createSymbol : function(chart, element){
          var that = this;
          that.height = element.height();
          that.width = element.width();
          that.xItems = chart.xAxis.categories.length;
          that.yItems = chart.yAxis.categories.length;
          console.log(that.xItems)
          console.log(that.yItems)
          that.radius = 10
          $.extend(Highcharts.Renderer.prototype.symbols, {
              rect: function(){
                var args = Array.prototype.slice.call(arguments);
                return that.rect.apply(that,args)
                }
          });
        },
        rect: function(x, y) {
            var len = 0.707 * this.radius;
            var ylen = len / 1.2;
            return [
            'M', x - len, y - ylen,
            'L', x + len, y - ylen,
            x + len, y + ylen,
            x - len, y + ylen,
            'Z'
            ];
        }
    };

    /*
      The default ChartOptions are a series of sensible defaults.
      You can overwrite them by supplying a chartOptions object.
    */
    var defaultChartOptions = {
        chart: {
            renderTo: element.attr("id"),
            defaultSeriesType: 'scatter',
            zoomType: 'xy'
        },
        legend: {
            enabled: false
        },
        xAxis: {
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            startOnTick: false,
            endOnTick: false,
            minPadding: 0.5,
            maxPadding: 0.5
        },
        tooltip: {
            formatter: function() {
                return this.point.name;
            }
        },
        plotOptions: {
            series: {
                dataLabels:
                {
                    enabled: true,
                    color: '#000000',
                    formatter: function() {
                        return this.point.name;
                    }
                }
            },
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
        },
        series: heatMapper.buildSeriesData(config.seriesData)
    };
    $.extend(true, defaultChartOptions, chartOptions);
    defaultChartOptions.yAxis.categories = config.yCategories;
    defaultChartOptions.xAxis.categories = config.xCategories;
    heatMapper.createSymbol(defaultChartOptions, element);
    var chart = new Highcharts.Chart(defaultChartOptions);
    return chart;
};