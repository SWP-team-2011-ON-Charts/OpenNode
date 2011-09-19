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
    
    this.addListener("mousedown", this._onMouseDown);
    this.addListener("mouseup", this._onMouseUp);
    this.addListener("mousemove", this._onMouseMove);
  },

  members :
  {
    __grapharea : null,
    __posleft : 0,
    __ispanning : false,
    __pananchor : {left : null, top : null},
  
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
    
    _onMouseDown : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      e.stopPropagation();

      this.__ispanning = true;
      this.__pananchor = {
        left : e._native.clientX - this.__layoutProperties.left,
        top : e._native.clientY - this.__layoutProperties.top}
      this.__grapharea.setCursor("help");
    },
    
    _onMouseUp : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      e.stopPropagation();

      this.__ispanning = false;
      this.__grapharea.setCursor("move");
    },
    
    _onMouseMove : function(e)
    {
      if (!e.isLeftPressed()) {
        return;
      }

      if (this.__ispanning)
      {
        e.stopPropagation();
        
        var currentpos = {
        left : e._native.clientX - this.__layoutProperties.left,
        top : e._native.clientY - this.__layoutProperties.top}
        
        //this.scrollToX(this.getScrollX() - (this.__pananchor.left - currentpos.left));
        this.scrollToX((this.__pananchor.left - currentpos.left));
        this.__grapharea.setCursor("help");
      }
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
