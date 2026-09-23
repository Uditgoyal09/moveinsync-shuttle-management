import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDriver } from '@/shared/api/client';
import { X, Loader2, User, Bus } from 'lucide-react';

interface AddDriverModalProps {
  onClose: () => void;
}

export function AddDriverModal({ onClose }: AddDriverModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    vehicleId: '',
  });

  const mutation = useMutation({
    mutationFn: createDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.vehicleId) return;
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border-color rounded-[16px] w-[440px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-border-color flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-bold text-foreground">Add Shuttle</h2>
            <p className="text-[13px] text-muted mt-0.5">Register a new driver and vehicle.</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/10 text-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-foreground flex items-center gap-2">
              <User size={14} className="text-muted" /> Driver Name
            </label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="bg-background border border-border-color rounded-[8px] h-10 px-3 text-[13px] outline-none focus:border-[#3867FF] transition-colors"
              placeholder="e.g. Ramesh Kumar"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-foreground flex items-center gap-2">
              <Bus size={14} className="text-muted" /> Vehicle Details
            </label>
            <input 
              type="text" 
              value={formData.vehicleId}
              onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
              className="bg-background border border-border-color rounded-[8px] h-10 px-3 text-[13px] outline-none focus:border-[#3867FF] transition-colors"
              placeholder="e.g. Tata Starbus (PB-08-1234)"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 h-10 text-[14px] font-bold text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending || !formData.name || !formData.vehicleId}
              className="px-6 h-10 bg-foreground text-background rounded-[8px] text-[14px] font-bold hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
