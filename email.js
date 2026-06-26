/** EmailJS integration — welcome emails, ticket confirmations, and QR generation. */
import { config } from "./config.js";
import { getApiKey } from "./firebase.js";

const WELCOME_TEMPLATE_ID = "template_zvlax6l"; // Ensure this matches EmailJS dashboard
const TICKET_TEMPLATE_ID = "template_aw6j1cc"; // Ticket purchase confirmation template

async function ensureEmailJsInitialized() {
  try {
    const publicKey =
      (await getApiKey("EMAIL_PUBLIC_KEY")) || config.EMAIL_PUBLIC_KEY;
    if (window.emailjs && publicKey) {
      // Avoid re-init
      if (!window.__emailjs_initialized) {
        window.emailjs.init(publicKey);
        window.__emailjs_initialized = true;
      }
    } else {
      console.warn("EmailJS or public key missing; init skipped");
    }
  } catch (err) {
    console.error("Failed to initialize EmailJS", err);
  }
}

/**
 * Generate QR code as a data URL
 * @param {Object} ticketData - The ticket data to encode in the QR code
 * @returns {Promise<string>} - Promise resolving to data URL of the QR code
 */
export async function generateQRCode(ticketData) {
  try {
    // Create a JSON string with essential ticket details
    const ticketInfo = JSON.stringify({
      ticketId: ticketData.id,
      eventId: ticketData.eventId,
      event: ticketData.eventDetails.title,
      date: ticketData.eventDetails.date,
      attendee: ticketData.name,
      tickets: ticketData.tickets,
      totalQuantity: ticketData.totalQuantity
    });

    // Generate QR code as data URL using the QRCode library loaded in the HTML
    return new Promise((resolve, reject) => {
      window.QRCode.toDataURL(ticketInfo, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    // Return placeholder image if QR generation fails
    return 'https://via.placeholder.com/300?text=Ticket';
  }
}

/**
 * Send a welcome email to a newly registered user
 * @param {string} userEmail - The email address of the new user
 * @param {string} userName - The name of the new user (optional)
 * @returns {Promise} - Promise resolving when email is sent
 */
export async function sendWelcomeEmail(userEmail) {
  try {
    await ensureEmailJsInitialized();

    const serviceID = await getApiKey("EMAIL_SERVICE_ID");
    if (!serviceID) {
      console.error("EmailJS service ID missing; welcome email skipped");
      return null;
    }

    if (!userEmail) {
      console.error("No email to send welcome email to; skipping");
      return null;
    }

    const templateParams = {
      user_email: userEmail,
      user_name: userEmail,
      to_email: userEmail,
      to_name: userEmail,
      app_url: window.location.origin
    };

    const response = await window.emailjs.send(
      serviceID,
      WELCOME_TEMPLATE_ID,
      templateParams
    );
    return response;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw the error to prevent disrupting the signup process
    return null;
  }
}

function buildTicketTableHtml(ticketBreakdown = {}, totalQty = 0, totalPaid = 0) {
  const rows = [
    { label: "General Admission", qty: ticketBreakdown.general || 0, price: ticketBreakdown.generalPrice || 0 },
    { label: "Child", qty: ticketBreakdown.child || 0, price: ticketBreakdown.childPrice || 0 },
    { label: "Senior", qty: ticketBreakdown.senior || 0, price: ticketBreakdown.seniorPrice || 0 }
  ].filter(r => r.qty > 0);

  return `
    <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif;">
      <thead>
        <tr style="background:#f3f4f6; text-align:left;">
          <th style="padding:12px; border-bottom:1px solid #e5e7eb;">Ticket Type</th>
          <th style="padding:12px; border-bottom:1px solid #e5e7eb;">Quantity</th>
          <th style="padding:12px; border-bottom:1px solid #e5e7eb;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td style="padding:12px; border-bottom:1px solid #eef2f7;">${r.label}</td>
            <td style="padding:12px; border-bottom:1px solid #eef2f7;">${r.qty}</td>
            <td style="padding:12px; border-bottom:1px solid #eef2f7;">$${Number(r.price).toFixed(2)}</td>
          </tr>
        `).join("")}
        <tr>
          <td style="padding:12px; font-weight:700;">Total</td>
          <td style="padding:12px; font-weight:700;">${totalQty}</td>
          <td style="padding:12px; font-weight:700;">$${Number(totalPaid).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;
}

export async function sendTicketPurchaseEmail(payload) {
  try {
    await ensureEmailJsInitialized();

    const serviceID = await getApiKey("EMAIL_SERVICE_ID");
    if (!serviceID) {
      console.error("EmailJS service ID missing; ticket email skipped");
      return null;
    }

    const userEmail = (payload?.user_email || "").trim();
    if (!userEmail) {
      console.error("No email to send ticket confirmation to; skipping");
      return null;
    }

    const ticketBreakdown = payload?.tickets || {};
    const ticketPrices = {
      generalPrice: payload?.eventDetails?.generalPrice || 0,
      childPrice: payload?.eventDetails?.childPrice || 0,
      seniorPrice: payload?.eventDetails?.seniorPrice || 0,
    };
    const totalQty = payload?.total_quantity ?? payload?.totalQuantity ?? 0;
    const totalPaid = payload?.total_paid ?? payload?.finalPrice ?? 0;

    const ticket_table_html = buildTicketTableHtml(
      {
        general: ticketBreakdown.general,
        child: ticketBreakdown.child,
        senior: ticketBreakdown.senior,
        ...ticketPrices
      },
      totalQty,
      totalPaid
    );

    const templateParams = {
      user_email: userEmail,
      user_name: payload?.user_name || userEmail,
      to_email: userEmail,
      to_name: payload?.user_name || userEmail,
      order_id: payload?.order_id || payload?.id || `ORD-${Date.now()}`,
      event_title: payload?.event_title || payload?.eventDetails?.title || "",
      event_date: payload?.event_date || payload?.eventDetails?.date || "",
      event_time: payload?.event_time || payload?.eventDetails?.time || "",
      event_location: payload?.event_location || payload?.eventDetails?.location || "",
      ticket_table_html,
      total_quantity: String(totalQty ?? ""),
      total_paid: String(totalPaid ?? ""),
      qr_note: payload?.qr_note || "Please present your Ticket QR code at the event entrance.",
      banner_url: payload?.banner_url || ""
    };

    const response = await window.emailjs.send(
      serviceID,
      TICKET_TEMPLATE_ID,
      templateParams
    );
    return response;
  } catch (error) {
    console.error("Error sending ticket purchase email:", error);
    return null;
  }
}

/**
 * Send a ticket confirmation email
 * @param {Object} ticketData - The ticket data
 * @returns {Promise} - Promise resolving when email is sent
 */
export async function sendTicketConfirmationEmail(ticketData) {
  try {
    // Get EmailJS service ID from Firebase
    const serviceID = await getApiKey('EMAIL_SERVICE_ID');
    const templateID = 'template_ntl7hvp';

    // Extract ticket information for the template
    const hasGeneralTickets = ticketData.tickets.general > 0;
    const hasSeniorTickets = ticketData.tickets.senior > 0;
    const hasChildTickets = ticketData.tickets.child > 0;

    // Format event time from startTime and endTime
    const eventTime = ticketData.eventDetails.startTime && ticketData.eventDetails.endTime
      ? `${ticketData.eventDetails.startTime} - ${ticketData.eventDetails.endTime}`
      : ticketData.eventDetails.time || 'N/A';

    // Calculate individual ticket prices
    const generalPrice = hasGeneralTickets ? (ticketData.eventDetails.generalPrice || 0) : 0;
    const seniorPrice = hasSeniorTickets ? (ticketData.eventDetails.seniorPrice || 0) : 0;
    const childPrice = hasChildTickets ? (ticketData.eventDetails.childPrice || 0) : 0;

    // Calculate subtotals for each ticket type
    const generalSubtotal = generalPrice * (ticketData.tickets.general || 0);
    const seniorSubtotal = seniorPrice * (ticketData.tickets.senior || 0);
    const childSubtotal = childPrice * (ticketData.tickets.child || 0);

    // Calculate total price before any discounts
    const subtotal = generalSubtotal + seniorSubtotal + childSubtotal;

    // Use the provided total price if available, otherwise use calculated subtotal
    const finalTotalPrice = ticketData.totalPrice !== undefined ? ticketData.totalPrice : subtotal;

    // Get order ID for the subject line
    const orderId = ticketData.id || 'UNKNOWN';

    // Template parameters matched to the email template
    const templateParams = {
      email: ticketData.email,
      to_name: ticketData.name,
      subject: `Order Confirmed #${orderId}!`,
      order_id: orderId,
      event_title: ticketData.eventDetails.title,
      event_date: ticketData.eventDetails.date,
      event_time: eventTime,
      event_location: ticketData.eventDetails.location,

      // Ticket quantities
      general_qty: ticketData.tickets.general || 0,
      senior_qty: ticketData.tickets.senior || 0,
      child_qty: ticketData.tickets.child || 0,

      // Ticket prices - ensure these are numbers
      general_price: generalPrice,
      senior_price: seniorPrice,
      child_price: childPrice,

      // Show/hide flags for the template
      has_general: hasGeneralTickets,
      has_senior: hasSeniorTickets,
      has_child: hasChildTickets,

      // Totals
      total_tickets: ticketData.totalQuantity || 0,
      total_price: finalTotalPrice
    };

    const response = await window.emailjs.send(serviceID, templateID, templateParams);
    return response;
  } catch (error) {
    console.error('Error sending ticket confirmation email:', error);
    return null;
  }
}

/**
 * Send a ticket confirmation email (alias for sendTicketConfirmationEmail for backward compatibility)
 * @param {Object} ticketData - The ticket data
 * @returns {Promise} - Promise resolving when email is sent
 */
export async function sendTicketConfirmationEmailNoQR(ticketData) {
  return sendTicketConfirmationEmail(ticketData);
}