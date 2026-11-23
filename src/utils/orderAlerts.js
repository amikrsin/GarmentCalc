import { differenceInDays, format, isBefore, startOfToday } from 'date-fns';

/**
 * Determines whether an order qualifies for Critical / Ship < 30 Days alerts.
 */
export const getOrderUrgency = (order) => {
  const today = startOfToday();

  const shipDateObj = order?.shipDate ? new Date(order.shipDate) : null;
  const hasValidShipDate = shipDateObj && !Number.isNaN(shipDateObj.getTime());
  const daysToShip = hasValidShipDate ? differenceInDays(shipDateObj, today) : null;

  const milestones = order?.tnaState?.milestones || [];

  const overdueMilestones = milestones
    .filter((m) => {
      if (m.isComplete) return false;
      if (m.status === 'overdue') return true;
      if (m.date) {
        const d = new Date(m.date);
        return !Number.isNaN(d.getTime()) && isBefore(d, today);
      }
      return false;
    })
    .map((m) => {
      const target = new Date(m.date);
      const delayDays = !Number.isNaN(target.getTime()) ? Math.max(1, differenceInDays(today, target)) : 1;
      return {
        ...m,
        delayDays,
        formattedDate: !Number.isNaN(target.getTime()) ? format(target, 'dd MMM yyyy') : '—',
      };
    });

  const atRiskMilestones = milestones
    .filter((m) => {
      if (m.isComplete) return false;
      if (overdueMilestones.some((om) => om.id === m.id)) return false;
      if (m.status === 'at-risk') return true;
      if (m.date) {
        const d = new Date(m.date);
        const left = differenceInDays(d, today);
        return left >= 0 && left <= 5;
      }
      return false;
    })
    .map((m) => {
      const target = new Date(m.date);
      return {
        ...m,
        daysLeft: !Number.isNaN(target.getTime()) ? Math.max(0, differenceInDays(target, today)) : 0,
        formattedDate: !Number.isNaN(target.getTime()) ? format(target, 'dd MMM yyyy') : '—',
      };
    });

  const isShipped = order?.status === 'SHIPPED';
  const isCritical = !isShipped && overdueMilestones.length > 0;
  const isShipUnder30 = !isShipped && daysToShip !== null && daysToShip <= 30;
  const needsAlert = isCritical || isShipUnder30;

  return {
    isCritical,
    isShipUnder30,
    needsAlert,
    daysToShip,
    formattedShipDate: hasValidShipDate ? format(shipDateObj, 'dd MMM yyyy') : 'TBD',
    overdueMilestones,
    atRiskMilestones,
  };
};

/**
 * Formats a clean, zero-backend WhatsApp alert summary.
 */
export const buildWhatsAppMessage = (order, preferences = {}) => {
  const urgency = getOrderUrgency(order);
  const senderCompany = preferences.companyName ? ` (${preferences.companyName})` : '';

  const shipLine =
    urgency.daysToShip === null
      ? urgency.formattedShipDate
      : urgency.daysToShip < 0
      ? `${urgency.formattedShipDate} (OVERDUE by ${Math.abs(urgency.daysToShip)} days)`
      : `${urgency.formattedShipDate} (${urgency.daysToShip} days remaining)`;

  const lines = [
    `*CRITICAL ORDER ALERT${senderCompany}*`,
    ``,
    `*Buyer:* ${order.buyerName || '—'}`,
    `*Style:* ${order.styleName || '—'}`,
    `*PO / Ref:* ${order.poNumber || '—'}`,
    `*Stage:* ${order.status || '—'} | *Qty:* ${(order.orderQty || 0).toLocaleString()} pcs`,
    `*Ship Date:* ${shipLine}`,
  ];

  if (urgency.overdueMilestones.length > 0) {
    lines.push(``);
    lines.push(`*Delayed Milestones (${urgency.overdueMilestones.length}):*`);
    urgency.overdueMilestones.forEach((m, idx) => {
      lines.push(`${idx + 1}. ${m.name} — Due ${m.formattedDate} (${m.delayDays}d late)`);
    });
  } else {
    lines.push(``);
    lines.push(`*Status Note:* Shipment is within 30 days. Please prioritize final production & QC clearances.`);
  }

  if (urgency.atRiskMilestones.length > 0) {
    lines.push(``);
    lines.push(`*Upcoming At-Risk (${urgency.atRiskMilestones.length}):*`);
    urgency.atRiskMilestones.slice(0, 3).forEach((m) => {
      lines.push(`- ${m.name} — Due ${m.formattedDate} (in ${m.daysLeft}d)`);
    });
  }

  if (preferences.userName || preferences.companyContact) {
    lines.push(``);
    const sig = [preferences.userName, preferences.companyName, preferences.companyContact].filter(Boolean).join(' · ');
    lines.push(`Sent by: ${sig}`);
  }

  return lines.join('\n');
};

