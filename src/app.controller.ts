import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Header,
  Inject,
  Options,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

@Controller()
export class AppController {
  @Options('*')
  @Header('Access-Control-Allow-Origin', '*')
  @Header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  @Header(
    'Access-Control-Allow-Headers',
    'X-API-KEY, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, environment-flag',
  )
  options() {}

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'hello';
  }

  @Get('/fetchBusinessProfile/:businessId/:userId')
  async fetchBusinessProfile(
    @Req() req: Request,
    @Param('businessId') businessId: string,
    @Param('userId') userId: string,
  ) {
    const origin = req.header('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      // Set the Access-Control-Allow-Origin header to the value of the Origin header
      req.res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const res = await this.appService.fetchBusinessProfile({
      businessId,
      userId,
    });
    return res;
  }

  @Post('/fetchBusinessProfiles')
  async fetchBusinessProfiles(
    @Req() req: Request,
    @Body()
    body: {
      userId: string;
      tags?: string[];
      businessStates?: string[];
    },
  ) {
    const origin = req.header('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      // Set the Access-Control-Allow-Origin header to the value of the Origin header
      req.res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const res = await this.appService.fetchBusinessProfiles(body);
    return res;
  }

  @Post('/fetchLikedBusinessProfiles')
  async fetchLikedBusinessProfiles(
    @Req() req: Request,
    @Body()
    body: {
      userId: string;
      tags?: string[];
      businessStates?: string[];
    },
  ) {
    const origin = req.header('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      // Set the Access-Control-Allow-Origin header to the value of the Origin header
      req.res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const res = await this.appService.fetchLikedBusinessProfiles(body);
    return res;
  }

  @Get('/fetchReview/:businessId/:userId')
  async fetchReview(
    @Req() req: Request,
    @Param('businessId') businessId: string,
    @Param('userId') userId: string,
  ) {
    const origin = req.header('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      // Set the Access-Control-Allow-Origin header to the value of the Origin header
      req.res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const res = await this.appService.fetchReview({
      businessId,
      userId,
    });
    return res;
  }

  @Get('/fetchBusinessReviews/:businessId')
  async fetchBusinessReviews(
    @Req() req: Request,
    @Param('businessId') businessId: string,
  ) {
    const origin = req.header('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      // Set the Access-Control-Allow-Origin header to the value of the Origin header
      req.res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const res = await this.appService.fetchBusinessReviews({
      businessId,
    });

    return res;
  }

  @Get('/fetchUserReviews/:userId')
  async fetchUserReview(@Req() req: Request, @Param('userId') userId: string) {
    const origin = req.header('Origin');
    if (ALLOWED_ORIGINS.includes(origin)) {
      // Set the Access-Control-Allow-Origin header to the value of the Origin header
      req.res.setHeader('Access-Control-Allow-Origin', origin);
    }

    const res = await this.appService.fetchUserReviews({
      userId,
    });
    return res;
  }
}
