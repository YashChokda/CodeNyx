import { useState, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '../context/AppContext';
import { getEcosystemNode } from '../api/gemini';

const nodeDefinitions = [
  // Government
  { id: 'gov1', label: 'Local Municipal Office', emoji: '🏛️', group: 'Government', x: 100, y: 50, condition: (s) => s.government > 50 },
  { id: 'gov2', label: 'District Collector Office', emoji: '🏛️', group: 'Government', x: 100, y: 180, condition: (s) => s.government > 70 },
  { id: 'gov3', label: 'Ministry of Social Justice', emoji: '🏛️', group: 'Government', x: 100, y: 310, condition: (s) => s.government > 85 },
  // Community
  { id: 'com1', label: 'Local Youth Network', emoji: '🏘️', group: 'Community', x: 450, y: 50, condition: (s) => s.community > 40 },
  { id: 'com2', label: "Women's Self Help Group", emoji: '🏘️', group: 'Community', x: 450, y: 180, condition: (s) => s.community > 60 },
  { id: 'com3', label: 'Village Panchayat', emoji: '🏘️', group: 'Community', x: 450, y: 310, condition: (s) => s.community > 75 },
  // Corporate
  { id: 'corp1', label: 'CSR Fund Access', emoji: '💼', group: 'Corporate', x: 800, y: 50, condition: (s) => s.partnerships > 50 },
  { id: 'corp2', label: 'Tech Company Collaboration', emoji: '💼', group: 'Corporate', x: 800, y: 180, condition: (s) => s.partnerships > 65 },
  { id: 'corp3', label: 'Impact Investor Network', emoji: '💼', group: 'Corporate', x: 800, y: 310, condition: (s) => s.partnerships > 80 },
  // NGO
  { id: 'ngo1', label: 'Local Grassroots NGO', emoji: '🤝', group: 'NGO Allies', x: 250, y: 450, condition: (s) => s.community > 45 },
  { id: 'ngo2', label: 'National NGO Federation', emoji: '🤝', group: 'NGO Allies', x: 600, y: 450, condition: (s) => s.partnerships > 70 },
  // Funding
  { id: 'fund1', label: 'Government Grant Portal', emoji: '💰', group: 'Funding', x: 350, y: 570, condition: (s) => s.finance > 50 && s.government > 50 },
  { id: 'fund2', label: 'International Foundation', emoji: '💰', group: 'Funding', x: 650, y: 570, condition: (s) => s.finance > 75 },
];

const edgeList = [
  ['gov1', 'gov2'], ['gov2', 'gov3'], ['com1', 'com2'], ['com2', 'com3'],
  ['corp1', 'corp2'], ['corp2', 'corp3'], ['gov1', 'com1'], ['com1', 'ngo1'],
  ['corp1', 'ngo2'], ['ngo1', 'fund1'], ['ngo2', 'fund2'], ['gov3', 'fund1'],
  ['corp3', 'fund2'], ['com3', 'ngo1'],
];

export default function EcosystemMap() {
  const { rippleScores, domain, problem } = useApp();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeInfo, setNodeInfo] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const scores = rippleScores || { community: 0, finance: 0, government: 0, partnerships: 0 };

  const unlocked = useMemo(() => nodeDefinitions.filter(n => n.condition(scores)).map(n => n.id), [scores]);
  const unlockedCount = unlocked.length;

  const nodes = useMemo(() => nodeDefinitions.map(nd => ({
    id: nd.id,
    position: { x: nd.x, y: nd.y },
    data: { label: nd.label, emoji: nd.emoji, group: nd.group, isUnlocked: unlocked.includes(nd.id) },
    type: 'default',
    style: {
      background: unlocked.includes(nd.id) ? '#1a1a2e' : '#111122',
      border: unlocked.includes(nd.id) ? '2px solid #ffb347' : '2px solid #2a2a3e',
      borderRadius: 12,
      padding: '12px 16px',
      color: unlocked.includes(nd.id) ? '#ffb347' : '#555',
      fontSize: 12,
      fontWeight: 600,
      boxShadow: unlocked.includes(nd.id) ? '0 0 15px rgba(255,179,71,0.3)' : 'none',
      opacity: unlocked.includes(nd.id) ? 1 : 0.5,
      filter: unlocked.includes(nd.id) ? 'none' : 'blur(0.5px)',
      cursor: unlocked.includes(nd.id) ? 'pointer' : 'default',
      minWidth: 180,
      textAlign: 'center',
    },
    sourcePosition: 'right',
    targetPosition: 'left',
  })), [unlocked]);

  const edges = useMemo(() => edgeList.map(([s, t], i) => ({
    id: `e-${i}`, source: s, target: t,
    style: { stroke: unlocked.includes(s) && unlocked.includes(t) ? '#ffb34766' : '#2a2a3e', strokeWidth: 1.5 },
    animated: unlocked.includes(s) && unlocked.includes(t),
  })), [unlocked]);

  const onNodeClick = useCallback(async (_, node) => {
    if (!node.data.isUnlocked) return;
    setSelectedNode(node);
    setInfoLoading(true);
    setNodeInfo('');
    try {
      const data = await getEcosystemNode({ domain, problem, nodeName: node.data.label });
      setNodeInfo(data.info);
    } catch (e) { setNodeInfo('Unable to load info. Try again.'); }
    setInfoLoading(false);
  }, [domain, problem]);

  const getMessage = () => {
    if (unlockedCount < 5) return "Your ecosystem is just getting started. Refine your decisions to unlock more allies.";
    if (unlockedCount < 10) return "You're building a solid network. Keep strengthening your weakest dimension.";
    return "Impressive ecosystem! You're ready for real-world impact.";
  };

  // Update node labels to include emoji and lock icon
  const displayNodes = nodes.map(n => ({
    ...n,
    data: {
      ...n.data,
      label: `${n.data.emoji} ${n.data.label} ${n.data.isUnlocked ? '✅' : '🔒'}`,
    }
  }));

  return (
    <div className="h-screen flex flex-col">
      <div className="px-4 py-3 bg-dark/90 border-b border-dark-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl text-amber-400">Your Ecosystem</h1>
            <p className="text-xs text-gray-400 mt-0.5">{getMessage()}</p>
          </div>
          <span className="text-sm text-amber-400 font-bold bg-amber-400/10 px-3 py-1 rounded-full">
            {unlockedCount} of 13 unlocked
          </span>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow nodes={displayNodes} edges={edges} onNodeClick={onNodeClick}
          fitView fitViewOptions={{ padding: 0.3 }}
          style={{ background: '#0d0d1a' }}
          proOptions={{ hideAttribution: true }}>
          <Background color="#1a1a2e" gap={20} />
          <Controls style={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8 }} />
          <MiniMap style={{ background: '#0d0d1a', border: '1px solid #2a2a3e' }}
            nodeColor={n => n.data?.isUnlocked ? '#ffb347' : '#2a2a3e'} />
        </ReactFlow>

        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 glass-card animate-fade-in z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-amber-400 text-base">{selectedNode.data.emoji} {selectedNode.data.label.replace(/[✅🔒]/g, '').trim()}</h3>
              <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-amber-400 text-lg">✕</button>
            </div>
            <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">{selectedNode.data.group}</span>
            <div className="mt-3">
              {infoLoading ? (
                <p className="text-sm text-amber-400/60 animate-pulse">Loading insights...</p>
              ) : (
                <p className="text-sm text-gray-300 leading-relaxed">{nodeInfo}</p>
              )}
            </div>
            <button className="mt-4 w-full px-4 py-2 rounded-lg border border-amber-400/30 text-amber-400 text-sm hover:bg-amber-400/10 transition-all">
              Simulate Partnership
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
