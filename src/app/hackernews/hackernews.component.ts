import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { CollectionViewer } from '@angular/cdk/collections';
import { HackerNewsAPIClient, StoryDto, StoryDtoPaginatedResponse } from '../api-client';
import { Observable, BehaviorSubject, switchMap, Subscription, Subject, catchError, map, of } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'hackernews',
  templateUrl: './hackernews.component.html',
  styleUrls: ['./hackernews.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HackerNewsComponent implements OnInit {
  columns: string[] = ['title', 'url', 'score', 'by', 'time'];
  dataSource: StoryDataSource;
  paginationInfo: Observable<PaginationInfo>;   
  pageSize: number = 10; 
  pageSizeOptions: number[] = [10, 20, 30, 40, 50];
  form: FormGroup;
  formValue?: {title: string | null | undefined, minScore: number | null | undefined, maxScore: number | null | undefined, fromDate: Date | null | undefined, toDate: Date | null | undefined, createdBy: string | null | undefined};  

  constructor(private fb: FormBuilder, private apiClient: HackerNewsAPIClient)
  {    
    this.dataSource = new StoryDataSource(this.apiClient); // creates DataSource
    this.paginationInfo = this.dataSource.paginationInfo;   
    this.form = this.fb.group({
        title: [null],
        minScore: [null],
        maxScore: [null],
        fromDate: [null],     
        toDate: [null], 
        createdBy: [null],             
    });
  }
  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.form.valid)
    {
        this.formValue = this.form.value;
        this.dataSource.loadStories(this.formValue?.title, this.formValue?.minScore, this.formValue?.maxScore, this.formValue?.fromDate,this.formValue?.toDate,this.formValue?.createdBy, 1, 10);
    }
  }

  onPageEvent(e: PageEvent) {
    let pageIndex = 1
    
    if (e.pageSize == this.pageSize) // when size is the same, otherwise we default to page 1
    {
      pageIndex = e.pageIndex + 1 // index in Angular Material starts at 0.
    }

    this.pageSize = e.pageSize;
    this.dataSource.loadStories(this.formValue?.title, this.formValue?.minScore, this.formValue?.maxScore, this.formValue?.fromDate,this.formValue?.toDate,this.formValue?.createdBy, pageIndex, e.pageSize);
  }
}

export class StoryDataSource implements DataSource<StoryDto>
{
  private _stories: BehaviorSubject<readonly StoryDto[]> = new BehaviorSubject<readonly StoryDto[]>([]);
  private _paginationInfo: BehaviorSubject<PaginationInfo> = new BehaviorSubject({pageNumber: 1, pageSize: 10, totalPages: 0, totalItems: 0, hasPrevious: false, hasNext: false} as PaginationInfo);
  private _subject: Subject<{title: string | null | undefined, minScore: number | null | undefined, maxScore: number | null | undefined, fromDate: Date | null | undefined, toDate: Date | null | undefined, createdBy: string | null | undefined, page: number | undefined, size: number | undefined}> = new Subject()
  private _subjectSubscription?: Subscription;
  constructor(private apiClient: HackerNewsAPIClient)
  {
    // create subscription for search subject
     this._subjectSubscription = this._subject.pipe(
      switchMap(({title, minScore, maxScore, fromDate, toDate, createdBy, page, size}) => this.apiClient.getNewStories(title, minScore, maxScore, fromDate, toDate, createdBy, page, size)
      .pipe(
        map((result) => ({result})))),
        catchError((err, obs) => of(
          {
            result: new StoryDtoPaginatedResponse(
              {
                items: [],
                hasNext: false,
                hasPrevious: false,
                pageNumber: 1,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0
              })
          })))
        .subscribe(c => {
            const {items, ...pageInformation} = c.result;
            this._stories.next(items ?? []); // emit new values for subject stories
            this._paginationInfo.next({...pageInformation}); // emit new values for subject paginationInfo
        })
  }

  connect(collectionViewer: CollectionViewer): Observable<readonly StoryDto[]> {
    return this._stories.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._stories.complete();
    this._subjectSubscription?.unsubscribe();
  }

  loadStories(title: string | null | undefined, minScore: number | null | undefined, maxScore: number | null | undefined, fromDate: Date | null | undefined, toDate: Date | null | undefined, createdBy: string | null | undefined, page: number | undefined, size: number | undefined) : void
  {
    toDate?.setHours(23, 59, 59, 999) // set time to 23.59.59.999
    this._subject.next({title, minScore, maxScore, fromDate, toDate, createdBy, page, size }); // emit new values for search subject 
  }

  public get paginationInfo() :Observable<PaginationInfo>
  {
    return this._paginationInfo.asObservable();
  }
  
}

export interface PaginationInfo { pageNumber?: number, pageSize?: number, totalPages?: number, totalItems?: number, hasPrevious?: boolean, hasNext?: boolean }
