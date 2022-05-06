import {Component, OnInit } from '@angular/core';
import {
  BamApiService,
  Checklist,
  CHECKLIST_FILTER,
  CHECKLIST_STATUS,
  CHECKLIST_TYPE,
  Team,
  Workspace,
  ZendeskCommunicatorService,
} from "../_core";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {finalize, forkJoin} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {McFlashNoticeService, McFlashNoticeType} from "@bamzooka/ui-kit";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  attachedChecklistId: number | null = null;
  attachChecklistForm!: FormGroup;
  forceChecklistCompletion: string = 'no';
  workspaces: Workspace[] = [];
  teams: Team[] = [];
  runningChecklists: Checklist[] = [];
  templateChecklists: Checklist[] = [];
  fetchingWorkspaces = false;
  fetchingTeams = false;
  fetchingChecklists = false;
  attachingChecklist = false;
  processingSettings = false;

  isChangingForceChecklistCompletionState = false;
  isUnattachingChecklist = false;
  checklist: Checklist | null = null;


  constructor(private api: BamApiService,
              private fb: FormBuilder,
              private flashNoticeService: McFlashNoticeService,
              private domSanitizer: DomSanitizer,
              private zendeskCommunicator: ZendeskCommunicatorService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.attachedChecklistId = null;
    this.checklist = null;
    forkJoin(
      [
        this.zendeskCommunicator.getChecklistId(),
        this.zendeskCommunicator.getForceChecklistCompletion()
      ]
    )
      .subscribe((checklistIdAndCompletion) => {
        const checklistId = checklistIdAndCompletion[0];
        this.forceChecklistCompletion = checklistIdAndCompletion[1];
        if (checklistId) {
          this.attachedChecklistId = checklistId;
          this.getChecklist(checklistId);
        } else {
          this.getWorkspaces();
        }
      })
  }

  get checklists(): Checklist[] {
    if (this.getFormControlForKey('template_or_running_radio')?.value === 'template') {
      return this.templateChecklists;
    } else {
      return this.runningChecklists;
    }
  }

  get checklistUrl(): SafeResourceUrl {
    console.log(this.checklist);
    const url = `/workspaces/${this.checklist?.project?.workspace_id}/checklists/${this.checklist?.id}?embedded=true`;
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url)
  }

  onAttachChecklist(): void {
    const templateOrRunningRadio = this.getTemplateOrRunningChoice();
    switch (templateOrRunningRadio) {
      // open run checklist dialog
      case 'template':
        // this.openRunChecklistDialog();
        break;
      // attach checklist right away
      case 'running':
        this.attachChecklist({
          checklist_id: this.getChecklistIdFromForm(),
          workspace_id: this.getWorkspaceIdFromForm()
        });
        break;
    }
  }


  onWorkspaceChanged(): void {
    this.attachChecklistForm.patchValue({
      project_id: null,
      checklist_id: null
    });
    if (this.isFormControlDefinedForKey('workspace_id')) {
      const workspaceId = this.getFormControlForKey('workspace_id')?.value;
      this.getTeams(workspaceId);
    }
  }


  onTeamChanged(): void {
    this.attachChecklistForm.patchValue({
      checklist_id: null
    });
    if (
      this.isFormControlDefinedForKey('project_id') &&
      this.isFormControlDefinedForKey('workspace_id')
    ) {
      const teamId = this.getFormControlForKey('project_id')?.value;
      const workspaceId = this.getFormControlForKey('workspace_id')?.value;
      this.getChecklists(teamId, workspaceId);
    }
  }

  isFormControlDefinedForKey(key: string): boolean {
    return (
      this.getFormControlForKey(key) &&
      this.getFormControlForKey(key)?.value &&
      this.getFormControlForKey(key)?.value !== 'null'
    );
  }

  getFormControlForKey(key: string): AbstractControl | null {
    return this.attachChecklistForm.get(key);
  }

  onChangeForceChecklistCompletionToCloseTicketState(): void {
    const newState = this.forceChecklistCompletion === 'yes' ? 'no' : 'yes';
    this.isChangingForceChecklistCompletionState = true;
    this.zendeskCommunicator.setForceChecklistCompletion(newState)
      .pipe(
        finalize(() => this.isChangingForceChecklistCompletionState = false)
      )
      .subscribe(() => {
        this.forceChecklistCompletion = newState;
      });
  }

  onOpenInAppDomain(): void {
    let url: string = '/';
    if (this.checklist) {
      url = `/workspaces/${this.checklist.project.workspace_id}/checklists/${this.checklist.id}`;
    }
    window.open(url, '_blank');
  }

  onUnattachChecklist(): void {
    this.isUnattachingChecklist = true;
    this.zendeskCommunicator.setChecklistId(null)
      .pipe(
        finalize(() => this.isUnattachingChecklist = false)
      )
      .subscribe(() => {
        this.init();
      });
  }

  onLogout(): void {
    this.api.logout().subscribe(() => {
      location.reload();
    }, (err) => {
      this.displayError('Cannot logout');
    })
  }


  private displayError(msg: string): void {
    this.flashNoticeService.openFlashNoticeSimple(msg, McFlashNoticeType.ERROR);
  }

  private attachChecklist(settings: { checklist_id: number; workspace_id: number }): void {
    this.attachingChecklist = true;
    // forkJoin(
    //   [
    //     this.zendeskCommunicator.setChecklistId(settings.checklist_id),
    //     this.zendeskCommunicator.setForceChecklistCompletion(true)
    //   ]
    // )
    this.zendeskCommunicator.setChecklistId(settings.checklist_id)
      .pipe(
        finalize(() => {
          this.attachingChecklist = false;
        })
      )
      .subscribe(() => {
        this.attachedChecklistId = settings.checklist_id;
      })
  }

  private getTemplateOrRunningChoice(): string {
    return this.attachChecklistForm.value.template_or_running_radio;
  }

  private getChecklistIdFromForm(): number {
    return this.attachChecklistForm.value.checklist_id;
  }

  private getWorkspaceIdFromForm(): number {
    return this.attachChecklistForm.value.workspace_id;
  }

  /**
   * Get teams user has access to for workspace id given in params
   */
  private getTeams(workspaceId: number): void {
    this.fetchingTeams = true;
    this.api
      .getMyTeams(workspaceId)
      .pipe(finalize(() => (this.fetchingTeams = false)))
      .subscribe(
        (teams: Team[]) => {
          this.teams = teams;
        }
      );
  }

  private createForm(): void {
    this.attachChecklistForm = this.fb.group({
      workspace_id: [null, Validators.required],
      project_id: [null, Validators.required],
      template_or_running_radio: ['template', Validators.required],
      checklist_id: [null, Validators.required]
    });
  }

  /**
   * Get workspaces from server, populate component attribute
   */
  private getWorkspaces(): void {
    this.fetchingWorkspaces = true;
    this.api
      .getWorkspacesIHaveAccessTo()
      .pipe(finalize(() => (this.fetchingWorkspaces = false)))
      .subscribe(
        (workspaces: Workspace[]) => {
          this.workspaces = workspaces;
        });
  }


  private getChecklists(teamId: string, workspaceId: number) {
    this.fetchingChecklists = true;
    const httpParamsRunning = new HttpParams()
      .set('type', CHECKLIST_TYPE.CHECKLIST_RUN)
      .set('project_id', teamId)
      .set(CHECKLIST_FILTER.IS_COMPLETED, 'false')
      .set('status', CHECKLIST_STATUS.ACTIVE.toString());
    const httpParamsTemplates = new HttpParams()
      .set('type', CHECKLIST_TYPE.CHECKLIST_TEMPLATE)
      .set('project_id', teamId)
      .set('status', CHECKLIST_STATUS.ACTIVE.toString());
    forkJoin([
      this.api.getChecklists(httpParamsRunning, workspaceId),
      this.api.getChecklists(httpParamsTemplates, workspaceId)
    ])
      .pipe(finalize(() => (this.fetchingChecklists = false)))
      .subscribe(
        (runningAndTemplateChecklists) => {
          this.runningChecklists = runningAndTemplateChecklists[0];
          this.templateChecklists = runningAndTemplateChecklists[1];
        }
      );
  }

  private getChecklist(checklistId: number): void {
    this.api
      .getChecklist(checklistId)
      .subscribe(
        (checklist: Checklist) => {
          this.checklist = checklist;
        }
      );
  }


}
