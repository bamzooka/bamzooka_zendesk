import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Checklist, Team, Workspace} from "./models";

@Injectable({
  providedIn: 'root'
})
export class BamApiService {
  readonly API_DOMAIN = '';

  constructor(private http: HttpClient) {
  }

  getLastUsedWorkspace(): Observable<Workspace> {
    const url = `${this.baseUrl}/me/last_used_workspace`;
    return this.http.get<Workspace>(url);
  }

  getMyTeams(workspaceId: number): Observable<Team[]> {
   const url = `${this.baseUrl}/workspaces/${workspaceId}/all_my_teams`;
   return this.http.get<Team[]>(url);
  }

  /**
   * GET the workspaces where the current user has access
   */
  getWorkspacesIHaveAccessTo(): Observable<Workspace[]> {
    const url =  `${this.baseUrl}/workspaces/all_my_accesses`;
    return this.http.get<Workspace[]>(url);
  }

  /**
   * GET the list of checklists with the query params given in param
   */
  getChecklists(queryParams: HttpParams, workspaceId: number): Observable<Checklist[]> {
    const url = `${this.baseUrl}/workspaces/${workspaceId}/checklists`;
    return this.http.get<Checklist[]>(url, {params: queryParams});
  }


  get baseUrl(): string {
    return this.API_DOMAIN + '/api/v1';
  }
}
