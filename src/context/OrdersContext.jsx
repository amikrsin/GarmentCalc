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

  const seedDemoOrder = () => {
    const today = new Date();
    
    // Formatting helper
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const demoId = crypto.randomUUID();
    const demoOrder = {
      id: demoId,
      createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date().toISOString(),
      isArchived: false,
      status: 'PRODUCTION',
      
      // Buyer details
      buyerName: 'Nordstrom Apparels',
      buyerContact: 'Sarah Jenkins (Merchandising Director)',
      buyerEmail: 's.jenkins@nordstrom.com',
      buyerPhone: '+1 (206) 628-2111',
      poNumber: 'PO-NORD-2026-89A',
      poDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago

      // Style info
      styleName: "Men's Luxury Organic Cotton Polo",
      category: 'Knit T-Shirts / Polos',
      styleDescription: 'Short sleeve pique polo with organic combed cotton yarn, engineered flat knit collar, and customized pearl buttons.',
      season: 'Autumn Winter 2026',
      orderType: 'FOB',
      fabricComposition: '95% Organic Cotton / 5% Elastane',
      fabricDescription: 'Premium Pique 220 GSM Combed Yarn with Softener Wash',

      // Quantities
      orderQty: 8500,
      sizeBreakdown: [
        { id: 'sb-s', name: 'S', qty: 1500 },
        { id: 'sb-m', name: 'M', qty: 3000 },
        { id: 'sb-l', name: 'L', qty: 2500 },
        { id: 'sb-xl', name: 'XL', qty: 1500 }
      ],
      colours: 'Classic Navy, Royal Teal, Burgundy Red',

      // Pricing
      fobPrice: 6.85,
      totalFOBValue: 58225,
      currency: 'USD',
      exchangeRate: 84.50,

      // Shipping
      shipDate: formatDate(new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000)), // 25 days in future
      shipmentMode: 'Sea FCL',
      portOfLoading: 'Nhava Sheva',
      destinationCountry: 'United States',
      destinationPort: 'Seattle Port',

      // Factory
      factoryName: 'Apex Textiles Quality Garm',
      factoryContact: 'Mustafa Rahman (Manager Logistics)',
      factoryPhone: '+91 98300 12345',
      factoryLocation: 'Udyog Vihar, Gurugram, India',
      factoryType: 'FOB',

      // Logistics details
      carrierName: 'Hapag-Lloyd Line',
      blNumber: 'HPL982341234',
      containerNo: 'HL-78234-A',
      sealNo: 'SL-NORD-90234',
      commercialInvoiceNo: 'APEX/CI/NORD-89',
      estimatedDeparture: formatDate(new Date(today.getTime() + 27 * 24 * 60 * 60 * 1000)),
      estimatedArrival: formatDate(new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000)),
      actualShipDate: '',

      // Approvals Checklist
      approvals: [
        { id: 'lab-dip', name: 'Lab Dip Approval', status: 'APPROVED', submissionDate: formatDate(new Date(today.getTime() - 12 * 24 * 60 * 60 * 1000)), approvalDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)), notes: 'Option C is approved for Burgundy. Option B approved for Navy.', docId: null },
        { id: 'fit-sample', name: 'Fit Sample Approval', status: 'APPROVED', submissionDate: formatDate(new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000)), approvalDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)), notes: 'Specs approved. Ensure proper sewing on shoulder bands.', docId: null },
        { id: 'size-set', name: 'Size Set Approval', status: 'SUBMITTED', submissionDate: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)), approvalDate: '', notes: 'Shipped physical samples via DHL to Nordstrom Seattle Office.', docId: null },
        { id: 'pp-sample', name: 'PP (Pre-Production) Sample Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: 'Fabric in testing; sample preparing.', docId: null },
        { id: 'top-sample', name: 'TOP (production) Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
        { id: 'carton-sample', name: 'Carton/Packing Approval', status: 'PENDING', submissionDate: '', approvalDate: '', notes: '', docId: null },
      ],

      // Activity Feed & Auditing Logs
      comments: [
        {
          id: 'cm-1',
          milestoneId: 'general',
          text: 'Tech pack received and verified. Pattern design approved by sample master.',
          authorName: 'Mustafa Rahman',
          timestamp: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'cm-2',
          milestoneId: 'fit-sample',
          text: 'Measurements matched. Fit feedback approved with 0.5cm chest correction.',
          authorName: 'Sarah Jenkins',
          timestamp: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      documents: [
        {
          id: 'doc-techpack',
          milestoneId: 'general',
          name: 'Tech_Pack_Organic_Polo_V2.pdf',
          type: 'application/pdf',
          sizeKB: 245,
          uploadedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          uploadedBy: 'Sarah Jenkins',
          data: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
        }
      ],
      generalNotes: 'Buyer requested special bio-wash finishing. Ensure metal detector scan for custom needle protection check at carton dock.',
      statusLog: [
        { id: 'log-1', from: 'INITIALIZED', to: 'ENQUIRY', changedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), changedBy: 'System', notes: 'Inquiry details mapped.' },
        { id: 'log-2', from: 'ENQUIRY', to: 'SAMPLING', changedAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), changedBy: 'Mustafa Rahman', notes: 'Design blueprint moved to sample table.' },
        { id: 'log-3', from: 'SAMPLING', to: 'CONFIRMED', changedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), changedBy: 'Sarah Jenkins', notes: 'Signed purchase authorization worksheet.' },
        { id: 'log-4', from: 'CONFIRMED', to: 'PRODUCTION', changedAt: new Date().toISOString(), changedBy: 'Mustafa Rahman', notes: 'Yarn arrived. Knitting department initiated.' }
      ],

      // COSTING STATE MODULE POPULATION
      costingState: {
        styleInfo: {
          companyName: 'JM Jain Merchandising',
          styleName: "Men's Luxury Organic Cotton Polo",
          styleNo: 'PO-NORD-2026-89A',
          description: 'Premium flat knit pique structure with double dye finishing.',
          category: 'Knit T-Shirts / Polos',
          season: 'Fall Winter 2026',
          buyerName: 'Nordstrom Apparels',
          orderQty: 8500,
          costingDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
          costingType: 'internal',
          currency: 'USD',
          exchangeRate: 84.50,
          garmentImage: null
        },
        fabrics: [
          {
            id: 'demo-fab-1',
            name: 'Pique Cotton Body Yarn',
            composition: '95% Organic Cotton / 5% Elastane',
            gsm: 220,
            widthInches: 58,
            consumptionMode: 'manual',
            consumption: 0.42,
            price: 13.20,
            wastage: 8,
            shrinkage: 3,
            calculatedConsumption: 0.45
          }
        ],
        trims: [
          { id: 'trim-1', name: 'Sewing Threads (120 Yps)', rate: 0.08, unit: 'Cones/garment', remarks: 'Polyester core spuns' },
          { id: 'trim-2', name: 'Premium Pearl Buttons', rate: 0.35, unit: 'Pcs/garment', remarks: 'Natural horn dyed buttons' },
          { id: 'trim-3', name: 'Main Woven Label + Wash Care', rate: 0.18, unit: 'Set', remarks: 'Organic satin cotton base' },
          { id: 'trim-4', name: 'Neck Tape (12mm Twill)', rate: 0.05, unit: 'Meter', remarks: 'Reinforcing navy twill band' },
          { id: 'trim-5', name: 'Hang Tag & Price Sticker', rate: 0.12, unit: 'Set', remarks: 'FSC recycled board tag' },
          { id: 'trim-6', name: 'Polybag & Shipping Carton', rate: 0.22, unit: 'Pc', remarks: '5-ply corrugated shipper cardboard box' }
        ],
        embellishments: [
          { id: 'embroi-1', type: 'Embroidery', details: 'Chest Crest Logo - 8000 stitches', rate: 0.30, conversionFactorType: '1', unitsRequired: 1, calculatedCost: 0.30 }
        ],
        labor: {
          cuttingCostPerPc: 0.10,
          stitchingCostPerPc: 1.25,
          packingCostPerPc: 0.10,
          smvStitching: 18,
          efficiencyPct: 70,
          laborRatePerMin: 0.12
        },
        finishing: {
          threadCuttingRate: 0.03,
          qcCheckingRate: 0.06,
          washingRequired: true,
          washType: 'Bio-Enzyme Softener',
          washingRate: 0.35,
          pressingRate: 0.08
        },
        commercial: {
          freightPerPc: 0.18,
          insurancePct: 0.5,
          buyingCommissionPct: 3.0,
          bankChargesPct: 0.5,
          inspectionPerPc: 0.05,
          testingPerPc: 0.05
        },
        exportCosts: {
          documentationPerPc: 0.02,
          dutyDrawbackPct: 1.5,
          gstRefundPct: 0
        },
        margins: {
          overheadPct: 10,
          currencyBufferPct: 1.5,
          reworkAllowancePct: 1,
          sampleCostTotal: 150,
          targetProfitPct: 12.5,
          minAcceptableMarginPct: 5,
          gstApplicable: false,
          gstPct: 5
        }
      },

      // TNA STATE MILESTONE GENERATION (Realistic Time Calendars)
      tnaState: {
        lastSavedAt: new Date().toISOString(),
        data: {
          styleName: "Men's Luxury Organic Cotton Polo",
          quantity: 8500,
          destination: 'United States',
          shipmentMode: 'Sea FCL',
          shipDate: formatDate(new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000)),
          productionLeadDays: 45,
          fabricLeadDays: 30,
          skipWeekends: true,
          includeSizeSet: true,
          includePPM: true,
          includeInline: true,
          includeTOP: true
        },
        milestones: [
          { id: 'm-tp', name: 'Order Confirmation & Tech Pack Finalized', date: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), daysFromShip: 40, responsibleParty: 'Buyer 👔', isComplete: true, actualDate: formatDate(new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000)), status: 'on-time' },
          { id: 'm-ld', name: 'Lab Dip Submit & Color Approval', date: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)), daysFromShip: 35, responsibleParty: 'Exporter 👔', isComplete: true, actualDate: formatDate(new Date(today.getTime() - 10 * 24 * 60 * 65 * 1000)), status: 'on-time' },
          { id: 'm-fit', name: 'Fit Sample Submission & Resubmissions', date: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)), daysFromShip: 30, responsibleParty: 'Exporter 👔', isComplete: true, actualDate: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 65 * 1000)), status: 'on-time' },
          
          // Overdue Milestone for clear visual tracking notification!
          { id: 'm-ss', name: 'Size Set Samples Ready for Grading Clearance', date: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)), daysFromShip: 26, responsibleParty: 'Factory 🏭', isComplete: false, actualDate: '', status: 'overdue' },
          
          { id: 'm-ppm', name: 'Pre-Production Meeting (PPM) Clearance', date: formatDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)), daysFromShip: 22, responsibleParty: 'Factory & QA 🏭', isComplete: false, actualDate: '', status: 'at-risk' },
          { id: 'm-ct', name: 'Bulk Fabric Cutting Commenced', date: formatDate(new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)), daysFromShip: 19, responsibleParty: 'Factory 🏭', isComplete: false, actualDate: '', status: 'on-time' },
          { id: 'm-sew', name: 'Sewing Operations In-Line Assembly', date: formatDate(new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000)), daysFromShip: 13, responsibleParty: 'Factory 🏭', isComplete: false, actualDate: '', status: 'on-time' },
          { id: 'm-ins', name: 'Buyer Nominated Final Quality Inspection', date: formatDate(new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000)), daysFromShip: 5, responsibleParty: 'Agency QA 👔', isComplete: false, actualDate: '', status: 'on-time' },
          { id: 'm-ship', name: 'Final Handover at Loading Port / Ship Out', date: formatDate(new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000)), daysFromShip: 0, responsibleParty: 'Logistics 🛳️', isComplete: false, actualDate: '', status: 'on-time' },
        ]
      }
    };

    setOrders(prev => [demoOrder, ...prev]);
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
    seedDemoOrder,
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
