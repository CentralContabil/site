import { PrismaClient } from '@prisma/client';
import { FileService, FileUploadResult } from './fileService.js';

const prisma = new PrismaClient();

export interface ConfigurationData {
  company_name?: string;
  phone?: string;
  email?: string;
  contact_email?: string;
  address?: string;
  business_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  logo_url?: string;
  logo_dark_url?: string;
  favicon_url?: string;
  whatsapp_number?: string | null;
  footer_years_text?: string;
  head_scripts?: string | null;
  body_scripts?: string | null;
  // Redes Sociais
  facebook_api_enabled?: boolean;
  facebook_access_token?: string;
  facebook_page_id?: string;
  instagram_api_enabled?: boolean;
  instagram_access_token?: string;
  instagram_account_id?: string;
  linkedin_api_enabled?: boolean;
  linkedin_access_token?: string;
  linkedin_organization_id?: string;
  twitter_api_enabled?: boolean;
  twitter_api_key?: string;
  twitter_api_secret?: string;
  twitter_access_token?: string;
  twitter_access_token_secret?: string;
  threads_api_enabled?: boolean;
  threads_access_token?: string;
  threads_account_id?: string;
  [key: string]: any; // Permite campos adicionais
}

export class ConfigurationService {
  static async getConfiguration() {
    let config = await prisma.configuration.findFirst();
    
    if (!config) {
      config = await prisma.configuration.create({
        data: {
          company_name: 'Central Contábil'
        }
      });
    }
    
    return config;
  }

  static async updateConfiguration(data: ConfigurationData) {
    const config = await this.getConfiguration();
    
    return await prisma.configuration.update({
      where: { id: config.id },
      data
    });
  }

  static async uploadLogo(file: Express.Multer.File, type: 'logo' | 'logo_dark' | 'favicon'): Promise<FileUploadResult> {
    try {
      // Valida o arquivo
      FileService.validateImageFile(file);
      
      // Faz upload do arquivo
      const uploadResult = await FileService.uploadFile(file);
      
      // Pega configuração atual
      const config = await this.getConfiguration();
      
      // Deleta logo antiga se existir
      const fieldName = type === 'logo' ? 'logo_url' : 
                       type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
      
      const oldLogoUrl = config[fieldName as keyof typeof config] as string;
      if (oldLogoUrl) {
        const oldFilename = oldLogoUrl.split('/').pop();
        if (oldFilename) {
          await FileService.deleteFile(oldFilename);
        }
      }
      
      // Atualiza configuração com nova logo
      await this.updateConfiguration({
        [fieldName]: uploadResult.url
      } as ConfigurationData);
      
      return uploadResult;
    } catch (error) {
      throw error;
    }
  }

  static async deleteLogo(type: 'logo' | 'logo_dark' | 'favicon'): Promise<void> {
    const config = await this.getConfiguration();
    const fieldName = type === 'logo' ? 'logo_url' : 
                     type === 'logo_dark' ? 'logo_dark_url' : 'favicon_url';
    
    const logoUrl = config[fieldName as keyof typeof config] as string;
    if (logoUrl) {
      const filename = logoUrl.split('/').pop();
      if (filename) {
        await FileService.deleteFile(filename);
      }
    }
    
    await this.updateConfiguration({
      [fieldName]: null
    } as ConfigurationData);
  }
}