import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Loader2, Trash2, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { NewsletterSubscription } from '@/types';

export default function SubscriptionsAdmin() {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getNewsletterSubscriptions();
      setSubscriptions(response.subscriptions);
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao buscar inscrições:', error);
      setError('Não foi possível carregar as inscrições. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  const handleDelete = async (id: string) => {
    const confirmResult = await Swal.fire({
      icon: 'warning',
      title: 'Remover inscrição?',
      text: 'Essa ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Sim, remover',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setDeletingId(id);
    try {
      await apiService.deleteNewsletterSubscription(id);
      setSubscriptions((prev) => prev.filter((item) => item.id !== id));
      toast.success('Inscrição removida');
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao remover inscrição:', error);
      toast.error(error?.message || 'Não foi possível remover');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await apiService.exportNewsletterSubscriptions();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'inscricoes-newsletter.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Exportação pronta!');
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao exportar inscrições:', error);
      toast.error(error?.message || 'Não foi possível exportar');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inscrições da Newsletter</h1>
          <p className="text-sm text-gray-500">
            Acompanhe quem se cadastrou para receber as novidades e atualize a lista sempre que quiser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchSubscriptions} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? 'Atualizando' : 'Atualizar'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exportando' : 'Exportar CSV'}
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        {loading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-600">{error}</div>
        ) : subscriptions.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Ainda não houve novas inscrições.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Cadastrado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 text-sm text-gray-700 break-all">{subscription.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{subscription.name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(subscription.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleDelete(subscription.id)}
                        disabled={deletingId === subscription.id}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

