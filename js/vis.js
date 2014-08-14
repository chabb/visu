// a ploybrush for d3
(function(d3) {
  d3.svg.polybrush = function() {
    var dispatch = d3.dispatch("brushstart", "brush", "brushend"),
        x = null,
        y = null,
        extent = [],
        firstClick = true,
        firstTime = true,
        wasDragged = false,
        origin = null,
        line = d3.svg.line()
          .x(function(d) {
            return d[0];
          })
          .y(function(d) {
            return d[1];
          });
    var brush = function(g) {
      g.each(function() {
        var bg, e, fg;
        g = d3.select(this);
        bg = g.selectAll(".background").data([0]);
        fg = g.selectAll(".extent").data([extent]);
        g.style("pointer-events", "all").on("click.brush", addAnchor);
        bg.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        fg.enter().append("path").attr("class", "extent").style("cursor", "move");
        if (x) {
          e = scaleExtent(x.range());
          bg.attr("x", e[0]).attr("width", e[1] - e[0]);
        }
        if (y) {
          e = scaleExtent(y.range());
          bg.attr("y", e[0]).attr("height", e[1] - e[0]);
        }
      });
    };
    var drawPath = function() {
      return d3.selectAll("g#brush path").attr("d", function(d) {
        return line(d) + "Z";
      });
    };
    var scaleExtent = function(domain) {
      var start, stop;
      start = domain[0];
      stop = domain[domain.length - 1];
      if (start < stop) {
        return [start, stop];
      } else {
        return [stop, start];
      }
    };
    var withinBounds = function(point) {
      var rangeX, rangeY, _x, _y;
      rangeX = scaleExtent(x.range());
      rangeY = scaleExtent(y.range());
      _x = Math.max(rangeX[0], Math.min(rangeX[1], point[0]));
      _y = Math.max(rangeY[0], Math.min(rangeY[1], point[1]));
      return point[0] === _x && point[1] === _y;
    };
    var moveAnchor = function(target) {
      var moved, point;
      point = d3.mouse(target);
      if (firstTime) {
        extent.push(point);
        firstTime = false;
      } else {
        if (withinBounds(point)) {
          extent.splice(extent.length - 1, 1, point);
        }
        drawPath();
        dispatch.brush();
      }
    };
    var closePath = function() {
      var w;
      w = d3.select(window);
      w.on("dblclick.brush", null).on("mousemove.brush", null);
      firstClick = true;
      if (extent.length === 2 && extent[0][0] === extent[1][0] && extent[0][1] === extent[1][1]) {
        extent.splice(0, extent.length);
      }
      d3.select(".extent").on("mousedown.brush", moveExtent);
      return dispatch.brushend();
    };
    var addAnchor = function() {
      var g, w,
        _this = this;
      g = d3.select(this);
      w = d3.select(window);
      firstTime = true;
      if (wasDragged) {
        wasDragged = false;
        return;
      }
      if (firstClick) {
        extent.splice(0, extent.length);
        firstClick = false;
        d3.select(".extent").on("mousedown.brush", null);
        w.on("mousemove.brush", function() {
          return moveAnchor(_this);
        }).on("dblclick.brush", closePath);
        dispatch.brushstart();
      }
      if (extent.length > 1) {
        extent.pop();
      }
      extent.push(d3.mouse(this));
      return drawPath();
    };
    var dragExtent = function(target) {
      var checkBounds, fail, p, point, scaleX, scaleY, updateExtentPoint, _i, _j, _len, _len1;
      point = d3.mouse(target);
      scaleX = point[0] - origin[0];
      scaleY = point[1] - origin[1];
      fail = false;
      origin = point;
      updateExtentPoint = function(p) {
        p[0] += scaleX;
        p[1] += scaleY;
      };
      for (_i = 0, _len = extent.length; _i < _len; _i++) {
        p = extent[_i];
        updateExtentPoint(p);
      }
      checkBounds = function(p) {
        if (!withinBounds(p)) {
          fail = true;
        }
        return fail;
      };
      for (_j = 0, _len1 = extent.length; _j < _len1; _j++) {
        p = extent[_j];
        checkBounds(p);
      }
      if (fail) {
        return;
      }
      drawPath();
      return dispatch.brush({
        mode: "move"
      });
    };
    var dragStop = function() {
      var w;
      w = d3.select(window);
      w.on("mousemove.brush", null).on("mouseup.brush", null);
      wasDragged = true;
      return dispatch.brushend();
    };
    var moveExtent = function() {
      var _this = this;
      d3.event.stopPropagation();
      d3.event.preventDefault();
      if (firstClick && !brush.empty()) {
        d3.select(window).on("mousemove.brush", function() {
          return dragExtent(_this);
        }).on("mouseup.brush", dragStop);
        origin = d3.mouse(this);
      }
    };
    brush.isWithinExtent = function(x, y) {
      var i, j, len, p1, p2, ret, _i, _len;
      len = extent.length;
      j = len - 1;
      ret = false;
      for (i = _i = 0, _len = extent.length; _i < _len; i = ++_i) {
        p1 = extent[i];
        p2 = extent[j];
        if ((p1[1] > y) !== (p2[1] > y) && x < (p2[0] - p1[0]) * (y - p1[1]) / (p2[1] - p1[1]) + p1[0]) {
          ret = !ret;
        }
        j = i;
      }
      return ret;
    };
    brush.x = function(z) {
      if (!arguments.length) {
        return x;
      }
      x = z;
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) {
        return y;
      }
      y = z;
      return brush;
    };
    brush.extent = function(z) {
      if (!arguments.length) {
        return extent;
      }
      extent = z;
      return brush;
    };
    brush.clear = function() {
      extent.splice(0, extent.length);
      return brush;
    };
    brush.empty = function() {
      return extent.length === 0;
    };

    d3.rebind(brush, dispatch, "on");

    return brush;
  };
})(d3);

