// (C) Wolfgang Huber 2010-2011

// Script parameters - these are set up by R in the function 'writeReport' when copying the 
//   template for this script from arrayQualityMetrics/inst/scripts into the report.

var highlightInitial = [ false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, true ];
var arrayMetadata    = [ [ "1", "GSM4472532_C", "GSM4472532_HBx_src_NOR-2", "control", "none", "" ], [ "2", "GSM4472533_C", "GSM4472533_HBx_src_NOR-3", "control", "none", "HBx_Src" ], [ "3", "GSM4472534_C", "GSM4472534_HBx_src_NOR-4", "control", "none", "HBx_Src" ], [ "4", "GSM4472535_Ob", "GSM4472535_HBx_src_DIO-1", "obesity", "none", "HBx_Src" ], [ "5", "GSM4472536_Ob", "GSM4472536_HBx_src_DIO-2", "obesity", "none", "HBx_Src" ], [ "6", "GSM4472537_Ob", "GSM4472537_HBx_src_DIO-4", "obesity", "none", "HBx_Src" ], [ "7", "GSM4472538_ObOF", "GSM4472538_HBx_src_DIO+OF-1", "obesity", "OF", "HBx_Src" ], [ "8", "GSM4472539_ObOF", "GSM4472539_HBx_src_DIO+OF-7", "obesity", "OF", "HBx_Src" ], [ "9", "GSM4472540_ObOF", "GSM4472540_HBx_src_DIO+OF-8", "obesity", "OF", "HBx_Src" ], [ "10", "GSM4472541_p53-C", "GSM4472541_HBx_src_p53-_NOR-1", "control", "none", "HBx_Src_p53-" ], [ "11", "GSM4472542_p53-C", "GSM4472542_HBx_src_p53-_NOR-2", "control", "none", "HBx_Src_p53-" ], [ "12", "GSM4472543_p53-Ob", "GSM4472543_HBx_src_p53-_DIO-1", "obesity", "none", "HBx_Src_p53-" ], [ "13", "GSM4472544_p53-Ob", "GSM4472544_HBx_src_p53-_DIO-2", "obesity", "none", "HBx_Src_p53-" ], [ "14", "GSM4472545_P53-Ob", "GSM4472545_HBx_src_p53-_DIO-3", "obesity", "none", "HBx_Src_p53-" ], [ "15", "GSM4472546_P53-ObOF", "GSM4472546_HBx_src_p53-_DIO+OF-2", "obesity", "OF", "HBx_Src_p53-" ], [ "16", "GSM4472547_P53-ObOF", "GSM4472547_HBx_src_p53-_DIO+OF-3", "obesity", "OF", "HBx_Src_p53-" ], [ "17", "GSM4472548_P53-ObOF", "GSM4472548_HBx_src_p53-_DIO+OF-6", "obesity", "OF", "HBx_Src_p53-" ] ];
var svgObjectNames   = [ "pca", "dens" ];

var cssText = ["stroke-width:1; stroke-opacity:0.4",
               "stroke-width:3; stroke-opacity:1" ];

// Global variables - these are set up below by 'reportinit'
var tables;             // array of all the associated ('tooltips') tables on the page
var checkboxes;         // the checkboxes
var ssrules;


function reportinit() 
{
 
    var a, i, status;

    /*--------find checkboxes and set them to start values------*/
    checkboxes = document.getElementsByName("ReportObjectCheckBoxes");
    if(checkboxes.length != highlightInitial.length)
	throw new Error("checkboxes.length=" + checkboxes.length + "  !=  "
                        + " highlightInitial.length="+ highlightInitial.length);
    
    /*--------find associated tables and cache their locations------*/
    tables = new Array(svgObjectNames.length);
    for(i=0; i<tables.length; i++) 
    {
        tables[i] = safeGetElementById("Tab:"+svgObjectNames[i]);
    }

    /*------- style sheet rules ---------*/
    var ss = document.styleSheets[0];
    ssrules = ss.cssRules ? ss.cssRules : ss.rules; 

    /*------- checkboxes[a] is (expected to be) of class HTMLInputElement ---*/
    for(a=0; a<checkboxes.length; a++)
    {
	checkboxes[a].checked = highlightInitial[a];
        status = checkboxes[a].checked; 
        setReportObj(a+1, status, false);
    }

}


