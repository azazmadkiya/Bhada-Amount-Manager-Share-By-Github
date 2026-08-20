import { BhadaRate, Reminder, TransportNote } from '../types';

export function formatINR(amount: number | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function buildWhatsAppBhadaText(bhada: BhadaRate): string {
  return `🚚 *FREIGHT / BHADA RATE QUOTE*
----------------------------------------
📍 *Route:* ${bhada.originCity} ➔ ${bhada.destinationCity}
💰 *Rate:* ${formatINR(bhada.ratePerUnit, false)} / ${bhada.rateUnit}
⚖️ *Weight:* ${bhada.weightTons ? `${bhada.weightTons} Tons` : 'As per Actual'}
💵 *Total Bhada Amount:* ${formatINR(bhada.totalBhadaAmount)}
🚛 *Truck No:* ${bhada.truckNumber || 'To be allocated'} ${bhada.truckType ? `(${bhada.truckType})` : ''}
📦 *Material:* ${bhada.materialType || 'General Freight'}
📅 *Date:* ${bhada.loadingDate || 'Immediate'}
${bhada.partyName ? `🏢 *Party:* ${bhada.partyName}` : ''}
${bhada.advanceAmount ? `💳 *Advance:* ${formatINR(bhada.advanceAmount, false)}` : ''}
${bhada.balanceAmount ? `🧾 *Balance Due:* ${formatINR(bhada.balanceAmount, false)}` : ''}
${bhada.remarks ? `📝 *Note:* ${bhada.remarks}` : ''}
----------------------------------------
_Generated via Transport & Freight Management_`;
}

export function buildWhatsAppReminderText(reminder: Reminder): string {
  return `⏰ *TRANSPORT REMINDER / DUE ALERT*
----------------------------------------
📌 *Task:* ${reminder.title}
🔖 *Type:* ${reminder.reminderType}
${reminder.partyOrTruck ? `🚚 *Party/Truck:* ${reminder.partyOrTruck}` : ''}
${reminder.amount ? `💰 *Amount:* ${formatINR(reminder.amount)}` : ''}
📅 *Due Date:* ${formatDate(reminder.dueDate)} ${reminder.dueTime ? `at ${reminder.dueTime}` : ''}
⚡ *Priority:* ${reminder.priority}
${reminder.notes ? `📝 *Remarks:* ${reminder.notes}` : ''}
----------------------------------------
_Transport & Freight Management_`;
}

export const COMMON_CITIES = [
  'PADANA', 'BHACHAU', 'HALVAD', 'DAHEJ', 'BEED', 'KALAMB', 'MORBI',
  'GANDHIDHAM', 'MUNDRA', 'KANDLA', 'SURAT', 'HAZIRA', 'AHMEDABAD',
  'VADODARA', 'ANKLESHWAR', 'VAPI', 'RAJKOT', 'JAMNAGAR', 'BHAVNAGAR',
  'MUMBAI', 'PUNE', 'NAGPUR', 'NASHIK', 'AURANGABAD', 'THANE',
  'JAIPUR', 'KISHANGARH', 'JODHPUR', 'UDAIPUR', 'INDORE', 'BHOPAL',
  'GWALIOR', 'DELHI', 'GURUGRAM', 'FARIDABAD', 'PANIPAT', 'LUDHIANA',
  'HYDERABAD', 'BENGALURU', 'CHENNAI', 'KOLKATA', 'RAIPUR', 'ROURKELA'
];

export const TRUCK_TYPES = [
  '10 Wheeler Open Body (16 MT)',
  '12 Wheeler Taurus (21-25 MT)',
  '14 Wheeler Multi-axle (28-31 MT)',
  '16 Wheeler Heavy Multi (35-40 MT)',
  '18/22 Wheeler High Bed Trailer (42+ MT)',
  '32ft Single Axle Container (7.5 MT)',
  '32ft Multi Axle Container (15-18 MT)',
  '20ft Flatbed Container Trailer',
  '40ft High Cube Container Trailer',
  'Dumper / Tipper',
  'Tanker (Chemical / Edible Oil)',
  'Pickup / Tata Ace (1-3 MT)'
];

export const MATERIAL_TYPES = [
  'Bentonite Powder',
  'Industrial Refined Salt',
  'Plastic Granules / Polymers',
  'Soda Ash in Bags',
  'Vitrified Wall & Floor Tiles',
  'Sanitaryware & Ceramics',
  'Steel Plates / Coils / TMT Bars',
  'Edible Refined Oil (Tins/Drums)',
  'Cement & Clinker',
  'Chemical Liquid / Solid in Drums',
  'Cotton Bales / Yarns',
  'Agricultural Grains & Wheat',
  'Coal & Petcoke',
  'Heavy Machinery & Equipment',
  'FMCG Packaged Goods'
];

export function exportToCSV(bhadaRates: BhadaRate[]): void {
  const headers = [
    'Origin', 'Destination', 'Rate/Unit', 'Unit', 'Weight(Tons)', 'Total Bhada (INR)',
    'Truck No', 'Truck Type', 'Party Name', 'LR / Bilty No', 'Loading Date',
    'Material', 'Advance', 'Diesel Advance', 'Toll', 'Kanta', 'Commission', 'Balance', 'Remarks'
  ];

  const rows = bhadaRates.map(b => [
    `"${b.originCity}"`,
    `"${b.destinationCity}"`,
    b.ratePerUnit,
    `"${b.rateUnit}"`,
    b.weightTons || '',
    b.totalBhadaAmount,
    `"${b.truckNumber || ''}"`,
    `"${b.truckType || ''}"`,
    `"${b.partyName || ''}"`,
    `"${b.lrNumber || ''}"`,
    `"${b.loadingDate || ''}"`,
    `"${b.materialType || ''}"`,
    b.advanceAmount || 0,
    b.dieselAdvance || 0,
    b.tollTax || 0,
    b.kantaCharges || 0,
    b.commissionCharges || 0,
    b.balanceAmount || 0,
    `"${(b.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Transport_Freight_Management_Rates_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