// set the stage for the visualization
var margin = {top: 100, right: 100, bottom: 100, left: 100},
  w = 960 - margin.left - margin.right,
  h = 600 - margin.top - margin.bottom,
  x = d3.time.scale().range([0, w]).clamp(false),
  y = d3.scale.linear().range([h, 0]).clamp(false);
  parseDate = d3.time.format("%Y").parse;
var trueWidth =960+150;
var grid;
var color = d3.scale.category10(); // to generate a different color for each line
var scatter = false;
var countries,
  filtered,
  transpose;
var svg,xAxis,yAxis;
// where the line gets its properties, how it will be interpolated
var vline = d3.svg.line()
  .interpolate("basis")
  .x(function(d) { return x(d.year); })
  .y(function(d) { return y(d.stat); });
//scatterPlot Interpolator
var xMap = function(d) { return x(d.year)};
var yMap = function(d) { return y(d.stat)};

var heatColors =   ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];

var heatmapColourScale= d3.scale.linear()
  .domain(d3.range(0, 1, 1.0 / (heatColors.length - 1)))
  .range(heatColors);

var datatToHeatMapScale = d3.scale.linear();


// prepare datas, with some optimizations
var year_column = d3.keys(DATAS[0]).filter(function(key){ return (key !=="Country Code") && (key!=="Country Name" ) });
var preparedDatas = DATAS.map(function(d){
  // retrieve all the years

var key_dates = d3.keys(d).filter(function(key){ return (key !=="Country Code") && (key!=="Country Name" ) });
  return { pk:d['Country Code'], name : d["Country Name"] , values : key_dates.map(function(_d) { return {year:parseDate(_d),stat:d[_d]}})};
});
// thesea are used to speed up data manipulations
var scatterDictionnary = {};
preparedDatas.forEach( function(d){
  _values=[];
  d.values.forEach(function(_d) {
    _values.push({pk:d.pk,year:_d.year,stat:_d.stat});
  });
  scatterDictionnary[d.pk]=_values;
});
var scatterDatas = [];
var scatterLegend = [];
var brush;
var main;
transpose = preparedDatas;
var countryDictionnary = {};
preparedDatas.forEach(function(d){
   countryDictionnary[d.pk]=d;
});
// bootstrap application
$(document).ready(function() { init(); redraw(false); initGrid(); initMap();});

