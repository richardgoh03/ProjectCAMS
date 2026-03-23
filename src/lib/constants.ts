export const FORM_SECTIONS = [
  {
    id: 'A',
    title: 'Accuracy & Compliance',
    weight: '35%',
    items: [
      { id: 'A1', name: 'Identity verification before disclosure', desc: "Verified caller's identity before disclosing any account or billing information.", type: 'auto-fail' },
      { id: 'A2', name: 'Correct payment sequence explained', desc: "Subsidy → MediShield Life / ISP → MediSave → cash.", type: 'score' },
      { id: 'A3', name: "Schemes applied correctly to caller's situation", desc: "Deductibles, co-insurance, ward billing rules applied accurately to this caller.", type: 'score' },
      { id: 'A4', name: 'No misinformation given', desc: "No factually incorrect statements about any scheme, entitlement, limit, or process.", type: 'auto-fail' },
      { id: 'A5', name: 'Documentation complete', desc: "All enquiry data recorded accurately in system.", type: 'auto-fail' },
    ]
  },
  {
    id: 'B',
    title: 'Resolution & Ownership',
    weight: '30%',
    items: [
      { id: 'B1', name: 'Identified true root cause', desc: "Went beyond surface question to identify what the caller actually needed.", type: 'score' },
      { id: 'B2', name: 'Provided clear, specific next steps', desc: "Gave exact locations, requirements, and times, not generic answers.", type: 'score' },
      { id: 'B3', name: 'Managed expectations on timelines', desc: "Gave realistic timeframes.", type: 'score' },
      { id: 'B4', name: 'Escalated only when truly necessary', desc: "Did not pass caller unnecessarily, but escalated when required.", type: 'auto-fail' },
      { id: 'B5', name: 'First call resolution achieved where appropriate', desc: "Caller does not need to call back, or expectations for follow-up were clear.", type: 'score' },
    ]
  },
  {
    id: 'C',
    title: 'Financial Communication',
    weight: '25%',
    items: [
      { id: 'C1', name: "Used caller's actual figures in explanation", desc: "Used real monetary amounts discussed, not generic policy regurgitation.", type: 'score' },
      { id: 'C2', name: 'Explained in plain language — no jargon', desc: "Translated healthcare terms into plain language.", type: 'score' },
      { id: 'C3', name: 'Checked understanding before closing', desc: "Genuinely checked caller's takeaway, avoiding 'does that make sense?'.", type: 'score' },
      { id: 'C4', name: 'Managed emotional tone appropriately', desc: "Frightened → reassurance; Angry → de-escalation; Grieving → acknowledgment.", type: 'score' },
      { id: 'C5', name: 'Explored alternatives when primary answer was "no"', desc: "Proactively offered appeals, MSW, MediFund, payment arrangements.", type: 'score' },
    ]
  },
  {
    id: 'D',
    title: 'Service & Professionalism',
    weight: '10%',
    items: [
      { id: 'D1', name: 'Professional greeting and name usage', desc: "Standard opening used, referenced caller's name naturally.", type: 'score' },
      { id: 'D2', name: 'Courteous, calm, respectful tone throughout', desc: "Measured across full call, maintained even tone under pressure.", type: 'score' },
      { id: 'D3', name: 'Clear summary and reference number provided', desc: "Summarised discussion, next steps, and provided reference number.", type: 'score' },
    ]
  }
];

export const CALL_CATEGORIES = [
  'MediSave', 'MediShield Life', 'MediFund', 'Means Testing', 
  'Ward Billing', 'ISP/IP Coordination', 'MCAF Forms', 
  'Payment Arrangements', 'General Billing Enquiry', 'Complaint', 'Other'
];

export const COACHING_PRIORITIES = [
  'Accuracy', 'Resolution', 'Financial Communication', 'Tone', 'Process'
];
