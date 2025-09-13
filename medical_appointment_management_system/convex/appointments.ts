import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const createAppointment = mutation({
  args: {
    patientId: v.id("patients"),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    type: v.string(),
    notes: v.optional(v.string()),
    requestedBy: v.union(v.literal("doctor"), v.literal("patient")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const doctor = await ctx.db.get(patient.doctorId);
    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // If requested by doctor, check authorization
    if (args.requestedBy === "doctor" && doctor.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const status = args.requestedBy === "doctor" ? "scheduled" : "pending";

    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      doctorId: patient.doctorId,
      status,
    });

    // Create notification
    await ctx.scheduler.runAfter(0, internal.notifications.createAppointmentNotification, {
      appointmentId,
      type: args.requestedBy === "doctor" ? "appointment_confirmed" : "appointment_request",
    });

    return appointmentId;
  },
});

export const getAppointmentsByDoctor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!doctor) {
      return [];
    }

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
      .collect();

    // Get patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        return {
          ...appointment,
          patient,
        };
      })
    );

    return appointmentsWithPatients;
  },
});

export const getAppointmentsByPatient = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .unique();

    if (!patient) {
      return [];
    }

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
      .collect();

    // Get doctor details for each appointment
    const appointmentsWithDoctor = await Promise.all(
      appointments.map(async (appointment) => {
        const doctor = await ctx.db.get(appointment.doctorId);
        return {
          ...appointment,
          doctor,
        };
      })
    );

    return appointmentsWithDoctor;
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("pending")
    ),
    notes: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    prescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const doctor = await ctx.db.get(appointment.doctorId);
    if (!doctor || doctor.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const { appointmentId, ...updateData } = args;
    await ctx.db.patch(appointmentId, updateData);

    // Create notification for status change
    if (args.status === "scheduled" || args.status === "cancelled") {
      await ctx.scheduler.runAfter(0, internal.notifications.createAppointmentNotification, {
        appointmentId,
        type: args.status === "scheduled" ? "appointment_confirmed" : "appointment_cancelled",
      });
    }

    return appointmentId;
  },
});

export const deleteAppointment = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const doctor = await ctx.db.get(appointment.doctorId);
    if (!doctor || doctor.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.delete(args.appointmentId);
  },
});