function initMap() {
  var width = 1960,
    height = 1160;

  var svg = d3.select("#world").append("svg")
    .attr("width", width)
    .attr("height", height);

  var subunits = topojson.feature(topolgoy, topolgoy.objects.subunits);
  var sf = subunits.features;

  var projection = d3.geo.mercator()
    .scale(100)
    .translate([width / 2, height / 2]);
  var path = d3.geo.path()
    .projection(projection);


  var datas = [];
  var fakeDico = {};
  for (var i=0;i<sf.length;i++) {
     var centroid = path.centroid(sf[i]),
            x = centroid[0],
            y = centroid[1];
     var id = sf[i].id;
     datas.push({id:id,x:x,y:y,datas:scatterDictionnary[id]});
     fakeDico[id]=scatterDictionnary[id];
  }
  //key fonction is the same

  console.log(datas);
  datatToHeatMapScale.domain([
      d3.min(datas, function(c) { if (c.datas) return c.datas[10].stat; }),
      d3.max(datas, function(c) { if (c.datas) return c.datas[10].stat; })
  ]).range([0,1]);

  // le fichier de gémoétrie contient aussi les sous-divisions entre pays, ce qui rend
  // la chose inutilisable


  svg.selectAll(".subunit")
    .data(topojson.feature(topolgoy, topolgoy.objects.subunits).features)
  .enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id; })
    .style("fill", function(d) {
      var id = d.id;
      if (id == "US1") id = "USA";
      if (id == "GB1") id= "GBR";
      if (id == "FR1") id ="FRA";
      if (id == "DN1") id= "DNK";
      if (id == "NZ1") id= "DNK";
      if (id == "NL1") id= "NLD";
      if (id == "AU1") id= "AUS";
      var value = scatterDictionnary[id];
      if (value) value = value[10].stat;
      console.log('==>',d.id,id,value,datatToHeatMapScale(value));
      return heatmapColourScale(datatToHeatMapScale(value));})
    .attr("d",path);

  /*svg.append("path")
      .datum(topojson.feature(topolgoy, topolgoy.objects.subunits))
      .attr("d", d3.geo.path().projection(d3.geo.mercator()));*/

}

