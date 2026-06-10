import { Injectable } from '@nestjs/common';
import * as apn from 'apn';

@Injectable()
export class ApnsProvider {
  private readonly provider: apn.Provider;

  constructor() {
    this.provider = new apn.Provider({
      token: {
        key: process.env.APN_KEY_PATH!,
        keyId: process.env.APN_KEY_ID!,
        teamId: process.env.APN_TEAM_ID!,
      },
      production: process.env.NODE_ENV === 'production',
    });
  }

  getClient() {
    return this.provider;
  }
}