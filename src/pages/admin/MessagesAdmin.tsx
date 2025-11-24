import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { ContactMessage, ContactMessageReply } from '../../types';
import { Trash2, Mail, MailOpen, Eye, Send, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/Button';

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Função auxiliar para formatar data
  const formatDate = (date: Date | string): string => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContactMessages();
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao carregar mensagens. Tente novamente.',
      });
    } finally {
      setLoading(false);
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

    if (result.isConfirmed) {
      try {
        await apiService.deleteContactMessage(id);
        setMessages(messages.filter(msg => msg.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
        Swal.fire('Excluído!', 'A mensagem foi excluída.', 'success');
      } catch (error) {
        console.error('Error deleting message:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao excluir mensagem. Tente novamente.',
        });
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiService.markContactMessageAsRead(id);
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, isRead: true } : msg
      ));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setReplyMessage(''); // Limpar resposta ao trocar de mensagem
    
    // Carregar mensagem completa com respostas
    try {
      const response = await apiService.getContactMessage(message.id);
      setSelectedMessage(response.message);
      
      // Atualizar também na lista
      setMessages(messages.map(msg => 
        msg.id === message.id ? response.message : msg
      ));
    } catch (error) {
      console.error('Error loading message details:', error);
      // Se falhar, usar a mensagem da lista mesmo
      setSelectedMessage(message);
    }
    
    if (!message.isRead) {
      await handleMarkAsRead(message.id);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Atenção',
        text: 'Por favor, digite uma mensagem antes de enviar.',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Enviar resposta?',
      text: 'A resposta será enviada por email para o contato.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3bb664',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        setSendingReply(true);
        await apiService.sendContactMessageReply(selectedMessage.id, replyMessage.trim());
        
        // Recarregar a mensagem para obter o histórico atualizado
        const updatedResponse = await apiService.getContactMessage(selectedMessage.id);
        setSelectedMessage(updatedResponse.message);
        
        // Atualizar também na lista
        setMessages(messages.map(msg => 
          msg.id === selectedMessage.id ? updatedResponse.message : msg
        ));
        
        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Resposta enviada com sucesso.',
        });
        setReplyMessage('');
      } catch (error) {
        console.error('Error sending reply:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao enviar resposta. Tente novamente.',
        });
      } finally {
        setSendingReply(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
      </div>
    );
  }

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens de Contato</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {unreadCount} {unreadCount === 1 ? 'mensagem não lida' : 'mensagens não lidas'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Mensagens */}
        <div className={`lg:col-span-2 ${selectedMessage ? 'lg:col-span-1' : ''}`}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3bb664]"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Nenhuma mensagem de contato recebida ainda.</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !message.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    } ${selectedMessage?.id === message.id ? 'bg-[#3bb664]/10' : ''}`}
                    onClick={() => handleViewMessage(message)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {message.name}
                          </p>
                          {!message.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {message.email}
                        </p>
                        {message.serviceType && (
                          <p className="text-xs text-gray-500 mt-1">
                            {message.serviceType}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(message.createdAt)}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                          {message.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(message.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detalhes da Mensagem */}
        {selectedMessage && (
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Detalhes da Mensagem</h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Nome</label>
                  <p className="text-gray-900 mt-1">{selectedMessage.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-[#3bb664] hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </p>
                </div>

                {selectedMessage.phone && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Telefone</label>
                    <p className="text-gray-900 mt-1">
                      <a
                        href={`tel:${selectedMessage.phone.replace(/\D/g, '')}`}
                        className="text-[#3bb664] hover:underline"
                      >
                        {selectedMessage.phone}
                      </a>
                    </p>
                  </div>
                )}

                {selectedMessage.serviceType && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Tipo de Serviço</label>
                    <p className="text-gray-900 mt-1">{selectedMessage.serviceType}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-700">Data</label>
                  <p className="text-gray-900 mt-1">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Mensagem Original</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Histórico de Respostas */}
                {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Histórico de Respostas ({selectedMessage.replies.length})
                    </label>
                    <div className="space-y-3">
                      {selectedMessage.replies.map((reply: ContactMessageReply) => (
                        <div
                          key={reply.id}
                          className="p-4 bg-[#3bb664]/5 border border-[#3bb664]/20 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Send className="w-4 h-4 text-[#3bb664]" />
                              <span className="text-xs font-semibold text-[#3bb664]">
                                Resposta Enviada
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDate(reply.createdAt)}
                            </div>
                          </div>
                          <p className="text-gray-900 whitespace-pre-wrap text-sm">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Enviar Resposta
                  </label>
                  <Textarea
                    placeholder="Digite sua resposta aqui..."
                    value={replyMessage}
                    onChange={(value) => setReplyMessage(value)}
                    className="min-h-[120px] mb-3"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className="flex-1 bg-[#3bb664] hover:bg-[#2d9a4f] text-white"
                    >
                      {sendingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Resposta
                        </>
                      )}
                    </Button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}