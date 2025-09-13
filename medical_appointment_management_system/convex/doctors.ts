import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createDoctorProfile = mutation({
  args: {
    name: v.string(),
    specialization: v.string(),
    phone: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
    }),
    workingDays: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if doctor profile already exists
    const existingDoctor = await ctx.db
      .query("doctors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingDoctor) {
      throw new Error("Doctor profile already exists");
    }

    return await ctx.db.insert("doctors", {
      userId,
      ...args,
    });
  },
});

export const getDoctorProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("doctors")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const getDoctorById = query({
  args: { doctorId: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.doctorId);
  },
});

export const updateDoctorProfile = mutation({
  args: {
    doctorId: v.id("doctors"),
    name: v.string(),
    specialization: v.string(),
    phone: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
    workingHours: v.object({
      start: v.string(),
      end: v.string(),
    }),
    workingDays: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor || doctor.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const { doctorId, ...updateData } = args;
    return await ctx.db.patch(doctorId, updateData);
  },
});
