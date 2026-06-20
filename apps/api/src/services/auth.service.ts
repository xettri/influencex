import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import type { RegisterInput, LoginInput } from "@influencex/shared";
import { Errors } from "../utils/errors.js";

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private fastify: FastifyInstance
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw Errors.conflict("Email already in use");

    const hashed = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        password: hashed,
        role: input.role,
        ...(input.role === "BRAND"
          ? { brand: { create: { name: input.name } } }
          : { influencer: { create: { displayName: input.name } } }),
      },
      include: { brand: true, influencer: true },
    });

    const tokens = await this.generateTokens(user.id);
    return { user: this.sanitize(user), tokens };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
      include: { brand: true, influencer: true },
    });

    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw Errors.unauthorized("Invalid email or password");
    }

    const tokens = await this.generateTokens(user.id);
    return { user: this.sanitize(user), tokens };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { brand: true, influencer: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw Errors.unauthorized("Invalid or expired refresh token");
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await this.generateTokens(stored.user.id);
    return { user: this.sanitize(stored.user), tokens };
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  private async generateTokens(userId: string) {
    const accessToken = this.fastify.jwt.sign({ sub: userId }, { expiresIn: "15m" });

    const rawRefresh = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: rawRefresh, userId, expiresAt },
    });

    return { accessToken, refreshToken: rawRefresh, expiresIn: 900 };
  }

  private sanitize(user: { id: string; email: string; role: string; createdAt: Date }) {
    return { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt };
  }
}
