export type Framework = 'react' | 'vue';
export type ComponentId =
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'switch'
  | 'badge'
  | 'card'
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
  size: 'sm' | 'md' | 'lg';
  state: 'default' | 'disabled' | 'invalid' | 'loading';
  variant: string;
  orientation: 'horizontal' | 'vertical';
  progress: number;
}

export type AnatomyPart = { name: string; structure: string; purpose: string; tokens: string[] };
