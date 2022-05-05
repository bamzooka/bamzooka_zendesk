export type IFrameMessageType = 'bam_ticket_storage_set_checklist_id'
  | 'bam_ticket_storage_set_checklist_id_response'
  | 'bam_ticket_storage_get_checklist_id'
  | 'bam_ticket_storage_get_checklist_id_response'
  | 'bam_ticket_storage_set_workspace_id'
  | 'bam_ticket_storage_set_workspace_id_response'
  | 'bam_ticket_storage_set_force_checklist_completion'
  | 'bam_ticket_storage_set_force_checklist_completion_response';

interface IFrameProtocolMessage {
  id: number;
  event_type: IFrameMessageType;
}

export interface GetMessage extends IFrameProtocolMessage {
  event_type: 'bam_ticket_storage_get_checklist_id';
}

export interface ChecklistIdMessage extends IFrameProtocolMessage {
  checklist_id: string;
  event_type: 'bam_ticket_storage_set_checklist_id' | 'bam_ticket_storage_get_checklist_id_response'
    | 'bam_ticket_storage_set_checklist_id_response';
}

export interface WorkspaceIdMessage extends IFrameProtocolMessage {
  workspace_id: string;
}

export interface ForceChecklistCompletionMessage extends IFrameProtocolMessage {
  force_checklist_completion: string;
}
