/**
 * CopilotOperationalMemory - Cache for repeated queries
 * 
 * Stores recent KPIs, queries, insights, and analyses to avoid redundant calculations
 * Implements intelligent caching with TTL to balance freshness and performance
 */

import { supabase } from '@/lib/supabase';
import type { ResponseStrategy } from './CopilotIntentRouter';

export interface CachedResponse {
  query: string;
  response: string;
  strategy: ResponseStrategy;
  sources: string[];
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MemoryStatistics {
  totalQueries: number;
  strategyUsage: Record<ResponseStrategy, number>;
  aiUsageRate: number;
  averageResponseTime: number;
  cacheHitRate: number;
}

export class CopilotOperationalMemory {
  private cache: Map<string, CachedResponse> = new Map();
  private queryHistory: Array<{ query: string; strategy: ResponseStrategy; timestamp: string; executionTime: number }> = [];
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  /**
   * Get cached response for a query
   */
  async get(query: string, tenantId?: string): Promise<CachedResponse | null> {
    if (!tenantId) return null;
    const cacheKey = this.getCacheKey(query, tenantId);

    // Check in-memory cache first
    const inMemory = this.cache.get(cacheKey);
    if (inMemory && this.isCacheValid(inMemory.timestamp)) {
      this.cacheHits++;
      return inMemory;
    }

    // Check database cache
    try {
      const { data, error } = await supabase
        .from('copilot_memory')
        .select('*')
        .eq('cache_key', cacheKey)
        .eq('tenant_id', tenantId || null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        this.cacheMisses++;
        return null;
      }

      // Check if cache is still valid
      if (!this.isCacheValid(data.created_at)) {
        this.cacheMisses++;
        return null;
      }

      // Store in memory cache
      const cachedResponse: CachedResponse = {
        query: data.query,
        response: data.response,
        strategy: data.strategy,
        sources: data.sources,
        confidence: data.confidence,
        timestamp: data.created_at,
        metadata: data.metadata,
      };

      this.cache.set(cacheKey, cachedResponse);
      this.cacheHits++;

      return cachedResponse;
    } catch (error) {
      console.error('Error getting from memory cache:', error);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Set a response in cache
   */
  async set(
    query: string,
    result: {
      strategy: ResponseStrategy;
      response: string;
      sources: string[];
      confidence: number;
      metadata?: Record<string, any>;
    },
    tenantId?: string
  ): Promise<void> {
    if (!tenantId) return;
    const cacheKey = this.getCacheKey(query, tenantId);

    const cachedResponse: CachedResponse = {
      query,
      response: result.response,
      strategy: result.strategy,
      sources: result.sources,
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
      metadata: result.metadata,
    };

    // Store in memory cache
    this.cache.set(cacheKey, cachedResponse);

    // Store in database
    try {
      await supabase
        .from('copilot_memory')
        .upsert({
          cache_key: cacheKey,
          query,
          response: result.response,
          strategy: result.strategy,
          sources: result.sources,
          confidence: result.confidence,
          metadata: result.metadata,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'cache_key,tenant_id'
        });
    } catch (error) {
      console.error('Error setting memory cache:', error);
    }

    // Record in history
    this.queryHistory.push({
      query,
      strategy: result.strategy,
      timestamp: new Date().toISOString(),
      executionTime: result.metadata?.executionTime || 0,
    });

    // Keep history size manageable
    if (this.queryHistory.length > 1000) {
      this.queryHistory = this.queryHistory.slice(-500);
    }
  }

  /**
   * Clear cache for a specific query or all cache
   */
  async clear(query?: string, tenantId?: string): Promise<void> {
    if (!tenantId) return;
    if (query) {
      const cacheKey = this.getCacheKey(query, tenantId);
      this.cache.delete(cacheKey);

      try {
        await supabase
          .from('copilot_memory')
          .delete()
          .eq('cache_key', cacheKey)
          .eq('tenant_id', tenantId || null);
      } catch (error) {
        console.error('Error clearing memory cache:', error);
      }
    } else {
      this.cache.clear();

      try {
        await supabase
          .from('copilot_memory')
          .delete()
          .eq('tenant_id', tenantId || null);
      } catch (error) {
        console.error('Error clearing all memory cache:', error);
      }
    }
  }

  /**
   * Get statistics on memory usage
   */
  async getStatistics(tenantId?: string): Promise<MemoryStatistics> {
    const totalQueries = this.queryHistory.length;
    const strategyUsage: Record<ResponseStrategy, number> = {
      kpi_precomputed: 0,
      insight_existing: 0,
      analytics: 0,
      report_structured: 0,
      template: 0,
      ai: 0,
    };

    let aiUsage = 0;
    let totalExecutionTime = 0;

    for (const entry of this.queryHistory) {
      strategyUsage[entry.strategy]++;
      if (entry.strategy === 'ai') {
        aiUsage++;
      }
      totalExecutionTime += entry.executionTime;
    }

    const aiUsageRate = totalQueries > 0 ? (aiUsage / totalQueries) * 100 : 0;
    const averageResponseTime = totalQueries > 0 ? totalExecutionTime / totalQueries : 0;
    const cacheHitRate = this.cacheHits + this.cacheMisses > 0
      ? (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100
      : 0;

    return {
      totalQueries,
      strategyUsage,
      aiUsageRate,
      averageResponseTime,
      cacheHitRate,
    };
  }

  /**
   * Get recent queries
   */
  getRecentQueries(limit: number = 10): Array<{ query: string; strategy: ResponseStrategy; timestamp: string }> {
    return this.queryHistory
      .slice(-limit)
      .reverse()
      .map(entry => ({
        query: entry.query,
        strategy: entry.strategy,
        timestamp: entry.timestamp,
      }));
  }

  /**
   * Invalidate old cache entries
   */
  async invalidateOldCache(maxAgeMinutes: number = 60): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - maxAgeMinutes);

    // Clear in-memorycache
    for (const [key, value] of this.cache.entries()) {
      if (new Date(value.timestamp) < cutoffDate) {
        this.cache.delete(key);
      }
    }

    // Clear database cache
    try {
      await supabase
        .from('copilot_memory')
        .delete()
        .lt('created_at', cutoffDate.toISOString());
    } catch (error) {
      console.error('Error invalidating old cache:', error);
    }
  }

  private getCacheKey(query: string, tenantId?: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    return `${tenantId || 'default'}:${normalizedQuery}`;
  }

  private isCacheValid(timestamp: string): boolean {
    const cacheTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
    return diffMinutes < 30; // Cache valid for 30 minutes
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Clear in-memory cache only
   */
  clearInMemoryCache(): void {
    this.cache.clear();
  }
}

export const copilotOperationalMemory = new CopilotOperationalMemory();
