# Seeker #


## Description ##
A javascript library for visualization of biological sequencing data. In addition to the a standard library of components (checkboxes, menu, buttons..), I plan to code three components: annotation viewer, genome browser, and sequence editor. 

## Annotation viewer ##
**Version 1.0**  
This web app is used to view domain or feature annotations on genes. A demo of this app can be viewed [here](http://www.nextgenetics.net/tools/anno_view/annotator.html):  

The sequence/feature rendering function is performed by the `seeker.annotator` element. This element can be instantiated by:

    var anno = new seeker.annotator();
        .attachTo(document.body);

This will create a new annotator element and attach the node to body of the document. To position this element you can use the `whxy()` function that is available to every seeker control element:  

    var dim = seeker.util.winDimensions();
    anno.whyx(dim[0],dim[1],0,0);

The function `seeker.util.winDimensions()` returns the width and height of the browser window as an array of `[x,y]`. We then assigned the browser width/height to the annotator width/height and positioned it at 0,0.

To load data into annotator:

    var myData = 'Tab delimited or HMMScan data';
    anno.loadData(myData);

Currently, the parsing function only supports HMM Scan domain table result or a tab delimited format. The tab delimited format requires 5 columns: sequence name, feature name, start position, end position, and sequence length. 

An example tab delimited input:

    seq1	feat1	10	20	100
    seq1	feat2	40	60
    seq2	feat1	60	70	200

This will generate a figure with 2 sequences. Sequence 1 will contain 2 features and sequence 2 will contain 1 feature. Note that you only need to define the sequence length once. You can omitt the sequence length in subsequent lines with the same sequence. 

## Genome browser ##
In progress

## Sequence editor ##
Not yet started