/**
 * Returns the https://wa.me/?text=... URL for 1-click WhatsApp sharing.
 */
export const getWhatsAppShareUrl = (order, preferences = {}) => {
  const text = buildWhatsAppMessage(order, preferences);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

/**
 * Formats a clean professional Email Status Update for 1-click clipboard copy.
 */
export const buildEmailSummary = (order, preferences = {}) => {
  const urgency = getOrderUrgency(order);

  const urgencyTag = urgency.isCritical
    ? `[URGENT — ${urgency.overdueMilestones.length} DELAYED MILESTONE${urgency.overdueMilestones.length > 1 ? 'S' : ''}]`
    : `[SHIP ALERT — ${urgency.daysToShip} DAYS TO SHIP]`;

  const shipLine =
    urgency.daysToShip === null
      ? urgency.formattedShipDate
      : urgency.daysToShip < 0
      ? `${urgency.formattedShipDate} (Overdue by ${Math.abs(urgency.daysToShip)} days)`
      : `${urgency.formattedShipDate} (${urgency.daysToShip} days left)`;

  const lines = [
    `Subject: ${urgencyTag} ${order.buyerName} — ${order.styleName} (${order.poNumber})`,
    ``,
    `Hi Team,`,
    ``,
    `Please find below the urgent status update for the following order requiring immediate attention:`,
    ``,
    `Order Overview`,
    `--------------------------------------------------`,
    `Buyer:        ${order.buyerName || '—'}`,
    `Style Name:   ${order.styleName || '—'}`,
    `PO Number:    ${order.poNumber || '—'}`,
    `Current Stage:${order.status || '—'}`,
    `Order Qty:    ${(order.orderQty || 0).toLocaleString()} pcs`,
    `Ship Date:    ${shipLine}`,
    `Factory:      ${order.factoryName || 'TBD'}`,
    `--------------------------------------------------`,
  ];

  if (urgency.overdueMilestones.length > 0) {
    lines.push(``);
    lines.push(`Delayed Milestones:`);
    urgency.overdueMilestones.forEach((m, idx) => {
      lines.push(`  ${idx + 1}. ${m.name} | Target: ${m.formattedDate} | Delay: ${m.delayDays} day(s)`);
    });
  }

  if (urgency.atRiskMilestones.length > 0) {
    lines.push(``);
    lines.push(`Upcoming At-Risk Milestones (Due within 5 days):`);
    urgency.atRiskMilestones.forEach((m, idx) => {
      lines.push(`  ${idx + 1}. ${m.name} | Target: ${m.formattedDate} (${m.daysLeft} day(s) remaining)`);
    });
  }

  lines.push(``);
  lines.push(`Please confirm revised completion dates and recovery plan at the earliest to protect the ex-factory / ship date.`);
  lines.push(``);
  lines.push(`Best regards,`);
  lines.push(preferences.userName || 'Merchandising Team');
  if (preferences.companyName) lines.push(preferences.companyName);
  if (preferences.companyContact) lines.push(preferences.companyContact);

  return lines.join('\n');
};

/**
 * Reliable clipboard copy helper with fallback for restricted iframe contexts.
 */
export const copyTextToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};
