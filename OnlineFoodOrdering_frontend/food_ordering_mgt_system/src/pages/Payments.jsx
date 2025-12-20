import { useState, useEffect, useRef } from 'react';
import { CreditCard, Eye, Loader2, Wallet, Search, X } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { paymentApi } from '../services/api';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Payments = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('highlight');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [highlightedPayment, setHighlightedPayment] = useState(null);
  const highlightRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

  // Handle highlighting from global search
  useEffect(() => {
    if (highlightId && payments.length > 0) {
      const paymentId = parseInt(highlightId);
      setHighlightedPayment(paymentId);
      // Find and auto-open the payment modal
      const payment = payments.find(p => p.id === paymentId);
      if (payment) {
        setTimeout(() => {
          if (highlightRef.current) {
            highlightRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
          setSelectedPayment(payment);
          setIsViewModalOpen(true);
        }, 500);
      }
      setTimeout(() => {
        setHighlightedPayment(null);
        navigate('/payments', { replace: true });
      }, 3000);
    }
  }, [highlightId, payments, navigate]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const [pendingRes, completedRes] = await Promise.allSettled([
        paymentApi.getByStatus('PENDING'),
        paymentApi.getByStatus('COMPLETED'),
      ]);

      const pending = pendingRes.status === 'fulfilled' ? pendingRes.value.data : [];
      const completed = completedRes.status === 'fulfilled' ? completedRes.value.data : [];
      
      const allPayments = [...pending, ...completed];
      allPayments.sort((a, b) => new Date(b.paidAt || 0) - new Date(a.paidAt || 0));
      setPayments(allPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const openViewModal = (payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const getMethodConfig = (method) => {
    const configs = {
      CARD: { bg: 'bg-blue-100 text-blue-700', icon: '💳', label: 'Card' },
      MOBILE_MONEY: { bg: 'bg-purple-100 text-purple-700', icon: '📱', label: 'Mobile Money' },
      CASH: { bg: 'bg-green-100 text-green-700', icon: '💵', label: 'Cash' },
    };
    return configs[method] || { bg: 'bg-gray-100 text-gray-700', icon: '💰', label: method };
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { bg: 'bg-yellow-100 text-yellow-700', emoji: '⏳' },
      COMPLETED: { bg: 'bg-green-100 text-green-700', emoji: '✅' },
      PAID: { bg: 'bg-green-100 text-green-700', emoji: '✅' },
      FAILED: { bg: 'bg-red-100 text-red-700', emoji: '❌' },
      REFUNDED: { bg: 'bg-purple-100 text-purple-700', emoji: '↩️' },
    };
    return configs[status] || configs.PENDING;
  };

  // Filter payments by search term, status, and method
  const filteredPayments = payments.filter((payment) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      payment.id?.toString().includes(term) ||
      payment.transactionId?.toLowerCase().includes(term) ||
      payment.amount?.toString().includes(term) ||
      payment.status?.toLowerCase().includes(term) ||
      payment.method?.toLowerCase().includes(term) ||
      payment.order?.id?.toString().includes(term);

    const matchesStatus = statusFilter === '' || payment.status === statusFilter;
    const matchesMethod = methodFilter === '' || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-8 h-8 text-orange-500" />
          Payments
        </h1>
        <p className="text-gray-500 mt-1">View your payment history</p>
      </div>

      {/* Search & Filters */}
      {payments.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, transaction ID, amount, order..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 md:w-40"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 md:w-44"
            >
              <option value="">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CARD">Card</option>
            </select>
          </div>
          {(searchTerm || statusFilter || methodFilter) && (
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-semibold text-gray-900">{filteredPayments.length}</span> of {payments.length} payments
            </p>
          )}
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-16 h-16 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No payments yet</h2>
          <p className="text-gray-500 mb-6">Your payment history will appear here</p>
          <a
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            🍕 Order Something
          </a>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-orange-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No payments found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-orange-100">
            {filteredPayments.map((payment) => {
              const methodConfig = getMethodConfig(payment.method);
              const statusConfig = getStatusConfig(payment.status);
              const isHighlighted = highlightedPayment === payment.id;

              return (
                <div
                  key={payment.id}
                  ref={isHighlighted ? highlightRef : null}
                  className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isHighlighted
                      ? 'bg-orange-100 ring-2 ring-orange-500 animate-pulse shadow-lg'
                      : 'hover:bg-orange-50/50'
                  }`}
                >
                  {/* Payment Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-2xl">
                      {methodConfig.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Payment #{payment.id}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${statusConfig.bg}`}>
                          {statusConfig.emoji} {payment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Order #{payment.order?.id || '—'} • {payment.paidAt ? formatDateTime(payment.paidAt) : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Amount & Action */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${methodConfig.bg}`}>
                        {methodConfig.label}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-green-600 min-w-[100px] text-right">
                      {formatCurrency(payment.amount)}
                    </p>
                    <button
                      onClick={() => openViewModal(payment)}
                      className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Payment Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`💳 Payment #${selectedPayment?.id}`}
        showFooter={false}
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-bold text-orange-600">#{selectedPayment.order?.id || '—'}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="font-bold text-xl text-green-600">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Method</p>
                <p className="font-medium">
                  {getMethodConfig(selectedPayment.method).icon} {getMethodConfig(selectedPayment.method).label}
                </p>
              </div>
              <div className={`rounded-xl p-4 ${getStatusConfig(selectedPayment.status).bg}`}>
                <p className="text-sm opacity-70 mb-1">Status</p>
                <p className="font-bold">
                  {getStatusConfig(selectedPayment.status).emoji} {selectedPayment.status}
                </p>
              </div>
            </div>
            
            {selectedPayment.transactionId && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono text-sm bg-white px-3 py-2 rounded-lg border border-gray-200 break-all">
                  {selectedPayment.transactionId}
                </p>
              </div>
            )}

            {selectedPayment.paidAt && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Paid At</p>
                <p className="font-medium">{formatDateTime(selectedPayment.paidAt)}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;