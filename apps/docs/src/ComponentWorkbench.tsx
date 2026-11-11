import { useState, type CSSProperties } from 'react';
import { createTheme, defaultTheme, type ThemeMode, type ThemeConfig } from '@btdesign/tokens';
import { loadStudio } from './studio/model';
import {
  catalog,
  componentAnatomy,
  componentCode,
  defaultDemoOptions,
  type ComponentId,
  type DemoOptions,
  type Framework,
} from './catalog';
import { ComponentDemo } from './ComponentDemo';
import { VueDemo } from './VueDemo';
import { CodeBlock, FrameworkToggle } from './shared';
import './ComponentWorkbench.css';

const sizeable: ComponentId[] = [
  'button',
  'input',
  'auto-complete',
  'mention',
  'upload',
  'input-tag',
  'textarea',
  'select',
  'field',
  'input-group',
  'number-input',
  'time-picker',
  'avatar',
  'spinner',
];
const disableable: ComponentId[] = [
  'collapse',
  'tag',
  'tooltip',
  'form',
  'calendar',
  'date-picker',
  'date-range-picker',
  'radio',
  'checkbox-group',
  'toggle-group',
  'segmented',
  'file-list',
  'tree',
  'tree-select',
  'cascader',
  'org-picker',
  'transfer',
  'sidebar-nav',
  'top-nav',
  'dropdown-menu',
  'data-table',
  'button',
  'input',
  'auto-complete',
  'mention',
  'upload',
  'input-tag',
  'textarea',
  'select',
  'checkbox',
  'switch',
  'field',
  'input-group',
  'radio-group',
  'number-input',
  'slider',
  'rate',
  'time-picker',
  'pagination',
];
const invalidable: ComponentId[] = [
  'input',
  'auto-complete',
  'mention',
  'input-tag',
  'textarea',
  'select',
  'field',
  'input-group',
  'number-input',
  'time-picker',
];
const variantLabels: Record<string, string> = {
  primary: '主要',
  secondary: '次要',
  ghost: '轻量',
  danger: '危险',
  default: '默认',
  success: '成功',
  warning: '警告',
  info: '信息',
};
const variants: Partial<Record<ComponentId, string[]>> = {
  button: ['primary', 'secondary', 'ghost', 'danger'],
  badge: ['default', 'success', 'warning', 'danger', 'info'],
  tag: ['default', 'success', 'warning', 'danger', 'info'],
  timeline: ['default', 'success', 'warning', 'danger', 'info'],
  alert: ['info', 'success', 'warning', 'danger'],
};
export function ComponentWorkbench({
  kind,
  framework,
  mode,
  onFrameworkChange,
  onAction,
  liveProject,
  embedded = false,
}: {
  kind: ComponentId;
  framework: Framework;
  mode: ThemeMode;
  onFrameworkChange: (value: Framework) => void;
  onAction: (message: string) => void;
  liveProject?: { name: string; theme: ThemeConfig };
  embedded?: boolean;
}) {
  const [options, setOptions] = useState<DemoOptions>({
    ...defaultDemoOptions,
    variant: variants[kind]?.[0] ?? 'primary',
    orientation: kind === 'radio-group' || kind === 'timeline' ? 'vertical' : 'horizontal',
  });
  const [partIndex, setPartIndex] = useState(0);
  const [savedProject] = useState(() => loadStudio().project);
  const project = liveProject ?? savedProject;
  const [themeSource, setThemeSource] = useState<'workspace' | 'default'>('workspace');
  const previewTheme = liveProject || themeSource === 'workspace' ? project.theme : defaultTheme;
  const previewStyle = {
    ...createTheme(previewTheme, mode),
    fontFamily: 'var(--f-font)',
    color: 'var(--f-text)',
    colorScheme: mode,
  } as CSSProperties;
  const parts = componentAnatomy[kind];
  const part = parts[partIndex];
  const update = <K extends keyof DemoOptions>(key: K, value: DemoOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }));
  return (
    <>
      {!embedded && (
        <div className="example-heading">
          <h2 id="preview">预览</h2>
          <FrameworkToggle value={framework} onChange={onFrameworkChange} />
        </div>
      )}
      <div className={`bt-workbench ${embedded ? 'bt-workbench-embedded' : ''}`}>
        <div className="bt-workbench-controls" aria-label="预览参数">
          {embedded && <FrameworkToggle value={framework} onChange={onFrameworkChange} />}
          {['tree', 'tree-select', 'cascader', 'org-picker', 'toggle-group'].includes(kind) && (
            <label>
              选择方式
              <select
                aria-label="预览选择方式"
                value={options.multiple ? 'multiple' : 'single'}
                onChange={(e) => update('multiple', e.target.value === 'multiple')}
              >
                <option value="single">单选</option>
                <option value="multiple">多选</option>
              </select>
            </label>
          )}
          {['tree', 'tree-select', 'org-picker'].includes(kind) && options.multiple && (
            <label>
              父子选择
              <select
                aria-label="预览父子选择"
                value={options.cascade ? 'cascade' : 'independent'}
                onChange={(e) => update('cascade', e.target.value === 'cascade')}
              >
                <option value="independent">独立选择</option>
                <option value="cascade">关联叶节点</option>
              </select>
            </label>
          )}
          {!liveProject && (
            <label>
              预览主题
              <select
                aria-label="预览主题"
                value={themeSource}
                onChange={(event) => setThemeSource(event.target.value as 'workspace' | 'default')}
              >
                <option value="workspace">{project.name}</option>
                <option value="default">BTDESIGN 默认</option>
              </select>
            </label>
          )}
          {sizeable.includes(kind) && kind !== 'button' && (
            <label>
              尺寸
              <select
                aria-label="预览尺寸"
                value={options.size}
                onChange={(e) => update('size', e.target.value as DemoOptions['size'])}
              >
                <option value="sm">小</option>
                <option value="md">中</option>
                <option value="lg">大</option>
              </select>
            </label>
          )}
          {kind === 'rate' && (
            <>
              <label>
                图形
                <select
                  aria-label="预览评分图形"
                  value={options.rateShape ?? 'star'}
                  onChange={(event) =>
                    update('rateShape', event.target.value as NonNullable<DemoOptions['rateShape']>)
                  }
                >
                  <option value="star">星形</option>
                  <option value="heart">心形</option>
                </select>
              </label>
              <label>
                精度
                <select
                  aria-label="预览评分精度"
                  value={options.rateHalf ? 'half' : 'whole'}
                  onChange={(event) => update('rateHalf', event.target.value === 'half')}
                >
                  <option value="whole">整数</option>
                  <option value="half">半分</option>
                </select>
              </label>
              <label>
                数量
                <select
                  aria-label="预览评分数量"
                  value={options.rateCount ?? 5}
                  onChange={(event) => update('rateCount', Number(event.target.value))}
                >
                  {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                再次点击
                <select
                  aria-label="预览评分清除"
                  value={options.rateClear ? 'allow' : 'keep'}
                  onChange={(event) => update('rateClear', event.target.value === 'allow')}
                >
                  <option value="keep">保留评分</option>
                  <option value="allow">清除评分</option>
                </select>
              </label>
            </>
          )}
          {kind === 'auto-complete' && (
            <label>
              候选项
              <select
                aria-label="预览候选项"
                value={options.autoCompleteEmpty ? 'empty' : 'example'}
                onChange={(event) => update('autoCompleteEmpty', event.target.value === 'empty')}
              >
                <option value="example">示例数据</option>
                <option value="empty">空列表</option>
              </select>
            </label>
          )}
          {(kind === 'date-picker' || kind === 'date-range-picker') && (
            <label>
              编辑方式
              <select
                aria-label="预览日期编辑方式"
                value={options.dateReadOnly ? 'readonly' : 'editable'}
                onChange={(event) => update('dateReadOnly', event.target.value === 'readonly')}
              >
                <option value="editable">可编辑</option>
                <option value="readonly">只读</option>
              </select>
            </label>
          )}
          {kind === 'date-picker' && (
            <label>
              清除按钮
              <select
                aria-label="预览日期清除按钮"
                value={options.dateClearable === false ? 'hidden' : 'shown'}
                onChange={(event) => update('dateClearable', event.target.value === 'shown')}
              >
                <option value="shown">显示</option>
                <option value="hidden">隐藏</option>
              </select>
            </label>
          )}
          {kind === 'upload' && (
            <>
              <label>
                选择数量
                <select
                  aria-label="预览文件数量"
                  value={options.uploadMultiple ? 'multiple' : 'single'}
                  onChange={(event) => update('uploadMultiple', event.target.value === 'multiple')}
                >
                  <option value="single">单个</option>
                  <option value="multiple">多个</option>
                </select>
              </label>
              <label>
                文件类型
                <select
                  aria-label="预览文件类型"
                  value={options.uploadAccept ?? 'any'}
                  onChange={(event) =>
                    update('uploadAccept', event.target.value as 'any' | 'image' | 'text')
                  }
                >
                  <option value="any">全部</option>
                  <option value="image">图片</option>
                  <option value="text">文本</option>
                </select>
              </label>
            </>
          )}
          {kind === 'mention' && (
            <label>
              候选项
              <select
                aria-label="预览候选项"
                value={options.mentionEmpty ? 'empty' : 'example'}
                onChange={(event) => update('mentionEmpty', event.target.value === 'empty')}
              >
                <option value="example">示例数据</option>
                <option value="empty">空列表</option>
              </select>
            </label>
          )}
          {kind === 'input-tag' && (
            <label>
              重复标签
              <select
                aria-label="预览重复标签"
                value={options.inputTagDuplicates ? 'allow' : 'reject'}
                onChange={(event) => update('inputTagDuplicates', event.target.value === 'allow')}
              >
                <option value="reject">不允许</option>
                <option value="allow">允许</option>
              </select>
            </label>
          )}
          {kind === 'slider' && (
            <label>
              刻度
              <select
                aria-label="预览刻度"
                value={options.sliderMarks ? 'show' : 'hide'}
                onChange={(event) => update('sliderMarks', event.target.value === 'show')}
              >
                <option value="hide">隐藏</option>
                <option value="show">显示</option>
              </select>
            </label>
          )}
          {kind === 'input' && (
            <>
              <label>
                类型
                <select
                  aria-label="预览输入类型"
                  value={options.inputKind ?? 'text'}
                  onChange={(event) =>
                    update('inputKind', event.target.value as NonNullable<DemoOptions['inputKind']>)
                  }
                >
                  <option value="text">普通输入</option>
                  <option value="password">密码</option>
                  <option value="search">搜索</option>
                </select>
              </label>
              {(options.inputKind ?? 'text') === 'text' && (
                <label>
                  附加项
                  <select
                    aria-label="预览输入附加项"
                    value={options.inputAddon ?? 'none'}
                    onChange={(event) =>
                      update(
                        'inputAddon',
                        event.target.value as NonNullable<DemoOptions['inputAddon']>,
                      )
                    }
                  >
                    <option value="none">无</option>
                    <option value="start">前置</option>
                    <option value="end">后置</option>
                    <option value="both">前后</option>
                  </select>
                </label>
              )}
            </>
          )}
          {kind === 'avatar' && (
            <>
              <label>
                类型
                <select
                  aria-label="预览头像类型"
                  value={options.avatarMode ?? 'single'}
                  onChange={(e) =>
                    update('avatarMode', e.target.value as NonNullable<DemoOptions['avatarMode']>)
                  }
                >
                  <option value="single">单个头像</option>
                  <option value="group">头像组</option>
                </select>
              </label>
              <label>
                形状
                <select
                  aria-label="预览头像形状"
                  value={options.avatarShape ?? 'circle'}
                  onChange={(e) =>
                    update('avatarShape', e.target.value as NonNullable<DemoOptions['avatarShape']>)
                  }
                >
                  <option value="circle">圆形</option>
                  <option value="square">方形</option>
                </select>
              </label>
              {options.avatarMode === 'group' && (
                <label>
                  显示上限
                  <select
                    aria-label="预览头像显示上限"
                    value={options.avatarMax ?? 3}
                    onChange={(e) => update('avatarMax', Number(e.target.value))}
                  >
                    <option value={2}>2 个</option>
                    <option value={3}>3 个</option>
                    <option value={4}>全部 4 个</option>
                  </select>
                </label>
              )}
            </>
          )}
          {kind === 'empty-state' && (
            <>
              <label>
                场景
                <select
                  aria-label="预览空状态场景"
                  value={options.emptyVariant ?? 'no-content'}
                  onChange={(event) =>
                    update(
                      'emptyVariant',
                      event.target.value as NonNullable<DemoOptions['emptyVariant']>,
                    )
                  }
                >
                  <option value="no-content">无内容</option>
                  <option value="initial">初始页面</option>
                  <option value="no-messages">无消息</option>
                  <option value="no-results">搜索无果</option>
                  <option value="no-permission">无权限</option>
                  <option value="offline">断联</option>
                  <option value="not-found">内容不存在</option>
                  <option value="error">加载异常</option>
                </select>
              </label>
              <label>
                空间
                <select
                  aria-label="预览空状态尺寸"
                  value={options.emptySize ?? 'default'}
                  onChange={(event) =>
                    update('emptySize', event.target.value as NonNullable<DemoOptions['emptySize']>)
                  }
                >
                  <option value="compact">小区域</option>
                  <option value="default">常规</option>
                  <option value="page">整页</option>
                </select>
              </label>
              <label>
                标题层级
                <select
                  aria-label="预览空状态标题层级"
                  value={options.emptyHeadingLevel ?? 3}
                  onChange={(event) =>
                    update(
                      'emptyHeadingLevel',
                      Number(event.target.value) as NonNullable<DemoOptions['emptyHeadingLevel']>,
                    )
                  }
                >
                  <option value={2}>H2</option>
                  <option value={3}>H3</option>
                  <option value={4}>H4</option>
                  <option value={5}>H5</option>
                  <option value={6}>H6</option>
                </select>
              </label>
            </>
          )}
          {kind === 'back-top' && (
            <>
              <label>
                形状
                <select
                  aria-label="预览返回顶部形状"
                  value={options.backTopShape ?? 'square'}
                  onChange={(event) =>
                    update(
                      'backTopShape',
                      event.target.value as NonNullable<DemoOptions['backTopShape']>,
                    )
                  }
                >
                  <option value="square">方形</option>
                  <option value="circle">圆形</option>
                </select>
              </label>
              <label>
                样式
                <select
                  aria-label="预览返回顶部样式"
                  value={options.backTopVariant ?? 'neutral'}
                  onChange={(event) =>
                    update(
                      'backTopVariant',
                      event.target.value as NonNullable<DemoOptions['backTopVariant']>,
                    )
                  }
                >
                  <option value="neutral">中性</option>
                  <option value="primary">强调</option>
                </select>
              </label>
              <label>
                内容
                <select
                  aria-label="预览返回顶部内容"
                  value={options.backTopContent ?? 'arrow'}
                  onChange={(event) =>
                    update(
                      'backTopContent',
                      event.target.value as NonNullable<DemoOptions['backTopContent']>,
                    )
                  }
                >
                  <option value="arrow">箭头</option>
                  <option value="up">UP</option>
                  <option value="top">TOP</option>
                </select>
              </label>
            </>
          )}
          {kind === 'popover' && (
            <>
              <label>
                浮层位置
                <select
                  aria-label="预览气泡卡片位置"
                  value={options.popoverPlacement ?? 'bottom'}
                  onChange={(event) =>
                    update(
                      'popoverPlacement',
                      event.target.value as NonNullable<DemoOptions['popoverPlacement']>,
                    )
                  }
                >
                  <option value="top">上方居中</option>
                  <option value="top-start">上方靠左</option>
                  <option value="top-end">上方靠右</option>
                  <option value="bottom">下方居中</option>
                  <option value="bottom-start">下方靠左</option>
                  <option value="bottom-end">下方靠右</option>
                  <option value="left">左侧居中</option>
                  <option value="left-start">左侧靠上</option>
                  <option value="left-end">左侧靠下</option>
                  <option value="right">右侧居中</option>
                  <option value="right-start">右侧靠上</option>
                  <option value="right-end">右侧靠下</option>
                </select>
              </label>
              <label>
                箭头
                <select
                  aria-label="预览气泡卡片箭头"
                  value={options.popoverArrow === false ? 'off' : 'on'}
                  onChange={(event) => update('popoverArrow', event.target.value === 'on')}
                >
                  <option value="on">显示</option>
                  <option value="off">隐藏</option>
                </select>
              </label>
              <label>
                标题
                <select
                  aria-label="预览气泡卡片标题"
                  value={options.popoverTitle === false ? 'off' : 'on'}
                  onChange={(event) => update('popoverTitle', event.target.value === 'on')}
                >
                  <option value="on">显示</option>
                  <option value="off">隐藏</option>
                </select>
              </label>
              <label>
                状态
                <select
                  aria-label="预览气泡卡片状态"
                  value={options.popoverDisabled ? 'disabled' : 'enabled'}
                  onChange={(event) => update('popoverDisabled', event.target.value === 'disabled')}
                >
                  <option value="enabled">可用</option>
                  <option value="disabled">禁用</option>
                </select>
              </label>
            </>
          )}
          {kind === 'carousel' && (
            <>
              <label>
                指示器
                <select
                  aria-label="预览轮播指示器"
                  value={options.carouselIndicatorStyle ?? 'dots'}
                  onChange={(event) =>
                    update(
                      'carouselIndicatorStyle',
                      event.target.value as NonNullable<DemoOptions['carouselIndicatorStyle']>,
                    )
                  }
                >
                  <option value="dots">圆点</option>
                  <option value="lines">线条</option>
                </select>
              </label>
              <label>
                位置
                <select
                  aria-label="预览轮播位置"
                  value={options.carouselIndicatorPlacement ?? 'bottom'}
                  onChange={(event) =>
                    update(
                      'carouselIndicatorPlacement',
                      event.target.value as NonNullable<DemoOptions['carouselIndicatorPlacement']>,
                    )
                  }
                >
                  <option value="bottom">底部</option>
                  <option value="start">左侧</option>
                  <option value="end">右侧</option>
                </select>
              </label>
              <label>
                循环
                <select
                  aria-label="预览轮播循环"
                  value={options.carouselLoop ? 'loop' : 'stop'}
                  onChange={(event) => update('carouselLoop', event.target.value === 'loop')}
                >
                  <option value="stop">边界停止</option>
                  <option value="loop">首尾循环</option>
                </select>
              </label>
            </>
          )}
          {kind === 'image' && (
            <>
              <label>
                比例
                <select
                  aria-label="预览图片比例"
                  value={options.imageRatio ?? '16 / 9'}
                  onChange={(event) =>
                    update(
                      'imageRatio',
                      event.target.value as NonNullable<DemoOptions['imageRatio']>,
                    )
                  }
                >
                  <option value="1 / 1">1:1</option>
                  <option value="4 / 3">4:3</option>
                  <option value="3 / 2">3:2</option>
                  <option value="16 / 10">16:10</option>
                  <option value="1.618 / 1">1.618:1</option>
                  <option value="16 / 9">16:9</option>
                  <option value="2 / 1">2:1</option>
                  <option value="5 / 2">5:2</option>
                  <option value="3 / 1">3:1</option>
                  <option value="1 / 1.618">1:1.618</option>
                  <option value="2 / 3">2:3</option>
                  <option value="3 / 4">3:4</option>
                </select>
              </label>
              <label>
                填充
                <select
                  aria-label="预览图片填充"
                  value={options.imageFit ?? 'cover'}
                  onChange={(event) =>
                    update('imageFit', event.target.value as NonNullable<DemoOptions['imageFit']>)
                  }
                >
                  <option value="cover">裁剪铺满</option>
                  <option value="contain">完整显示</option>
                </select>
              </label>
              <label>
                查看大图
                <select
                  aria-label="预览大图功能"
                  value={options.imagePreview ? 'enabled' : 'disabled'}
                  onChange={(event) => update('imagePreview', event.target.value === 'enabled')}
                >
                  <option value="disabled">关闭</option>
                  <option value="enabled">开启</option>
                </select>
              </label>
              <label>
                图片状态
                <select
                  aria-label="预览图片状态"
                  value={options.imageBroken ? 'error' : 'loaded'}
                  onChange={(event) => update('imageBroken', event.target.value === 'error')}
                >
                  <option value="loaded">正常</option>
                  <option value="error">加载失败</option>
                </select>
              </label>
            </>
          )}
          {kind === 'statistic' && (
            <>
              <label>
                格式
                <select
                  aria-label="预览数值格式"
                  value={options.statisticFormat ?? 'number'}
                  onChange={(event) =>
                    update(
                      'statisticFormat',
                      event.target.value as NonNullable<DemoOptions['statisticFormat']>,
                    )
                  }
                >
                  <option value="number">数字</option>
                  <option value="percent">百分比</option>
                </select>
              </label>
              <label>
                趋势
                <select
                  aria-label="预览数值趋势"
                  value={options.statisticTrend ?? 'none'}
                  onChange={(event) =>
                    update(
                      'statisticTrend',
                      event.target.value as NonNullable<DemoOptions['statisticTrend']>,
                    )
                  }
                >
                  <option value="none">无</option>
                  <option value="up">上升</option>
                  <option value="down">下降</option>
                  <option value="neutral">持平</option>
                </select>
              </label>
              <label>
                小数位
                <select
                  aria-label="预览数值精度"
                  value={options.statisticPrecision ?? 1}
                  onChange={(event) =>
                    update(
                      'statisticPrecision',
                      Number(event.target.value) as NonNullable<DemoOptions['statisticPrecision']>,
                    )
                  }
                >
                  <option value={0}>0 位</option>
                  <option value={1}>1 位</option>
                  <option value={2}>2 位</option>
                </select>
              </label>
            </>
          )}
          {kind === 'comment' && (
            <>
              <label>
                对齐
                <select
                  aria-label="预览评论对齐"
                  value={options.commentAlignment ?? 'start'}
                  onChange={(event) =>
                    update(
                      'commentAlignment',
                      event.target.value as NonNullable<DemoOptions['commentAlignment']>,
                    )
                  }
                >
                  <option value="start">靠前</option>
                  <option value="end">靠后</option>
                </select>
              </label>
              <label>
                回复
                <select
                  aria-label="预览评论回复"
                  value={options.commentNested ? 'nested' : 'single'}
                  onChange={(event) => update('commentNested', event.target.value === 'nested')}
                >
                  <option value="single">单条</option>
                  <option value="nested">嵌套回复</option>
                </select>
              </label>
              <label>
                操作
                <select
                  aria-label="预览评论操作"
                  value={options.commentActions === false ? 'hidden' : 'visible'}
                  onChange={(event) => update('commentActions', event.target.value === 'visible')}
                >
                  <option value="visible">显示</option>
                  <option value="hidden">隐藏</option>
                </select>
              </label>
            </>
          )}
          {kind === 'descriptions' && (
            <>
              <label>
                排列
                <select
                  aria-label="预览描述排列"
                  value={options.orientation}
                  onChange={(event) =>
                    update('orientation', event.target.value as DemoOptions['orientation'])
                  }
                >
                  <option value="horizontal">横向</option>
                  <option value="vertical">纵向</option>
                </select>
              </label>
              <label>
                样式
                <select
                  aria-label="预览描述边框"
                  value={options.descriptionsBordered ? 'bordered' : 'plain'}
                  onChange={(event) =>
                    update('descriptionsBordered', event.target.value === 'bordered')
                  }
                >
                  <option value="plain">无边框</option>
                  <option value="bordered">带边框</option>
                </select>
              </label>
              <label>
                列数
                <select
                  aria-label="预览描述列数"
                  value={options.descriptionsColumns ?? 3}
                  onChange={(event) =>
                    update(
                      'descriptionsColumns',
                      Number(event.target.value) as NonNullable<DemoOptions['descriptionsColumns']>,
                    )
                  }
                >
                  <option value={1}>1 列</option>
                  <option value={2}>2 列</option>
                  <option value={3}>3 列</option>
                </select>
              </label>
            </>
          )}
          {kind === 'collapse' && (
            <>
              <label>
                展开方式
                <select
                  aria-label="预览展开方式"
                  value={options.collapseMode ?? 'multiple'}
                  onChange={(e) =>
                    update(
                      'collapseMode',
                      e.target.value as NonNullable<DemoOptions['collapseMode']>,
                    )
                  }
                >
                  <option value="multiple">多项展开</option>
                  <option value="accordion">手风琴</option>
                </select>
              </label>
              <label>
                箭头位置
                <select
                  aria-label="预览箭头位置"
                  value={options.collapseIcon ?? 'start'}
                  onChange={(e) =>
                    update(
                      'collapseIcon',
                      e.target.value as NonNullable<DemoOptions['collapseIcon']>,
                    )
                  }
                >
                  <option value="start">前置</option>
                  <option value="end">后置</option>
                  <option value="none">隐藏</option>
                </select>
              </label>
            </>
          )}
          {kind === 'tabs' && (
            <>
              <label>
                标签样式
                <select
                  aria-label="预览标签页样式"
                  value={options.tabsVariant ?? 'default'}
                  onChange={(event) =>
                    update(
                      'tabsVariant',
                      event.target.value as NonNullable<DemoOptions['tabsVariant']>,
                    )
                  }
                >
                  <option value="default">默认</option>
                  <option value="line">下划线</option>
                  <option value="text">文字</option>
                  <option value="card">卡片</option>
                  <option value="card-gutter">间隔卡片</option>
                  <option value="rounded">圆角</option>
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览禁用标签"
                  checked={options.tabsDisabledItem ?? false}
                  onChange={(event) => update('tabsDisabledItem', event.target.checked)}
                />
                禁用末项
              </label>
            </>
          )}
          {kind === 'dropdown-menu' && (
            <>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览菜单分组"
                  checked={options.dropdownGroup ?? false}
                  onChange={(event) => update('dropdownGroup', event.target.checked)}
                />
                分组
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览菜单分隔线"
                  checked={options.dropdownSeparator ?? false}
                  onChange={(event) => update('dropdownSeparator', event.target.checked)}
                />
                分隔线
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览子菜单"
                  checked={options.dropdownSubmenu ?? false}
                  onChange={(event) => update('dropdownSubmenu', event.target.checked)}
                />
                子菜单
              </label>
            </>
          )}
          {kind === 'badge' && (
            <>
              <label>
                展示方式
                <select
                  aria-label="预览徽标展示方式"
                  value={options.badgeMode ?? 'status'}
                  onChange={(event) =>
                    update('badgeMode', event.target.value as NonNullable<DemoOptions['badgeMode']>)
                  }
                >
                  <option value="status">状态文字</option>
                  <option value="count">计数</option>
                  <option value="dot">圆点</option>
                </select>
              </label>
              {(options.badgeMode ?? 'status') !== 'status' && (
                <label>
                  标记内容
                  <select
                    aria-label="预览徽标标记内容"
                    value={options.badgeTarget ?? 'avatar'}
                    onChange={(event) =>
                      update(
                        'badgeTarget',
                        event.target.value as NonNullable<DemoOptions['badgeTarget']>,
                      )
                    }
                  >
                    <option value="avatar">头像</option>
                    <option value="text">文字</option>
                    <option value="standalone">独立展示</option>
                  </select>
                </label>
              )}
              {options.badgeMode === 'count' && (
                <>
                  <label>
                    数量
                    <select
                      aria-label="预览徽标数量"
                      value={options.badgeCount ?? 8}
                      onChange={(event) =>
                        update(
                          'badgeCount',
                          Number(event.target.value) as NonNullable<DemoOptions['badgeCount']>,
                        )
                      }
                    >
                      <option value={0}>0</option>
                      <option value={8}>8</option>
                      <option value={120}>120</option>
                    </select>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      aria-label="预览零值徽标"
                      checked={options.badgeShowZero ?? false}
                      onChange={(event) => update('badgeShowZero', event.target.checked)}
                    />
                    显示零值
                  </label>
                </>
              )}
            </>
          )}
          {kind === 'anchor' && (
            <label>
              <input
                type="checkbox"
                aria-label="预览嵌套锚点"
                checked={options.anchorNested ?? false}
                onChange={(event) => update('anchorNested', event.target.checked)}
              />
              嵌套目录
            </label>
          )}
          {kind === 'page-header' && (
            <>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览返回操作"
                  checked={options.pageHeaderBack ?? true}
                  onChange={(event) => update('pageHeaderBack', event.target.checked)}
                />
                返回
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览页头说明"
                  checked={options.pageHeaderDescription ?? true}
                  onChange={(event) => update('pageHeaderDescription', event.target.checked)}
                />
                说明
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览页头操作"
                  checked={options.pageHeaderActions ?? true}
                  onChange={(event) => update('pageHeaderActions', event.target.checked)}
                />
                操作
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label="预览面包屑"
                  checked={options.pageHeaderBreadcrumb ?? false}
                  onChange={(event) => update('pageHeaderBreadcrumb', event.target.checked)}
                />
                面包屑
              </label>
            </>
          )}
          {kind === 'tooltip' && (
            <label>
              气泡位置
              <select
                aria-label="预览气泡位置"
                value={options.tooltipPlacement ?? 'top'}
                onChange={(event) =>
                  update(
                    'tooltipPlacement',
                    event.target.value as NonNullable<DemoOptions['tooltipPlacement']>,
                  )
                }
              >
                <option value="top">上方</option>
                <option value="bottom">下方</option>
                <option value="left">左侧</option>
                <option value="right">右侧</option>
              </select>
            </label>
          )}
          {kind === 'steps' && (
            <>
              <label>
                当前步骤
                <select
                  aria-label="预览当前步骤"
                  value={options.stepsCurrent ?? 1}
                  onChange={(event) =>
                    update('stepsCurrent', Number(event.target.value) as 0 | 1 | 2)
                  }
                >
                  <option value="0">第 1 步</option>
                  <option value="1">第 2 步</option>
                  <option value="2">第 3 步</option>
                </select>
              </label>
              <label>
                步骤图标
                <select
                  aria-label="预览步骤图标"
                  value={options.stepsIcons ? 'icons' : 'numbers'}
                  onChange={(event) => update('stepsIcons', event.target.value === 'icons')}
                >
                  <option value="numbers">数字</option>
                  <option value="icons">图标</option>
                </select>
              </label>
              <label>
                末项状态
                <select
                  aria-label="预览末项状态"
                  value={options.stepsError ? 'error' : 'auto'}
                  onChange={(event) => update('stepsError', event.target.value === 'error')}
                >
                  <option value="auto">跟随进度</option>
                  <option value="error">错误</option>
                </select>
              </label>
            </>
          )}
          {kind === 'timeline' && (
            <label>
              节点状态
              <select
                aria-label="预览时间轴节点状态"
                value={(options.timelineStates ?? true) ? 'states' : 'plain'}
                onChange={(event) => update('timelineStates', event.target.value === 'states')}
              >
                <option value="states">显示状态</option>
                <option value="plain">仅时间与内容</option>
              </select>
            </label>
          )}
          {kind === 'tag' && (
            <label>
              关闭操作
              <select
                aria-label="预览标签关闭操作"
                value={options.tagClosable ? 'closable' : 'static'}
                onChange={(event) => update('tagClosable', event.target.value === 'closable')}
              >
                <option value="static">不可关闭</option>
                <option value="closable">可关闭</option>
              </select>
            </label>
          )}
          {kind === 'button-group' && (
            <>
              <label>
                按钮数量
                <select
                  aria-label="预览按钮数量"
                  value={options.buttonGroupCount ?? 3}
                  onChange={(e) => update('buttonGroupCount', Number(e.target.value))}
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n} 个
                    </option>
                  ))}
                </select>
              </label>
              <label>
                排列顺序
                <select
                  aria-label="预览按钮顺序"
                  value={options.buttonGroupReverse ? 'reverse' : 'normal'}
                  onChange={(e) => update('buttonGroupReverse', e.target.value === 'reverse')}
                >
                  <option value="normal">正序</option>
                  <option value="reverse">倒序</option>
                </select>
              </label>
            </>
          )}
          {kind === 'button' && (
            <>
              <label>
                尺寸
                <select
                  aria-label="预览尺寸"
                  value={options.buttonSize ?? 'md'}
                  onChange={(e) =>
                    update('buttonSize', e.target.value as NonNullable<DemoOptions['buttonSize']>)
                  }
                >
                  <option value="xs">迷你</option>
                  <option value="sm">小</option>
                  <option value="md">中</option>
                  <option value="lg">大</option>
                  <option value="xl">加大</option>
                </select>
              </label>
              <label>
                语义
                <select
                  aria-label="预览语义"
                  value={options.buttonTone ?? 'standard'}
                  onChange={(e) =>
                    update('buttonTone', e.target.value as NonNullable<DemoOptions['buttonTone']>)
                  }
                >
                  <option value="standard">标准</option>
                  <option value="success">成功</option>
                  <option value="warning">警告</option>
                  <option value="danger">危险</option>
                  <option value="ai">AI</option>
                </select>
              </label>
              <label>
                形状
                <select
                  aria-label="预览形状"
                  value={options.buttonShape ?? 'default'}
                  onChange={(e) =>
                    update('buttonShape', e.target.value as NonNullable<DemoOptions['buttonShape']>)
                  }
                >
                  <option value="default">常规</option>
                  <option value="pill">全圆角</option>
                </select>
              </label>
              <label>
                内容
                <select
                  aria-label="预览内容"
                  value={options.buttonContent ?? 'text'}
                  onChange={(e) =>
                    update(
                      'buttonContent',
                      e.target.value as NonNullable<DemoOptions['buttonContent']>,
                    )
                  }
                >
                  <option value="text">文字</option>
                  <option value="leading">前置图标</option>
                  <option value="trailing">后置图标</option>
                  <option value="icon">仅图标</option>
                </select>
              </label>
            </>
          )}
          {variants[kind] && (
            <label>
              样式
              <select
                aria-label="预览变体"
                value={options.variant}
                onChange={(e) => update('variant', e.target.value)}
              >
                {variants[kind]!.map((variant) => (
                  <option key={variant} value={variant}>
                    {variantLabels[variant] ?? variant}
                  </option>
                ))}
              </select>
            </label>
          )}
          {disableable.includes(kind) && (
            <label>
              状态
              <select
                aria-label="预览状态"
                value={options.state}
                onChange={(e) => update('state', e.target.value as DemoOptions['state'])}
              >
                <option value="default">默认</option>
                <option value="disabled">禁用</option>
                {invalidable.includes(kind) && <option value="invalid">错误</option>}
                {(kind === 'button' || kind === 'data-table') && (
                  <option value="loading">处理中</option>
                )}
              </select>
            </label>
          )}
          {['separator', 'radio-group', 'timeline', 'steps', 'tabs'].includes(kind) && (
            <label>
              方向
              <select
                aria-label="预览方向"
                value={options.orientation}
                onChange={(e) =>
                  update('orientation', e.target.value as DemoOptions['orientation'])
                }
              >
                <option value="horizontal">横向</option>
                <option value="vertical">纵向</option>
              </select>
            </label>
          )}
          {kind === 'progress' && (
            <label>
              示例进度 <output>{options.progress}%</output>
              <input
                aria-label="示例进度"
                type="range"
                min={0}
                max={100}
                value={options.progress}
                onChange={(e) => update('progress', Number(e.target.value))}
              />
            </label>
          )}
        </div>
        {kind === 'button' && (
          <p className="bt-workbench-hint">
            悬停、聚焦与按下状态可直接在预览中体验。仅图标按钮需提供无障碍名称。
          </p>
        )}
        <div className={`component-example example-${kind}`} data-theme={mode} style={previewStyle}>
          {framework === 'react' ? (
            <ComponentDemo kind={kind} options={options} onAction={onAction} />
          ) : (
            <VueDemo kind={kind} options={options} onAction={onAction} />
          )}
        </div>
        {embedded ? (
          <details className="bt-workbench-code">
            <summary>查看代码</summary>
            <CodeBlock
              code={componentCode(kind, framework, options)}
              label={framework === 'react' ? 'React · TSX' : 'Vue · SFC'}
            />
          </details>
        ) : (
          <CodeBlock
            code={componentCode(kind, framework, options)}
            label={framework === 'react' ? 'React · TSX' : 'Vue · SFC'}
          />
        )}
      </div>
      {!embedded && (
        <section className="bt-component-anatomy" aria-labelledby="anatomy">
          <div className="bt-anatomy-heading">
            <h2 id="anatomy">理解每一层</h2>
            <span>{parts.length} 个结构层</span>
          </div>
          <div className="bt-anatomy-layout">
            <div
              className="bt-anatomy-parts"
              aria-label={`${catalog.find((c) => c.id === kind)?.name} 结构层`}
            >
              {parts.map((item, index) => (
                <button
                  type="button"
                  key={item.name}
                  aria-pressed={index === partIndex}
                  onClick={() => setPartIndex(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item.name}
                </button>
              ))}
            </div>
            <div className="bt-anatomy-detail">
              <strong>{part.name}</strong>
              <p>{part.purpose}</p>
              <dl>
                <div>
                  <dt>前端结构</dt>
                  <dd>
                    <code>{part.structure}</code>
                  </dd>
                </div>
                <div>
                  <dt>继承规则</dt>
                  <dd className="bt-anatomy-tokens">
                    {part.tokens.map((token) => (
                      <code key={token}>{token}</code>
                    ))}
                  </dd>
                </div>
              </dl>
              <a href="#/lab">在 Lab 调整样式 →</a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
