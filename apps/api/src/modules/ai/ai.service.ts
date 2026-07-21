import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateMatchScore(workerId: string, jobId: string) {
    // In a real application, we would call an LLM or ML model here
    // For now, we generate a deterministic pseudo-random score based on IDs
    
    // Check if worker and job exist
    const worker = await this.prisma.workerProfile.findUnique({ where: { userId: workerId } });
    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    
    if (!worker || !job) {
      return { score: 0, reason: 'Missing profile or job data' };
    }

    // Mock logic based on IDs length and some arbitrary factors
    const combinedLength = worker.id.length + job.id.length;
    const baseScore = 70; // Base score 70%
    const variable = (combinedLength % 30); // 0 to 29
    
    const score = Math.min(100, baseScore + variable);
    
    let reason = "Good fit based on standard criteria.";
    if (score > 90) {
      reason = "Excellent match! Skills and availability align perfectly.";
    } else if (score > 80) {
      reason = "Strong match based on previous experience.";
    } else if (score < 75) {
      reason = "Partial match. May require additional training.";
    }

    return {
      score,
      reason
    };
  }
}
