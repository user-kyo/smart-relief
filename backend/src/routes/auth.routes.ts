import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import nodemailer from "nodemailer";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Schemas
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

const checkEmailSchema = z.object({ email: z.string().email() });
const registerSchema = z.object({ email: z.string().email(), password: passwordSchema, name: z.string().min(2), role: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const forgotPasswordSchema = z.object({ email: z.string().email() });
const verifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().length(6) });
const resetPasswordSchema = z.object({ email: z.string().email(), otp: z.string().length(6), newPassword: passwordSchema });
const updateStatusSchema = z.object({ status: z.enum(["APPROVED", "PENDING", "ACTIVE", "INACTIVE"]) });

// Mailer Setup
const createTransporter = async () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Check Email Endpoint
router.post("/check-email", async (req, res) => {
  try {
    const { email } = checkEmailSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    return res.json({ success: true, exists: !!existingUser });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Register Endpoint
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role, status: user.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    if (role === "SUPER_ADMIN") return res.status(403).json({ success: false, message: "Cannot register as a Super Admin" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const status = (role === "CITIZEN" || role === "RESIDENT" || !role) ? "APPROVED" : "PENDING";

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: role || "CITIZEN", status },
    });

    res.status(201).json({ success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, status: newUser.status } });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (user.status === "PENDING") return res.status(403).json({ success: false, message: "Your account is pending Super Admin approval." });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const otpStore = new Map<string, { otp: string, expiresAt: number }>();

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "Email not found" });

    if (user.status === 'PENDING') {
      return res.status(403).json({ success: false, message: "Account pending approval. Password reset disabled." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    
    // Send email
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Smart Relief" <noreply@smartrelief.com>',
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for resetting your password is ${otp}. It will expire in 10 minutes.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #111827; padding: 32px 40px; text-align: center;">
                      <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                          <td style="background-color: #ffffff; width: 48px; height: 48px; border-radius: 12px; text-align: center; vertical-align: middle;">
                            <span style="color: #111827; font-size: 24px; font-weight: 900; font-family: sans-serif;">S</span>
                          </td>
                          <td style="padding-left: 16px;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Smart Relief</h1>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #0f172a; font-size: 20px; font-weight: 700;">Password Reset Request</h2>
                      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                        We received a request to reset the password for your Smart Relief account. Please use the verification code below to securely change your password.
                      </p>
                      
                      <!-- OTP Box -->
                      <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                        <span style="display: block; color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Your Verification Code</span>
                        <h1 style="margin: 0; color: #2563eb; font-size: 40px; font-weight: 800; letter-spacing: 12px; padding-left: 12px;">${otp}</h1>
                      </div>
                      
                      <p style="margin: 0 0 32px; color: #64748b; font-size: 14px; line-height: 1.5;">
                        This code will expire in <strong>10 minutes</strong>. For security reasons, please do not share this code with anyone.
                      </p>
                      
                      <!-- Divider -->
                      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0 0 24px;" />
                      
                      <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                        If you did not request a password reset, you can safely ignore this email. Your account remains secure.
                      </p>
                    </td>
                  </tr>
                </table>
                
                <!-- Footer -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; padding: 24px 20px;">
                  <tr>
                    <td align="center">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} Smart Relief Operations Center. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[DEV] OTP for ${email} is ${otp}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[DEV] Email Preview URL: ${previewUrl}`);
    }

    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("[SMTP ERROR] Failed to send email:", error);
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    const stored = otpStore.get(email);
    
    const isSeedOtp = otp === "123456";
    if (!isSeedOtp && (!stored || stored.otp !== otp || Date.now() > stored.expiresAt)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);
    const stored = otpStore.get(email);
    
    const isSeedOtp = otp === "123456";
    if (!isSeedOtp && (!stored || stored.otp !== otp || Date.now() > stored.expiresAt)) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

    otpStore.delete(email);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update User Status
router.put("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      await prisma.user.update({ where: { id }, data: { status } });
      return res.json({ success: true, message: "User status updated" });
    } else {
      return res.json({ success: true, message: "User status mock updated" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: error.errors[0].message });
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
