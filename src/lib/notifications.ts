import connectDB from "@/lib/db";
import Notification, { NotificationType } from "@/models/Notification";
import User from "@/models/User";
import nodemailer from "nodemailer";
import { getNotificationEmailTemplate } from "./email-templates/notification";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  referenceId?: string;
  referenceType?: string;
  sendEmail?: boolean;
  emailActionLabel?: string;
}

export async function createNotification(opts: CreateNotificationOptions) {
  await connectDB();

  const notification = await Notification.create({
    userId: opts.userId,
    type: opts.type,
    title: opts.title,
    message: opts.message,
    link: opts.link,
    referenceId: opts.referenceId,
    referenceType: opts.referenceType,
  });

  // Send email notification (non-blocking)
  if (opts.sendEmail !== false) {
    sendNotificationEmail(notification._id.toString(), opts).catch((err) => {
      console.error("Failed to send notification email:", err);
    });
  }

  return notification;
}

async function sendNotificationEmail(
  notificationId: string,
  opts: CreateNotificationOptions
) {
  try {
    const user = await User.findById(opts.userId)
      .select("email fullName")
      .lean();
    if (!user) return;

    const actionUrl = opts.link ? `${APP_URL}${opts.link}` : undefined;

    const html = getNotificationEmailTemplate(
      (user as any).fullName || "User",
      opts.title,
      opts.message,
      actionUrl,
      opts.emailActionLabel
    );

    await getTransporter().sendMail({
      from:
        process.env.SMTP_FROM || "ProcureSource <hello@procuresource.co>",
      to: (user as any).email,
      subject: `${opts.title} — ProcureSource`,
      html,
    });

    await Notification.findByIdAndUpdate(notificationId, {
      emailSent: true,
    });
  } catch (err) {
    console.error("Notification email failed:", err);
  }
}

// Convenience helpers for common notification types

export async function notifyQuoteReceived(
  pmUserId: string,
  supplierName: string,
  rfqTitle: string,
  rfqId: string
) {
  return createNotification({
    userId: pmUserId,
    type: "quote_received",
    title: "New Quote Received",
    message: `${supplierName} submitted a quote for your RFQ "${rfqTitle}".`,
    link: `/pm/rfqs/${rfqId}`,
    referenceId: rfqId,
    referenceType: "rfq",
    emailActionLabel: "View Quote",
  });
}

export async function notifyContractAwarded(
  supplierUserId: string,
  contractNumber: string,
  contractId: string,
  title: string
) {
  return createNotification({
    userId: supplierUserId,
    type: "contract_awarded",
    title: "Contract Awarded",
    message: `you have been awarded contract ${contractNumber} for "${title}".`,
    link: `/supplier/contracts/${contractId}`,
    referenceId: contractId,
    referenceType: "contract",
    emailActionLabel: "View Contract",
  });
}

export async function notifyQuoteNotSelected(
  supplierUserId: string,
  rfqTitle: string,
  rfqId: string
) {
  return createNotification({
    userId: supplierUserId,
    type: "quote_not_selected",
    title: "Quote Not Selected",
    message: `your quote for "${rfqTitle}" was not selected. The RFQ has been awarded to another supplier.`,
    link: `/rfqs/${rfqId}`,
    referenceId: rfqId,
    referenceType: "rfq",
    emailActionLabel: "View RFQ",
    sendEmail: false,
  });
}

export async function notifyDeliveryUpdate(
  userId: string,
  eventTitle: string,
  deliveryId: string,
  contractId: string,
  type: "delivery_update" | "delivery_shipped" | "delivery_delivered" = "delivery_update"
) {
  return createNotification({
    userId,
    type,
    title: "Delivery Update",
    message: `delivery update: ${eventTitle}.`,
    link: `/pm/contracts/${contractId}`,
    referenceId: deliveryId,
    referenceType: "delivery",
    emailActionLabel: "View Delivery",
  });
}

export async function notifyUserVerified(userId: string) {
  return createNotification({
    userId,
    type: "user_verified",
    title: "Account Verified",
    message: "your account has been verified. You now have full access to the platform.",
    link: "/dashboard",
    emailActionLabel: "Go to Dashboard",
  });
}

export async function notifyProductReview(
  supplierUserId: string,
  productName: string,
  productId: string,
  approved: boolean,
  reason?: string
) {
  return createNotification({
    userId: supplierUserId,
    type: approved ? "product_approved" : "product_rejected",
    title: approved ? "Product Approved" : "Product Needs Changes",
    message: approved
      ? `your product "${productName}" has been approved and is now listed on the platform.`
      : `your product "${productName}" requires changes${reason ? `: ${reason}` : "."}.`,
    link: "/supplier/dashboard",
    referenceId: productId,
    referenceType: "product",
    emailActionLabel: approved ? "View Listing" : "Update Product",
  });
}

export async function notifyConnectionRequest(
  supplierUserId: string,
  requesterName: string,
  connectionId: string
) {
  return createNotification({
    userId: supplierUserId,
    type: "connection_request",
    title: "New Connection Request",
    message: `${requesterName} wants to connect with you.`,
    link: "/supplier/dashboard",
    referenceId: connectionId,
    referenceType: "connection",
    emailActionLabel: "View Request",
  });
}

export async function notifyConnectionResponse(
  requesterUserId: string,
  supplierName: string,
  accepted: boolean,
  connectionId: string
) {
  return createNotification({
    userId: requesterUserId,
    type: accepted ? "connection_accepted" : "connection_declined",
    title: accepted ? "Connection Accepted" : "Connection Declined",
    message: accepted
      ? `${supplierName} accepted your connection request.`
      : `${supplierName} declined your connection request.`,
    link: "/pm/dashboard",
    referenceId: connectionId,
    referenceType: "connection",
    emailActionLabel: accepted ? "View Connection" : undefined,
    sendEmail: accepted, // Only email on acceptance
  });
}
