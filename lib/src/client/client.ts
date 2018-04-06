import { HttpHeaders, HttpParams } from '@angular/common/http';

import { RestangularHandler } from '../handler';
import { RestangularBuilder } from '../builder';
import { RestangularRequest } from '../backend';
import { Observable } from 'rxjs/Observable';


export class RestangularClient {

  private _fromServer: boolean;

  constructor(
    private builder: RestangularBuilder,
    private handler: RestangularHandler,
    private parent?: RestangularClient,
  ) {
  }

  get isCollection() {
    return this.builder.isCollection;
  }

  get id() {
    return this.builder.id;
  }

  get route() {
    return this.builder.route;
  }

  get fromServer() {
    return this._fromServer;
  }

  one(id: string): RestangularClient;
  one(route: string, id: string): RestangularClient;
  one(routeOrId, id?) {
    const builder = this.builder.one(routeOrId, id);
    return new RestangularClient(builder, this.handler);
  }

  all(route: string): RestangularClient {
    const builder = this.builder.all(route);
    return new RestangularClient(builder, this.handler);
  }

  get<T>(params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  get<T>(id: string, params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  get(
    paramsOrId?,
    paramsOrHeaders?,
    headers?,
  ) {
    let id: string;
    let params: HttpParams;
    if (this.isCollection) {
      id = paramsOrId as string;
      params = paramsOrHeaders as HttpParams;
      return this.one(id).get(params, headers);
    }
    params = paramsOrId as HttpParams;
    headers = paramsOrHeaders as HttpHeaders;
    const req = new RestangularRequest('GET', this.builder.pointer, {params, headers});
    return this.handler.handle(req);
  }


  getList<T>(params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  getList<T>(route: string, params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  getList(
    routeOrParams?,
    paramsOrHeaders?,
    headers?,
  ) {
    let route: string;
    let params: HttpParams;
    if (!this.isCollection && typeof routeOrParams === 'string') {
      route = routeOrParams;
      params = paramsOrHeaders as HttpParams;
      return this.all(route).getList(params, headers);
    }
    params = routeOrParams as HttpParams;
    headers = paramsOrHeaders as HttpHeaders;
    const req = new RestangularRequest('GET', this.builder.pointer, {params, headers});
    return this.handler.handle(req);
  }

  post<T>(body: T, params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  post<T>(subElement: string, body: T, params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  post(
    subElementOrBody,
    bodyOrParams,
    paramsOrHeaders?,
    headers?,
  ) {
    let subElement: string;
    let body: any;
    let params: HttpParams;
    if (!this.isCollection) {
      subElement = subElementOrBody as string;
      body = bodyOrParams as HttpParams;
      params = bodyOrParams as HttpParams;
      return this.all(subElement).post(body, params, headers);
    }
    body = subElementOrBody;
    params = bodyOrParams as HttpParams;
    headers = paramsOrHeaders as HttpParams;
    const req = new RestangularRequest('POST', this.builder.pointer, body, {params, headers});
    return this.handler.handle(req);
  }

  put<T>(params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  put<T>(index: number, params?: HttpParams, headers?: HttpHeaders): Observable<RestangularClient & T>;
  put<T>(
    indexOrParams?,
    paramsOrHeaders?,
    headers?,
  ) {
    let params: HttpParams;
    let index: number;
    switch (true) {
      case this.isCollection && this.fromServer: {
        index = indexOrParams as number;
        params = paramsOrHeaders as HttpParams;
        return (this[index] as RestangularClient).put(params, headers);
      }
      case !this.isCollection && typeof this.id !== 'undefined':
      case this.isCollection && !this.fromServer: {
        throw new Error('Could not perform PUT request on collection. Should be Entity pointer');
      }
      default: {
        params = indexOrParams as HttpParams;
        headers = paramsOrHeaders as HttpHeaders;
        const req = new RestangularRequest('PUT', this.builder.pointer, {}, {params, headers});
        return this.handler.handle(req);
      }
    }
  }

  patch<T>(
    object: any,
    params?: HttpParams,
    headers?: HttpHeaders,
  ) {
    const req = new RestangularRequest('PATCH', this.builder.pointer, object, {params, headers});
    return this.handler.handle(req);
  }

  delete<T>(
    params?: HttpParams,
    headers?: HttpHeaders,
  ) {
    const req = new RestangularRequest('DELETE', this.builder.pointer, {params, headers});
    return this.handler.handle(req);
  }

  withConfig(options: any) {
    const handler = this.handler.withConfig(options);
    return new RestangularClient(this.builder, handler);
  }

  extendConfig(options: any) {
    const handler = this.handler.extendConfig(options);
    return new RestangularClient(this.builder, handler);
  }
}
