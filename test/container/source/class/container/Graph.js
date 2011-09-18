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
qx.Class.define("container.Graph",
{
  extend : qx.ui.container.Scroll,



  construct : function()
  {
    this.base(arguments);

    this.__grapharea = this._createChildControl("grapharea");
    this.__grapharea.setCursor("move");
  },

  members :
  {
    __grapharea : null,
    __posleft : 0,
  
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "grapharea":
          control = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
          this.add(control);
          break;
      }

      return control || this.base(arguments, id);
    },
    
    addItem : function(widget)
    {
      widget.setCursor("pointer");

      this.__grapharea.add((widget).set({
        allowShrinkY : false,
        allowShrinkX : false
      }), {left: this.__posleft, top: 0});

      this.__posleft = this.__posleft + 70;
    }
  }
});
