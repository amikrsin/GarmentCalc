import React, { useState } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  Paperclip, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Send,
  StickyNote,
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const ActivityTab = ({ order }) => {
  const { updateOrder, addComment, deleteComment, addDocument, deleteDocument } = useOrders();
  const { preferences, triggerSaveIndicator } = useApp();
  const [generalNote, setGeneralNote] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [newComment, setNewComment] = useState({});

  const milestones = order.tnaState?.milestones || [];

  const handleAddGeneralNote = () => {
    if (!generalNote.trim()) return;
    addComment(order.id, 'general', generalNote, preferences.userName);
    setGeneralNote('');
    triggerSaveIndicator();
  };

  const handleAddMilestoneComment = (milestoneId) => {
    const text = newComment[milestoneId];
    if (!text?.trim()) return;
    addComment(order.id, milestoneId, text, preferences.userName);
    setNewComment({ ...newComment, [milestoneId]: '' });
    triggerSaveIndicator();
  };

  const handleFileUpload = async (e, milestoneId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('File too large. Max 500KB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileInfo = {
        name: file.name,
        type: file.type,
        sizeKB: Math.round(file.size / 1024),
        data: event.target.result
      };
      addDocument(order.id, milestoneId, fileInfo, preferences.userName);
    };
    reader.readAsDataURL(file);
  };

  const toggleMilestone = (id) => {
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getPartyEmoji = (party) => {
    switch (party) {
      case 'Factory': return '🏭';
      case 'Buyer': return '👔';
      case 'Lab': return '🧪';
      case 'Freight': return '🚢';
      case 'Internal': return '🏠';
      default: return '🏠';
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Transition Audit Log Trail */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#E8622A] shadow-sm">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Audit Log & Status Changes</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Complete historical trial of pipeline state transitions</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {(!order.statusLog || order.statusLog.length === 0) ? (
            <p className="text-xs text-gray-400 italic text-center">No status audit entries available yet.</p>
          ) : (
            <div className="relative border-l border-gray-200 pl-6 ml-2 space-y-6">
              {order.statusLog.map((log) => (
                <div key={log.id} className="relative">
                  {/* Bullet */}
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#E8622A] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E8622A]" />
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black uppercase tracking-wider border border-gray-150">{log.from}</span>
                      <span className="text-gray-300 text-xs">➔</span>
                      <span className="px-1.5 py-0.5 bg-[#E8622A]/10 text-[#E8622A] rounded text-[9px] font-black uppercase tracking-wider border border-[#E8622A]/20">{log.to}</span>
                      <span className="text-gray-400 text-xs font-semibold">by {log.changedBy}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{format(new Date(log.changedAt), 'dd MMM yyyy, p')}</span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-gray-650 mt-1 pl-1 italic font-medium">"{log.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* General Notes */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm">
              <StickyNote size={18} />
            </div>
            <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">General Order Notes</h3>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-3">
            <textarea
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder="Write a general note about this order..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all resize-none h-24"
            />
            <button 
              onClick={handleAddGeneralNote}
              disabled={!generalNote.trim()}
              className="px-6 bg-[#1A3C5C] text-white rounded-2xl font-bold text-sm hover:bg-[#142d45] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span className="text-[10px] uppercase tracking-widest">Add Note</span>
            </button>
          </div>

          <div className="space-y-4">
            {order.comments?.filter(c => c.milestoneId === 'general').map(comment => (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#1A3C5C] text-[10px] font-bold border border-gray-100">
                      {comment.authorName?.[0]}
                    </div>
                    <span className="text-[10px] font-bold text-[#1A3C5C] uppercase tracking-widest">{comment.authorName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{format(new Date(comment.timestamp), 'dd MMM, p')}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                <button 
                  onClick={() => deleteComment(order.id, comment.id)}
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestone Activity */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider ml-2">Milestone Activity</h3>
        
        {milestones.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto">
              <Clock size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No TNA created yet</p>
              <p className="text-xs text-gray-300 mt-1">Create a TNA first to see milestone activity sections.</p>
            </div>
          </div>
        ) : (
          milestones.map((milestone) => {
            const isExpanded = expandedMilestones[milestone.id];
            const milestoneDocs = order.documents?.filter(d => d.milestoneId === milestone.id) || [];
            const milestoneComments = order.comments?.filter(c => c.milestoneId === milestone.id) || [];
            
            const statusColors = {
              'on-track': 'text-blue-500 bg-blue-50',
              'at-risk': 'text-orange-500 bg-orange-50',
              'overdue': 'text-red-500 bg-red-50',
              'complete': 'text-green-500 bg-green-50',
            };

            return (
              <div key={milestone.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleMilestone(milestone.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{getPartyEmoji(milestone.responsibleParty || 'Internal')}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1A3C5C]">{milestone.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColors[milestone.status]}`}>
                          {milestone.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target: {format(new Date(milestone.date), 'dd MMM')}</p>
                        {(milestoneDocs.length > 0 || milestoneComments.length > 0) && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#E8622A] uppercase tracking-widest">
                            {milestoneComments.length > 0 && <span>{milestoneComments.length} notes</span>}
                            {milestoneDocs.length > 0 && <span>{milestoneDocs.length} docs</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-300">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-gray-50"
                    >
                      <div className="p-6 space-y-8">
                        {/* Milestone Docs */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Paperclip size={12} />
                              Documents ({milestoneDocs.length})
                            </h5>
                            <label className="text-[10px] font-bold text-[#1A3C5C] hover:underline cursor-pointer">
                              + Attach Document
                              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, milestone.id)} />
                            </label>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {milestoneDocs.map(doc => (
                              <div key={doc.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm flex-shrink-0">
                                    <Paperclip size={14} />
                                  </div>
                                  <div className="overflow-hidden">
                                    <p className="text-[11px] font-bold text-[#1A3C5C] truncate">{doc.name}</p>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{doc.sizeKB}KB · {format(new Date(doc.uploadedAt), 'dd MMM')}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      const win = window.open();
                                      if (doc.type.startsWith('image/')) {
                                        win.document.write(`<img src="${doc.data}" />`);
                                      } else {
                                        win.document.write(`<iframe src="${doc.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                                      }
                                    }}
                                    className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-[#1A3C5C]"
                                  >
                                    <ExternalLink size={12} />
                                  </button>
                                  <button 
                                    onClick={() => deleteDocument(order.id, doc.id)}
                                    className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Milestone Comments */}
                        <div className="space-y-4">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MessageSquare size={12} />
                            Comments ({milestoneComments.length})
                          </h5>
                          
                          <div className="space-y-4">
                            {milestoneComments.map(comment => (
                              <div key={comment.id} className="flex gap-3 group">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#1A3C5C] text-[10px] font-bold flex-shrink-0">
                                  {comment.authorName?.[0]}
                                </div>
                                <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none relative">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-[#1A3C5C] uppercase tracking-widest">{comment.authorName}</span>
                                    <span className="text-[9px] font-bold text-gray-400">{format(new Date(comment.timestamp), 'dd MMM, p')}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{comment.text}</p>
                                  <button 
                                    onClick={() => deleteComment(order.id, comment.id)}
                                    className="absolute -right-8 top-0 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={newComment[milestone.id] || ''}
                              onChange={(e) => setNewComment({ ...newComment, [milestone.id]: e.target.value })}
                              placeholder="Write a comment..."
                              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#1A3C5C]/10 outline-none transition-all"
                              onKeyDown={(e) => e.key === 'Enter' && handleAddMilestoneComment(milestone.id)}
                            />
                            <button 
                              onClick={() => handleAddMilestoneComment(milestone.id)}
                              disabled={!newComment[milestone.id]?.trim()}
                              className="p-2 bg-[#1A3C5C] text-white rounded-xl hover:bg-[#142d45] transition-all disabled:opacity-50"
                            >
                              <Send size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityTab;
