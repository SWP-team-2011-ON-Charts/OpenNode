jasmine.Matchers.prototype.toThrow = function(expected) {
  var result = false;
  var exception;
  if (typeof this.actual != 'function') {
    throw new Error('Actual is not a function');
  }
  try {
    this.actual();
  } catch (e) {
    exception = e;
  }
  if (exception) {
      result = (expected === jasmine.undefined || this.env.equals_(exception.message || exception, expected.message || expected) || this.env.equals_(exception.name, expected));
  }

  var not = this.isNot ? "not " : "";

  this.message = function() {
    if (exception && (expected === jasmine.undefined || !this.env.equals_(exception.message || exception, expected.message || expected))) {
      return ["Expected function " + not + "to throw", expected ? expected.name || expected.message || expected : " an exception", ", but it threw", exception.name || exception.message || exception].join(' ');
    } else {
      return "Expected function to throw an exception.";
    }
  };

  return result;
};

var node, node2, graph;
var id = '0',
    name = 'OMS',
    image = 'images/network-server.png';

describe('Initialization', function() {
  it('can create GraphNode', function() {
    expect (function () {
        node = Ext.create('GraphNode', {
            params: { id: id, name : name }
        });
        node2 = Ext.create('GraphNode', {
            params: { id: '1', name : 'node 2' }
        });
    }).not.toThrow ("Ext.Error");
  });
  it('can create OpenNodeGraph', function() {
    expect (function () {
        graph = Ext.create('OpenNodeGraph', {
            renderTo: Ext.getBody(),
            width: 900,
            height: 600,
        });
    }).not.toThrow ("Ext.Error");
  });
});

describe('GraphNode tests', function() {
  it('can store id field', function() {
    expect(node.params.id).toEqual(id);
  });
  it('can store name field', function() {
    expect(node.getName()).toEqual(name);
  });
  it('can\'t add node to itself as child', function() {
    node.addChild(node);
    expect(node.children.length).toEqual(0);
  });
  it('can add child', function() {
    node2.addChild(node);
    expect(node2.children.length).toEqual(1);
  });
  it('can\'t add child twice', function() {
    node2.addChild(node);
    expect(node2.children.length).toEqual(1);
  });
  it('can\'t add parent node as a child', function() {
    node.addChild(node2);
    expect(node.children.length).toEqual(0);
  });
});

describe('OpenNodeGraph tests', function() {
  it('can add node', function() {
    expect(function() {
        graph.addNode(node);
    }).not.toThrow ("Ext.Error");
  });
});
