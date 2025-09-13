import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate unique patient ID
function generatePatientId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `P${timestamp}${randomStr}`.toUpperCase();
}

export const createPatient = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get doctor profile
    const doctor = await ctx.db
      .query("doctors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!doctor) {
      throw new Error("Doctor profile not found");
    }

    const patientId = generatePatientId();

    return await ctx.db.insert("patients", {
      patientId,
      doctorId: doctor._id,
      createdBy: userId,
      ...args,
    });
  },
});

export const getPatientsByDoctor = query({
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

    return await ctx.db
      .query("patients")
      .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
      .collect();
  },
});

export const getPatientByPatientId = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_patient_id", (q) => q.eq("patientId", args.patientId))
      .unique();
  },
});

export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    address: v.optional(v.string()),
    medicalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    const { patientId, ...updateData } = args;
    return await ctx.db.patch(patientId, updateData);
  },
});

export const deletePatient = mutation({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const patient = await ctx.db.get(args.patientId);
    if (!patient || patient.createdBy !== userId) {
      throw new Error("Unauthorized");
    }

    // Delete all appointments for this patient
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    for (const appointment of appointments) {
      await ctx.db.delete(appointment._id);
    }

    return await ctx.db.delete(args.patientId);
  },
});
