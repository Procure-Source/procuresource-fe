"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Calculator, FileText, 
  ChevronDown, Settings2, Sparkles, Send,
  Package, DollarSign, Clock, Calendar
} from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  metric_spec: string;
}

interface QuoteBuilderProps {
  rfqId?: string;
  onSave?: (quoteData: any) => void;
  initialData?: any;
  metricSystem: string;
}

  export default function QuoteBuilder({ rfqId, onSave, initialData, metricSystem }: QuoteBuilderProps) {
    const isRfqResponse = !!rfqId;
    const [items, setItems] = useState<QuoteItem[]>(() => {
      if (initialData?.items && initialData.items.length > 0) {
        return initialData.items.map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: (item.quantity || 1) * (item.unit_price || 0),
          metric_spec: item.metric_spec || '',
        }));
      }
      return [{ id: '1', description: '', quantity: 1, unit_price: 0, total_price: 0, metric_spec: '' }];
    });

    useEffect(() => {
      if (initialData?.items && initialData.items.length > 0) {
        setItems(initialData.items.map((item: any) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: (item.quantity || 1) * (item.unit_price || 0),
          metric_spec: item.metric_spec || ''
        })));
      }
    }, [initialData]);

  const [quoteNumber, setQuoteNumber] = useState(`QS-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`);
  const [leadTime, setLeadTime] = useState(initialData?.lead_time || "");
  const [validUntil, setValidUntil] = useState(initialData?.valid_until || initialData?.deadline || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [currency, setCurrency] = useState(initialData?.currency || "AED");
  const [isSaving, setIsSaving] = useState(false);

  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const subtotal = calculateSubtotal();
  const vat = subtotal * 0.05; // 5% VAT standard in many industrial regions (UAE/KSA)
  const total = subtotal + vat;

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      total_price: 0, 
      metric_spec: '' 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSave = async () => {
    if (isRfqResponse
      ? items.some(i => i.unit_price <= 0)
      : items.some(i => !i.description || i.unit_price <= 0)
    ) {
      toast.error(isRfqResponse ? "Please enter a unit price for all items" : "Please fill in all item details correctly");
      return;
    }

    setIsSaving(true);
    try {
      const quoteData = {
        rfq_id: rfqId,
        quote_number: quoteNumber,
        total_amount: total,
        currency,
        lead_time: leadTime,
        valid_until: validUntil,
        notes,
        items: items.map(({ id, ...rest }) => rest)
      };

      if (onSave) {
        await onSave(quoteData);
      }
      
      toast.success("Quote generated successfully!");
    } catch (error: any) {
      toast.error(friendlyError(error, "Failed to save quote"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-[#d2d2d7]/30 shadow-2xl overflow-hidden flex flex-col h-full max-h-[800px]">
      {/* Header */}
      <div className="bg-[#f5f5f7] p-8 border-b border-[#d2d2d7]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f] flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0066cc]" /> Professional Quotation Builder
          </h2>
          <p className="text-[15px] text-[#86868b] mt-1">Generate high-standard quotes in minutes</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-[#d2d2d7]/50 shadow-sm">
          <p className="text-[11px] text-[#86868b] uppercase font-bold tracking-wider">Quote Number</p>
          <p className="text-[17px] font-mono font-bold text-[#0066cc]">{quoteNumber}</p>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
        {/* Basic Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#86868b]" /> Lead Time
            </label>
            {isRfqResponse ? (
              <div className="w-full h-12 px-4 flex items-center bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-[15px] text-[#1d1d1f]">
                {leadTime || <span className="text-[#86868b] italic">Not specified</span>}
              </div>
            ) : (
              <input
                type="text"
                value={leadTime}
                onChange={e => setLeadTime(e.target.value)}
                placeholder="e.g. 2-3 Weeks Ex-Stock"
                className="w-full h-12 px-4 bg-white border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#0066cc] transition-all outline-none"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#86868b]" /> Validity Period
            </label>
            {isRfqResponse ? (
              <div className="w-full h-12 px-4 flex items-center bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-[15px] text-[#1d1d1f]">
                {validUntil ? new Date(validUntil).toLocaleDateString() : <span className="text-[#86868b] italic">Not specified</span>}
              </div>
            ) : (
              <input
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#0066cc] transition-all outline-none"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-[#1d1d1f] flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#86868b]" /> Currency
            </label>
            {isRfqResponse ? (
              <div className="w-full h-12 px-4 flex items-center bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-[15px] font-bold text-[#1d1d1f]">
                {currency}
              </div>
            ) : (
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-12 px-4 bg-white border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#0066cc] transition-all outline-none appearance-none"
              >
                <option value="AED">AED - UAE Dirham</option>
                <option value="USD">USD - US Dollar</option>
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-bold text-[#1d1d1f]">Line Items</h3>
            <div className="px-3 py-1 bg-blue-50 text-[#0066cc] text-[12px] font-bold rounded-full border border-blue-100 uppercase tracking-tight">
              Using {metricSystem} System
            </div>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="group relative bg-[#f5f5f7]/50 rounded-2xl p-6 border border-transparent hover:border-[#0066cc]/20 hover:bg-white transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Item Description */}
                  <div className="lg:col-span-5 space-y-2">
                    <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Item Description</label>
                    {isRfqResponse ? (
                      <div className="w-full min-h-[96px] p-3 bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-[15px] text-[#1d1d1f] whitespace-pre-wrap">
                        {item.description || <span className="text-[#86868b] italic">No description</span>}
                      </div>
                    ) : (
                      <textarea
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Enter product name, model, or technical specs..."
                        className="w-full h-24 p-3 bg-white border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#0066cc] outline-none text-[15px] resize-none"
                      />
                    )}
                  </div>

                  {/* Technical Spec */}
                  <div className="lg:col-span-3 space-y-2">
                    <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">Technical Spec ({metricSystem})</label>
                    {isRfqResponse ? (
                      <div className="w-full h-12 px-4 flex items-center bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-[15px] text-[#1d1d1f]">
                        {item.metric_spec || <span className="text-[#86868b] italic">—</span>}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={item.metric_spec}
                        onChange={e => updateItem(item.id, 'metric_spec', e.target.value)}
                        placeholder="e.g. 50mm, 150 PSI..."
                        className="w-full h-12 px-4 bg-white border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#0066cc] outline-none text-[15px]"
                      />
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div className="lg:col-span-4 grid grid-cols-3 gap-3 items-end">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider text-center block">Qty</label>
                      {isRfqResponse ? (
                        <div className="w-full h-12 flex items-center justify-center bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-center font-bold text-[#1d1d1f]">
                          {item.quantity}
                        </div>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full h-12 px-3 bg-white border border-[#d2d2d7] rounded-xl text-center font-bold text-[#1d1d1f]"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#0066cc] uppercase tracking-wider text-center block">Unit Price *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={e => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full h-12 px-3 bg-white border-2 border-[#0066cc]/30 rounded-xl text-center font-bold text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider text-center block">Total</label>
                      <div className="w-full h-12 flex items-center justify-center bg-[#f5f5f7] rounded-xl text-[14px] font-bold text-[#1d1d1f] border border-[#d2d2d7]/50">
                        {item.total_price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remove Button — hidden when items come from RFQ */}
                {!isRfqResponse && items.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -right-3 -top-3 w-8 h-8 bg-white text-[#ff3b30] border border-[#ff3b30]/20 rounded-full flex items-center justify-center shadow-lg hover:bg-[#ff3b30] hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!isRfqResponse && (
            <button
              onClick={addItem}
              className="w-full py-4 border-2 border-dashed border-[#d2d2d7] rounded-2xl flex items-center justify-center gap-2 text-[#0066cc] font-bold hover:bg-[#0066cc]/5 transition-all"
            >
              <Plus className="w-5 h-5" /> Add Another Item
            </button>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-[#1d1d1f]">Terms & Conditions / Special Notes</label>
          {isRfqResponse ? (
            <div className="w-full min-h-[128px] p-4 bg-[#f5f5f7] border border-[#d2d2d7]/50 rounded-xl text-[15px] text-[#1d1d1f] whitespace-pre-wrap">
              {notes || <span className="text-[#86868b] italic">No notes specified</span>}
            </div>
          ) : (
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. 50% Advance, 50% Delivery. Prices are valid for 15 days."
              className="w-full h-32 p-4 bg-white border border-[#d2d2d7] rounded-xl focus:ring-2 focus:ring-[#0066cc] outline-none text-[15px] resize-none"
            />
          )}
        </div>
      </div>

      {/* Footer / Summary */}
      <div className="bg-[#f5f5f7] p-8 border-t border-[#d2d2d7]/30">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-grow space-y-4">
            <div className="bg-white/50 p-4 rounded-2xl border border-[#d2d2d7]/30 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
              <div>
                <p className="text-[14px] font-bold text-[#1d1d1f]">AI Pre-Check Enabled</p>
                <p className="text-[13px] text-[#86868b]">We've verified all technical specs match the <strong>{metricSystem}</strong> requirements of the RFQ.</p>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-[320px] space-y-4">
            <div className="flex justify-between text-[15px]">
              <span className="text-[#86868b]">Subtotal</span>
              <span className="font-semibold">{currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-[#86868b]">VAT (5%)</span>
              <span className="font-semibold">{currency} {vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pt-4 border-t border-[#d2d2d7] flex justify-between">
              <span className="text-[19px] font-bold text-[#1d1d1f]">Total Amount</span>
              <span className="text-[19px] font-bold text-[#0066cc]">{currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 bg-[#0066cc] text-white rounded-full text-[17px] font-bold hover:bg-[#0077ed] transition-all shadow-xl shadow-[#0066cc]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isSaving ? "Processing..." : (
                <>
                  <Send className="w-5 h-5" /> Generate & Submit Quote
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