function safeGetElementById(id)
{
    res = document.getElementById(id);
    if(res == null)
        throw new Error("Id '"+ id + "' not found.");
    return(res)
}

/*------------------------------------------------------------
   Highlighting of Report Objects 
 ---------------------------------------------------------------*/
function setReportObj(reportObjId, status, doTable)
{
    var i, j, plotObjIds, selector;

    if(doTable) {
	for(i=0; i<svgObjectNames.length; i++) {
	    showTipTable(i, reportObjId);
	} 
    }

    /* This works in Chrome 10, ssrules will be null; we use getElementsByClassName and loop over them */
    if(ssrules == null) {
	elements = document.getElementsByClassName("aqm" + reportObjId); 
	for(i=0; i<elements.length; i++) {
	    elements[i].style.cssText = cssText[0+status];
	}
    } else {
    /* This works in Firefox 4 */
    for(i=0; i<ssrules.length; i++) {
        if (ssrules[i].selectorText == (".aqm" + reportObjId)) {
		ssrules[i].style.cssText = cssText[0+status];
		break;
	    }
	}
    }

}

/*------------------------------------------------------------
   Display of the Metadata Table
  ------------------------------------------------------------*/
function showTipTable(tableIndex, reportObjId)
{
    var rows = tables[tableIndex].rows;
    var a = reportObjId - 1;

    if(rows.length != arrayMetadata[a].length)
	throw new Error("rows.length=" + rows.length+"  !=  arrayMetadata[array].length=" + arrayMetadata[a].length);

    for(i=0; i<rows.length; i++) 
 	rows[i].cells[1].innerHTML = arrayMetadata[a][i];
}

function hideTipTable(tableIndex)
{
    var rows = tables[tableIndex].rows;

    for(i=0; i<rows.length; i++) 
 	rows[i].cells[1].innerHTML = "";
}


/*------------------------------------------------------------
  From module 'name' (e.g. 'density'), find numeric index in the 
  'svgObjectNames' array.
  ------------------------------------------------------------*/
function getIndexFromName(name) 
{
    var i;
    for(i=0; i<svgObjectNames.length; i++)
        if(svgObjectNames[i] == name)
	    return i;

    throw new Error("Did not find '" + name + "'.");
}


/*------------------------------------------------------------
  SVG plot object callbacks
  ------------------------------------------------------------*/
function plotObjRespond(what, reportObjId, name)
{

    var a, i, status;

    switch(what) {
    case "show":
	i = getIndexFromName(name);
	showTipTable(i, reportObjId);
	break;
    case "hide":
	i = getIndexFromName(name);
	hideTipTable(i);
	break;
    case "click":
        a = reportObjId - 1;
	status = !checkboxes[a].checked;
	checkboxes[a].checked = status;
	setReportObj(reportObjId, status, true);
	break;
    default:
	throw new Error("Invalid 'what': "+what)
    }
}

/*------------------------------------------------------------
  checkboxes 'onchange' event
------------------------------------------------------------*/
function checkboxEvent(reportObjId)
{
    var a = reportObjId - 1;
    var status = checkboxes[a].checked;
    setReportObj(reportObjId, status, true);
}


/*------------------------------------------------------------
  toggle visibility
------------------------------------------------------------*/
function toggle(id){
  var head = safeGetElementById(id + "-h");
  var body = safeGetElementById(id + "-b");
  var hdtxt = head.innerHTML;
  var dsp;
  switch(body.style.display){
    case 'none':
      dsp = 'block';
      hdtxt = '-' + hdtxt.substr(1);
      break;
    case 'block':
      dsp = 'none';
      hdtxt = '+' + hdtxt.substr(1);
      break;
  }  
  body.style.display = dsp;
  head.innerHTML = hdtxt;
}
