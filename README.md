# Seeker #

## Description ##
A javascript library for visualization of biological sequencing data. I plan to code three components: annotation viewer, genome browser, and sequence editor. 

The seeker javascript library currently has 3 dependencies (located in the ext folder):

1.	[D3.js](https://github.com/mbostock/d3): Used for all svg rendering and DOM manipulations
2.	[crossfilter.js](https://github.com/square/crossfilter): Used primarily in the genome browser component. This decision is still tentative.
3.	[FlexiColorpicker.js](https://github.com/DavidDurman/FlexiColorPicker): Used for the color picker control
4.	[Cavg.js](http://code.google.com/p/canvg/): Rendering of gene coverage plot of the genome browser is not efficient with SVG. Instead, the plot is converted to canvas using canvg library.

There are several components to the seeker javascript library (located in the js folder). I will consolidate them all into one .js file when I am done. So far there are:

1.	seeker.control.js: Contains all the standard control elements (checkboxes, sliders, option menus).
2.	seeker.util.js: Contains all utility functions and data binding functions for MVC
3.	seeker.annotator.js: Contains the annotator element used to render sequence feature figures
4.	seeker.browser.js: Contains the genome browser element. Still in progress.

update(Nov 17th, 2013):
 -The lack of progress is due to thesis writing. I plan to be submitting my thesis in January. Hopefully I'll pick this back up around that time.


## Genome browser ##
work in progress 

A toy demo of the genome browser can be found [here](http://www.nextgenetics.net/tools/browser/browser.html)  

Here are some brief description of this demo:
 -The demo currently displays all gene features on human chromosome 1. Features are rendered with D3.js. 
 - Data is loaded in as a delimited file instead of JSON formatted file. Decided to go with this route because pre-JSON formatted files are huge. The time saving in parsing the delimited file is not significant enough to warrant JSON formatted data. Sample data is currently genes on human chromosome 1 from UCSC. The parse.py script in the data folder parses a .gtf into the correct format.
 - Interface is designed similar to stock charts. Bottom overview bar will show feature density of the entire reference contig. Aim is to keep the interface as simple and uncluttered as possible.
 - Implemented a "rubber-banding" system for rendering genomic loci instead of classic google map tiling system. Seems to be working well. Potentially less update() calls needed than tiling systems. More details on this system to follow.
 - Element pooling system to recycle svg elements instead of continuously creating and destroying DOM nodes. Saves garbage collector a lot of work.
 - WASD key movement for scrolling through the genome.

## Annotation viewer ##
**Version 1.1**  
This web app is used to view domain or feature annotations on genes. A demo of this app can be viewed [here](http://www.nextgenetics.net/tools/anno_view/annotator.html):  

The sequence/feature rendering function is performed by the `seeker.annotator` element. This element can be instantiated by:

    var anno = new seeker.annotator();
        .attachTo(document.body);

This will create a new annotator element and attach the node to body of the document. To size and position this element you can use the `whxy()` function that is available to every seeker control element:  

    var dim = seeker.util.winDimensions()
    anno
        .whxy(dim[0],dim[1],0,0);

The function `seeker.util.winDimensions()` returns the width and height of the browser window as an array of `[w,h]`. We then assigned the browser width/height to the annotator width/height and positioned it at 0, 0. This will effectively make the annotator element fill up the entire screen of the browser.

To load data into annotator:

    var myData = 'Tab delimited or HMMScan data';
    anno
        .loadData(myData);

Currently, the parsing function only supports HMM Scan domain table result or a tab delimited format. The tab delimited format requires 5 columns: sequence name, feature name, start position, end position, and sequence length. 

An example tab delimited input:

    seq1	feat1	10	20	100
    seq1	feat2	40	60
    seq2	feat1	60	70	200

This will generate a figure with 2 sequences. Sequence 1 will contain 2 features and sequence 2 will contain 1 feature. Note that you only need to define the sequence length once. You can omitt the sequence length in subsequent lines with the same sequence.

There are many settings that will modify the annotation figure. The settings are stored in the `settings` property of the annotator element. Here are the available settings:

    settings = {
		'margin':50,
		'legend_show':true,
		'legend_width':800,
		'legend_height':70,
		'legend_spacing':30,
		'legend_size':15,
		'legend_cols':5,
		'legend_xPos':0,
		'seq_spacing':40,
		'seq_maxLength':1000,
		'feat_width':10,
		'seq_spineColor':'grey',
		'seq_spineWidth':5,
		'seq_labelxPos':0,
		'seq_numbered':true
	}; 

To change a setting and update the figure:
	
	anno.settings.legened_show = false;
	anno
	    .update();

Setting the `legend_show` property to false will hide the legend. Update the figure will calling the `update()` function.

## Sequence editor ##
Not yet started
