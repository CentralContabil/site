import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PostData {
  title: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  url: string;
}

export class SocialMediaService {
  /**
   * Publica no Facebook
   */
  static async publishToFacebook(
    accessToken: string,
    pageId: string,
    postData: PostData
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Remover HTML do conteúdo para o post
      const textContent = postData.content.replace(/<[^>]*>/g, '').substring(0, 500);
      const message = `${postData.title}\n\n${postData.excerpt || textContent}\n\n${postData.url}`;

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            access_token: accessToken,
            link: postData.url,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, postId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao publicar no Facebook' };
    }
  }

  /**
   * Publica no Instagram
   */
  static async publishToInstagram(
    accessToken: string,
    accountId: string,
    postData: PostData
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Instagram requer uma imagem, então vamos criar um container primeiro
      if (!postData.featuredImageUrl) {
        return { success: false, error: 'Instagram requer uma imagem para publicação' };
      }

      // Criar container de mídia
      const caption = `${postData.title}\n\n${postData.excerpt || ''}\n\n${postData.url}`;
      
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: postData.featuredImageUrl,
            caption: caption.substring(0, 2200), // Limite do Instagram
            access_token: accessToken,
          }),
        }
      );

      const containerData = await containerResponse.json();

      if (containerData.error) {
        return { success: false, error: containerData.error.message };
      }

      // Publicar o container
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${accountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accessToken,
          }),
        }
      );

      const publishData = await publishResponse.json();

      if (publishData.error) {
        return { success: false, error: publishData.error.message };
      }

      return { success: true, postId: publishData.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao publicar no Instagram' };
    }
  }

  /**
   * Publica no LinkedIn
   */
  static async publishToLinkedIn(
    accessToken: string,
    organizationId: string,
    postData: PostData
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const textContent = postData.content.replace(/<[^>]*>/g, '').substring(0, 3000);
      const text = `${postData.title}\n\n${postData.excerpt || textContent}\n\n${postData.url}`;

      const response = await fetch(
        `https://api.linkedin.com/v2/ugcPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
          body: JSON.stringify({
            author: `urn:li:organization:${organizationId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: text.substring(0, 3000),
                },
                shareMediaCategory: 'ARTICLE',
                media: [
                  {
                    status: 'READY',
                    description: {
                      text: postData.excerpt || '',
                    },
                    originalUrl: postData.url,
                    title: {
                      text: postData.title,
                    },
                  },
                ],
              },
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Erro ao publicar no LinkedIn' };
      }

      return { success: true, postId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao publicar no LinkedIn' };
    }
  }

  /**
   * Publica no Twitter/X
   */
  static async publishToTwitter(
    apiKey: string,
    apiSecret: string,
    accessToken: string,
    accessTokenSecret: string,
    postData: PostData
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Twitter API v2 requer OAuth 1.0a
      // Por simplicidade, vamos usar uma abordagem simplificada
      // Em produção, você deve usar uma biblioteca OAuth adequada
      
      const textContent = postData.content.replace(/<[^>]*>/g, '').substring(0, 200);
      const text = `${postData.title}\n\n${postData.excerpt || textContent}\n\n${postData.url}`;
      
      // Nota: Implementação completa requer biblioteca OAuth como 'oauth-1.0a'
      // Por enquanto, retornamos um erro informativo
      return { 
        success: false, 
        error: 'Publicação no Twitter requer implementação OAuth 1.0a. Use uma biblioteca como oauth-1.0a.' 
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao publicar no Twitter' };
    }
  }

  /**
   * Publica no Threads
   */
  static async publishToThreads(
    accessToken: string,
    accountId: string,
    postData: PostData
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      const textContent = postData.content.replace(/<[^>]*>/g, '').substring(0, 500);
      const text = `${postData.title}\n\n${postData.excerpt || textContent}\n\n${postData.url}`;

      const response = await fetch(
        `https://graph.threads.net/v1.0/${accountId}/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_type: 'TEXT',
            text: text.substring(0, 500),
            access_token: accessToken,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        return { success: false, error: data.error.message };
      }

      return { success: true, postId: data.id };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao publicar no Threads' };
    }
  }

  /**
   * Publica em todas as redes sociais selecionadas
   */
  static async publishToSocialMedia(
    config: any,
    postData: PostData,
    options: {
      publishToFacebook?: boolean;
      publishToInstagram?: boolean;
      publishToLinkedIn?: boolean;
      publishToTwitter?: boolean;
      publishToThreads?: boolean;
    }
  ): Promise<{
    facebook?: { success: boolean; postId?: string; error?: string };
    instagram?: { success: boolean; postId?: string; error?: string };
    linkedin?: { success: boolean; postId?: string; error?: string };
    twitter?: { success: boolean; postId?: string; error?: string };
    threads?: { success: boolean; postId?: string; error?: string };
  }> {
    const results: any = {};

    // Facebook
    if (options.publishToFacebook && config.facebook_api_enabled) {
      if (config.facebook_access_token && config.facebook_page_id) {
        results.facebook = await this.publishToFacebook(
          config.facebook_access_token,
          config.facebook_page_id,
          postData
        );
      }
    }

    // Instagram
    if (options.publishToInstagram && config.instagram_api_enabled) {
      if (config.instagram_access_token && config.instagram_account_id) {
        results.instagram = await this.publishToInstagram(
          config.instagram_access_token,
          config.instagram_account_id,
          postData
        );
      }
    }

    // LinkedIn
    if (options.publishToLinkedIn && config.linkedin_api_enabled) {
      if (config.linkedin_access_token && config.linkedin_organization_id) {
        results.linkedin = await this.publishToLinkedIn(
          config.linkedin_access_token,
          config.linkedin_organization_id,
          postData
        );
      }
    }

    // Twitter
    if (options.publishToTwitter && config.twitter_api_enabled) {
      if (
        config.twitter_api_key &&
        config.twitter_api_secret &&
        config.twitter_access_token &&
        config.twitter_access_token_secret
      ) {
        results.twitter = await this.publishToTwitter(
          config.twitter_api_key,
          config.twitter_api_secret,
          config.twitter_access_token,
          config.twitter_access_token_secret,
          postData
        );
      }
    }

    // Threads
    if (options.publishToThreads && config.threads_api_enabled) {
      if (config.threads_access_token && config.threads_account_id) {
        results.threads = await this.publishToThreads(
          config.threads_access_token,
          config.threads_account_id,
          postData
        );
      }
    }

    return results;
  }
}



