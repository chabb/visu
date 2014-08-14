

==========INSTALLATION================
- Unzip archive
- Go in the directory
- Launch a local server on your MAC : python -m SimpleHTTPServer 8000
- Points your browser to localhost:8000
- There are some added features, so take time to experiment a bit ;
======================================

Apart from the classic jQuery, I used two librairies : slickgrid and d3.js, these are two open libraries that looks very promising.

d3.js is very interesting as it allows you to bound DOM elements and datas, and
then instruct the DOM about how it should it react to data changes, typically :
 - new datas
 - updated datas
 - 'exited' datas ( eg, when you remove datas)
As datas are bound to DOM element, the relation between datas and displayed elements is immediate.
It seems quite confusing at start, but then it seems very natural, as it is just built on the top of HTML/SVG. Plus,
it has a lot of arrays utilities and math utilites that make life easier.


The other library, Slickgrid is a very-fast table library, who can do a lot of stuff, and is easily customizable. The maintener is sadly doing little work on it these times, but everything is okay (documentation is a bit scarce)

I have wired the graph and the grid, so when you edit a cell, changes are reflected on the graph

===========BREAKDOWN===========================

Here is a basic breakdown of the time i spent on this project

(2h) Basic prototype with line chart
(1h) Added grid, wire it with the chart
(1h) Added the scatter plot
(1h) Added the rubber
(0.5h) Some HTML/CSS Formatting
(1h) Some debugging and optimizations
(1h) Grid edition, domain zooming
(0.5h) Code cleaning, zipping
(0.5h) Added selection feature
(1.5h) CSS, ICON, HMTL, added images, and other stuff..
(0.25) Mirrors the selected cell on the scatter plot..
Plus some time thinking on it on other days.

==============TODO========================

I am a bit worried with the "polygon" lasso, as it is not very "user-friendly". I think a simple "rectangular" lasso
would have been easier to use and code, and a graph zoom on the selction would be very easy to implent.
With a polygon lasson, zoom is quit hard, as domains is not clearly defined.

When you edit a cell, the selection goes to current row. It would be nice to keep the selected rows

I kind of rushed thing in the end, so there are some dirty tricks.

========================================

There is large room for other improvments :
  - Use Set as datastructure
  - Hide globals
  - Use an unique DataSource, that updates the arrays that are used for visualisation
  - Interactions between graphs, grids and html are tighty coupled. To make thing more reusable, i should
    have use an event system.
  - ....

