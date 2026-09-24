'use client';

import React from 'react';
import { Radio, Users, ShieldAlert, CheckCircle2, Clock, Wrench, Calendar, Plus } from 'lucide-react';
import { FloorCheckIn, MachineReservation } from '@/types/teamCentral';

interface LiveFloorLogViewProps {
  floorLog: FloorCheckIn[];
  machineReservations?: MachineReservation[];
  onOpenKiosk: () => void;
  onOpenMachineRequest?: () => void;
}

export const LiveFloorLogView: React.FC<LiveFloorLogViewProps> = ({
  floorLog,
  machineReservations = [],
  onOpenKiosk,
  onOpenMachineRequest,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-400 animate-pulse" />
            <span>Live Shop Floor Presence & Machine Operations</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time RFID/NFC entryway check-ins • Current Shop Floor Count: {floorLog.length} Students
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMachineRequest && (
            <button
              type="button"
              onClick={onOpenMachineRequest}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-medium text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-slate-400" />
              <span>Reserve Machine</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenKiosk}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            Launch Entryway Kiosk
          </button>
        </div>
      </div>

      {/* Emergency Muster Callout */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-white font-bold">Emergency Evacuation Roster Synced</p>
            <p className="text-slate-400 text-[11px]">All {floorLog.length} members accounted for on designated assembly grid.</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500">SUPERVISING MENTOR:</span>
          <p className="text-emerald-400 font-bold">Bob K. (Safety Lead)</p>
        </div>
      </div>

      {/* Active Machine Reservations Section */}
      {machineReservations.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>Active Machine Reservations & Queue</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{machineReservations.length} tools booked</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {machineReservations.map((res) => (
              <div
                key={res.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[170px]">{res.machine}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      res.status === 'ACTIVE'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p className="text-slate-200 font-medium">Operator: {res.studentName}</p>
                  <p>Slot: {res.timeSlot}</p>
                  <p className="truncate text-slate-500">Proctor: {res.mentor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floor Presence Log Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {floorLog.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{log.studentName}</h4>
                <p className="text-[11px] font-mono text-slate-400">{log.studentId}</p>
              </div>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ON FLOOR
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-900 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <Wrench className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{log.activeMachine || 'General Workstation'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-900">
                <span>In at: {log.checkInTime}</span>
                <span className="text-slate-300 font-bold">{log.hoursToday}h today</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
