import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AccessLogService {
  /**
   * Registra um log de acesso
   */
  static async logAccess(data: {
    adminId: string;
    adminEmail: string;
    adminName: string;
    ipAddress?: string;
    userAgent?: string;
    loginMethod?: 'password' | '2fa';
    success: boolean;
  }) {
    try {
      await prisma.accessLog.create({
        data: {
          admin_id: data.adminId,
          admin_email: data.adminEmail,
          admin_name: data.adminName,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          login_method: data.loginMethod || 'password',
          success: data.success,
        },
      });
    } catch (error) {
      // Não falhar o login se o log falhar
      console.error('Erro ao registrar log de acesso:', error);
    }
  }

  /**
   * Obtém o IP do cliente da requisição
   * Verifica múltiplos headers e propriedades para capturar o IP real
   */
  static getClientIp(req: any): string | undefined {
    // Log para debug (apenas em desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Headers disponíveis para captura de IP:', {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'x-client-ip': req.headers['x-client-ip'],
        'cf-connecting-ip': req.headers['cf-connecting-ip'],
        'forwarded': req.headers['forwarded'],
        'connection.remoteAddress': req.connection?.remoteAddress,
        'socket.remoteAddress': req.socket?.remoteAddress,
        'req.ip': req.ip
      });
    }
    // Função auxiliar para normalizar IP
    const normalizeIp = (ip: string): string => {
      // Remove espaços e quebras de linha
      ip = ip.trim();
      // Remove prefixo IPv6-mapped IPv4 (::ffff:)
      ip = ip.replace(/^::ffff:/i, '');
      // Remove colchetes do IPv6 se presente
      ip = ip.replace(/^\[|\]$/g, '');
      return ip;
    };

    // Função auxiliar para verificar se é localhost
    const isLocalhost = (ip: string): boolean => {
      const normalized = normalizeIp(ip);
      return normalized === '::1' || 
             normalized === '127.0.0.1' || 
             normalized === 'localhost' ||
             normalized.startsWith('192.168.') ||
             normalized.startsWith('10.') ||
             normalized.startsWith('172.16.') ||
             normalized.startsWith('172.17.') ||
             normalized.startsWith('172.18.') ||
             normalized.startsWith('172.19.') ||
             normalized.startsWith('172.20.') ||
             normalized.startsWith('172.21.') ||
             normalized.startsWith('172.22.') ||
             normalized.startsWith('172.23.') ||
             normalized.startsWith('172.24.') ||
             normalized.startsWith('172.25.') ||
             normalized.startsWith('172.26.') ||
             normalized.startsWith('172.27.') ||
             normalized.startsWith('172.28.') ||
             normalized.startsWith('172.29.') ||
             normalized.startsWith('172.30.') ||
             normalized.startsWith('172.31.');
    };

    // 1. Verifica x-forwarded-for (mais comum)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map((ip: string) => normalizeIp(ip.trim()));
      // Pega o primeiro IP que não seja localhost
      for (const ip of ips) {
        if (ip && !isLocalhost(ip)) {
          return ip;
        }
      }
      // Se todos forem localhost, retorna o primeiro mesmo assim
      if (ips[0]) {
        return normalizeIp(ips[0]);
      }
    }

    // 2. Verifica header Forwarded (RFC 7239)
    const forwarded = req.headers['forwarded'];
    if (forwarded) {
      // Formato: for=192.0.2.60;proto=http;by=203.0.113.43
      const forMatch = forwarded.match(/for=([^;,\s]+)/i);
      if (forMatch && forMatch[1]) {
        let ip = forMatch[1];
        // Remove aspas se presente
        ip = ip.replace(/^"|"$/g, '');
        ip = normalizeIp(ip);
        if (ip && !isLocalhost(ip)) {
          return ip;
        }
        if (ip) {
          return ip;
        }
      }
    }

    // 3. Outros headers comuns
    const headersToCheck = [
      'x-real-ip',
      'x-client-ip',
      'cf-connecting-ip', // Cloudflare
      'true-client-ip', // Cloudflare Enterprise
      'x-cluster-client-ip',
      'x-forwarded',
      'forwarded-for'
    ];

    for (const header of headersToCheck) {
      const value = req.headers[header];
      if (value) {
        const ip = normalizeIp(typeof value === 'string' ? value.split(',')[0].trim() : String(value));
        if (ip && !isLocalhost(ip)) {
          return ip;
        }
        if (ip) {
          return ip;
        }
      }
    }

    // 4. Verifica propriedades do socket/connection
    const socketIp = req.connection?.remoteAddress || 
                     req.socket?.remoteAddress ||
                     req.ip;

    if (socketIp) {
      const cleanIp = normalizeIp(socketIp);
      
      // Em desenvolvimento, retorna localhost se for o caso
      if (isLocalhost(cleanIp)) {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
          return '127.0.0.1'; // Retorna localhost em desenvolvimento
        }
        return undefined; // Não retorna localhost em produção
      }
      
      return cleanIp;
    }

    return undefined;
  }

  /**
   * Obtém o User-Agent da requisição
   */
  static getUserAgent(req: any): string | undefined {
    return req.headers['user-agent'] || undefined;
  }
}

