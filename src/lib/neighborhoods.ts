import coordsData from '@/data/neighborhood-coords.json';
import subwayData from '@/data/neighborhood-subway-lines.json';
import commuteData from '@/data/commute-data.json';
import parentData from '@/data/neighborhood-parents.json';
import areaIdData from '@/data/neighborhood-area-ids.json';

const coords = coordsData as Record<string, { lat: number; lng: number; formatted: string }>;
const subways = subwayData as Record<string, string[]>;
const commutes = commuteData as Record<string, Record<string, number | null>>;
const parents = parentData as Record<string, string>;
const areaIds = areaIdData as Record<string, number>;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function unslugify(slug: string): string | null {
  return slugMap.get(slug) ?? null;
}

const slugMap = new Map(Object.keys(coords).map((name) => [slugify(name), name]));

export function getAllNeighborhoodSlugs(): string[] {
  return Object.keys(coords).map(slugify);
}

export function getAllNeighborhoods(): string[] {
  return Object.keys(coords);
}

export function getAllNeighborhoodCoords(): Record<string, { lat: number; lng: number }> {
  return coords;
}

export interface NeighborhoodStaticData {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  formatted: string;
  borough: string;
  subwayLines: string[];
  commuteTimes: Record<string, number>;
  parentNeighborhood: { name: string; slug: string } | null;
  childNeighborhoods: { name: string; slug: string }[];
}

const COMMUTE_LABELS: Record<string, string> = {
  timesSquare: 'Times Square',
  grandCentral: 'Grand Central',
  midtownEast: 'Midtown East',
  penn: 'Penn Station',
  hudsonYards: 'Hudson Yards',
  fidi: 'Financial District',
  unionSquare: 'Union Square',
  barclays: 'Barclays Center',
  nyu: 'NYU',
  columbiaCampus: 'Columbia University',
};

export { COMMUTE_LABELS };

// Official MTA subway line colors
// https://new.mta.info/maps
const SUBWAY_COLORS: Record<string, string> = {
  // IRT Broadway–Seventh Avenue (red)
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  // IRT Lexington Avenue (green)
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  // IRT Flushing (purple)
  '7': '#B933AD',
  // IND Eighth Avenue (blue)
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  // IND Sixth Avenue (orange)
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  // IND Crosstown (light green)
  'G': '#6CBE45',
  // BMT Nassau Street (brown)
  'J': '#996633', 'Z': '#996633',
  // BMT Broadway (yellow)
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  // BMT Canarsie (light gray)
  'L': '#A7A9AC',
  // Shuttles (dark gray)
  'S': '#808183',
  // PATH (blue, similar to A/C/E)
  'PATH': '#0039A6',
};

export function getSubwayColor(line: string): string {
  return SUBWAY_COLORS[line] || '#888';
}

// Yellow lines need dark text for contrast
export function getSubwayTextColor(line: string): string {
  return ['N', 'Q', 'R', 'W'].includes(line) ? '#333' : '#fff';
}

function extractBorough(formatted: string): string {
  if (formatted.includes('Manhattan') || formatted.includes('New York, NY')) return 'Manhattan';
  if (formatted.includes('Brooklyn')) return 'Brooklyn';
  if (formatted.includes('Queens')) return 'Queens';
  if (formatted.includes('Bronx')) return 'Bronx';
  if (formatted.includes('Staten Island')) return 'Staten Island';
  if (formatted.includes('NJ')) return 'New Jersey';
  return 'NYC';
}

// Get all area_name values for a neighborhood: itself + all descendant children
// Used to aggregate rent data for parent neighborhoods
export function getNeighborhoodAreaNames(name: string): string[] {
  const result = [name];
  // Find direct children
  const directChildren = Object.entries(parents)
    .filter(([, p]) => p === name)
    .map(([child]) => child);
  for (const child of directChildren) {
    result.push(...getNeighborhoodAreaNames(child));
  }
  return result;
}

// Get comma-separated StreetEasy area IDs for a neighborhood (including all descendants)
export function getNeighborhoodAreaIds(name: string): string {
  const names = getNeighborhoodAreaNames(name);
  return names.map((n) => areaIds[n]).filter(Boolean).join(',');
}

export function getNeighborhoodStaticData(name: string): NeighborhoodStaticData | null {
  const coord = coords[name];
  if (!coord) return null;

  const parentName = parents[name] || null;
  const parent = parentName && coords[parentName]
    ? { name: parentName, slug: slugify(parentName) }
    : null;

  // Find children: neighborhoods whose parent is this one (and have coords data)
  const children = Object.entries(parents)
    .filter(([child, p]) => p === name && coords[child])
    .map(([child]) => ({ name: child, slug: slugify(child) }));

  return {
    name,
    slug: slugify(name),
    lat: coord.lat,
    lng: coord.lng,
    formatted: coord.formatted,
    borough: extractBorough(coord.formatted),
    subwayLines: subways[name] || [],
    commuteTimes: Object.fromEntries(
      Object.entries(commutes[name] || {}).filter(([, v]) => v !== null)
    ) as Record<string, number>,
    parentNeighborhood: parent,
    childNeighborhoods: children,
  };
}
