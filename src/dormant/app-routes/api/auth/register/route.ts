import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import User from "@/models/User";
import Supplier from "@/models/Supplier";
import UserDocument from "@/models/UserDocument";
import { generateToken, tokenExpiry, sendVerificationEmail } from "@/lib/email";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getDefaultTagsForRole, isSupplySideRole, isValidUserRole } from "@/lib/tags";

function registrationServiceError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|querySrv|Mongo/i.test(message)) {
    return NextResponse.json(
      { error: "Registration service is temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  return NextResponse.json({ error: "Registration failed" }, { status: 500 });
}

async function parseRegistrationRequest(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const tagsRaw = String(formData.get("tags") || "[]");
    const documents: Array<{ documentType: string; file: File }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("document:") && value instanceof File && value.size > 0) {
        documents.push({
          documentType: key.replace("document:", ""),
          file: value,
        });
      }
    }

    let tags: string[] = [];
    try {
      const parsed = JSON.parse(tagsRaw);
      tags = Array.isArray(parsed) ? parsed.filter((tag) => typeof tag === "string") : [];
    } catch {
      tags = [];
    }

    return {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      company: String(formData.get("company") || ""),
      role: String(formData.get("role") || ""),
      phone: String(formData.get("phone") || ""),
      website: String(formData.get("website") || ""),
      address: String(formData.get("address") || ""),
      country: String(formData.get("country") || "UAE"),
      city: String(formData.get("city") || "Dubai"),
      tags,
      documents,
      existingDocuments: [],
    };
  }

  const body = await request.json();
  return {
    ...body,
    documents: [] as Array<{ documentType: string; file: File }>,
    existingDocuments: Array.isArray(body.documents) ? body.documents : [],
    tags: Array.isArray(body.tags) ? body.tags : [],
  };
}

async function uploadRegistrationDocuments(
  documents: Array<{ documentType: string; file: File }>
) {
  const uploadedDocuments: Array<{
    documentType: string;
    fileName: string;
    fileUrl: string;
  }> = [];

  for (const doc of documents) {
    if (doc.file.size > 10 * 1024 * 1024) {
      throw new Error(`${doc.file.name} is too large. Max 10MB.`);
    }

    const buffer = Buffer.from(await doc.file.arrayBuffer());
    const { url } = await uploadToCloudinary(buffer, "documents", doc.file.name);

    uploadedDocuments.push({
      documentType: doc.documentType,
      fileName: doc.file.name,
      fileUrl: url,
    });
  }

  return uploadedDocuments;
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseRegistrationRequest(request);
    const { email, password, firstName, lastName, company, phone, website, address, country, city } = body;
    const role = isValidUserRole(body.role) && body.role !== "admin" ? body.role : "purchase_manager";
    const tags = Array.from(new Set([
      ...getDefaultTagsForRole(role),
      ...(Array.isArray(body.tags) ? body.tags : []),
    ]));

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    await connectDB();

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const uploadedDocuments = await uploadRegistrationDocuments(body.documents || []);

    // Generate verification token
    const verificationToken = generateToken();
    const verificationExpires = tokenExpiry(24); // 24 hours

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      fullName: `${firstName} ${lastName}`,
      companyName: company,
      role: role || "purchase_manager",
      tags: Array.isArray(tags) ? tags : [],
      phone,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    for (const doc of uploadedDocuments) {
      await UserDocument.create({
        userId: user._id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
      });
    }

    // Save uploaded document references for legacy JSON callers.
    if (Array.isArray(body.existingDocuments)) {
      for (const doc of body.existingDocuments) {
        if (doc.fileUrl && doc.documentType) {
          await UserDocument.create({
            userId: user._id,
            documentType: doc.documentType,
            fileName: doc.fileName || "document",
            fileUrl: doc.fileUrl,
          });
        }
      }
    }

    if (isSupplySideRole(role)) {
      const supplierTags = tags;
      const supplierType = supplierTags.find((t: string) =>
        ["manufacturer", "distributor", "dealer_agent", "service_provider", "rental_company", "freight_logistics", "inspection_agency", "certification_body"].includes(t)
      ) || (role === "manufacturer" ? "manufacturer" : role === "agent" ? "dealer_agent" : "distributor");

      await Supplier.create({
        userId: user._id,
        name: company || `${firstName} ${lastName}`,
        slug: (company || `${firstName}-${lastName}`).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: supplierType,
        specializations: supplierTags,
        email: email.toLowerCase(),
        phone,
        websiteUrl: website,
        address,
        country: country || "UAE",
        city: city || "Dubai",
        isVerified: false,
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail(
        user.email,
        user.fullName,
        verificationToken
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't block registration if email fails — user can resend
    }

    // Do NOT auto-login — require email verification first
    return NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      requiresVerification: true,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    return registrationServiceError(error);
  }
}
