import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import { JobPosition } from '../../types';
import { Plus, Edit, Trash2, X, Users, ChevronRight, CheckCircle, XCircle, Clock, FileText, MessageSquare, ArrowRight, Star, UserPlus, Settings, Eye, EyeOff, GripVertical, BarChart3, TrendingUp, PieChart, Download, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/textarea';
import Swal from 'sweetalert2';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface RecruitmentProcess {
  id: string;
  title: string;
  description?: string;
  position_id: string;
  position?: JobPosition;
  status: 'open' | 'in_progress' | 'closed' | 'cancelled';
  open_date: string;
  close_date?: string;
  expected_start_date?: string;
  stages?: RecruitmentStage[];
  candidates?: RecruitmentCandidate[];
  _count?: {
    candidates: number;
    stages: number;
  };
}

interface RecruitmentStage {
  id: string;
  process_id: string;
  name: string;
  description?: string;
  order: number;
  is_active: boolean;
}

interface RecruitmentCandidate {
  id: string;
  process_id: string;
  application_id?: string;
  application?: any;
  status: 'pending' | 'in_stage' | 'approved' | 'rejected' | 'withdrawn';
  current_stage_id?: string;
  current_stage?: RecruitmentStage;
  score?: number;
  notes?: string;
  added_at: string;
}

// Função auxiliar para obter cor do status (será definida no componente principal)
const getCandidateStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-800',
    in_stage: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

// Componente de Card Arrastável
function DraggableCandidateCard({ candidate, onClick }: { candidate: RecruitmentCandidate; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-200 relative"
    >
      <div
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div
        onClick={onClick}
        className="pl-6"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">
              {candidate.application?.name || 'Candidato sem nome'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {candidate.application?.email || '—'}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${getCandidateStatusColor(candidate.status)}`}>
            {candidate.status === 'pending' ? 'Pendente' :
             candidate.status === 'in_stage' ? 'Em Etapa' :
             candidate.status === 'approved' ? 'Aprovado' :
             candidate.status === 'rejected' ? 'Rejeitado' :
             'Retirado'}
          </span>
        </div>
        {candidate.score !== null && candidate.score !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {candidate.score.toFixed(1)}/10
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Coluna Droppable
function DroppableStageColumn({ 
  stageId, 
  stageName, 
  stageDescription, 
  candidates, 
  onCandidateClick,
  onEditStage,
  candidateCount 
}: { 
  stageId: string | null;
  stageName: string;
  stageDescription?: string;
  candidates: RecruitmentCandidate[];
  onCandidateClick: (candidate: RecruitmentCandidate) => void;
  onEditStage?: () => void;
  candidateCount: number;
}) {
  const droppableId = `stage-${stageId || 'none'}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-blue-100 border-2 border-blue-400' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-700">{stageName}</h3>
          {stageDescription && (
            <p className="text-xs text-gray-500 mt-1">{stageDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
            stageId === null ? 'bg-gray-200 text-gray-700' : 'bg-blue-200 text-blue-700'
          }`}>
            {candidateCount}
          </span>
          {onEditStage && (
            <button
              onClick={onEditStage}
              className="p-1.5 hover:bg-blue-100 rounded transition-colors border border-blue-200 text-blue-700 hover:text-blue-800"
              title="Editar etapa"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[100px]">
          {candidates.map((candidate) => (
            <DraggableCandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCandidateClick(candidate)}
            />
          ))}
          {candidates.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              Arraste candidatos aqui
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function RecruitmentProcessesAdmin() {
  const [processes, setProcesses] = useState<RecruitmentProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<RecruitmentProcess | null>(null);
  const [editingProcess, setEditingProcess] = useState<RecruitmentProcess | null>(null);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  
  // Estados para gestão de candidatos
  const [processStages, setProcessStages] = useState<RecruitmentStage[]>([]);
  const [processCandidates, setProcessCandidates] = useState<RecruitmentCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showCandidateDetailModal, setShowCandidateDetailModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [editingStage, setEditingStage] = useState<RecruitmentStage | null>(null);
  const [stageForm, setStageForm] = useState({ name: '', description: '', order: 0, is_active: true });
  const [candidateNote, setCandidateNote] = useState('');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedCandidate, setDraggedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loadingReports, setLoadingReports] = useState(false);

  // Configurar sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requer 8px de movimento antes de iniciar o drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position_id: '',
    status: 'open' as const,
    close_date: '',
    expected_start_date: '',
  });

  useEffect(() => {
    loadProcesses();
    loadJobPositions();
  }, []);

  useEffect(() => {
    loadProcesses();
  }, [filterStatus, filterPosition]);

  const loadProcesses = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPosition !== 'all') params.append('position_id', filterPosition);

      const response = await fetch(`${API_BASE_URL}/recruitment/processes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar processos');
      const data = await response.json();
      setProcesses(data.processes || []);
    } catch (error: any) {
      console.error('Erro ao carregar processos:', error);
      toast.error(error.message || 'Erro ao carregar processos seletivos');
    } finally {
      setLoading(false);
    }
  };

  const loadJobPositions = async () => {
    try {
      const response = await apiService.getAllJobPositions();
      setJobPositions(response.positions || []);
    } catch (error) {
      console.error('Erro ao carregar áreas de interesse:', error);
    }
  };

  const loadApplications = async (positionId?: string) => {
    try {
      const response = await apiService.getJobApplications(positionId);
      setApplications(response.applications || []);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    }
  };

  const handleOpenModal = (process?: RecruitmentProcess) => {
    if (process) {
      setEditingProcess(process);
      setFormData({
        title: process.title,
        description: process.description || '',
        position_id: process.position_id,
        status: process.status,
        close_date: process.close_date ? process.close_date.split('T')[0] : '',
        expected_start_date: process.expected_start_date ? process.expected_start_date.split('T')[0] : '',
      });
    } else {
      setEditingProcess(null);
      setFormData({
        title: '',
        description: '',
        position_id: '',
        status: 'open',
        close_date: '',
        expected_start_date: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProcess(null);
    setFormData({
      title: '',
      description: '',
      position_id: '',
      status: 'open',
      close_date: '',
      expected_start_date: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.position_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');

      const url = editingProcess
        ? `${API_BASE_URL}/recruitment/processes/${editingProcess.id}`
        : `${API_BASE_URL}/recruitment/processes`;

      const response = await fetch(url, {
        method: editingProcess ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          position_id: formData.position_id,
          status: formData.status,
          close_date: formData.close_date || null,
          expected_start_date: formData.expected_start_date || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar processo');
      }

      toast.success(editingProcess ? 'Processo atualizado com sucesso!' : 'Processo criado com sucesso!');
      handleCloseModal();
      loadProcesses();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar processo seletivo');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/recruitment/processes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error('Erro ao excluir processo');

      toast.success('Processo excluído com sucesso!');
      loadProcesses();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir processo');
    }
  };

  const handleViewCandidates = async (process: RecruitmentProcess) => {
    setSelectedProcess(process);
    setShowCandidatesModal(true);
    if (process.position_id) {
      await loadApplications(process.position_id);
    }
    await loadProcessDetails(process.id);
  };

  const loadProcessDetails = async (processId: string) => {
    try {
      setLoadingCandidates(true);
      const response = await apiService.getRecruitmentProcessById(processId);
      const process = response.process;
      
      // Carregar etapas
      setProcessStages((process.stages || []).sort((a: any, b: any) => a.order - b.order));
      
      // Carregar candidatos
      setProcessCandidates(process.candidates || []);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do processo:', error);
      toast.error(error.message || 'Erro ao carregar detalhes do processo');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleAddCandidate = async (applicationId?: string) => {
    if (!selectedProcess) return;

    try {
      await apiService.addCandidateToProcess(selectedProcess.id, applicationId);
      toast.success('Candidato adicionado com sucesso!');
      setShowAddCandidateModal(false);
      await loadProcessDetails(selectedProcess.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar candidato');
    }
  };

  const handleCreateStage = async () => {
    if (!selectedProcess || !stageForm.name.trim()) {
      toast.error('Preencha o nome da etapa');
      return;
    }

    try {
      await apiService.createRecruitmentStage(selectedProcess.id, {
        name: stageForm.name.trim(),
        description: stageForm.description.trim() || undefined,
        order: stageForm.order,
        is_active: stageForm.is_active,
      });
      toast.success('Etapa criada com sucesso!');
      setShowStageModal(false);
      setStageForm({ name: '', description: '', order: 0, is_active: true });
      setEditingStage(null);
      await loadProcessDetails(selectedProcess.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar etapa');
    }
  };

  const handleUpdateStage = async () => {
    if (!editingStage || !stageForm.name.trim()) {
      toast.error('Preencha o nome da etapa');
      return;
    }

    try {
      await apiService.updateRecruitmentStage(editingStage.id, {
        name: stageForm.name.trim(),
        description: stageForm.description.trim() || undefined,
        order: stageForm.order,
        is_active: stageForm.is_active,
      });
      toast.success('Etapa atualizada com sucesso!');
      setShowStageModal(false);
      setStageForm({ name: '', description: '', order: 0, is_active: true });
      setEditingStage(null);
      await loadProcessDetails(selectedProcess!.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar etapa');
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Esta ação não pode ser desfeita!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.deleteRecruitmentStage(stageId);
      toast.success('Etapa excluída com sucesso!');
      await loadProcessDetails(selectedProcess!.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir etapa');
    }
  };

  const handleMoveCandidate = async (candidateId: string, stageId: string | null) => {
    try {
      await apiService.updateRecruitmentCandidate(candidateId, {
        current_stage_id: stageId || undefined,
        status: stageId ? 'in_stage' : 'pending',
      });
      toast.success('Candidato movido com sucesso!');
      await loadProcessDetails(selectedProcess!.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao mover candidato');
    }
  };

  const handleEvaluateCandidate = async (candidateId: string, stageId: string, status: 'approved' | 'rejected', score?: number, feedback?: string) => {
    try {
      await apiService.evaluateCandidateStage(candidateId, stageId, {
        status,
        score,
        feedback,
      });
      toast.success('Avaliação registrada com sucesso!');
      await loadProcessDetails(selectedProcess!.id);
      setShowCandidateDetailModal(false);
      setSelectedCandidate(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao avaliar candidato');
    }
  };

  const handleAddNote = async () => {
    if (!selectedCandidate || !candidateNote.trim()) {
      toast.error('Digite uma nota');
      return;
    }

    try {
      await apiService.addNoteToCandidate(selectedCandidate.id, candidateNote.trim());
      toast.success('Nota adicionada com sucesso!');
      setCandidateNote('');
      await loadProcessDetails(selectedProcess!.id);
      // Recarregar detalhes do candidato
      const updated = processCandidates.find(c => c.id === selectedCandidate.id);
      if (updated) setSelectedCandidate(updated);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar nota');
    }
  };

  const handleRemoveCandidate = async (candidateId: string) => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'O candidato será removido do processo seletivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.removeCandidateFromProcess(candidateId);
      toast.success('Candidato removido com sucesso!');
      await loadProcessDetails(selectedProcess!.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover candidato');
    }
  };

  const openStageModal = (stage?: RecruitmentStage) => {
    if (stage) {
      setEditingStage(stage);
      setStageForm({
        name: stage.name,
        description: stage.description || '',
        order: stage.order,
        is_active: stage.is_active,
      });
    } else {
      setEditingStage(null);
      const maxOrder = processStages.length > 0 ? Math.max(...processStages.map(s => s.order)) : 0;
      setStageForm({
        name: '',
        description: '',
        order: maxOrder + 1,
        is_active: true,
      });
    }
    setShowStageModal(true);
  };

  const getCandidatesByStage = (stageId: string | null) => {
    return processCandidates.filter(c => 
      (stageId === null && !c.current_stage_id) || 
      (stageId && c.current_stage_id === stageId)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const candidate = processCandidates.find(c => c.id === active.id);
    setDraggedCandidate(candidate || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedCandidate(null);

    if (!over || !selectedProcess) return;

    const candidateId = active.id as string;
    const overId = over.id as string;

    // Se soltou em uma coluna de etapa
    if (overId.startsWith('stage-')) {
      const targetStageId = overId.replace('stage-', '');
      const newStageId = targetStageId === 'none' ? null : targetStageId;

      const candidate = processCandidates.find(c => c.id === candidateId);
      if (!candidate) return;

      // Se já está na mesma etapa, não faz nada
      if (candidate.current_stage_id === newStageId) return;

      try {
        await handleMoveCandidate(candidateId, newStageId);
      } catch (error) {
        // Erro já é tratado em handleMoveCandidate
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Pode adicionar lógica adicional aqui se necessário
  };

  const loadReportsData = async () => {
    try {
      setLoadingReports(true);
      
      // Carregar todos os processos com candidatos e etapas
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/recruitment/processes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) throw new Error('Erro ao carregar dados');
      const data = await response.json();
      const allProcesses = data.processes || [];

      // Carregar detalhes completos de cada processo
      const processesWithDetails = await Promise.all(
        allProcesses.map(async (process: any) => {
          try {
            const detailResponse = await fetch(`${API_BASE_URL}/recruitment/processes/${process.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
            });
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return detailData.process;
            }
            return process;
          } catch {
            return process;
          }
        })
      );

      // Calcular estatísticas
      const stats = {
        totalProcesses: processesWithDetails.length,
        totalCandidates: 0,
        candidatesByStatus: {
          pending: 0,
          in_stage: 0,
          approved: 0,
          rejected: 0,
          withdrawn: 0,
        },
        candidatesByStage: [] as any[],
        candidatesByPosition: [] as any[],
        processesByStatus: {
          open: 0,
          in_progress: 0,
          closed: 0,
          cancelled: 0,
        },
        averageScore: 0,
        candidatesByMonth: [] as any[],
      };

      const stageMap = new Map<string, number>();
      const positionMap = new Map<string, { name: string; count: number }>();
      const monthMap = new Map<string, number>();
      let totalScore = 0;
      let candidatesWithScore = 0;

      processesWithDetails.forEach((process: any) => {
        // Contar processos por status
        stats.processesByStatus[process.status as keyof typeof stats.processesByStatus]++;

        // Processar candidatos
        const candidates = process.candidates || [];
        stats.totalCandidates += candidates.length;

        candidates.forEach((candidate: any) => {
          // Status dos candidatos
          stats.candidatesByStatus[candidate.status as keyof typeof stats.candidatesByStatus]++;

          // Por etapa
          const stageId = candidate.current_stage_id || 'sem-etapa';
          const stageName = candidate.current_stage?.name || 'Sem Etapa';
          stageMap.set(stageId, (stageMap.get(stageId) || 0) + 1);

          // Por área de interesse
          if (process.position) {
            const posId = process.position.id;
            const posName = process.position.name;
            if (!positionMap.has(posId)) {
              positionMap.set(posId, { name: posName, count: 0 });
            }
            positionMap.get(posId)!.count++;
          }

          // Por mês
          const month = new Date(candidate.added_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
          monthMap.set(month, (monthMap.get(month) || 0) + 1);

          // Média de notas
          if (candidate.score !== null && candidate.score !== undefined) {
            totalScore += candidate.score;
            candidatesWithScore++;
          }
        });
      });

      // Converter maps para arrays
      stats.candidatesByStage = Array.from(stageMap.entries()).map(([id, count]) => {
        const process = processesWithDetails.find((p: any) => 
          p.stages?.some((s: any) => s.id === id) || id === 'sem-etapa'
        );
        const stage = process?.stages?.find((s: any) => s.id === id);
        return {
          name: stage?.name || 'Sem Etapa',
          value: count,
        };
      });

      stats.candidatesByPosition = Array.from(positionMap.values()).map(pos => ({
        name: pos.name,
        value: pos.count,
      }));

      stats.candidatesByMonth = Array.from(monthMap.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA.getTime() - dateB.getTime();
        });

      stats.averageScore = candidatesWithScore > 0 ? totalScore / candidatesWithScore : 0;

      setReportsData(stats);
    } catch (error: any) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error(error.message || 'Erro ao carregar dados dos relatórios');
    } finally {
      setLoadingReports(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const badges = {
      open: { label: 'Aberto', color: 'bg-green-100 text-green-800' },
      in_progress: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
      closed: { label: 'Fechado', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status as keyof typeof badges] || badges.open;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  const filteredProcesses = processes;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Processos Seletivos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gerencie processos seletivos, etapas e candidatos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowReportsModal(true);
              loadReportsData();
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Processo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors text-gray-900"
          >
            <option value="all">Todos os status</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em Andamento</option>
            <option value="closed">Fechado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Área
          </label>
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors text-gray-900"
          >
            <option value="all">Todas as áreas</option>
            {jobPositions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Processos */}
      {filteredProcesses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Nenhum processo seletivo cadastrado ainda.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Candidatos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data Abertura
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProcesses.map((process) => (
                <tr key={process.id}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{process.title}</div>
                    {process.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {process.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {process.position?.name || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(process.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {process._count?.candidates || process.candidates?.length || 0} candidato(s)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {formatDate(process.open_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewCandidates(process)}
                      className="inline-flex items-center px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Ver Candidatos"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Candidatos
                    </button>
                    <button
                      onClick={() => handleOpenModal(process)}
                      className="inline-flex items-center px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(process.id)}
                      className="inline-flex items-center px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Processo */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingProcess ? 'Editar Processo Seletivo' : 'Novo Processo Seletivo'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Processo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  placeholder="Ex: Contador - Vaga CLT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada da vaga..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área de Interesse <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.position_id}
                    onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors text-gray-900"
                  >
                    <option value="">Selecione...</option>
                    {jobPositions.map((position) => (
                      <option key={position.id} value={position.id}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3bb664] focus:border-[#3bb664] transition-colors text-gray-900"
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="closed">Fechado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Fechamento
                  </label>
                  <Input
                    type="date"
                    value={formData.close_date}
                    onChange={(value) => setFormData({ ...formData, close_date: value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Prevista de Início
                  </label>
                  <Input
                    type="date"
                    value={formData.expected_start_date}
                    onChange={(value) => setFormData({ ...formData, expected_start_date: value })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProcess ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Candidatos */}
      {showCandidatesModal && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0 bg-white">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-800">
                  Gestão de Candidatos - {selectedProcess.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedProcess.position?.name} • {processCandidates.length} candidato(s)
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => setViewMode(viewMode === 'pipeline' ? 'list' : 'pipeline')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-gray-900"
                  title={viewMode === 'pipeline' ? 'Ver como lista' : 'Ver como pipeline'}
                >
                  {viewMode === 'pipeline' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCandidatesModal(false);
                    setSelectedProcess(null);
                    setProcessStages([]);
                    setProcessCandidates([]);
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingCandidates ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
                </div>
              ) : (
                <>
                  {/* Barra de ações */}
                  <div className="flex justify-between items-center mb-6 flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => setShowAddCandidateModal(true)}
                        className="flex items-center gap-2 bg-[#3bb664] hover:bg-[#2d9550] text-white shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        Adicionar Candidato
                      </Button>
                      <Button
                        onClick={() => openStageModal()}
                        variant="outline"
                        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Gerenciar Etapas
                      </Button>
                    </div>
                  </div>

                  {/* Pipeline View com Drag-and-Drop */}
                  {viewMode === 'pipeline' ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCorners}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                    >
                      <div className="overflow-x-auto">
                        <div className="flex gap-4 min-w-max pb-4">
                          {/* Coluna: Sem Etapa */}
                          <DroppableStageColumn
                            stageId={null}
                            stageName="Sem Etapa"
                            candidates={getCandidatesByStage(null)}
                            onCandidateClick={(candidate) => {
                              setSelectedCandidate(candidate);
                              setShowCandidateDetailModal(true);
                            }}
                            candidateCount={getCandidatesByStage(null).length}
                          />

                          {/* Colunas: Etapas */}
                          {processStages.filter(s => s.is_active).map((stage) => (
                            <DroppableStageColumn
                              key={stage.id}
                              stageId={stage.id}
                              stageName={stage.name}
                              stageDescription={stage.description}
                              candidates={getCandidatesByStage(stage.id)}
                              onCandidateClick={(candidate) => {
                                setSelectedCandidate(candidate);
                                setShowCandidateDetailModal(true);
                              }}
                              onEditStage={() => openStageModal(stage)}
                              candidateCount={getCandidatesByStage(stage.id).length}
                            />
                          ))}
                        </div>
                      </div>
                      <DragOverlay>
                        {draggedCandidate ? (
                          <div className="bg-white p-3 rounded-lg shadow-lg border-2 border-[#3bb664] w-72">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">
                                  {draggedCandidate.application?.name || 'Candidato sem nome'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {draggedCandidate.application?.email || '—'}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${getCandidateStatusColor(draggedCandidate.status)}`}>
                                {draggedCandidate.status === 'pending' ? 'Pendente' :
                                 draggedCandidate.status === 'in_stage' ? 'Em Etapa' :
                                 draggedCandidate.status === 'approved' ? 'Aprovado' :
                                 draggedCandidate.status === 'rejected' ? 'Rejeitado' :
                                 'Retirado'}
                              </span>
                            </div>
                            {draggedCandidate.score !== null && draggedCandidate.score !== undefined && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                {draggedCandidate.score.toFixed(1)}/10
                              </div>
                            )}
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  ) : (
                    /* List View */
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processCandidates.map((candidate) => (
                            <tr key={candidate.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {candidate.application?.name || 'Candidato sem nome'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {candidate.application?.email || '—'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-700">
                                  {candidate.current_stage?.name || 'Sem etapa'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-xs px-2 py-1 rounded-full ${getCandidateStatusColor(candidate.status)}`}>
                                  {candidate.status === 'pending' ? 'Pendente' :
                                   candidate.status === 'in_stage' ? 'Em Etapa' :
                                   candidate.status === 'approved' ? 'Aprovado' :
                                   candidate.status === 'rejected' ? 'Rejeitado' :
                                   'Retirado'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {candidate.score !== null && candidate.score !== undefined ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-gray-700">{candidate.score.toFixed(1)}/10</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setShowCandidateDetailModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                                  title="Ver detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveCandidate(candidate.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-200 hover:border-red-300 transition-colors"
                                  title="Remover"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {processCandidates.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                Nenhum candidato adicionado ainda. Clique em "Adicionar Candidato" para começar.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Candidato */}
      {showAddCandidateModal && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-xl font-semibold text-gray-800">Adicionar Candidato</h2>
              <button
                type="button"
                onClick={() => setShowAddCandidateModal(false)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Selecione uma candidatura da área <strong>{selectedProcess.position?.name}</strong>:
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {applications.filter(app => !processCandidates.some(c => c.application_id === app.id)).map((app) => (
                  <div
                    key={app.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.email}</p>
                      {app.phone && <p className="text-xs text-gray-400">{app.phone}</p>}
                    </div>
                    <Button
                      onClick={() => handleAddCandidate(app.id)}
                      size="sm"
                    >
                      Adicionar
                    </Button>
                  </div>
                ))}
                {applications.filter(app => !processCandidates.some(c => c.application_id === app.id)).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma candidatura disponível ou todas já foram adicionadas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Gerenciar Etapas */}
      {showStageModal && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingStage ? 'Editar Etapa' : 'Nova Etapa'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowStageModal(false);
                  setEditingStage(null);
                  setStageForm({ name: '', description: '', order: 0, is_active: true });
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingStage ? handleUpdateStage() : handleCreateStage();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Etapa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={stageForm.name}
                  onChange={(value) => setStageForm({ ...stageForm, name: value })}
                  placeholder="Ex: Triagem, Entrevista, Teste Técnico..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <Textarea
                  value={stageForm.description}
                  onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                  placeholder="Descrição da etapa..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordem
                  </label>
                  <Input
                    type="number"
                    value={stageForm.order.toString()}
                    onChange={(value) => setStageForm({ ...stageForm, order: parseInt(value) || 0 })}
                  />
                </div>
                <div className="flex items-center pt-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stageForm.is_active}
                      onChange={(e) => setStageForm({ ...stageForm, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Etapa ativa</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowStageModal(false);
                    setEditingStage(null);
                    setStageForm({ name: '', description: '', order: 0, is_active: true });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingStage ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
            {processStages.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Etapas Existentes</h3>
                <div className="space-y-2">
                  {processStages.map((stage) => (
                    <div
                      key={stage.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">{stage.name}</p>
                        {stage.description && (
                          <p className="text-xs text-gray-500 mt-1">{stage.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Ordem: {stage.order} • {stage.is_active ? 'Ativa' : 'Inativa'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openStageModal(stage)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 hover:border-blue-300 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-200 hover:border-red-300 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Candidato */}
      {showCandidateDetailModal && selectedCandidate && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedCandidate.application?.name || 'Candidato sem nome'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{selectedCandidate.application?.email || '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCandidateDetailModal(false);
                  setSelectedCandidate(null);
                }}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300 flex-shrink-0 ml-4"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Informações do Candidato */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Informações</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="text-sm text-gray-900">{selectedCandidate.application?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block ${getCandidateStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status === 'pending' ? 'Pendente' :
                       selectedCandidate.status === 'in_stage' ? 'Em Etapa' :
                       selectedCandidate.status === 'approved' ? 'Aprovado' :
                       selectedCandidate.status === 'rejected' ? 'Rejeitado' :
                       'Retirado'}
                    </span>
                  </div>
                  {selectedCandidate.score !== null && selectedCandidate.score !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Nota Geral</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <p className="text-sm text-gray-900">{selectedCandidate.score.toFixed(1)}/10</p>
                      </div>
                    </div>
                  )}
                  {selectedCandidate.application?.cv_url && (
                    <div>
                      <p className="text-xs text-gray-500">Currículo</p>
                      <a
                        href={selectedCandidate.application.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver currículo
                      </a>
                    </div>
                  )}
                </div>
                {selectedCandidate.application?.message && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-1">Mensagem do Candidato</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedCandidate.application.message}</p>
                  </div>
                )}
              </div>

              {/* Mover entre Etapas */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Mover para Etapa</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleMoveCandidate(selectedCandidate.id, null)}
                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                      !selectedCandidate.current_stage_id
                        ? 'bg-[#3bb664] text-white border-[#3bb664]'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Sem Etapa
                  </button>
                  {processStages.filter(s => s.is_active).map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => handleMoveCandidate(selectedCandidate.id, stage.id)}
                      className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                        selectedCandidate.current_stage_id === stage.id
                          ? 'bg-[#3bb664] text-white border-[#3bb664]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {stage.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Avaliar Etapa Atual */}
              {selectedCandidate.current_stage_id && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Avaliar: {selectedCandidate.current_stage?.name}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEvaluateCandidate(
                          selectedCandidate.id,
                          selectedCandidate.current_stage_id!,
                          'approved'
                        )}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleEvaluateCandidate(
                          selectedCandidate.id,
                          selectedCandidate.current_stage_id!,
                          'rejected'
                        )}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Adicionar Nota */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Adicionar Nota</h3>
                <div className="flex gap-2">
                  <Textarea
                    value={candidateNote}
                    onChange={(e) => setCandidateNote(e.target.value)}
                    placeholder="Digite uma nota sobre o candidato..."
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!candidateNote.trim()}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Relatórios */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-shrink-0 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Relatórios de Processos Seletivos</h2>
                <p className="text-sm text-gray-500 mt-1">Estatísticas e análises dos processos seletivos</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportsModal(false)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors border border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-300"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingReports ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
                </div>
              ) : reportsData ? (
                <div className="space-y-6">
                  {/* Cards de Estatísticas Gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total de Processos</p>
                          <p className="text-2xl font-bold text-blue-900 mt-1">{reportsData.totalProcesses}</p>
                        </div>
                        <Briefcase className="w-8 h-8 text-blue-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Total de Candidatos</p>
                          <p className="text-2xl font-bold text-green-900 mt-1">{reportsData.totalCandidates}</p>
                        </div>
                        <Users className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Taxa de Aprovação</p>
                          <p className="text-2xl font-bold text-purple-900 mt-1">
                            {reportsData.totalCandidates > 0
                              ? ((reportsData.candidatesByStatus.approved / reportsData.totalCandidates) * 100).toFixed(1)
                              : 0}%
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-purple-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-600 font-medium">Nota Média</p>
                          <p className="text-2xl font-bold text-yellow-900 mt-1">
                            {reportsData.averageScore.toFixed(1)}/10
                          </p>
                        </div>
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                      </div>
                    </div>
                  </div>

                  {/* Gráficos em Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Candidatos por Status */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidatos por Status</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Pendente', value: reportsData.candidatesByStatus.pending, color: '#9CA3AF' },
                              { name: 'Em Etapa', value: reportsData.candidatesByStatus.in_stage, color: '#3B82F6' },
                              { name: 'Aprovado', value: reportsData.candidatesByStatus.approved, color: '#10B981' },
                              { name: 'Rejeitado', value: reportsData.candidatesByStatus.rejected, color: '#EF4444' },
                              { name: 'Retirado', value: reportsData.candidatesByStatus.withdrawn, color: '#F59E0B' },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Pendente', value: reportsData.candidatesByStatus.pending, color: '#9CA3AF' },
                              { name: 'Em Etapa', value: reportsData.candidatesByStatus.in_stage, color: '#3B82F6' },
                              { name: 'Aprovado', value: reportsData.candidatesByStatus.approved, color: '#10B981' },
                              { name: 'Rejeitado', value: reportsData.candidatesByStatus.rejected, color: '#EF4444' },
                              { name: 'Retirado', value: reportsData.candidatesByStatus.withdrawn, color: '#F59E0B' },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Candidatos por Etapa */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidatos por Etapa</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={reportsData.candidatesByStage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3B82F6" name="Candidatos" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Processos por Status */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Processos por Status</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={[
                            { name: 'Aberto', value: reportsData.processesByStatus.open, color: '#10B981' },
                            { name: 'Em Andamento', value: reportsData.processesByStatus.in_progress, color: '#3B82F6' },
                            { name: 'Fechado', value: reportsData.processesByStatus.closed, color: '#6B7280' },
                            { name: 'Cancelado', value: reportsData.processesByStatus.cancelled, color: '#EF4444' },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" fill="#3B82F6" name="Processos" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Candidatos por Área de Interesse */}
                    {reportsData.candidatesByPosition.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidatos por Área de Interesse</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={reportsData.candidatesByPosition}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#10B981" name="Candidatos" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Candidatos por Mês */}
                    {reportsData.candidatesByMonth.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Candidatos Adicionados por Mês</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={reportsData.candidatesByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} name="Candidatos" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Tabela de Estatísticas Detalhadas */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas Detalhadas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{reportsData.candidatesByStatus.pending}</p>
                        <p className="text-sm text-gray-600 mt-1">Pendentes</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-900">{reportsData.candidatesByStatus.in_stage}</p>
                        <p className="text-sm text-blue-600 mt-1">Em Etapa</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-900">{reportsData.candidatesByStatus.approved}</p>
                        <p className="text-sm text-green-600 mt-1">Aprovados</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-900">{reportsData.candidatesByStatus.rejected}</p>
                        <p className="text-sm text-red-600 mt-1">Rejeitados</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum dado disponível para relatórios</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

