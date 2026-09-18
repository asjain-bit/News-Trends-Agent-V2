export type ReportStatus = "active" | "locked";

export interface ReportTypeConfig {
  id: string;
  label: string;
  status: ReportStatus;
  description: string;
  required: string[];
  optional: string[];
  depths?: string[];
}

export const REPORT_TYPES: Record<string, ReportTypeConfig> = {
  techLandscape: {
    id: "techLandscape",
    label: "Health Tech Landscape Report",
    description: "Generate comprehensive landscape intelligence reports.",
    status: "active",
    required: ["country", "techDomain", "depth"],
    optional: ["focusLens"],
    depths: ["Exec Brief", "Deep"],
  },
  hcCountry: {
    id: "hcCountry",
    label: "HC Country",
    description: "Same backbone, healthcare lens. Shown as \"coming soon\" in the pilot.",
    status: "locked",
    required: ["country", "depth"],
    optional: ["focusAreas"],
  },
  personality: {
    id: "personality",
    label: "Personality",
    description: "Meeting-prep profile of a named person. Behind legal sign-off.",
    status: "locked",
    required: ["name", "role", "country", "purpose", "depth"],
    optional: [],
  },
};
