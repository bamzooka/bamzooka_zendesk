import {Injectable, OnDestroy} from "@angular/core";
import {Observable} from "rxjs";
import {
  ChecklistDataResponseMessage,
  ChecklistIdMessage,
  ForceChecklistCompletionMessage,
  GetChecklistDataMessage,
  GetMessage,
} from "./iframe-protocol";
import {PARENT_ORIGIN} from "./constant";
import {getRandomId} from "./utils";
import {BamApiService} from "./bam-api.service";

@Injectable({
  providedIn: 'root'
})
export class ZendeskCommunicatorService implements OnDestroy {
  isListening = false;

  constructor(private api: BamApiService) {
    if (!this.isListening) {
      window.addEventListener('message', this.zendeskEventListener.bind(this));
      this.isListening = true;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.zendeskEventListener);
  }

  zendeskEventListener(event: MessageEvent): void {
    if (event.origin !== PARENT_ORIGIN) {
      return;
    }
    let message: GetChecklistDataMessage = JSON.parse(JSON.stringify(event.data));
    let messageId = message.id;
    switch (message.event_type) {
      case "bam_get_checklist_data":
        this.api.getChecklist(+message.checklist_id).subscribe(checklist => {
          const response: ChecklistDataResponseMessage = {
            id: messageId,
            event_type: "bam_get_checklist_data_response",
            checklist_data: JSON.stringify(checklist)
          };
          parent.postMessage(response, PARENT_ORIGIN);
        });
        break;
    }
  }

  setChecklistId(checklistId: number | null): Observable<number | null> {
    return Observable.create((observer: { next: (arg0: number | null) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: ChecklistIdMessage = {
        id: messageId,
        checklist_id: checklistId ? checklistId.toString() : null,
        event_type: 'bam_ticket_storage_set_checklist_id'
      }
      const fn = (event: MessageEvent) => {
        const message: ChecklistIdMessage = JSON.parse(event.data);
        if (+message.id === +messageId) {
          if (message.event_type === 'bam_ticket_storage_set_checklist_id_response') {
            observer.next(message.checklist_id ? +message.checklist_id : null);
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }

  getChecklistId(): Observable<number | null> {
    return Observable.create((observer: { next: (arg0: number | null) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: GetMessage = {
        id: messageId,
        event_type: 'bam_ticket_storage_get_checklist_id'
      }
      const fn = (event: MessageEvent) => {
        const messageResponse: ChecklistIdMessage = JSON.parse(event.data);
        if (+messageResponse.id === +messageId) {
          if (messageResponse.event_type === 'bam_ticket_storage_get_checklist_id_response') {
            observer.next(messageResponse.checklist_id ? +messageResponse.checklist_id : null);
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }

  setForceChecklistCompletion(state: string): Observable<string> {
    return Observable.create((observer: { next: (arg0: string) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: ForceChecklistCompletionMessage = {
        id: messageId,
        force_checklist_completion: state,
        event_type: 'bam_ticket_storage_set_force_checklist_completion'
      }
      const fn = (event: MessageEvent) => {
        const messageResponse: ForceChecklistCompletionMessage = JSON.parse(event.data);
        if (+messageResponse.id === +messageId) {
          if (messageResponse.event_type === 'bam_ticket_storage_set_force_checklist_completion_response') {
            observer.next(messageResponse.force_checklist_completion);
            observer.complete();
          }
          window.removeEventListener('message', fn);
        }
      }
      parent.postMessage(message, PARENT_ORIGIN);
      window.addEventListener('message', fn);
    })
  }

  getForceChecklistCompletion(): Observable<string> {
    return Observable.create((observer: { next: (arg0: string) => void; complete: () => void; }) => {
      const messageId = getRandomId();
      const message: GetMessage = {
        id: messageId,
        event_type: 'bam_ticket_storage_get_force_checklist_completion'
      }
      const fn = (event: MessageEvent) => {
        console.log('++++++=', event);
        const messageResponse: ForceChecklistCompletionMessage = JSON.parse(event.data);
        if (+messageResponse.id === +messageId) {
          if (messageResponse.event_type === 'bam_ticket_storage_get_force_checklist_completion_response') {
            observer.next(messageResponse.force_checklist_completion);
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
