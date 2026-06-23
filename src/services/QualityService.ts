import { supabase } from "@/lib/supabase";
import type { ServiceResult } from "./types";

export interface QualityRecord {
  id: string;
  lot_id?: string;
  production_order_id?: string;
  inspection_type: 'incoming' | 'in_process' | 'final' | 'rework';
  status: 'pending' | 'approved' | 'rejected' | 'rework';
  quantity_inspected: number;
  quantity_approved: number;
  quantity_rejected: number;
  quantity_rework: number;
  defects?: string[];
  inspector_id?: string;
  inspection_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQualityRecordInput {
  lot_id?: string;
  production_order_id?: string;
  inspection_type: 'incoming' | 'in_process' | 'final' | 'rework';
  quantity_inspected: number;
  quantity_approved: number;
  quantity_rejected: number;
  quantity_rework?: number;
  defects?: string[];
  inspector_id?: string;
  notes?: string;
}

export interface UpdateQualityRecordInput {
  status?: 'pending' | 'approved' | 'rejected' | 'rework';
  quantity_approved?: number;
  quantity_rejected?: number;
  quantity_rework?: number;
  defects?: string[];
  notes?: string;
}

export class QualityService {
  /**
   * Cria um novo registro de qualidade
   */
  async create(input: CreateQualityRecordInput): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .insert({
          ...input,
          status: 'pending',
          inspection_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao criar registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um registro de qualidade
   */
  async update(id: string, input: UpdateQualityRecordInput): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao atualizar registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um registro de qualidade
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      const { error } = await supabase
        .schema('industrial').from('qualidade')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erro ao remover registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um registro de qualidade por ID
   */
  async getById(id: string): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .select(`
          *,
          lots:lot_id (lot_number, product_id),
          production_orders:production_order_id (order_number, product_id),
          inspectors:inspector_id (name, function)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao buscar registro de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista registros de qualidade
   */
  async list(options?: { 
    lot_id?: string;
    production_order_id?: string;
    inspection_type?: QualityRecord['inspection_type'];
    status?: QualityRecord['status'];
    start_date?: string;
    end_date?: string;
  }): Promise<ServiceResult<QualityRecord[]>> {
    try {
      let query = supabase
        .schema('industrial').from('qualidade')
        .select(`
          *,
          lots:lot_id (lot_number, product_id),
          production_orders:production_order_id (order_number, product_id),
          inspectors:inspector_id (name, function)
        `);

      if (options?.lot_id) {
        query = query.eq('lot_id', options.lot_id);
      }

      if (options?.production_order_id) {
        query = query.eq('production_order_id', options.production_order_id);
      }

      if (options?.inspection_type) {
        query = query.eq('inspection_type', options.inspection_type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.start_date) {
        query = query.gte('inspection_date', options.start_date);
      }

      if (options?.end_date) {
        query = query.lte('inspection_date', options.end_date);
      }

      const { data, error } = await query.order('inspection_date', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord[]
      };
    } catch (error) {
      console.error('Erro ao listar registros de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra refugo durante produção
   */
  async registerScrap(productionOrderId: string, quantity: number, reason: string, defectType?: string): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .insert({
          production_order_id: productionOrderId,
          inspection_type: 'in_process',
          status: 'rejected',
          quantity_inspected: quantity,
          quantity_approved: 0,
          quantity_rejected: quantity,
          quantity_rework: 0,
          defects: defectType ? [defectType] : [],
          notes: reason,
          inspection_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao registrar refugo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Aprova um lote após inspeção
   */
  async approveLot(lotId: string, inspectorId: string, notes?: string): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .insert({
          lot_id: lotId,
          inspection_type: 'final',
          status: 'approved',
          quantity_inspected: 0,
          quantity_approved: 0,
          quantity_rejected: 0,
          quantity_rework: 0,
          inspector_id: inspectorId,
          notes,
          inspection_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar status do lote
      await supabase
        .schema('industrial').from('lotes')
        .update({ status: 'completed' })
        .eq('id', lotId);

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao aprovar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Rejeita um lote após inspeção
   */
  async rejectLot(lotId: string, inspectorId: string, reason: string, defects?: string[]): Promise<ServiceResult<QualityRecord>> {
    try {
      const { data, error } = await supabase
        .schema('industrial').from('qualidade')
        .insert({
          lot_id: lotId,
          inspection_type: 'final',
          status: 'rejected',
          quantity_inspected: 0,
          quantity_approved: 0,
          quantity_rejected: 0,
          quantity_rework: 0,
          defects: defects || [],
          notes: reason,
          inspector_id: inspectorId,
          inspection_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar status do lote
      await supabase
        .schema('industrial').from('lotes')
        .update({ status: 'rejected', notes: reason })
        .eq('id', lotId);

      return {
        success: true,
        data: data as QualityRecord
      };
    } catch (error) {
      console.error('Erro ao rejeitar lote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula taxa de refugo de uma OP
   */
  async calculateScrapRate(productionOrderId: string): Promise<ServiceResult<{ scrapRate: number; totalRejected: number; totalProduced: number }>> {
    try {
      const { data: records, error } = await supabase
        .from('qualidade')
        .select('quantity_rejected')
        .eq('production_order_id', productionOrderId);

      if (error) throw error;

      const totalRejected = records?.reduce((sum, r) => sum + (r.quantity_rejected || 0), 0) || 0;

      // Buscar quantidade produzida
      const { data: order } = await supabase
        .schema('industrial').from('ordens_producao')
        .select('quantidade')
        .eq('id', productionOrderId)
        .single();

      const totalProduced = order?.quantidade || 0;
      const scrapRate = totalProduced > 0 ? (totalRejected / totalProduced) * 100 : 0;

      return {
        success: true,
        data: {
          scrapRate,
          totalRejected,
          totalProduced,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular taxa de refugo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista defeitos mais comuns
   */
  async listCommonDefects(limit: number = 10): Promise<ServiceResult<Array<{ defect: string; count: number }>>> {
    try {
      const { data, error } = await supabase
        .from('qualidade')
        .select('defects')
        .not('defects', 'is', null);

      if (error) throw error;

      const defectCounts = new Map<string, number>();
      (data || []).forEach(record => {
        (record.defects || []).forEach((defect: string) => {
          defectCounts.set(defect, (defectCounts.get(defect) || 0) + 1);
        });
      });

      const sorted = Array.from(defectCounts.entries())
        .map(([defect, count]) => ({ defect, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);

      return {
        success: true,
        data: sorted
      };
    } catch (error) {
      console.error('Erro ao listar defeitos comuns:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria uma não-conformidade
   */
  async createNonConformity(input: {
    type: 'material' | 'process' | 'product' | 'documentation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rootCause?: string;
    correctiveAction?: string;
    responsibleId?: string;
    dueDate?: string;
    productionOrderId?: string;
    lotId?: string;
  }): Promise<ServiceResult<any>> {
    try {
      const { data, error } = await supabase
        .from('nao_conformidades')
        .insert({
          ...input,
          status: 'open',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao criar não-conformidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista não-conformidades
   */
  async listNonConformities(options?: {
    status?: string;
    severity?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ServiceResult<any[]>> {
    try {
      let query = supabase
        .from('nao_conformidades')
        .select();

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.severity) {
        query = query.eq('severity', options.severity);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Erro ao listar não-conformidades:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza status de não-conformidade
   */
  async updateNonConformity(id: string, input: {
    status?: string;
    correctiveAction?: string;
    verification?: string;
  }): Promise<ServiceResult<any>> {
    try {
      const { data, error } = await supabase
        .from('nao_conformidades')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao atualizar não-conformidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Registra retrabalho
   */
  async registerRework(input: {
    productionOrderId: string;
    quantity: number;
    reason: string;
    defectType?: string;
    estimatedCost?: number;
    actualCost?: number;
  }): Promise<ServiceResult<any>> {
    try {
      const { data, error } = await supabase
        .from('retrabalhos')
        .insert({
          ...input,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao registrar retrabalho:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Lista retrabalhos
   */
  async listReworks(options?: {
    productionOrderId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ServiceResult<any[]>> {
    try {
      let query = supabase
        .from('retrabalhos')
        .select();

      if (options?.productionOrderId) {
        query = query.eq('production_order_id', options.productionOrderId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.startDate) {
        query = query.gte('created_at', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('created_at', options.endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Erro ao listar retrabalhos:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Calcula métricas de qualidade por período
   */
  async calculateQualityMetrics(startDate: string, endDate: string): Promise<ServiceResult<{
    totalInspections: number;
    totalApproved: number;
    totalRejected: number;
    totalRework: number;
    approvalRate: number;
    rejectionRate: number;
    reworkRate: number;
    scrapRate: number;
    commonDefects: Array<{ defect: string; count: number }>;
    openNonConformities: number;
    totalReworkCost: number;
  }>> {
    try {
      // Buscar inspeções no período
      const { data: inspections, error: inspectionsError } = await supabase
        .from('qualidade')
        .select('*')
        .gte('inspection_date', startDate)
        .lte('inspection_date', endDate);

      if (inspectionsError) throw inspectionsError;

      const totalInspections = inspections?.length || 0;
      const totalApproved = inspections?.reduce((sum, r) => sum + (r.quantity_approved || 0), 0) || 0;
      const totalRejected = inspections?.reduce((sum, r) => sum + (r.quantity_rejected || 0), 0) || 0;
      const totalRework = inspections?.reduce((sum, r) => sum + (r.quantity_rework || 0), 0) || 0;
      const totalInspected = inspections?.reduce((sum, r) => sum + (r.quantity_inspected || 0), 0) || 0;

      const approvalRate = totalInspected > 0 ? (totalApproved / totalInspected) * 100 : 0;
      const rejectionRate = totalInspected > 0 ? (totalRejected / totalInspected) * 100 : 0;
      const reworkRate = totalInspected > 0 ? (totalRework / totalInspected) * 100 : 0;
      const scrapRate = totalInspected > 0 ? (totalRejected / totalInspected) * 100 : 0;

      // Buscar defeitos comuns
      const defectsResult = await this.listCommonDefects(10);

      // Buscar não-conformidades abertas
      const { data: nonConformities } = await supabase
        .from('nao_conformidades')
        .select('id')
        .eq('status', 'open');

      const openNonConformities = nonConformities?.length || 0;

      // Buscar custo de retrabalho
      const { data: reworks } = await supabase
        .from('retrabalhos')
        .select('actual_cost')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      const totalReworkCost = reworks?.reduce((sum, r) => sum + (r.actual_cost || 0), 0) || 0;

      return {
        success: true,
        data: {
          totalInspections,
          totalApproved,
          totalRejected,
          totalRework,
          approvalRate,
          rejectionRate,
          reworkRate,
          scrapRate,
          commonDefects: defectsResult.success ? (defectsResult.data || []) : [],
          openNonConformities,
          totalReworkCost,
        }
      };
    } catch (error) {
      console.error('Erro ao calcular métricas de qualidade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Inicia workflow de inspeção
   */
  async startInspectionWorkflow(input: {
    lotId?: string;
    productionOrderId?: string;
    inspectionType: 'incoming' | 'in_process' | 'final';
    checklist: Array<{ item: string; required: boolean; result?: boolean; notes?: string }>;
    inspectorId: string;
  }): Promise<ServiceResult<any>> {
    try {
      // Criar registro de qualidade
      const qualityRecord = await this.create({
        lot_id: input.lotId,
        production_order_id: input.productionOrderId,
        inspection_type: input.inspectionType,
        quantity_inspected: 0,
        quantity_approved: 0,
        quantity_rejected: 0,
        quantity_rework: 0,
        inspector_id: input.inspectorId,
      });

      if (!qualityRecord.success || !qualityRecord.data) {
        return qualityRecord;
      }

      // Criar checklist de inspeção
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists_inspecao')
        .insert({
          quality_record_id: qualityRecord.data.id,
          checklist: input.checklist,
          status: 'in_progress',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      return {
        success: true,
        data: {
          qualityRecord: qualityRecord.data,
          checklist,
        }
      };
    } catch (error) {
      console.error('Erro ao iniciar workflow de inspeção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Completa workflow de inspeção
   */
  async completeInspectionWorkflow(checklistId: string, results: Array<{ item: string; result: boolean; notes?: string }>): Promise<ServiceResult<any>> {
    try {
      // Atualizar checklist
      const { data: checklist, error: checklistError } = await supabase
        .from('checklists_inspecao')
        .update({
          checklist: results,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', checklistId)
        .select()
        .single();

      if (checklistError) throw checklistError;

      // Calcular resultado final
      const failedItems = results.filter(r => !r.result);
      const allPassed = failedItems.length === 0;

      // Atualizar registro de qualidade
      const qualityRecordId = checklist.quality_record_id;
      await this.update(qualityRecordId, {
        status: allPassed ? 'approved' : 'rejected',
        quantity_approved: allPassed ? 1 : 0,
        quantity_rejected: allPassed ? 0 : 1,
        defects: failedItems.map(f => f.item),
      });

      return {
        success: true,
        data: {
          checklist,
          allPassed,
          failedItems,
        }
      };
    } catch (error) {
      console.error('Erro ao completar workflow de inspeção:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Singleton instance
export const qualityService = new QualityService();
