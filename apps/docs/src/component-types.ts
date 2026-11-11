export type Framework = 'react' | 'vue';
export type ComponentId =
  | 'button'
  | 'input'
  | 'auto-complete'
  | 'mention'
  | 'upload'
  | 'input-tag'
  | 'slider'
  | 'rate'
  | 'time-picker'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'badge'
  | 'tag'
  | 'timeline'
  | 'steps'
  | 'tooltip'
  | 'page-header'
  | 'anchor'
  | 'card'
  | 'collapse'
  | 'descriptions'
  | 'comment'
  | 'statistic'
  | 'image'
  | 'carousel'
  | 'popover'
  | 'back-top'
  | 'resize-box'
  | 'alert'
  | 'tabs'
  | 'dialog'
  | 'avatar'
  | 'separator'
  | 'table'
  | 'skeleton'
  | 'progress'
  | 'field'
  | 'input-group'
  | 'radio-group'
  | 'number-input'
  | 'breadcrumb'
  | 'pagination'
  | 'empty-state'
  | 'spinner'
  | 'form'
  | 'calendar'
  | 'date-picker'
  | 'date-range-picker'
  | 'radio'
  | 'checkbox-group'
  | 'toggle-group'
  | 'segmented'
  | 'button-group'
  | 'list'
  | 'file-list'
  | 'tree'
  | 'tree-select'
  | 'cascader'
  | 'org-picker'
  | 'transfer'
  | 'sidebar-nav'
  | 'top-nav'
  | 'dropdown-menu'
  | 'data-table';

export interface DemoOptions {
  multiple?: boolean;
  cascade?: boolean;
  buttonGroupCount?: number;
  buttonGroupReverse?: boolean;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  buttonTone?: 'standard' | 'success' | 'warning' | 'danger' | 'ai';
  buttonShape?: 'default' | 'pill';
  buttonContent?: 'text' | 'leading' | 'trailing' | 'icon';
  avatarMode?: 'single' | 'group';
  avatarShape?: 'circle' | 'square';
  avatarMax?: number;
  collapseMode?: 'multiple' | 'accordion';
  collapseIcon?: 'start' | 'end' | 'none';
  descriptionsBordered?: boolean;
  descriptionsColumns?: 1 | 2 | 3;
  commentAlignment?: 'start' | 'end';
  commentNested?: boolean;
  commentActions?: boolean;
  statisticFormat?: 'number' | 'percent';
  statisticTrend?: 'none' | 'up' | 'down' | 'neutral';
  statisticPrecision?: 0 | 1 | 2;
  imageRatio?:
    | '1 / 1'
    | '4 / 3'
    | '3 / 2'
    | '16 / 10'
    | '1.618 / 1'
    | '16 / 9'
    | '2 / 1'
    | '5 / 2'
    | '3 / 1'
    | '1 / 1.618'
    | '2 / 3'
    | '3 / 4';
  imageFit?: 'cover' | 'contain';
  imagePreview?: boolean;
  imageBroken?: boolean;
  carouselIndicatorStyle?: 'dots' | 'lines';
  carouselIndicatorPlacement?: 'bottom' | 'start' | 'end';
  carouselLoop?: boolean;
  popoverPlacement?: import('./PopoverExample').PopoverPreviewPlacement;
  popoverArrow?: boolean;
  popoverTitle?: boolean;
  popoverDisabled?: boolean;
  backTopShape?: 'square' | 'circle';
  backTopVariant?: 'neutral' | 'primary';
  backTopContent?: 'arrow' | 'up' | 'top';
  listMode?: 'basic' | 'advanced' | 'grid';
  listColumns?: 2 | 3 | 4;
  listBordered?: boolean;
  listSplit?: boolean;
  emptyVariant?: import('./EmptyStateExample').EmptyPreviewVariant;
  emptySize?: 'compact' | 'default' | 'page';
  emptyHeadingLevel?: 2 | 3 | 4 | 5 | 6;
  inputKind?: 'text' | 'password' | 'search';
  inputAddon?: 'none' | 'start' | 'end' | 'both';
  inputTagDuplicates?: boolean;
  autoCompleteEmpty?: boolean;
  autoCompleteDetail?: boolean;
  autoCompleteSuffix?: 'none' | 'arrow' | 'dot';
  mentionEmpty?: boolean;
  dateReadOnly?: boolean;
  dateClearable?: boolean;
  dateRangeCalendar?: boolean;
  dateRangePresets?: boolean;
  uploadMultiple?: boolean;
  uploadAccept?: 'any' | 'image' | 'text';
  sliderMarks?: boolean;
  rateShape?: 'star' | 'heart';
  rateHalf?: boolean;
  rateClear?: boolean;
  rateCount?: number;
  tagClosable?: boolean;
  timelineStates?: boolean;
  stepsCurrent?: 0 | 1 | 2;
  stepsIcons?: boolean;
  stepsError?: boolean;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  pageHeaderBack?: boolean;
  pageHeaderDescription?: boolean;
  pageHeaderActions?: boolean;
  pageHeaderBreadcrumb?: boolean;
  anchorNested?: boolean;
  badgeMode?: 'status' | 'count' | 'dot';
  badgeTarget?: 'standalone' | 'avatar' | 'text';
  badgeCount?: 0 | 8 | 120;
  badgeShowZero?: boolean;
  dropdownGroup?: boolean;
  dropdownSeparator?: boolean;
  dropdownSubmenu?: boolean;
  fieldLayout?: 'vertical' | 'horizontal';
  cascaderSearchable?: boolean;
  cascaderChangeOnSelect?: boolean;
  progressType?: 'line' | 'circle' | 'mini';
  progressStatus?: 'normal' | 'success' | 'warning' | 'error';
  progressShowValue?: boolean;
  tableExpandColumn?: 'inline' | 'separate';
  tableAdvancedFilters?: boolean;
  checkboxIndeterminate?: boolean;
  breadcrumbSeparator?: 'slash' | 'dot' | 'arrow';
  tabsVariant?: 'default' | 'line' | 'text' | 'card' | 'card-gutter' | 'rounded';
  tabsDisabledItem?: boolean;
  size: 'sm' | 'md' | 'lg';
  state: 'default' | 'disabled' | 'invalid' | 'loading';
  variant: string;
  orientation: 'horizontal' | 'vertical';
  progress: number;
}

export type AnatomyPart = { name: string; structure: string; purpose: string; tokens: string[] };
