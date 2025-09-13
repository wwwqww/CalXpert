import { internalMutation, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAppointmentNotification = internalMutation({
  args: {
    appointmentId: v.id("appointments"),
    type: v.union(
      v.literal("appointment_reminder"),
      v.literal("appointment_request"),
      v.literal("appointment_confirmed"),
      v.literal("appointment_cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      return;
    }

    const patient = await ctx.db.get(appointment.patientId);
    const doctor = await ctx.db.get(appointment.doctorId);

    if (!patient || !doctor) {
      return;
    }

    let title = "";
    let message = "";
    let recipientId = "";
    let recipientType: "doctor" | "patient" = "patient";

    switch (args.type) {
      case "appointment_request":
        title = "New Appointment Request";
        message = `${patient.name} has requested an appointment on ${appointment.appointmentDate} at ${appointment.appointmentTime}`;
        recipientId = doctor.userId;
        recipientType = "doctor";
        break;
      case "appointment_confirmed":
        title = "Appointment Confirmed";
        message = `Your appointment with Dr. ${doctor.name} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been confirmed`;
        recipientId = patient.patientId;
        recipientType = "patient";
        break;
      case "appointment_cancelled":
        title = "Appointment Cancelled";
        message = `Your appointment with Dr. ${doctor.name} on ${appointment.appointmentDate} at ${appointment.appointmentTime} has been cancelled`;
        recipientId = patient.patientId;
        recipientType = "patient";
        break;
      case "appointment_reminder":
        title = "Appointment Reminder";
        message = `Reminder: You have an appointment with Dr. ${doctor.name} tomorrow at ${appointment.appointmentTime}`;
        recipientId = patient.patientId;
        recipientType = "patient";
        break;
    }

    await ctx.db.insert("notifications", {
      recipientId,
      recipientType,
      title,
      message,
      type: args.type,
      isRead: false,
      appointmentId: args.appointmentId,
    });
  },
});

export const getNotificationsForDoctor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", userId))
      .filter((q) => q.eq(q.field("recipientType"), "doctor"))
      .order("desc")
      .take(50);
  },
});

export const getNotificationsForPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.patientId))
      .filter((q) => q.eq(q.field("recipientType"), "patient"))
      .order("desc")
      .take(50);
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Check if user has permission to mark this notification as read
    if (notification.recipientType === "doctor" && notification.recipientId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});
