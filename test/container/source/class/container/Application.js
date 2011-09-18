/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(container/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "container"
 */
qx.Class.define("container.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }


      var graph = new container.Graph();
      graph.set({ width: 200, height: 200 });
      //graph.set({ width : null, allowGrowX: true });

      var addComputeButton = new qx.ui.form.Button("Add VM", "container/list-add.png");

      // Add an event listener
      addComputeButton.addListener("execute", function(e) {
        var icon = new qx.ui.basic.Image("container/computer.png");
        graph.addItem(icon);
      });

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(addComputeButton, {left: 10, top: 10});
      doc.add(graph, {left: 10, top: 60});
    }
  }
});
