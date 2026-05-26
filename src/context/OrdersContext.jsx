import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '../utils/storage';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within an OrdersProvider');
  return context;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeBuyer, setActiveBuyer] = useState('All Buyers');
  const [sortBy, setSortBy] = useState('Ship Date ↑');
  const [searchQuery, setSearchQuery] = useState('');

  // Load orders on mount
  useEffect(() => {
    const savedOrders = loadFromStorage('garmentcalc_orders');
    if (savedOrders) {
      setOrders(savedOrders);
    }
  }, []);

  // Save orders on change
  useEffect(() => {
    saveToStorage('garmentcalc_orders', orders);
  }, [orders]);

  const createOrder = (basicInfo) => {
    const newOrder = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      status: basicInfo.initialStatus || 'ENQUIRY',
      
      // Buyer
      buyerName: basicInfo.buyerName,
      buyerContact: '',
      buyerEmail: '',
      buyerPhone: '',
      poNumber: basicInfo.styleName, // Using styleName as initial PO
      poDate: new Date().toISOString().split('T')[0],

      // Style
      styleName: basicInfo.styleName,
      category: basicInfo.category,
      styleDescription: '',
      season: basicInfo.season || '',
      orderType: basicInfo.orderType || 'FOB',
      fabricComposition: '',
      fabricDescription: '',

      // Quantities
      orderQty: parseInt(basicInfo.orderQty) || 0,
      sizeBreakdown: [
        { id: crypto.randomUUID(), name: 'S', qty: 0 },
        { id: crypto.randomUUID(), name: 'M', qty: 0 },
        { id: crypto.randomUUID(), name: 'L', qty: 0 }
      ],
      colours: '',

      // Pricing
      fobPrice: 0,
      totalFOBValue: 0,
      currency: 'USD',
      exchangeRate: 84.50,

      // Shipping
      shipDate: basicInfo.shipDate,
      shipmentMode: basicInfo.shipmentMode || 'Sea FCL',
      portOfLoading: 'Nhava Sheva',
      destinationCountry: basicInfo.destinationCountry || '',
      destinationPort: '',

      // Factory
      factoryName: '',
      factoryContact: '',
      factoryPhone: '',
      factoryLocation: '',
      factoryType: 'FOB',

      // Linked module states
      costingState: null,
      tnaState: null,

      // Logistics details
      carrierName: '',
      blNumber: '',
      containerNo: '',
      sealNo: '',
      commercialInvoiceNo: '',
      estimatedDeparture: basicInfo.estimatedDeparture || '',
      estimatedArrival: basicInfo.estimatedArrival || '',
      actualShipDate: '',

      // Approvals Checklist
      approvals: [
        { id: 'lab-dip', name: 'Lab Dip Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
        { id: 'fit-sample', name: 'Fit Sample Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
        { id: 'size-set', name: 'Size Set Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
        { id: 'pp-sample', name: 'PP (Pre-Production) Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
        { id: 'top-sample', name: 'TOP (production) Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
        { id: 'carton-sample', name: 'Carton/Packing Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
      ],

      // Activity
      comments: [],
      documents: [],
      generalNotes: '',
      statusLog: [
        {
          id: crypto.randomUUID(),
          from: 'INITIALIZED',
          to: basicInfo.initialStatus || 'ENQUIRY',
          changedAt: new Date().toISOString(),
          changedBy: 'System',
          notes: 'Order initiated on dashboard.'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrder = (id, changes, authorName = 'User') => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const extra = {};
        if (changes.status && changes.status !== order.status) {
          const logEntry = {
            id: crypto.randomUUID(),
            from: order.status,
            to: changes.status,
            changedAt: new Date().toISOString(),
            changedBy: authorName,
            notes: changes.statusNotes || `Changed stage status to ${changes.status}`
          };
          extra.statusLog = [logEntry, ...(order.statusLog || [])];
        }
        return { 
          ...order, 
          ...changes, 
          ...extra, 
          updatedAt: new Date().toISOString() 
        };
      }
      return order;
    }));
  };

  const deleteOrder = (id) => {
    setOrders(prev => prev.filter(order => order.id !== id));
  };

  const archiveOrder = (id) => {
    updateOrder(id, { isArchived: true });
  };

  const unarchiveOrder = (id) => {
    updateOrder(id, { isArchived: false });
  };

  const addComment = (orderId, milestoneId, text, authorName) => {
    const newComment = {
      id: crypto.randomUUID(),
      milestoneId,
      text,
      authorName,
      timestamp: new Date().toISOString(),
      isEdited: false,
      editedAt: null
    };
    
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          comments: [newComment, ...order.comments],
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  const deleteComment = (orderId, commentId) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          comments: order.comments.filter(c => c.id !== commentId),
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  const addDocument = (orderId, milestoneId, fileInfo, authorName) => {
    const newDoc = {
      id: crypto.randomUUID(),
      milestoneId,
      ...fileInfo,
      uploadedAt: new Date().toISOString(),
      uploadedBy: authorName
    };

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          documents: [newDoc, ...order.documents],
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  const deleteDocument = (orderId, documentId) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          documents: order.documents.filter(d => d.id !== documentId),
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  const value = {
    orders,
    createOrder,
    updateOrder,
    deleteOrder,
    archiveOrder,
    unarchiveOrder,
    addComment,
    deleteComment,
    addDocument,
    deleteDocument,
    activeFilter,
    setActiveFilter,
    activeBuyer,
    setActiveBuyer,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
