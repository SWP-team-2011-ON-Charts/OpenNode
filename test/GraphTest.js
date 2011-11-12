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

var node, graph;
var id = '0',
    name = 'OMS',
    image = 'images/network-server.png';

describe('Initialization', function() {
  it('can create GraphNode', function() {
    expect (function () {
        node = Ext.create('GraphNode', {
            params: { id: id, name : name }
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
});

describe('OpenNodeGraph tests', function() {
  it('can add node', function() {
    expect(function() {
        graph.addNode(node)
    }).not.toThrow ("Ext.Error");
  });
});
