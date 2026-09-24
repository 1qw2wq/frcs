import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_SCOUTING_ENTRIES, INITIAL_PIT_DATA, INITIAL_PICKLIST } from '@/lib/defaultData';
import { MatchScoutingEntry, PitScoutingData, PicklistTeam } from '@/types/frc';

// In-memory data store for server-side mutations
let teamsStore = [...INITIAL_TEAMS];
let matchesStore = [...INITIAL_MATCHES];
let scoutingStore: MatchScoutingEntry[] = [...INITIAL_SCOUTING_ENTRIES];
let pitStore: PitScoutingData[] = [...INITIAL_PIT_DATA];
let picklistStore: PicklistTeam[] = [...INITIAL_PICKLIST];

export async function GET() {
  return NextResponse.json({
    teams: teamsStore,
    matches: matchesStore,
    scoutingEntries: scoutingStore,
    pitData: pitStore,
    picklist: picklistStore,
    lastUpdated: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (type === 'submit_scouting') {
      const entry: MatchScoutingEntry = {
        ...payload,
        id: payload.id || `scout-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };

      scoutingStore.unshift(entry);

      // Dynamically update team's EPA slightly based on scouted performance
      const teamIdx = teamsStore.findIndex((t) => t.number === entry.teamNumber);
      if (teamIdx !== -1) {
        const totalCoral = (entry.teleopCoralL1 || 0) + (entry.teleopCoralL2 || 0) + (entry.teleopCoralL3 || 0) + (entry.teleopCoralL4 || 0);
        const autoCoral = (entry.autoCoralL1 || 0) + (entry.autoCoralL2 || 0) + (entry.autoCoralL3 || 0) + (entry.autoCoralL4 || 0);
        const bump = Math.min(1.5, (totalCoral + autoCoral * 1.5) * 0.1);
        teamsStore[teamIdx] = {
          ...teamsStore[teamIdx],
          epa: Math.round((teamsStore[teamIdx].epa + bump) * 10) / 10,
        };
      }

      return NextResponse.json({ success: true, entry, totalEntries: scoutingStore.length });
    }

    if (type === 'submit_pit') {
      const pitEntry: PitScoutingData = {
        ...payload,
        lastChecked: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      const existingIndex = pitStore.findIndex((p) => p.teamNumber === pitEntry.teamNumber);
      if (existingIndex >= 0) {
        pitStore[existingIndex] = pitEntry;
      } else {
        pitStore.push(pitEntry);
      }

      return NextResponse.json({ success: true, pitEntry });
    }

    if (type === 'update_picklist') {
      if (Array.isArray(payload)) {
        picklistStore = payload;
        return NextResponse.json({ success: true, picklist: picklistStore });
      }
    }

    if (type === 'reset_defaults') {
      teamsStore = [...INITIAL_TEAMS];
      matchesStore = [...INITIAL_MATCHES];
      scoutingStore = [...INITIAL_SCOUTING_ENTRIES];
      pitStore = [...INITIAL_PIT_DATA];
      picklistStore = [...INITIAL_PICKLIST];
      return NextResponse.json({ success: true, message: 'Database reset to championship defaults' });
    }

    return NextResponse.json({ error: 'Invalid operation type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing data request' }, { status: 500 });
  }
}
