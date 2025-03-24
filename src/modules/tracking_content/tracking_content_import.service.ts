import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import { parse } from 'fast-csv';
import * as path from 'path';

@Injectable()
export class TrackingContentImportService {
  private readonly logger = new Logger(TrackingContentImportService.name);

  constructor(private readonly httpService: HttpService) {}

  // Default headers for outgoing API requests
  private readonly headers = {
    'Content-Type': 'application/json',
  };

  // API endpoints
  private readonly createContentApiUrl = 'http://localhost:3000/v1/tracking/content/create';
  private readonly enrollUserForCourseApiUrl = 'http://localhost:3000/v1/tracking/content/create';
  private readonly createAssessmentApiUrl = 'http://localhost:3000/v1/tracking/assessment/create';

  /**
   * Import content consumption data from CSV
   * @param filePath path to the CSV file
   */
  async importContent(filePath: string): Promise<{ success: number; errors: number }> {
    return new Promise((resolve, reject) => {
      let successCount = 0;
      let errorCount = 0;

      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on('data', async (row) => {
          try {
            // Construct payload for content tracking
            const contentPayload = {
              userId: row.userid,
              contentId: row.contentid,
              courseId: row.courseid,
              lastAccessOn: row.lastaccesstime,
              createdOn: row.datetime,
              contentType: 'pdf',
              contentMime: 'application/pdf',
              unitId: 'do_1141574296398561281114',
              detailsObject: [
                {
                  eid: 'START',
                  edata: {
                    type: 'content',
                    mode: 'play',
                    pageid: '',
                    duration: 1.88,
                  },
                },
                {
                  eid: 'INTERACT',
                  edata: {
                    type: 'TOUCH',
                    subtype: '',
                    id: 'close_menu',
                    pageid: '16',
                  },
                },
              ],
            };

            await this.createContent(contentPayload);
            successCount++;
            console.log(`✅ Success: ${successCount}`);
          } catch (error) {
            console.error(`❌ Error creating content ${row.contentid}:`, error?.response?.data || error.message);
            errorCount++;
          }
        })
        .on('end', () => resolve({ success: successCount, errors: errorCount }))
        .on('error', (error) => reject(error));
    });
  }

  // Call content creation API
  private async createContent(userPayload: any) {
    const config: AxiosRequestConfig = { headers: this.headers };
    console.log(this.createContentApiUrl, userPayload, config);
    await lastValueFrom(this.httpService.post(this.createContentApiUrl, userPayload, config));
  }

  /**
   * Import course enrollment data from CSV
   * @param filePath path to the CSV file
   */
  async importUserEnrollment(filePath: string): Promise<{ success: number; errors: number }> {
    return new Promise((resolve, reject) => {
      let successCount = 0;
      let errorCount = 0;

      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on('data', async (row) => {
          try {
            // Construct enrollment payload
            const contentPayload = {
              userId: row.userid,
              contentId: row.contentid,
              courseId: row.courseid,
              lastAccessOn: row.lastaccesstime,
              createdOn: row.datetime,
              contentType: 'pdf',
              contentMime: 'application/pdf',
              unitId: 'do_1141574296398561281114',
              detailsObject: [
                {
                  eid: 'START',
                  edata: {
                    type: 'content',
                    mode: 'play',
                    pageid: '',
                    duration: 1.88,
                  },
                },
                {
                  eid: 'INTERACT',
                  edata: {
                    type: 'TOUCH',
                    subtype: '',
                    id: 'close_menu',
                    pageid: '16',
                  },
                },
              ],
            };

            await this.createUserEnrollment(contentPayload);
            successCount++;
            console.log(`✅ Success: ${successCount}`);
          } catch (error) {
            console.error(`❌ Error creating enrollment ${row.contentid}:`, error?.response?.data || error.message);
            errorCount++;
          }
        })
        .on('end', () => resolve({ success: successCount, errors: errorCount }))
        .on('error', (error) => reject(error));
    });
  }

  // Call course enrollment API
  private async createUserEnrollment(userPayload: any) {
    const config: AxiosRequestConfig = { headers: this.headers };
    console.log(this.enrollUserForCourseApiUrl, userPayload, config);
    await lastValueFrom(this.httpService.post(this.enrollUserForCourseApiUrl, userPayload, config));
  }

  /**
   * Import user assessment data from CSV
   * @param filePath path to the CSV file
   */
  async importAssessment(filePath: string): Promise<{ success: number; errors: number }> {
    return new Promise((resolve, reject) => {
      let successCount = 0;
      let errorCount = 0;

      fs.createReadStream(filePath)
        .pipe(parse({ headers: true }))
        .on('data', async (row) => {
          try {
            const originalSummary = JSON.parse(row.question);
            const formattedSummary = this.transformAssessmentSummary(originalSummary);
            const totalDuration = originalSummary.reduce((total, q) => total + (q.duration || 0), 0);

            // Construct assessment payload
            const assessmentPayload = {
              userId: row.user_id,
              contentId: row.content_id,
              courseId: row.course_id,
              attemptId: row.attempt_id,
              createdOn: row.created_on,
              lastAttemptedOn: row.last_attempted_on,
              totalMaxScore: Number(row.total_max_score),
              totalScore: Number(row.total_score),
              assessmentSummary: formattedSummary,
              timeSpent: totalDuration,
              unitId: 'do_1141574296398561281114',
            };

            await this.createAssessment(assessmentPayload);
            successCount++;
            console.log(`✅ Success: ${successCount}`);
          } catch (error) {
            console.error(`❌ Error creating assessment ${row.content_id}:`, error?.response?.data || error.message);
            errorCount++;
          }
        })
        .on('end', () => resolve({ success: successCount, errors: errorCount }))
        .on('error', (error) => reject(error));
    });
  }

  // Call assessment tracking API
  private async createAssessment(userPayload: any) {
    const config: AxiosRequestConfig = { headers: this.headers };
    console.log(this.createAssessmentApiUrl, userPayload, config);
    await lastValueFrom(this.httpService.post(this.createAssessmentApiUrl, userPayload, config));
  }

  /**
   * Transform raw assessment summary into enriched structure
   * @param input original question-level assessment data
   * @returns transformed data object with metadata
   */
  private transformAssessmentSummary(input: any[]): any[] {
    const sectionId = 'do_114067393342742528128';
    const sectionName = 'प्रगति ओरिएंटेशन परीक्षा प्रश्न';

    const data = input.map((q, index) => {
      const itemParams = Array.isArray(q.params)
        ? q.params.map((param: any, i: number) => ({
            value: {
              body: `<p>${param[Object.keys(param)[0]]}</p>`,
              value: i,
            },
            answer: q.params[i]?.answer === 'true' || false,
          }))
        : [];

      const resvalues = q.resvalues?.map((res: any, i: number) => ({
        label: `<p>${res[Object.keys(res)[0]]}</p>`,
        value: i,
        selected: true,
      })) || [];

      return {
        item: {
          id: q.id,
          type: q.type,
          title: q.title,
          params: itemParams,
          maxscore: q.max_score,
          sectionId,
        },
        pass: q.score > 0 ? 'Yes' : 'No',
        index: index + 1,
        score: q.score,
        duration: q.duration,
        resvalues,
        sectionName,
      };
    });

    return [
      {
        data,
        sectionId,
        sectionName,
      },
    ];
  }
}
