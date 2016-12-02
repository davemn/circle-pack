const Mesh = require('../Mesh');

describe('Mesh class', function(){
  var m;
  
  beforeEach(function(){
    m = new Mesh();
  });
  
  it('increments vertex count when a vertex is added', function(){
    expect(m.vertexCount()).toBe(0);
    m.addVertex(0,0,true);
    expect(m.vertexCount()).toBe(1);
  });
  
  it('triangulates two vertices', function(){
    fail('NOT IMPLEMENTED');
  });
})