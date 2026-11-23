import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import {
  getOrderUrgency,
  buildWhatsAppMessage,
  getWhatsAppShareUrl,
  buildEmailSummary,
  copyTextToClipboard,
} from '../../utils/orderAlerts';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  AlertTriangle,
  MessageCircle,
  Mail,
  Check,
  Clock,
  ExternalLink,
} from 'lucide-react';

const SendAlertModal = ({ order, isOpen, onClose }) => {
  const { preferences } = useApp();
  const { showToast } = useToast();
  const [previewMode, setPreviewMode] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [copied, setCopied] = useState(false);

  const urgency = useMemo(() => (order ? getOrderUrgency(order) : null), [order]);
  const whatsappText = useMemo(
    () => (order ? buildWhatsAppMessage(order, preferences) : ''),
    [order, preferences]
  );
  const whatsappUrl = useMemo(
    () => (order ? getWhatsAppShareUrl(order, preferences) : '#'),
    [order, preferences]
  );
  const emailText = useMemo(
    () => (order ? buildEmailSummary(order, preferences) : ''),
    [order, preferences]
  );

  const handleCopyEmail = async () => {
    const ok = await copyTextToClipboard(emailText);
    if (ok) {
      setCopied(true);
      showToast('Formatted email status update copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      showToast('Could not copy automatically. Please select and copy the preview text.', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && order && urgency && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle size={14} />
                  <span>Critical Milestone Alert</span>
                </div>
                <h3 className="text-lg font-bold text-[#1A3C5C] mt-0.5">
                  {order.poNumber} — {order.styleName}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Buyer: {order.buyerName} · Ship Date: {urgency.formattedShipDate}
                  {urgency.daysToShip !== null && (
                    <span className="font-semibold text-red-600">
                      {' '}
                      ({urgency.daysToShip < 0 ? `${Math.abs(urgency.daysToShip)}d overdue` : `${urgency.daysToShip}d left`})
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200/70 rounded-lg transition-colors"
                aria-label="Close alert modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Delayed Milestones Snapshot */}
              {urgency.overdueMilestones.length > 0 ? (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
                    {urgency.overdueMilestones.length} Delayed Milestone{urgency.overdueMilestones.length > 1 ? 's' : ''}
                  </p>
                  <ul className="space-y-1.5">
                    {urgency.overdueMilestones.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 text-xs text-red-700">
                        <span className="font-medium truncate">{m.name}</span>
                        <span className="font-mono font-bold whitespace-nowrap shrink-0 tabular-nums">
                          Due {m.formattedDate} ({m.delayDays}d late)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
                  <Clock size={15} className="shrink-0" />
                  <span>
                    Shipment is approaching ({urgency.daysToShip} days remaining). Share this status check with your factory or buyer team.
                  </span>
                </div>
              )}

              {/* Preview Switcher */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message Preview</span>
                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('whatsapp')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        previewMode === 'whatsapp'
                          ? 'bg-white text-[#1A3C5C] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('email')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        previewMode === 'email'
                          ? 'bg-white text-[#1A3C5C] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Email Summary
                    </button>
                  </div>
                </div>

                <pre className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 whitespace-pre-wrap break-words max-h-56 overflow-y-auto leading-relaxed">
                  {previewMode === 'whatsapp' ? whatsappText : emailText}
                </pre>
              </div>

              {/* 2 Zero-Backend Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => showToast('Opening WhatsApp with pre-filled alert...', 'info')}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1fb858] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  <MessageCircle size={17} />
                  <span>Share on WhatsApp</span>
                  <ExternalLink size={13} className="opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#1A3C5C] hover:bg-[#142d45] text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  {copied ? <Check size={17} className="text-emerald-300" /> : <Mail size={17} />}
                  <span>{copied ? 'Email Summary Copied' : 'Copy Email Summary'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SendAlertModal;
