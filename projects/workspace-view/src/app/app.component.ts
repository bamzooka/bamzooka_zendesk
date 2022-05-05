import {Component, OnInit} from '@angular/core';
import {
  BamApiService,
  Checklist,
  CHECKLIST_FILTER, CHECKLIST_STATUS,
  CHECKLIST_TYPE,
  Team,
  Workspace, ZendeskCommunicatorService,
} from "../_core";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {finalize, forkJoin} from "rxjs";
import {HttpParams} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  attachedChecklistId: number | null = null;
  attachChecklistForm!: FormGroup
  workspaces: Workspace[] = [];
  teams: Team[] = [];
  runningChecklists: Checklist[] = [];
  templateChecklists: Checklist[] = [];
  fetchingWorkspaces = false;
  fetchingTeams = false;
  fetchingChecklists = false;
  attachingChecklist = false;


  constructor(private api: BamApiService,
              private fb: FormBuilder,
              private zendeskCommunicator: ZendeskCommunicatorService) {
    this.createForm();
  }

  ngOnInit(): void {
    this.zendeskCommunicator.getChecklistId().subscribe((checklistId: number) => {
      if (checklistId) {
        this.attachedChecklistId = checklistId;
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

  private attachChecklist(settings: { checklist_id: number; workspace_id: number }): void {
    this.attachingChecklist = true;
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


}
