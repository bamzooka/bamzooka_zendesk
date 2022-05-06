export interface Workspace {
  id: number;
  name: string;
}

export enum CHECKLIST_TYPE {
  CHECKLIST_RUN = 'ChecklistRun',
  CHECKLIST_TEMPLATE = 'ChecklistTemplate'
}

export enum CHECKLIST_STATUS {
  ACTIVE = 0,
}

export enum CHECKLIST_FILTER {
  IS_COMPLETED = 'is_completed',
}

export interface Checklist {
  id: number;
  title: string;
  project: {
    workspace_id: number;
  }
}

export interface Team {
  id: number;
  name: string;
}
