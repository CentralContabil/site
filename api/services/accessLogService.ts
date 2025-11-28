import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

export class AccessLogService {
  /**
   * Registra um acesso ao sistema
   */
  static async logAccess(
    adminId: string | null,
    email: string,
    name: string | null,
    req: Request,
    loginMethod: 'password' | '2fa',
    success: boolean
  ): Promise<void> {
    try {
      const ipAddress = this.getClientIp(req);
      const userAgent = this.getUserAgent(req);

      await prisma.accessLog.create({
        data: {
          admin_id: adminId,
          email: email.toLowerCase().trim(),
          name: name || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          login_method: loginMethod,
          success,
        },
      });
    } catch (error) {
      console.error('Erro ao registrar log de acesso:', error);
      // Não falha o login se o log falhar
    }
  }

  /**
   * Obtém o IP do cliente
   */
  static getClientIp(req: Request): string | null {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const forwardedHeader = req.headers['forwarded'];

    let ip: string | undefined;

    if (forwarded) {
      ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = Array.isArray(realIp) ? realIp[0] : realIp;
    } else if (cfConnectingIp) {
      ip = Array.isArray(cfConnectingIp) ? cfConnectingIp[0] : cfConnectingIp;
    } else if (forwardedHeader) {
      const match = forwardedHeader.match(/for=([^;]+)/);
      if (match) {
        ip = match[1].trim();
      }
    }

    if (!ip) {
      ip = req.socket.remoteAddress || req.ip;
    }

    // Normaliza IPv6
    if (ip && ip.startsWith('::ffff:')) {
      ip = ip.substring(7);
    }

    return ip || null;
  }

  /**
   * Obtém o User Agent do cliente
   */
  static getUserAgent(req: Request): string | null {
    return req.headers['user-agent'] || null;
  }
}




