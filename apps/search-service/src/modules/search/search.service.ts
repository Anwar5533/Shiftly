import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Client } from '@opensearch-project/opensearch';
import OpenAI from 'openai';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly opensearchClient: Client;
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.opensearchClient = new Client({
      node: process.env.OPENSEARCH_ENDPOINT || 'http://localhost:9200',
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'mock-key',
    });
  }

  async searchJobs(query: string, filters: any = {}) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
    const { category, minPayRate } = filters;

    // AI/Vector Search Attempt
    if (query && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-REPLACE_WITH_YOUR_OPENAI_API_KEY' && process.env.OPENAI_API_KEY !== 'mock-key') {
      try {
        this.logger.log(`Generating embedding for query: "${query}"`);
        const embeddingResponse = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: query,
        });
        const vector = embeddingResponse.data[0].embedding;
        
        const searchResponse = await this.opensearchClient.search({
          index: 'jobs',
          body: {
            size: 20,
            query: {
              knn: {
                embedding: {
                  vector: vector,
                  k: 20,
                }
              }
            }
          }
        });
        
        const jobIds = searchResponse.body.hits.hits.map((hit: any) => hit._id);
        
        if (jobIds.length > 0) {
          return this.prisma.job.findMany({
            where: { id: { in: jobIds }, status: 'PUBLISHED' },
            include: { employer: { select: { companyName: true, industry: true } } },
          });
        }
      } catch (error) {
        this.logger.error('OpenSearch/OpenAI matching failed, falling back to DB', error);
      }
    }

    // Fallback DB Search
    const where: any = { status: 'PUBLISHED' };

    if (query) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (category) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      where.jobType = category;
    }

    if (minPayRate) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- TODO(RC3): Address type safety
      where.salaryMin = { gte: Number(minPayRate) };
    }

    return this.prisma.job.findMany({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- TODO(RC3): Address type safety
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          select: { companyName: true, industry: true },
        },
      },
    });
  }
}
