import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import {
  individualBusinessProfileReturnType,
  individualReviewReturnType,
} from './types';

@Injectable()
export class AppService {
  private dynamo: AWS.DynamoDB.DocumentClient;

  constructor() {
    AWS.config.update({
      region: 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.dynamo = new AWS.DynamoDB.DocumentClient();
  }

  async fetchBusinessProfile({
    businessId,
    userId,
  }: {
    businessId: string;
    userId: string;
  }) {
    const item = await this.dynamo
      .get({
        Key: { id: businessId },
        TableName: 'BusinessProfile-m2ruyuknqfcxhp4ndrmfewfdlm-dev',
      })
      .promise();

    const name = item.Item.name;
    const state = item.Item.businessState;

    const userProfile = await this.dynamo
      .get({
        Key: { id: userId },
        TableName: 'UserProfile-n3zllqf5bnb7teipirimss4ene-dev',
      })
      .promise();

    const usersLikedBusinesses =
      userProfile.Item.likedBusinesses &&
      userProfile.Item.likedBusinesses.length > 0
        ? userProfile.Item.likedBusinesses
        : [];

    let liked = false;

    if (usersLikedBusinesses.includes(businessId)) {
      liked = true;
    }

    const businessProfile: individualBusinessProfileReturnType = {
      id: businessId,
      name,
      state,
      liked,
      album: [],
    };

    if (item.Item.profilePicture && item.Item.profilePicture.imageUrl) {
      businessProfile.profilePictureUrl = item.Item.profilePicture.imageUrl;
    }

    if (item.Item.description) {
      businessProfile.description = item.Item.description;
    }

    if (item.Item.address) {
      businessProfile.address = item.Item.address;
    }

    if (item.Item.website) {
      businessProfile.website = item.Item.website;
    }

    if (item.Item.operatingHours) {
      businessProfile.operatingHours = item.Item.operatingHours;
    }

    if (item.Item.contactInfo) {
      businessProfile.contactInfo = item.Item.contactInfo;
    }

    if (item.Item.tags) {
      businessProfile.tags = item.Item.tags;
    }

    const params = {
      TableName: 'Album-m2ruyuknqfcxhp4ndrmfewfdlm-dev',
      FilterExpression: 'businessProfileId = :businessProfileId',
      ExpressionAttributeValues: {
        ':businessProfileId': businessId,
      },
    };

    const albumResult = await this.dynamo.scan(params).promise();

    if (albumResult.Items) {
      for (const image of albumResult.Items) {
        businessProfile.album.push(image.imageUrl);
      }
    }

    return businessProfile;
  }

  private async queryBusinessProfiles({
    businessStates,
    tags,
  }: {
    tags?: string[];
    businessStates?: string[];
  }) {
    let filterExpressions = [];
    let expressionAttributeValues = {};

    if (tags) {
      tags.forEach((tag, index) => {
        filterExpressions.push(`contains (tags, :tag${index})`);
        expressionAttributeValues[`:tag${index}`] = tag;
      });
    }

    if (businessStates) {
      businessStates.forEach((state, index) => {
        filterExpressions.push(`businessState = :businessState${index}`);
        expressionAttributeValues[`:businessState${index}`] = state;
      });
    }

    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: 'BusinessProfile-m2ruyuknqfcxhp4ndrmfewfdlm-dev',
    };

    if (Object.keys(expressionAttributeValues).length > 0) {
      params['FilterExpression'] = filterExpressions.join(' OR ');
      params['ExpressionAttributeValues'] = expressionAttributeValues;
    }

    const items = await this.dynamo.scan(params).promise();

    return items.Items.map((item) => item.id);
  }

  async fetchBusinessProfiles({
    userId,
    businessStates,
    tags,
  }: {
    userId: string;
    tags?: string[];
    businessStates?: string[];
  }) {
    const filteredBusinessIds = await this.queryBusinessProfiles({
      tags,
      businessStates,
    });

    const businessProfiles: Array<individualBusinessProfileReturnType> = [];

    for (const businessId of filteredBusinessIds) {
      const businessProfile = await this.fetchBusinessProfile({
        businessId,
        userId,
      });
      businessProfiles.push(businessProfile);
    }

    return businessProfiles;
  }

  async fetchLikedBusinessProfiles({
    userId,
    businessStates,
    tags,
  }: {
    userId: string;
    tags?: string[];
    businessStates?: string[];
  }) {
    const userProfile = await this.dynamo
      .get({
        Key: { id: userId },
        TableName: 'UserProfile-n3zllqf5bnb7teipirimss4ene-dev',
      })
      .promise();

    const likedBusinessProfiles: Array<individualBusinessProfileReturnType> =
      [];

    if (
      userProfile.Item.likedBusinesses &&
      userProfile.Item.likedBusinesses.length > 0
    ) {
      const filteredBusinessIds = await this.queryBusinessProfiles({
        tags,
        businessStates,
      });
      const commonBusinessIds = filteredBusinessIds.filter((id) =>
        userProfile.Item.likedBusinesses.includes(id),
      );

      for (const businessId of commonBusinessIds) {
        const businessProfile = await this.fetchBusinessProfile({
          businessId: businessId,
          userId,
        });
        likedBusinessProfiles.push(businessProfile);
      }
    }

    return likedBusinessProfiles;
  }

  async fetchReview({
    businessId,
    userId,
  }: {
    businessId: string;
    userId: string;
  }) {
    const params = {
      TableName: 'Reviews-n3zllqf5bnb7teipirimss4ene-dev',
      FilterExpression: 'businessId = :businessId AND userId = :userId',
      ExpressionAttributeValues: {
        ':businessId': businessId,
        ':userId': userId,
      },
    };

    const fetchedReview = await this.dynamo.scan(params).promise();

    const review: individualReviewReturnType = {
      businessId,
      userId,
      rating: fetchedReview.Items[0].rating,
      text: fetchedReview.Items[0].text,
      updatedAt: fetchedReview.Items[0].updatedAt,
      id: fetchedReview.Items[0].id,
    };

    return review;
  }

  async fetchBusinessReviews({ businessId }: { businessId: string }) {
    const params = {
      TableName: 'Reviews-n3zllqf5bnb7teipirimss4ene-dev',
      FilterExpression: 'businessId = :businessId',
      ExpressionAttributeValues: {
        ':businessId': businessId,
      },
    };

    const fetchedReviews = await this.dynamo.scan(params).promise();

    const allReviews: Array<individualReviewReturnType> = [];

    for (const review of fetchedReviews.Items) {
      const formattedReview: individualReviewReturnType = {
        businessId,
        userId: review.userId,
        rating: review.rating,
        text: review.text,
        updatedAt: review.updatedAt,
        id: review.id,
      };

      allReviews.push(formattedReview);
    }

    return allReviews;
  }

  async fetchUserReviews({ userId }: { userId: string }) {
    const params = {
      TableName: 'Reviews-n3zllqf5bnb7teipirimss4ene-dev',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const fetchedReviews = await this.dynamo.scan(params).promise();

    const allReviews: Array<individualReviewReturnType> = [];

    for (const review of fetchedReviews.Items) {
      const formattedReview: individualReviewReturnType = {
        businessId: review.businessId,
        userId,
        rating: review.rating,
        text: review.text,
        updatedAt: review.updatedAt,
        id: review.id,
      };

      allReviews.push(formattedReview);
    }

    return allReviews;
  }
}
