import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SuTableLabels, SuTablePageSize, SuTablePagination } from '@su-labs/core/table';

/** The page controls under a table: rows per page, the range on screen, and previous and next */
@Component({
  selector: 'su-lib-table-paginator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table-paginator.component.html',
  styleUrl: './table-paginator.component.scss',
})
export class SuTablePaginatorComponent {
  readonly pagination = input.required<SuTablePagination>();
  readonly labels = input.required<SuTableLabels>();
  readonly controlId = input.required<string>();
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<SuTablePageSize>();

  /** The buttons stay focusable at the first and last page (`aria-disabled`), so focus isn't lost on the way */
  protected turn(page: number): void {
    const { pageCount } = this.pagination();
    if (page >= 0 && page < pageCount) {
      this.pageChange.emit(page);
    }
  }

  protected onPageSize(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      const { value } = event.target;
      const size = this.pagination().pageSizes.find(
        item => String(item) === value
      );
      if (size !== undefined) {
        this.pageSizeChange.emit(size);
      }
    }
  }
}
