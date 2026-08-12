import React from 'react';
import { ChallanDTO } from '../../api/challans';

interface ChallanPrintViewProps {
  challan: ChallanDTO;
}

export function ChallanPrintView({ challan }: ChallanPrintViewProps) {
  return (
    <div className="hidden print:block w-full text-black bg-white">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-widest text-black">NEXUS</h1>
          <p className="text-xs text-gray-600 font-mono tracking-widest uppercase mt-1">Enterprise Resource Planning</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-black uppercase tracking-widest">Sales Challan</h2>
          <p className="text-sm font-mono mt-2"><strong>No:</strong> {challan.challanNumber}</p>
          <p className="text-sm font-mono"><strong>Date:</strong> {new Date(challan.createdAt).toLocaleDateString()}</p>
          <p className="text-sm font-mono"><strong>Status:</strong> {challan.status}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-bold text-base">{challan.customer.businessName}</p>
            <p>{challan.customer.name}</p>
          </div>
          <div>
            {challan.customer.mobile && <p><strong>Phone:</strong> {challan.customer.mobile}</p>}
            {challan.customer.email && <p><strong>Email:</strong> {challan.customer.email}</p>}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black text-xs uppercase tracking-widest">
              <th className="py-2 font-bold">#</th>
              <th className="py-2 font-bold">Product / SKU</th>
              <th className="py-2 font-bold text-center">Qty</th>
              <th className="py-2 font-bold text-right">Unit Price</th>
              <th className="py-2 font-bold text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3 text-sm">{index + 1}</td>
                <td className="py-3">
                  <div className="font-bold text-sm">{item.productName}</div>
                  <div className="text-xs text-gray-500 font-mono">{item.sku}</div>
                </td>
                <td className="py-3 text-center text-sm font-mono">{item.quantity}</td>
                <td className="py-3 text-right text-sm font-mono">₹{Number(item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="py-3 text-right text-sm font-mono font-bold">₹{Number(item.lineTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-64">
          <div className="flex justify-between border-t-2 border-black pt-2">
            <span className="font-bold text-sm uppercase tracking-widest">Grand Total</span>
            <span className="font-bold text-xl font-mono">₹{Number(challan.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Footer Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t border-gray-300 page-break-inside-avoid">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest mb-12">Prepared By</p>
          <div className="border-t border-black w-48 pt-2">
            <p className="text-xs">{challan.createdBy.name}</p>
            <p className="text-xs text-gray-500">Authorized Signatory</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest mb-12">Received By</p>
          <div className="border-t border-black w-48 pt-2 ml-auto">
            <p className="text-xs">Customer Signature / Seal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
