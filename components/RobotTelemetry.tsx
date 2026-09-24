'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Battery, Radio, Activity, Compass, Zap, ShieldCheck, RefreshCw } from 'lucide-react';

export const RobotTelemetry: React.FC = () => {
  const [voltage, setVoltage] = useState(12.7);
  const [canBus, setCanBus] = useState(46);
  const [loopTime, setLoopTime] = useState(19.8);
  const [cpuUsage, setCpuUsage] = useState(38);
  const [wifiLatency, setWifiLatency] = useState(14);
  const [selectedAutoPath, setSelectedAutoPath] = useState<'5-Piece Center' | '3-Piece Amp Side' | 'Disruptor Defense'>('5-Piece Center');

  // Realistic jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVoltage((prev) => Math.round((12.5 + Math.random() * 0.4) * 10) / 10);
      setCanBus((prev) => Math.min(85, Math.max(35, Math.round(prev + (Math.random() * 6 - 3)))));
      setLoopTime((prev) => Math.round((19.5 + Math.random() * 1.0) * 10) / 10);
      setCpuUsage((prev) => Math.round(35 + Math.random() * 8));
      setWifiLatency((prev) => Math.round(12 + Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            RoboRIO Telemetry & 2D Field Navigation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time CAN network diagnostics, loop timing, and autonomous trajectory mapping
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            RoboRIO 2.0 Connected
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
            FMS Link: Active
          </span>
        </div>
      </div>

      {/* Primary Telemetry Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Battery Voltage */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">BATTERY BUS</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">{voltage} V</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                voltage > 12.2 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (voltage / 13.0) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">Nominal: 12.0 - 13.2V</span>
        </div>

        {/* CAN Bus Utilization */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">CAN FD UTILIZATION</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300 mb-1">{canBus}%</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                canBus < 70 ? 'bg-cyan-500' : 'bg-rose-500'
              }`}
              style={{ width: `${canBus}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">0 Error frames / sec</span>
        </div>

        {/* Loop Time */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">LOOP CYCLE PERIOD</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400 mb-1">{loopTime} ms</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${Math.min(100, (loopTime / 25) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">Target: 20ms periodic</span>
        </div>

        {/* Radio Latency */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase">VH-109 RADIO PING</span>
            <Radio className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">{wifiLatency} ms</div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (wifiLatency / 40) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">6 GHz Field Bandwidth</span>
        </div>
      </div>

      {/* 2D Field Navigation & AprilTags Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white font-mono">
              2D FIELD COORDINATES & AUTONOMOUS TRAJECTORY
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Routine:</span>
            <select
              value={selectedAutoPath}
              onChange={(e) => setSelectedAutoPath(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="5-Piece Center">5-Piece Center Auto</option>
              <option value="3-Piece Amp Side">3-Piece Substation Side</option>
              <option value="Disruptor Defense">Disruptor Defense Routing</option>
            </select>
          </div>
        </div>

        {/* Interactive Field Visualization Canvas (Pure SVG) */}
        <div className="relative w-full aspect-[2/1] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Field Grid */}
            <defs>
              <pattern id="fieldGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#fieldGrid)" />

            {/* Field Border */}
            <rect x="20" y="20" width="760" height="360" rx="8" stroke="#334155" strokeWidth="2" fill="none" />

            {/* Center Line */}
            <line x1="400" y1="20" x2="400" y2="380" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />

            {/* Red Alliance Zone (Left) */}
            <rect x="20" y="20" width="180" height="360" fill="rgba(239, 68, 68, 0.05)" />
            <text x="50" y="50" fill="#f87171" fontSize="12" fontFamily="monospace" fontWeight="bold">
              RED ALLIANCE ZONE
            </text>

            {/* Blue Alliance Zone (Right) */}
            <rect x="600" y="20" width="180" height="360" fill="rgba(59, 130, 246, 0.05)" />
            <text x="630" y="50" fill="#60a5fa" fontSize="12" fontFamily="monospace" fontWeight="bold">
              BLUE ALLIANCE ZONE
            </text>

            {/* Center Reef Structures */}
            {/* Red Reef */}
            <polygon
              points="240,160 280,140 320,160 320,240 280,260 240,240"
              stroke="#ef4444"
              strokeWidth="2"
              fill="rgba(239, 68, 68, 0.12)"
            />
            <text x="260" y="205" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold">
              REEF A
            </text>

            {/* Blue Reef */}
            <polygon
              points="480,160 520,140 560,160 560,240 520,260 480,240"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="rgba(59, 130, 246, 0.12)"
            />
            <text x="500" y="205" fill="#93c5fd" fontSize="11" fontFamily="monospace" fontWeight="bold">
              REEF B
            </text>

            {/* Barge / Cage Areas */}
            <rect x="360" y="40" width="80" height="60" rx="4" stroke="#eab308" strokeWidth="1.5" fill="rgba(234, 179, 8, 0.1)" />
            <text x="375" y="75" fill="#fde047" fontSize="10" fontFamily="monospace" fontWeight="bold">
              CAGE
            </text>

            {/* AprilTag Fiducial Markers */}
            {[
              { id: 1, x: 770, y: 150 },
              { id: 2, x: 770, y: 250 },
              { id: 6, x: 280, y: 135 },
              { id: 7, x: 325, y: 160 },
              { id: 8, x: 325, y: 240 },
              { id: 11, x: 30, y: 150 },
              { id: 12, x: 30, y: 250 },
            ].map((tag) => (
              <g key={tag.id}>
                <rect x={tag.x - 7} y={tag.y - 7} width="14" height="14" fill="#000" stroke="#38bdf8" strokeWidth="1.5" />
                <rect x={tag.x - 3} y={tag.y - 3} width="6" height="6" fill="#fff" />
              </g>
            ))}

            {/* Dynamic Autonomous Trajectory Path */}
            {selectedAutoPath === '5-Piece Center' && (
              <g>
                <path
                  d="M 120 200 C 180 200, 210 170, 240 160 S 160 120, 100 100 S 230 180, 280 140 S 140 100, 90 90 S 260 240, 280 260"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                  fill="none"
                />
                {/* Waypoint circles */}
                <circle cx="120" cy="200" r="6" fill="#10b981" />
                <circle cx="240" cy="160" r="4" fill="#38bdf8" />
                <circle cx="100" cy="100" r="4" fill="#38bdf8" />
                <circle cx="280" cy="140" r="4" fill="#38bdf8" />
                {/* Robot marker */}
                <rect x="230" y="150" width="20" height="20" rx="4" fill="#0284c7" stroke="#fff" strokeWidth="1.5" />
              </g>
            )}

            {selectedAutoPath === '3-Piece Amp Side' && (
              <g>
                <path
                  d="M 120 100 Q 200 90, 260 140 T 100 60 T 240 160"
                  stroke="#a855f7"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <circle cx="120" cy="100" r="6" fill="#10b981" />
                <circle cx="260" cy="140" r="4" fill="#a855f7" />
                <circle cx="100" cy="60" r="4" fill="#a855f7" />
                <rect x="230" y="150" width="20" height="20" rx="4" fill="#9333ea" stroke="#fff" strokeWidth="1.5" />
              </g>
            )}

            {selectedAutoPath === 'Disruptor Defense' && (
              <g>
                <path
                  d="M 120 300 L 260 250 L 380 200 L 460 180"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <circle cx="120" cy="300" r="6" fill="#10b981" />
                <circle cx="460" cy="180" r="4" fill="#f97316" />
                <rect x="450" y="170" width="20" height="20" rx="4" fill="#ea580c" stroke="#fff" strokeWidth="1.5" />
              </g>
            )}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between mt-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Start Node
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span> Scored Pose
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded bg-sky-600"></span> Current Robot Pose
            </span>
          </div>

          <span>Pose Estimation: AprilTag Megatag2 (Dual Limelight 3G)</span>
        </div>
      </div>

      {/* Subsystem Health Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Hardware Subsystems Health Check
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-mono text-xs">
          {[
            { name: 'Swerve Drive', status: 'OK', desc: '4x Kraken X60' },
            { name: 'Coral Elevator', status: 'OK', desc: 'Dual 775pro / FOC' },
            { name: 'Algae Intake', status: 'OK', desc: 'Polyurethane rollers' },
            { name: 'Limelight 3G', status: 'OK', desc: 'Megatag2 lock' },
            { name: 'Pneumatics', status: 'OK', desc: '118 PSI holding' },
            { name: 'Pigeon 2.0 IMU', status: 'OK', desc: 'Calibrated ±0.1°' },
          ].map((sub, idx) => (
            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-white font-semibold block">{sub.name}</span>
                <span className="text-[10px] text-slate-500 block">{sub.desc}</span>
              </div>
              <span className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 text-center">
                ● {sub.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
