import re

with open('FACIU-v6.36.7.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. SemVer increment: 6.36.7 -> 6.36.8
count_semver = text.count('6.36.7')
text = text.replace('6.36.7', '6.36.8')
print(f"SemVer atualizado em {count_semver} ocorrências para 6.36.8!")

# 2. CSS for #portOverlay to prevent overlap with active radial menu
old_css = """#portOverlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 25;
}"""

new_css = """#portOverlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 25;
}
/* Previne sobreposição das portas sobre o menu radial de contexto (v6.36.8) */
.tree-canvas-container:has(.cxtmenu > div[style*="display: block"]) #portOverlay {
  display: none !important;
  pointer-events: none !important;
}"""

if old_css in text:
    text = text.replace(old_css, new_css, 1)
    print("CSS de proteção do portOverlay inserido com sucesso!")
else:
    print("ERRO: old_css não encontrado!")

# 3. cy.cxtmenu configuration & cxttapstart/taphold listener
old_cxtmenu = """  if(typeof cy.cxtmenu === 'function'){
    cy.cxtmenu({
      selector: 'node',
      commands: [
        { content: 'Gerenciar', select: function(ele){ openNodeModal(ele.id()); } },
        { content: 'Excluir', select: function(ele){ quickDelete(ele.id()); } },
        { content: 'Ligar a...', select: function(ele){ startConnectingFrom(ele.id()); } },
        { content: 'Filho (+)', select: function(ele){ selectNode(ele.id()); const b = document.querySelector('button[onclick="addChild()"]'); if(b) b.click(); } },
        { content: 'Confirmar', select: function(ele){ const n = state.tree.nodes.find(x=>x.id===ele.id()); if(n){ n.estado = 'Confirmada'; cyFromState(); saveState(); } } }
      ]
    });
  }"""

new_cxtmenu = """  if(typeof cy.cxtmenu === 'function'){
    cy.cxtmenu({
      selector: 'node[kind != "gate"]',
      commands: [
        { content: 'Gerenciar', select: function(ele){ hidePorts(); openNodeModal(ele.id()); } },
        { content: 'Excluir', select: function(ele){ hidePorts(); quickDelete(ele.id()); } },
        { content: 'Ligar a...', select: function(ele){ startConnectingFrom(ele.id()); } },
        { content: 'Filho (+)', select: function(ele){ hidePorts(); selectNode(ele.id()); const b = document.querySelector('button[onclick="addChild()"]'); if(b) b.click(); } },
        { content: 'Confirmar', select: function(ele){ hidePorts(); const n = state.tree.nodes.find(x=>x.id===ele.id()); if(n){ n.estado = 'Confirmada'; cyFromState(); saveState(); } } }
      ]
    });
    // Ocultar imediatamente as portas ao acionar o menu radial (long-press ou botão direito)
    cy.on('cxttapstart taphold cxtmenu', 'node', function(){
      hidePorts();
    });
  }"""

if old_cxtmenu in text:
    text = text.replace(old_cxtmenu, new_cxtmenu, 1)
    print("cy.cxtmenu atualizado com hidePorts e listener cxttapstart com sucesso!")
else:
    print("ERRO: old_cxtmenu não encontrado!")

# 4. Remove initEdgeHandles() call in ensureCy()
old_call = """  initCanvasDrop();
  initEdgeHandles();
  cyFromState();"""

new_call = """  initCanvasDrop();
  // initEdgeHandles() desativado na v6.36.8 para eliminar quadrado cinza fantasma
  cyFromState();"""

if old_call in text:
    text = text.replace(old_call, new_call, 1)
    print("Chamada a initEdgeHandles() desativada com sucesso em ensureCy!")
else:
    print("ERRO: old_call não encontrado!")

# 5. Fix styleCy selector from node to node[disp] to prevent untyped node warnings
old_style_sel = "{selector:'node',style:{"
new_style_sel = "{selector:'node[disp]',style:{"

if old_style_sel in text:
    text = text.replace(old_style_sel, new_style_sel, 1)
    print("Seletor styleCy refinado para node[disp] com sucesso!")
else:
    print("ERRO: old_style_sel não encontrado!")

# 6. Update showPortsForNode and updatePortsPosition with isRadialMenuActive guard
old_show_ports = """function showPortsForNode(cyNode) {
  clearTimeout(hidePortsTimer);
  activeHoverNodeId = cyNode.id();
  updatePortsPosition(cyNode);
}

function updatePortsPosition(cyNode) {
  const overlay = document.getElementById('portOverlay');
  if (!overlay || !cyNode) return;
  overlay.innerHTML = '';"""

new_show_ports = """function isRadialMenuActive() {
  const cxt = document.querySelector('.cxtmenu');
  if (!cxt) return false;
  const child = cxt.firstElementChild;
  return !!(child && child.style.display !== 'none' && child.style.display !== '');
}

function showPortsForNode(cyNode) {
  if (isConnectingDrag || isRadialMenuActive()) return;
  clearTimeout(hidePortsTimer);
  activeHoverNodeId = cyNode.id();
  updatePortsPosition(cyNode);
}

function updatePortsPosition(cyNode) {
  if (isRadialMenuActive()) {
    hidePorts();
    return;
  }
  const overlay = document.getElementById('portOverlay');
  if (!overlay || !cyNode) return;
  overlay.innerHTML = '';"""

if old_show_ports in text:
    text = text.replace(old_show_ports, new_show_ports, 1)
    print("showPortsForNode e updatePortsPosition atualizados com guarda isRadialMenuActive com sucesso!")
else:
    print("ERRO: old_show_ports não encontrado!")

# 7. Safe stub for initEdgeHandles()
old_eh_def = """function initEdgeHandles(){
  if(!cy) return;
  if(typeof cy.edgehandles === 'function'){
    if(eh) { try { eh.destroy(); } catch(e){} }
    try {
      eh = cy.edgehandles({
        canConnect: function(sourceNode, targetNode){
          return sourceNode.id() !== targetNode.id();
        },
        edgeParams: function(sourceNode, targetNode){
          return { data: { source: sourceNode.id(), target: targetNode.id() } };
        },
        complete: function(sourceNode, targetNode, addedEles){
          if(addedEles) addedEles.remove();
          handleNewConnection(sourceNode.id(), targetNode.id());
        }
      });
    } catch(err) { /* edgehandles fallback silencioso */ }
  }
}"""

new_eh_def = """function initEdgeHandles(){
  // Desativado na v6.36.8: substituído pelo sistema de portas cardinais interativas (v6.22.0)
  // que elimina o nó cinza fantasma (quadrado cinza) e previne conflitos com o menu radial.
  if(eh) { try { eh.destroy(); } catch(e){} }
  eh = null;
}"""

if old_eh_def in text:
    text = text.replace(old_eh_def, new_eh_def, 1)
    print("initEdgeHandles substituído por stub seguro com sucesso!")
else:
    print("ERRO: old_eh_def não encontrado!")

with open('FACIU-v6.36.8.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("FACIU-v6.36.8.html gerado com sucesso!")
