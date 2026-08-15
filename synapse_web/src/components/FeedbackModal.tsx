import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'alert' | 'confirm' | 'success';
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function FeedbackModal({ isOpen, title, message, type = 'alert', onConfirm, onCancel }: FeedbackModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {type === 'alert' && <AlertTriangle className="text-red-500 w-8 h-8 flex-shrink-0" />}
            {type === 'confirm' && <AlertTriangle className="text-yellow-500 w-8 h-8 flex-shrink-0" />}
            {type === 'success' && <CheckCircle className="text-green-500 w-8 h-8 flex-shrink-0" />}
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          {type === 'confirm' && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              type === 'alert' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
              type === 'success' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
              'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
            }`}
          >
            {type === 'confirm' ? 'Confirmar' : 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
}
