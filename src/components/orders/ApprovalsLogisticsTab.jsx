import React, { useState } from 'react';
import { useOrders } from '../../context/OrdersContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { 
  CheckSquare, 
  Truck, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Paperclip, 
  ExternalLink,
  Info,
  DollarSign,
  Package,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

const ApprovalsLogisticsTab = ({ order }) => {
  const { updateOrder, addDocument, deleteDocument } = useOrders();
  const { preferences, triggerSaveIndicator } = useApp();
  const { showToast } = useToast();
  const [editingApprovalId, setEditingApprovalId] = useState(null);

  // For approval notes/dates temporary editing state
  const [approvalDrafts, setApprovalDrafts] = useState({});

  const approvals = order.approvals || [];
  const documents = order.documents || [];

  const handleUpdateApproval = (approvalId, updatedFields) => {
    const updatedApprovals = approvals.map(app => 
      app.id === approvalId ? { ...app, ...updatedFields } : app
    );
    updateOrder(order.id, { approvals: updatedApprovals });
    triggerSaveIndicator();
    showToast('Approval updated ✓', 'success');
  };

  const handleFieldChange = (field, value) => {
    updateOrder(order.id, { [field]: value });
    triggerSaveIndicator();
  };

  const handleApprovalFileUpload = async (e, approvalId) => {
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
        data: event.target.result,
        category: `approval-${approvalId}`
      };
      
      // We upload doc referencing 'approval' milestoneId
      addDocument(order.id, `approval-${approvalId}`, fileInfo, preferences.userName);
      showToast('Document attached to approval item', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleShipmentFileUpload = async (e, category) => {
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
        data: event.target.result,
        category: `shipment-${category}`
      };
      addDocument(order.id, `shipment-${category}`, fileInfo, preferences.userName);
      showToast('Shipment document uploaded', 'success');
    };
    reader.readAsDataURL(file);
  };

  const statusTags = {
    'PENDING': 'bg-gray-100 text-gray-700 border-gray-200',
    'SUBMITTED': 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse',
    'APPROVED': 'bg-green-50 text-green-700 border-green-100',
    'REJECTED': 'bg-red-50 text-red-700 border-red-100'
  };

  return (
    <div className="space-y-8">
      
      {/* Dynamic Notifications Alerts Box for logistics */}
      {(order.status === 'QC' || order.status === 'PACKING' || order.status === 'SHIPPED') && (
        <div className="p-4 bg-[#E8622A]/5 border border-[#E8622A]/20 text-[#E8622A] rounded-3xl flex items-start gap-3">
          <Info size={18} className="mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold uppercase tracking-wide mr-1">Shipper Logistics Mode Active:</span>
            Please maintain accurate Bill of Lading, Carrier names, and container metrics for customer export documents dispatch.
          </div>
        </div>
      )}

      {/* Grid: Approvals List & Quick Status updates */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#E8622A] shadow-sm">
              <CheckSquare size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Garment Approvals Tracking</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Track Proto, Lab Dips, PP and bulk garment approvals</p>
            </div>
          </div>
        </div>

        <div className="p-6 divide-y divide-gray-100">
          {approvals.map((app) => {
            const appDocs = documents.filter(d => d.milestoneId === `approval-${app.id}`);
            const isEditing = editingApprovalId === app.id;
            const draft = approvalDrafts[app.id] || { 
              submissionDate: app.submissionDate || '', 
              approvalDate: app.approvalDate || '', 
              notes: app.notes || '' 
            };

            return (
              <div key={app.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Title and statuses */}
                  <div className="space-y-2 max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[#1A3C5C] leading-none">{app.name}</span>
                      <span className={`px-2 py-0.5 border text-[9px] font-black rounded-full uppercase tracking-wider ${statusTags[app.status]}`}>
                        {app.status}
                      </span>
                    </div>
                    {app.notes ? (
                      <p className="text-xs text-gray-500 font-medium italic">"{app.notes}"</p>
                    ) : (
                      <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">No comments/notes entered</p>
                    )}
                    
                    {/* Dates metrics */}
                    <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {app.submissionDate && <span>Submitted: {format(new Date(app.submissionDate), 'dd MMM yyyy')}</span>}
                      {app.approvalDate && <span>Approved: {format(new Date(app.approvalDate), 'dd MMM yyyy')}</span>}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status selection slider */}
                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 gap-1">
                      {['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => handleUpdateApproval(app.id, { status: st })}
                          className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all ${
                            app.status === st 
                              ? st === 'APPROVED' ? 'bg-green-500 text-white' : st === 'REJECTED' ? 'bg-red-500 text-white' : st === 'SUBMITTED' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {/* Editor Trigger Button */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          handleUpdateApproval(app.id, draft);
                          setEditingApprovalId(null);
                        } else {
                          setEditingApprovalId(app.id);
                          setApprovalDrafts({
                            ...approvalDrafts,
                            [app.id]: { 
                              submissionDate: app.submissionDate || '', 
                              approvalDate: app.approvalDate || '', 
                              notes: app.notes || '' 
                            }
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#1A3C5C] border border-gray-200 rounded-xl text-xs font-bold transition-all"
                    >
                      {isEditing ? 'Save Details' : 'Edit Details'}
                    </button>

                    {/* File Attachment input */}
                    <label className="p-1.5 bg-gray-50 hover:bg-[#E8622A]/10 hover:text-[#E8622A] text-gray-400 border border-gray-200 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold">
                      <Upload size={14} />
                      <span>Attach File</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => handleApprovalFileUpload(e, app.id)} 
                        accept=".jpg,.png,.pdf,.docx" 
                      />
                    </label>
                  </div>
                </div>

                {/* Inline Editing Form */}
                {isEditing && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gray-5/50 border border-gray-100 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Submission Date</label>
                      <input 
                        type="date" 
                        value={draft.submissionDate} 
                        onChange={(e) => setApprovalDrafts({
                          ...approvalDrafts,
                          [app.id]: { ...draft, submissionDate: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-150 rounded-lg text-xs font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Resolution/Approval Date</label>
                      <input 
                        type="date" 
                        value={draft.approvalDate} 
                        onChange={(e) => setApprovalDrafts({
                          ...approvalDrafts,
                          [app.id]: { ...draft, approvalDate: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-150 rounded-lg text-xs font-medium outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Approval Notes / Comments</label>
                      <input 
                        type="text" 
                        placeholder="Resolution comments or next actions..."
                        value={draft.notes} 
                        onChange={(e) => setApprovalDrafts({
                          ...approvalDrafts,
                          [app.id]: { ...draft, notes: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-150 rounded-lg text-xs font-medium outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Embedded checkpoint files list */}
                {appDocs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pl-2 border-l-2 border-dashed border-gray-100">
                    {appDocs.map(doc => (
                      <div key={doc.id} className="px-3 py-1.5 bg-gray-50 rounded-xl flex items-center gap-2 group border border-gray-100">
                        <Paperclip size={10} className="text-gray-400" />
                        <span className="text-[10px] font-bold text-gray-650 truncate max-w-[120px]">{doc.name}</span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              const win = window.open();
                              win.document.write(`<iframe src="${doc.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                            }}
                            className="p-0.5 hover:bg-white rounded text-gray-400 hover:text-[#1A3C5C]"
                            title="View Document"
                          >
                            <ExternalLink size={10} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this file?')) deleteDocument(order.id, doc.id);
                            }}
                            className="p-0.5 hover:bg-white rounded text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Logistics Data Entry & Critical Shipment Docs */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Logistics Shipping Data Fields */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Logistics & Shipping Tracker</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logistics carrier values, containers, dates tracking</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Carrier / Shipping Line</label>
                <input 
                  type="text" 
                  value={order.carrierName || ''} 
                  onChange={(e) => handleFieldChange('carrierName', e.target.value)}
                  placeholder="e.g. MSC, Maersk, DHL Air"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Bill of Lading (B/L) / AWB</label>
                <input 
                  type="text" 
                  value={order.blNumber || ''} 
                  onChange={(e) => handleFieldChange('blNumber', e.target.value)}
                  placeholder="e.g. BL982342981"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Container Identification No.</label>
                <input 
                  type="text" 
                  value={order.containerNo || ''} 
                  onChange={(e) => handleFieldChange('containerNo', e.target.value)}
                  placeholder="e.g. MSCU7823412"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Customs Seal Number</label>
                <input 
                  type="text" 
                  value={order.sealNo || ''} 
                  onChange={(e) => handleFieldChange('sealNo', e.target.value)}
                  placeholder="e.g. SL-8923412"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Commercial Invoice Ref</label>
                <input 
                  type="text" 
                  value={order.commercialInvoiceNo || ''} 
                  onChange={(e) => handleFieldChange('commercialInvoiceNo', e.target.value)}
                  placeholder="e.g. CI-45212-98"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Actual Shipment Date</label>
                <input 
                  type="date" 
                  value={order.actualShipDate || ''} 
                  onChange={(e) => handleFieldChange('actualShipDate', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Est. Departure (ETD)</label>
                <input 
                  type="date" 
                  value={order.estimatedDeparture || ''} 
                  onChange={(e) => handleFieldChange('estimatedDeparture', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Est. Arrival (ETA)</label>
                <input 
                  type="date" 
                  value={order.estimatedArrival || ''} 
                  onChange={(e) => handleFieldChange('estimatedArrival', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-[#1A3C5C]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Tracking status update interval: Auto</span>
            <span className="text-[10px] font-bold uppercase text-[#E8622A] tracking-wider flex items-center gap-1">
              <Activity size={12} />
              Sailing Tracker Enabled
            </span>
          </div>
        </div>

        {/* Shipment Documents Portal */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1A3C5C] shadow-sm">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1A3C5C] uppercase tracking-wider">Export Shipment Docs</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Commercial Invoices, custom clearances, bill of lading</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Document upload categories boxes */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'packing-list', name: 'Packing List File', fileId: 'doc-pk-list' },
                  { id: 'inv', name: 'Commercial Invoice File', fileId: 'doc-inv' },
                  { id: 'bl-file', name: 'Bill of Lading File', fileId: 'doc-bl' },
                  { id: 'customs-doc', name: 'Customs clearance docs', fileId: 'doc-customs' },
                ].map(item => {
                  const relatedDoc = documents.find(d => d.milestoneId === `shipment-${item.id}`);

                  return (
                    <div key={item.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between h-28">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-bold text-[#1A3C5C] uppercase tracking-wider">{item.name}</span>
                        {relatedDoc ? (
                          <span className="bg-green-100 text-green-700 text-[8px] font-black rounded-full px-1.5 py-0.5">UPLOADED</span>
                        ) : (
                          <span className="bg-orange-100 text-orange-700 text-[8px] font-black rounded-full px-1.5 py-0.5">MISSING</span>
                        )}
                      </div>

                      {relatedDoc ? (
                        <div className="flex items-center justify-between text-xs pt-2">
                          <span className="truncate max-w-[120px] text-[10px] text-gray-500 font-bold">{relatedDoc.name}</span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => {
                                const win = window.open();
                                win.document.write(`<iframe src="${relatedDoc.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              }}
                              className="p-1 hover:bg-white rounded text-gray-500 hover:text-[#1A3C5C]"
                            >
                              <ExternalLink size={12} />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Delete shipment document?')) deleteDocument(order.id, relatedDoc.id);
                              }}
                              className="p-1 hover:bg-white rounded text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="text-[10px] font-black text-center border-2 border-dashed border-gray-200 hover:border-[#1A3C5C]/20 hover:text-[#1A3C5C] text-gray-400 rounded-xl py-2 cursor-pointer transition-all">
                          Upload Document
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleShipmentFileUpload(e, item.id)}
                            accept=".jpg,.png,.pdf,.docx,.xlsx"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Package size={14} className="text-[#E8622A]" />
            Strictly maintains multi-agency shipment credentials
          </div>
        </div>

      </div>

    </div>
  );
};

export default ApprovalsLogisticsTab;
