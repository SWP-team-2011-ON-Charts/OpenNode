var panda = "happy";

describe('panda',function(){
  it('is happy',function(){
    expect(panda).toBe('happy');
  });
});

var id = '0',
name = 'OMS',
image = 'images/network-server.png',
info = 'OMS Status: running'

var node = Ext.create('GraphNode', {
    id: id,
    name : name,
    image: image,
    info: info,
    left: 64
});

describe('GraphNode initialization', function() {
  it('can store id field', function() {
    expect(node.get('id')).toEqual(id);
  });
  it('can store name field', function() {
    expect(node.get('name')).toEqual(name);
  });
  it('can store image field', function() {
    expect(node.get('image')).toEqual(image);
  });
  it('can store info field', function() {
    expect(node.get('info')).toEqual(info);
  });
});