// init the viz
function init() {
  //sets canvas
  svg = d3.select("#vizu").append("svg:svg")
  .attr("width", w + margin.left + margin.right)
  .attr("height", h + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .attr("id","viz");
  xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom");
  svg.append("svg:g").attr("class", "x axis");
  main =svg.append("g").attr("class","main").attr("width",trueWidth).attr("height",h+margin.top+margin.bottom);

  // define the y axis and its class, append it to svg
  yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");
  svg.append("svg:g").attr("class", "y axis");

  // add brush to canvas
  brush = d3.svg.polybrush()
    .x(d3.scale.linear().range([0, w]))
    .y(d3.scale.linear().range([0, h]))
    .on("brushstart", function() {
      svg.selectAll(".selected").classed("selected", false);
    }).on("brushend",function(){

    })
    .on("brush", function() {
      // set the 'selected' class for the circle
      var dumb = [];
      svg.selectAll("circle.dot").classed("selected", function(d) {
        //  Brute forc approch
        if (brush.isWithinExtent(xMap(d), yMap(d))) {
           dumb.push(d);
           console.log(d);
           return true;
        } else {
          //vornoi.classed("selected", false);
          return false;
        }
      });
      template = "";
      for(var i=0;i<dumb.length;i++) {
        template = template +"<li>"+dumb[i].pk+"(Year:"+dumb[i].year.getFullYear()+")="+dumb[i].stat+"</li>";
      }
      $("ul#selection").html(template);
  });
  //add brush element to HTML
  svg.append("g").attr("id","brush").attr("class","brush").call(brush);
  //add main element to HTML
  main =svg.append("g").attr("class","main").attr("width",trueWidth).attr("height",h+margin.top+margin.bottom);
}

// this is where magic happens
function redraw(zoom)
{
  if (!zoom)
  {
    // set the x and y domains as the max and min
    // of the related year and statistics, respectively
    x.domain([
      d3.min(transpose, function(c) { return d3.min(c.values, function(v) { return v.year; }); }),
      d3.max(transpose, function(c) { return d3.max(c.values, function(v) { return v.year; }); })
    ]);

    y.domain([
      d3.min(transpose, function(c) { return d3.min(c.values, function(v) { return v.stat; }); }),
      d3.max(transpose, function(c) { return d3.max(c.values, function(v) { return v.stat; }); })
    ]);


    $('#x1').val(x.domain()[0].getFullYear());
    $('#x2').val(x.domain()[1].getFullYear());
    $('#y1').val(y.domain()[0]);
    $('#y2').val(y.domain()[1]);
  } else {
    // domains is bound by user
    y.domain([$('#y1').val(),$('#y2').val()]);
    x.domain([parseDate($('#x1').val()),parseDate($('#x2').val())]);
    recalculateDatas();
    //filter datas
    var ld = transpose.map(function(d){
        //console.log("FDS",d);
        var c = d.values.filter(function(_d){
         // console.log(_d.year.getYear(),x.domain()[1].getYear(),d.stat,_d.stat );
          if (_d.year.getYear()<x.domain()[0].getYear() || _d.year.getYear()>x.domain()[1].getYear()) return false;
          if (_d.stat<y.domain()[0] || _d.stat>y.domain()[1]) return false;
          return true;
        });
        //console.log(c);
        return {pk:d.pk,name:d.name,values:c};
    });

    transpose =ld;
    var sd = scatterDatas.filter(function(_d) {
       if (_d.year.getYear()<x.domain()[0].getYear() || _d.year.getYear()>x.domain()[1].getYear()) return false;
       if (_d.stat<y.domain()[0] || _d.stat>y.domain()[1]) return false;
       return true;
    });
    scatterDatas = sd;

  }
  if(!scatter) {
   //line graph
   // announce to d3 that we will be using something called
    // "country" that makes use of the transposed data
    var country = main.selectAll(".country")
      .data(transpose,function(d){return d.pk});
    // create separate groups for each country
    // assign them a class and individual IDs (for styling)
    var countryEnter = country.enter().append("g")
      .attr("class", "country")
      .attr("id", function(d) { return d.name; });
    // draw the lines and color them according to their names
    countryEnter.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return vline(d.values); })
      .style("stroke", function(d) { return color(d.name); });
    // create lables for each country
    // set their position to that of the last year and stat
    countryEnter.append("text")
     .attr("class", "names")
     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
     .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.stat) + ")"; })
     .attr("x", 4)
     .attr("dy", ".35em")
     .text(function(d) { return d.name; });
    var exit = country.exit();
    // set variable for updating visualization
    // we dont remove the element, as they are always the same
    var exitUpdate = exit.transition().duration(1500);
    var countryUpdate = country.transition().duration(1500);
    exitUpdate.select("path").style('opacity',0);
    exitUpdate.select("text").style('opacity',0);
    // change values of path for updated series
    countryUpdate.select("path")
      .attr("d", function(d) { return vline(d.values); })
      .style("opacity",0.8);

    // change position of text alongside the moving path
    countryUpdate.select("text")
       .attr("transform", function(d) { return "translate(" + x(d.values[d.values.length - 1].year) + "," + y(d.values[d.values.length - 1].stat) + ")"; })
       .style("opacity",0.8);
    }else {
    //scatter stuff
    // new datas
    var scatterP = main.selectAll(".dot")
      .data(scatterDatas,function(d){return d.pk+d.year.getYear()});
    scatterP.enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(d.pk);})
      .style('opacity',1)
      .on("mouseover", function(d) {
          /*tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d)
          + ", " + yValue(d) + ")")
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");*/
      })
      .on("mouseout", function(d) {
          /*tooltip.transition()
               .duration(500)
               .style("opacity", 0);*/
      });
     //scatterP.style('opacity',1);
     scatterP.exit().transition().duration(1000).attr("cx",0).remove();
     scatterP.transition().duration(1000).attr("cx",xMap).attr("cy",yMap).style('opacity',1);

     var legend = svg.selectAll(".legend")
      .data(scatterKeys);

     legend.enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    //remove legend in current group
     legend.select("rect").remove();
     legend.select("text").remove();

    // draw legend colored rectangles
      legend.append("rect")
      .attr("x", w + 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

    // draw legend text
      legend.append("text")
      .attr("x", w + 44)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d) { return d;});
    // remove unused group element
      legend.exit().remove();
    }
    //update axis
    d3.select("svg").transition().duration(1000).select(".y.axis")
      .call(yAxis);

    d3.select("svg").transition().duration(1000).select(".x.axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);
}
function initGrid() {
  // columns definitionds
  var year_columns = year_column.map(function(d){
       return {id:d,name:d,field:d,width:150,sortable:true,editor:Slick.Editors.Float};
  });
  var columns = [
    {id: "title", name: "Country Name", field: "Country Name", width: 290,  editor: Slick.Editors.Text,sortable:true},
  ];
  var t_columns = columns.concat(year_columns);
  console.log(t_columns);
  var options = {
    editable: true,
    enableAddRow: false,
    enableCellNavigation: true,
    asyncEditorLoading: false,
    autoEdit: false,
    multiColumnSort: true
  };
  var checkboxSelector = new Slick.CheckboxSelectColumn({
      cssClass: "slick-cell-checkboxsel"
  });
  t_columns.unshift(checkboxSelector.getColumnDefinition());

  // instantiate gride, set options
  grid = new Slick.Grid("#myGrid", DATAS, t_columns, options);
  grid.setSelectionModel(new Slick.CellSelectionModel());

  grid.registerPlugin(checkboxSelector);

  // wire events
  grid.onSelectedRowsChanged.subscribe(function(e,args) {

    var rows = args.grid.getSelectedRows();
    transpose = rows.map(function(d){
      var key = DATAS[d]['Country Code'];
      return countryDictionnary[key];
    });
    //console.log(rows,transpose);
    var tmp = [];
    var tmpk = [];
    rows.forEach(function(d)
    {
       var key = DATAS[d]['Country Code'];
       tmpk.push(key);
       tmp = tmp.concat(scatterDictionnary[key]);

    });
    scatterKeys = tmpk;
    scatterDatas = tmp;
    redraw(false);
  });

  //sort event
  grid.onSort.subscribe(function (e, args) {
    var cols = args.sortCols;

    DATAS.sort(function (dataRow1, dataRow2) {
        for (var i = 0, l = cols.length; i < l; i++) {
          var field = cols[i].sortCol.field;
          var sign = cols[i].sortAsc ? 1 : -1;
          var value1 = dataRow1[field], value2 = dataRow2[field];
          var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
          if (result !== 0) {
            return result;
          }
        }
        return 0;
      });
      grid.invalidate();
      grid.render();
  });

  // highlicht selected cell on scatterplot
  grid.onActiveCellChanged.subscribe(function(e,args){
    console.log(e,args);
    var item = grid.getDataItem(args.row);

    var yearKey = (args.grid.getColumns()[args.cell]);
    console.log(yearKey.field);
    if (yearKey.field==="sel") return;
    if (yearKey.field==="Country Name") return;
     svg.selectAll("circle.dot").classed("selected", function(d) {
        //  Brute forc approch
        if (d.pk===item["Country Code"] && d.year.getFullYear()==yearKey.field) {
          console.log('dsfds');
          return true;
        }
        return false;
      });


  });
  grid.onCellChange.subscribe(function(e,args) {

    var item = args.item;
    var cc = item['Country Code'];
    var cn = item['Country Name'];
    var cell = args.cell;
    // console.log('CCHANGE EVENTS',args,cell,cc);
    //ITEM HAS ALREADY THE NEW VALUE
    var yearKey = parseInt(args.grid.getColumns()[cell].name,10);
    // we rely on fact that our datas are sorted
    var year_values =  scatterDictionnary[cc];
    var cyear_values = countryDictionnary[cc];
    for (var i=0;i<year_values.length;i++) {
      if (year_values[i].year.getFullYear()===yearKey)
      {
        year_values[i].stat=item[args.grid.getColumns()[cell].name];
      }
    }
    for (var j=0;j<cyear_values.values.length;j++) {
      if (cyear_values.values[j].year.getFullYear()===yearKey)
      {
        cyear_values.values[j].stat=item[args.grid.getColumns()[cell].name];
      }
    }

    // rebuild datas
    var rows = args.grid.getSelectedRows();
    transpose = rows.map(function(d){
      var key = DATAS[d]['Country Code'];
      return countryDictionnary[key];
    });
    //console.log(rows,transpose);
    var tmp = [];
    var tmpk = [];
    rows.forEach(function(d)
    {
       var key = DATAS[d]['Country Code'];
       tmpk.push(key);
       tmp = tmp.concat(scatterDictionnary[key]);

    });
    scatterKeys = tmpk;
    scatterDatas = tmp;
    redraw(false);
  });
  //get some rows to display
  var random = [15,12,11,10,66];
  grid.setSelectedRows(random);
}

function recalculateDatas() {
    var rows = grid.getSelectedRows();
    transpose = rows.map(function(d){
      var key = DATAS[d]['Country Code'];
      return countryDictionnary[key];
    });
    //console.log(rows,transpose);
    var tmp = [];
    var tmpk = [];
    rows.forEach(function(d)
    {
       var key = DATAS[d]['Country Code'];
       tmpk.push(key);
       tmp = tmp.concat(scatterDictionnary[key]);

    });
    scatterKeys = tmpk;
    scatterDatas = tmp;
}

//redraw with zoom domain enabled
function switchDomain() {
  redraw(true);
}
function disposeSelection() {
   $("ul#selection").html("");
}
// switch between scatter and chart
function switchGraph(isPlot) {

  scatter = !isPlot;
  if (scatter) {
    $(".country").hide();
    $(".legend").show();
    $(".dot").show();
  }
  else  {
    $('.country').show();
    $(".dot").hide();
    $(".legend").hide();
  }
  redraw(false);
}
