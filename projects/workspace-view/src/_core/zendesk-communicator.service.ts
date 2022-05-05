import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {ChecklistIdMessage, ForceChecklistCompletionMessage, GetMessage, WorkspaceIdMessage} from "./iframe-protocol";
import {PARENT_ORIGIN} from "./constant";
import {getRandomId} from "./utils";

@Injectable({
  providedIn: 'root'
})
export class ZendeskCommunicatorService {

  setChecklistId(checklistId: number): Observable<number> {
    return Observable.create((observer: { next: (arg0: number) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: ChecklistIdMessage = {
        id: messageId,
        checklist_id: checklistId.toString(),
        event_type: 'bam_ticket_storage_set_checklist_id'
      }
      const fn = (event: MessageEvent) => {
        const message: ChecklistIdMessage = JSON.parse(event.data);
        if (+message.id === +messageId) {
          if (message.event_type === 'bam_ticket_storage_set_checklist_id_response') {
            observer.next(+message.checklist_id);
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }

  getChecklistId(): Observable<number> {
    return Observable.create((observer: { next: (arg0: number) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: GetMessage = {
        id: messageId,
        event_type: 'bam_ticket_storage_get_checklist_id'
      }
      const fn = (event: MessageEvent) => {
        const message: ChecklistIdMessage = JSON.parse(event.data);
        if (+message.id === +messageId) {
          if (message.event_type === 'bam_ticket_storage_get_checklist_id_response') {
            observer.next(+message.checklist_id);
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }

  setWorkspaceId(workspaceId: number): Observable<number> {
    return Observable.create((observer: { next: (arg0: number) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: WorkspaceIdMessage = {
        id: messageId,
        workspace_id: workspaceId.toString(),
        event_type: 'bam_ticket_storage_set_workspace_id'
      }
      const fn = (event: MessageEvent) => {
        const message: WorkspaceIdMessage = JSON.parse(event.data);
        if (+message.id === +messageId) {
          if (message.event_type === 'bam_ticket_storage_set_workspace_id_response') {
            observer.next(+message.workspace_id);
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }

  setForceChecklistCompletion(state: boolean): Observable<boolean> {
    return Observable.create((observer: { next: (arg0: boolean) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: ForceChecklistCompletionMessage = {
        id: messageId,
        force_checklist_completion: state ? 'true' : 'false',
        event_type: 'bam_ticket_storage_set_force_checklist_completion'
      }
      const fn = (event: MessageEvent) => {
        const message: ForceChecklistCompletionMessage = JSON.parse(event.data);
        if (+message.id === +messageId) {
          if (message.event_type === 'bam_ticket_storage_set_force_checklist_completion_response') {
            observer.next(message.force_checklist_completion === 'true');
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }
}
