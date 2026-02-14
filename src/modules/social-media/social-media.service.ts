import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SocialMediaService {
  private readonly logger = new Logger(SocialMediaService.name);
  private readonly instagramAccessToken: string;
  private readonly instagramAccountId: string;

  constructor(private readonly configService: ConfigService) {
    this.instagramAccessToken = this.configService.get<string>('INSTAGRAM_ACCESS_TOKEN', '');
    this.instagramAccountId = this.configService.get<string>('INSTAGRAM_ACCOUNT_ID', '');
  }

  /**
   * Post a photo to Instagram Feed.
   * Note: The imageUrl must be a public URL. Localhost URLs will not work.
   * 
   * @param imageUrl Public URL of the image
   * @param caption Caption for the post
   */
  async postToInstagram(imageUrl: string, caption: string): Promise<any> {
    if (!this.instagramAccessToken || !this.instagramAccountId) {
      this.logger.warn('Instagram credentials not configured. Skipping post.');
      return;
    }

    try {
      this.logger.log(`Attempting to post to Instagram. Account: ${this.instagramAccountId}`);
      
      // Step 1: Create Media Container
      const mediaUrl = `https://graph.facebook.com/v18.0/${this.instagramAccountId}/media`;
      const mediaResponse = await axios.post(mediaUrl, null, {
        params: {
          image_url: imageUrl,
          caption: caption,
          access_token: this.instagramAccessToken,
        },
      });

      if (!mediaResponse.data || !mediaResponse.data.id) {
        throw new Error('Failed to create media container');
      }

      const creationId = mediaResponse.data.id;
      this.logger.log(`Media container created. ID: ${creationId}`);

      // Step 2: Publish Media
      const publishUrl = `https://graph.facebook.com/v18.0/${this.instagramAccountId}/media_publish`;
      const publishResponse = await axios.post(publishUrl, null, {
        params: {
          creation_id: creationId,
          access_token: this.instagramAccessToken,
        },
      });

      this.logger.log(`Instagram post published successfully. ID: ${publishResponse.data.id}`);
      return publishResponse.data;

    } catch (error: any) {
      this.logger.error('Failed to post to Instagram', error.response?.data || error.message);
      // We don't throw here to avoid failing the main transaction (e.g. promotion creation)
      // just because the social media post failed.
      return null;
    }
  }
}
