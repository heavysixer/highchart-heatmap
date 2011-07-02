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

$.fn.heatmap = function(chartOptions, config, callback) {
    var element = $(this);
    var heatMapper = {
        defaultColors : ["#F23A33","#FFDD2F","#91C450"],
        aliasEventsChain : function(options){
          if(typeof(options.chart.events) === 'object'){
            if(typeof(options.chart.events.load) !== 'undefined'){
              this.afterLoadCallback = options.chart.events.load;
              var that = this;
              options.chart.events.load = function() {
                var args = Array.prototype.slice.call(arguments);
                that.beforeLoadCallback.apply(that, args);
                that.afterLoadCallback.apply(that, args);
              };
            } else {
              var that = this;
              options.chart.events.load = function() {
                var args = Array.prototype.slice.call(arguments);
                that.beforeLoadCallback.apply(that, args);
              };
            }
          } else {
            options.chart.events = {};
            this.aliasEventsChain(options);
          }
        },
        beforeLoadCallback : function(event){
          var chart = event.target;
          this.setHeight(chart.clipRect.height, defaultChartOptions);
          this.setWidth(chart.clipRect.width, defaultChartOptions);
          chart.isDirtyBox = true;
          chart.redraw(false);
        },
        buildSeriesData: function(config) {
            var len = config.seriesData.length;
            for (var x = 0; x < len; x++) {
                config.seriesData[x].marker = {
                    symbol: 'heatmap'
                };
                var dlen = config.seriesData[x].data.length;
                for(var y = 0; y < dlen; y++){
                  config.seriesData[x].data[y].fillColor = this.getColor(config.seriesData[x].data[y].name,config.thresholds[y]);
                }
            }
            return config.seriesData;
        },
        getColor: function(num, threshold){
          if(typeof(threshold.colors) === 'undefined'){
            threshold.colors = this.defaultColors;
          }
          var len = threshold.colors.length;
          var p = Math.min(0.999999999999,num/threshold.max);
          return threshold.colors[Math.floor(len * p)];
        },

        /*
          Creates the appropriately sized heatmap rect for the space provided by the chart.
        */
        createSymbol: function(chart, element) {
            var that = this;
            this.setHeight(element.height(),chart);
            this.setWidth(element.width(),chart);

            /*
            FIXME: This offset is only necessary to keep the heatmap items from overlapping one another
            This can most likely be removed if we are able to calibrate the width and height according to the 
            buffer used to draw the gridlines.
          */
            //this.height -= chart.yAxis.categories.length * 1.7;
            //this.width -= chart.xAxis.categories.length * 0.5;
            $.extend(Highcharts.Renderer.prototype.symbols, {
                heatmap: function() {
                    var args = Array.prototype.slice.call(arguments);
                    return that.heatmap.apply(that, args);
                }
            });
        },
        setHeight: function(h,chart) {
          this.height = (h / chart.yAxis.categories.length) / 2;
        },
        setWidth: function(w,chart) {
          this.width = (w / chart.xAxis.categories.length) / 2;
        },
        heatmap: function(x, y) {
            return [
            'M', x - this.width, y - this.height,
            'L', x + this.width, y - this.height,
            x + this.width, y + this.height,
            x - this.width, y + this.height,
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
        series: heatMapper.buildSeriesData(config)
    };
    $.extend(true, defaultChartOptions, chartOptions);
    defaultChartOptions.yAxis.categories = config.yCategories;
    defaultChartOptions.xAxis.categories = config.xCategories;
    heatMapper.aliasEventsChain(defaultChartOptions);
    heatMapper.createSymbol(defaultChartOptions, element);

    var chart = new Highcharts.Chart(defaultChartOptions, function(){
      if(typeof(callback) === 'function'){
        callback.apply(this,Array.prototype.slice.call(arguments));
      }
    });
    return chart;
};