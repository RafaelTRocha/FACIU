import re

def build():
    with open('FACIU-v6.37.0.html', 'r', encoding='utf-8') as f:
        src = f.read()

    print(f"Original length: {len(src)}")

    # 1. Update Version strings
    src = src.replace('FACIU v6.37.0', 'FACIU v6.37.1')
    src = src.replace('APP_VERSION="6.37.0"', 'APP_VERSION="6.37.1"')
    src = src.replace("APP_VERSION = '6.37.0'", "APP_VERSION = '6.37.1'")
    src = src.replace('v<span class="appv">6.37.0</span>', 'v<span class="appv">6.37.1</span>')
    src = src.replace('class="start-version">v6.37.0<', 'class="start-version">v6.37.1<')
    src = src.replace('id="appVersionLabel">v6.37.0<', 'id="appVersionLabel">v6.37.1<')
    src = src.replace("? APP_VERSION : '6.37.0'", "? APP_VERSION : '6.37.1'")
    src = src.replace('Linear-App v6.37.0', 'Linear-App v6.37.1')

    # 2. Update styleCy()
    old_style_target = """    {selector:'edge[logic="OU"], edge[gate="OU"]',style:{
      'label':'OU',
      'color':'#FFFFFF',
      'text-background-color':'#4F46E5',
      'text-background-opacity':1,
      'text-background-padding':'3px',
      'text-background-shape':'round-rectangle',
      'font-size':9,
      'font-weight':700,
      'font-family':'"IBM Plex Sans", system-ui, sans-serif'
    }},
    {selector:'edge[logic="E"], edge[gate="E"]',style:{
      'label':'E',
      'color':'#FFFFFF',
      'text-background-color':'#059669',
      'text-background-opacity':1,
      'text-background-padding':'3px',
      'text-background-shape':'round-rectangle',
      'font-size':9,
      'font-weight':700,
      'font-family':'"IBM Plex Sans", system-ui, sans-serif'
    }},
    {selector:'edge[isActionEdge]',style:{
      'label':'',
      'line-style':'solid',
      'curve-style':'bezier'
    }},"""

    new_style_replacement = """    {selector:'edge[logic="OU"], edge[gate="OU"]',style:{
      'label':'',
      'font-size':8
    }},
    {selector:'edge[logic="E"], edge[gate="E"]',style:{
      'label':'',
      'font-size':8
    }},
    {selector:'edge[?isActionEdge]',style:{
      'label':'',
      'line-style':'solid',
      'curve-style':'bezier'
    }},
    {selector:'node[kind="gate_badge"]',style:{
      'shape':'round-rectangle','width':26,'height':16,'background-color':'#4F46E5','color':'#FFFFFF',
      'label':'data(label)','font-size':9,'font-weight':700,
      'font-family':'"IBM Plex Sans", system-ui, sans-serif','text-valign':'center','text-halign':'center',
      'border-width':1,'border-color':'#4338CA','z-index':100,'padding':'0px'
    }},
    {selector:'node[kind="gate_badge"][gateType="E"]',style:{
      'background-color':'#059669','border-color':'#047857'
    }},
    {selector:'node[kind="gate_badge"][gateType="OU"]',style:{
      'background-color':'#4F46E5','border-color':'#4338CA'
    }},"""

    if old_style_target in src:
        src = src.replace(old_style_target, new_style_replacement, 1)
        print("Updated styleCy() successfully!")
    else:
        print("WARNING: old_style_target not found in styleCy()!")

    # 3. Update cyFromState() to add gate_badge nodes
    old_cyfromstate_target = """    state.tree.edges.forEach(e => { const p = node(e.source); const tgt = node(e.target); const isAct = (p?.kind === 'acao' || tgt?.kind === 'acao'); const gVal = isAct ? '' : (e.gate || ''); const lVal = isAct ? '' : (e.logic || (e.gate ? e.gate : '')); els.push({ data: { id: e.id, source: e.source, target: e.target, gate: gVal, logic: lVal, isActionEdge: isAct, legacyInvalid: bad.has(e.id), fromDiscarded: p?.estado === 'Descartada', kind: e.kind || 'causal' } }) });
    cy.elements().remove();
    cy.add(els);"""

    new_cyfromstate_replacement = """    state.tree.edges.forEach(e => { const p = node(e.source); const tgt = node(e.target); const isAct = (p?.kind === 'acao' || tgt?.kind === 'acao'); const gVal = e.gate || ''; const lVal = e.logic || (e.gate ? e.gate : ''); els.push({ data: { id: e.id, source: e.source, target: e.target, gate: gVal, logic: lVal, isActionEdge: isAct, legacyInvalid: bad.has(e.id), fromDiscarded: p?.estado === 'Descartada', kind: e.kind || 'causal' } }) });
    // v6.37.1: Badge único de porta lógica (OU/E) posicionado no tronco do nó pai
    const parentGates = new Map();
    state.tree.edges.forEach(e => {
      if (e.kind === 'correlation') return;
      const p = node(e.source);
      if (p?.kind === 'acao') return;
      const logic = e.logic || e.gate || '';
      if (logic === 'OU' || logic === 'E') {
        if (!parentGates.has(e.source)) parentGates.set(e.source, logic);
      }
    });
    parentGates.forEach((logic, parentId) => {
      els.push({
        group: 'nodes',
        data: {
          id: '__gate_' + parentId,
          parentId: parentId,
          kind: 'gate_badge',
          label: logic,
          gateType: logic
        }
      });
    });
    cy.elements().remove();
    cy.add(els);"""

    if old_cyfromstate_target in src:
        src = src.replace(old_cyfromstate_target, new_cyfromstate_replacement, 1)
        print("Updated cyFromState() successfully!")
    else:
        print("WARNING: old_cyfromstate_target not found!")

    # 4. Update semanticLayout() pos calculation to position gate_badges
    old_layout_target = """  // Preserva coordenadas manuais a menos que seja reorganização forçada
  if (!force) {
    state.tree.nodes.forEach(n => {
      if (n.pos && typeof n.pos.x === 'number' && typeof n.pos.y === 'number') {
        pos[n.id] = { x: n.pos.x, y: n.pos.y };
      }
    });
  }"""

    new_layout_replacement = """  // Preserva coordenadas manuais a menos que seja reorganização forçada
  if (!force) {
    state.tree.nodes.forEach(n => {
      if (n.pos && typeof n.pos.x === 'number' && typeof n.pos.y === 'number') {
        pos[n.id] = { x: n.pos.x, y: n.pos.y };
      }
    });
  }

  // v6.37.1: Posicionamento automático das badges de portas lógicas logo abaixo de cada nó pai
  state.tree.edges.forEach(e => {
    const pId = e.source;
    const logic = e.logic || e.gate || '';
    if ((logic === 'OU' || logic === 'E') && pos[pId]) {
      const d = calcNodeDims(node(pId));
      pos['__gate_' + pId] = {
        x: pos[pId].x,
        y: pos[pId].y + Math.round(d.h / 2) + 12
      };
    }
  });"""

    if old_layout_target in src:
        src = src.replace(old_layout_target, new_layout_replacement, 1)
        print("Updated semanticLayout() successfully!")
    else:
        print("WARNING: old_layout_target not found!")

    # 5. In ensureCy(), update cxtmenu selector and add gate_badge interactions
    old_cxtmenu_target = """cy.cxtmenu({
      selector: 'node[kind != "gate"]',"""

    new_cxtmenu_replacement = """cy.cxtmenu({
      selector: 'node[kind != "gate"][kind != "gate_badge"]',"""

    if old_cxtmenu_target in src:
        src = src.replace(old_cxtmenu_target, new_cxtmenu_replacement, 1)
        print("Updated cxtmenu selector successfully!")
    else:
        print("WARNING: old_cxtmenu_target not found!")

    # Add tap-to-toggle on gate_badge in cy.on('tap','node'...)
    old_tap_node_target = """  cy.on('tap','node',e=>{
    const id=e.target.id();
    selectEdge(null);
    if(connectingSourceId){
      handleNewConnection(connectingSourceId, id);
      connectingSourceId = null;
      return;
    }
    if(e.target.data('kind')==='gate'){selectNode(id);return}"""

    new_tap_node_replacement = """  cy.on('tap','node',e=>{
    const id=e.target.id();
    selectEdge(null);
    if(connectingSourceId){
      handleNewConnection(connectingSourceId, id);
      connectingSourceId = null;
      return;
    }
    // v6.37.1: Clique na badge de porta lógica alterna entre [OU] e [E] diretamente
    if(e.target.data('kind')==='gate_badge'){
      const parentId = e.target.data('parentId');
      if (!parentId) return;
      const curLogic = e.target.data('gateType') || 'OU';
      const newLogic = (curLogic === 'OU') ? 'E' : 'OU';
      const edges = state.tree.edges.filter(edge => edge.source === parentId && edge.kind !== 'correlation');
      edges.forEach(edge => {
        edge.gate = newLogic;
        edge.logic = newLogic;
      });
      save();
      cyFromState();
      toast('Operador da ramificação alterado para [' + newLogic + '] (' + (newLogic === 'E' ? 'Causas combinadas simultâneas' : 'Hipóteses independentes / alternativas') + ').');
      return;
    }
    if(e.target.data('kind')==='gate'){selectNode(id);return}"""

    if old_tap_node_target in src:
        src = src.replace(old_tap_node_target, new_tap_node_replacement, 1)
        print("Updated cy.on tap node successfully!")
    else:
        print("WARNING: old_tap_node_target not found!")

    # Add position tracking on dragging parent nodes
    old_dragfree_target = """  cy.on('dragfree','node',e=>{"""

    new_dragfree_replacement = """  // v6.37.1: Sincronização do badge com o nó pai durante arrasto
  cy.on('position', 'node[kind != "gate_badge"]', function(evt){
    const p = evt.target;
    const gb = cy.getElementById('__gate_' + p.id());
    if(gb.length){
      const d = calcNodeDims(node(p.id()));
      gb.position({
        x: p.position('x'),
        y: p.position('y') + Math.round(d.h / 2) + 12
      });
    }
  });
  cy.on('dragfree','node',e=>{"""

    if old_dragfree_target in src:
        src = src.replace(old_dragfree_target, new_dragfree_replacement, 1)
        print("Updated dragfree / position tracking successfully!")
    else:
        print("WARNING: old_dragfree_target not found!")

    # Prevent cardinal ports on gate_badge hover
    old_ports_hover = """  cy.on('mouseover', 'node', function(evt) {
    if (isConnectingDrag || isAnyMenuOrDropdownActive()) {
      hidePorts();
      return;
    }
    showPortsForNode(evt.target);
  });"""

    new_ports_hover = """  cy.on('mouseover', 'node', function(evt) {
    if (evt.target.data('kind') === 'gate_badge') {
      hidePorts();
      return;
    }
    if (isConnectingDrag || isAnyMenuOrDropdownActive()) {
      hidePorts();
      return;
    }
    showPortsForNode(evt.target);
  });"""

    if old_ports_hover in src:
        src = src.replace(old_ports_hover, new_ports_hover, 1)
        print("Updated cardinal ports hover successfully!")
    else:
        print("WARNING: old_ports_hover not found!")

    # 6. In setSelectedEdgeLogic, update all sibling causal edges from that parent
    old_edge_logic_target = """function setSelectedEdgeLogic(logic){
  if(!selectedEdgeId) return;
  const edge = state.tree.edges.find(e => e.id === selectedEdgeId);
  if(!edge) return;
  edge.logic = logic || '';
  edge.gate = logic || '';
  save();
  cyFromState();
  selectEdge(selectedEdgeId);
  toast(logic ? ('Operador lógico [' + logic + '] aplicado à ligação.') : 'Operador lógico removido da ligação.');
}"""

    new_edge_logic_replacement = """function setSelectedEdgeLogic(logic){
  if(!selectedEdgeId) return;
  const edge = state.tree.edges.find(e => e.id === selectedEdgeId);
  if(!edge) return;
  const parentId = edge.source;
  const siblingEdges = state.tree.edges.filter(e => e.source === parentId && e.kind !== 'correlation');
  siblingEdges.forEach(e => {
    e.logic = logic || '';
    e.gate = logic || '';
  });
  save();
  cyFromState();
  selectEdge(selectedEdgeId);
  toast(logic ? ('Operador lógico [' + logic + '] aplicado à ramificação.') : 'Operador lógico removido da ramificação.');
}"""

    if old_edge_logic_target in src:
        src = src.replace(old_edge_logic_target, new_edge_logic_replacement, 1)
        print("Updated setSelectedEdgeLogic() successfully!")
    else:
        print("WARNING: old_edge_logic_target not found!")

    # Write FACIU-v6.37.1.html
    out_path = 'FACIU-v6.37.1.html'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(src)
    print(f"Generated {out_path} with size: {len(src)} bytes")

if __name__ == '__main__':
    build()
