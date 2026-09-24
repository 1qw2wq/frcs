'use client';

import React, { useState } from 'react';
import { X, Tablet, Radio, CheckCircle2, Delete, ArrowLeft, Clock, Users, Shield } from 'lucide-react';
import { MemberRosterItem, FloorCheckIn } from '@/types/teamCentral';

interface KioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: MemberRosterItem[];
  floorLog: FloorCheckIn[];
  onToggleStudentCheckIn: (studentId: string) => void;
}

export const KioskModal: React.FC<KioskModalProps> = ({
  isOpen,
  onClose,
  roster,
  floorLog,
  onToggleStudentCheckIn,
}) => {
  const [pin, setPin] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const verifyPin = (token: string) => {
    const matched = roster.find((m) => m.pin === token);
    if (matched) {
      onToggleStudentCheckIn(matched.id);
      const isCheckingIn = !matched.isCheckedIn;
      setStatusMsg({
        text: isCheckingIn
          ? `Welcome ${matched.name}! Clocked IN at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : `Goodbye ${matched.name}! Clocked OUT at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        isSuccess: true,
      });
      setTimeout(() => {
        setPin('');
        setStatusMsg(null);
      }, 2500);
    } else {
      setStatusMsg({
        text: `Invalid 4-Digit Token '${token}'. (Demo: 7419 for Maya)`,
        isSuccess: false,
      });
      setTimeout(() => {
        setPin('');
        setStatusMsg(null);
      }, 2000);
    }
  };

  const activeCount = roster.filter((r) => r.isCheckedIn).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0B0F17] border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Kiosk Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  VORTEX 5419 ENTRYWAY KIOSK
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold">
                  TERMINAL ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Tap RFID Sticker on Reader or Punch 4-Digit Token Below
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
              <span className="text-emerald-400 font-bold">{activeCount}</span> / 25 IN SHOP
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left Keypad, Right Floor Log */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 flex-1">
          {/* Keypad Column */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="w-full text-center space-y-1">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">STUDENT 4-DIGIT PIN</p>
              {/* Display Pin Dots */}
              <div className="flex justify-center items-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => {
                  const hasVal = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-xl border flex items-center justify-center font-mono text-2xl font-bold transition-all ${
                        hasVal
                          ? 'border-blue-500 bg-blue-950/40 text-blue-400 shadow-sm'
                          : 'border-slate-800 bg-slate-900/50 text-slate-600'
                      }`}
                    >
                      {hasVal ? '•' : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Feedback Message */}
            {statusMsg && (
              <div
                className={`w-full p-3 rounded-xl border text-xs font-mono text-center ${
                  statusMsg.isSuccess
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            {/* Touch Numpad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 text-white font-mono text-xl font-bold transition flex items-center justify-center shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-14 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:scale-95 border border-slate-800/80 text-slate-400 font-mono text-xs font-bold transition flex items-center justify-center"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 text-white font-mono text-xl font-bold transition flex items-center justify-center shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-slate-900/60 hover:bg-slate-800 active:scale-95 border border-slate-800/80 text-slate-400 transition flex items-center justify-center"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Quick RFID Tap Shortcut for Demo */}
            <div className="w-full pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Demo Fast Tap:</span>
              <button
                type="button"
                onClick={() => verifyPin('7419')}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-[11px] font-bold"
              >
                Tap Maya Patel (#7419)
              </button>
            </div>
          </div>

          {/* Right Column: Live In-Shop Roster */}
          <div className="md:col-span-6 flex flex-col p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  ACTIVE ON SHOP FLOOR ({activeCount})
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">BUILD SEASON WK 4</span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto max-h-[340px] space-y-2 pr-1">
              {roster.map((member) => (
                <div
                  key={member.id}
                  onClick={() => onToggleStudentCheckIn(member.id)}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                    member.isCheckedIn
                      ? 'bg-emerald-950/20 border-emerald-800/50 hover:border-emerald-700'
                      : 'bg-slate-900/30 border-slate-900 hover:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        member.isCheckedIn ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{member.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {member.role} • {member.subteam}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        member.isCheckedIn
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {member.isCheckedIn ? 'CLOCKED IN' : 'AWAY'}
                    </span>
                    <p className="text-slate-500 text-[10px] mt-0.5">{member.hoursLogged} hrs total</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
