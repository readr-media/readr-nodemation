export type ModuleActionCode = "ai" | "code" | "cms" | "content";

export type ModuleUnitData = {
  id: number;
  action: string;
  actionCode: ModuleActionCode;
  description: string;
  active: boolean;
  iconKey: string;
};

export type ModuleTypeData = {
  id: number;
  name: string;
  units: ModuleUnitData[];
};
