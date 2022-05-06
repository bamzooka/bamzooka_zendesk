export type IFrameMessageType = 'bam_ticket_storage_set_checklist_id'
  | 'bam_ticket_storage_set_checklist_id_response'
  | 'bam_ticket_storage_get_checklist_id'
  | 'bam_ticket_storage_get_checklist_id_response'
  | 'bam_ticket_storage_set_workspace_id'
  | 'bam_ticket_storage_set_workspace_id_response'
  | 'bam_ticket_storage_set_force_checklist_completion'
  | 'bam_ticket_storage_set_force_checklist_completion_response'
  | 'bam_ticket_storage_get_force_checklist_completion'
  | 'bam_ticket_storage_get_force_checklist_completion_response'
  | 'bam_get_checklist_data'
  | 'bam_get_checklist_data_response';

interface IFrameProtocolMessage {
  id: number;
  event_type: IFrameMessageType;
}

export interface GetMessage extends IFrameProtocolMessage {
  event_type: 'bam_ticket_storage_get_checklist_id' | 'bam_ticket_storage_get_force_checklist_completion';
}

export interface ChecklistIdMessage extends IFrameProtocolMessage {
  checklist_id: string | null;
  event_type: 'bam_ticket_storage_set_checklist_id' | 'bam_ticket_storage_get_checklist_id_response'
    | 'bam_ticket_storage_set_checklist_id_response';
}

export interface ForceChecklistCompletionMessage extends IFrameProtocolMessage {
  force_checklist_completion: string;
}

export interface GetChecklistDataMessage extends IFrameProtocolMessage {
  event_type: 'bam_get_checklist_data';
  checklist_id: string;
}

export interface ChecklistDataResponseMessage extends IFrameProtocolMessage {
  checklist_data: string;
  event_type: 'bam_get_checklist_data_response';
}
